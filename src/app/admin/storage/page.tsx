"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/shared/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { compressPetImage } from "@/lib/image/compress-image";
import { ArrowDownToLine, CheckCircle2, Image as ImageIcon, TriangleAlert } from "lucide-react";

type PetPhotoRow = { id: string; owner_id: string; name: string; photo_url: string };

export default function AdminStoragePage() {
  const [pets, setPets] = useState<PetPhotoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPet, setCurrentPet] = useState("");
  const [migrated, setMigrated] = useState(0);
  const [failures, setFailures] = useState<Array<{ name: string; message: string }>>([]);
  const [notice, setNotice] = useState("");
  const oldPhotos = useMemo(() => pets.filter((pet) => pet.photo_url.includes("/storage/v1/object/public/pet-photos/")), [pets]);

  const loadPets = async () => {
    setLoading(true); setLoadError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.assign("/auth/login"); return; }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") { window.location.assign("/auth/login"); return; }
    const { data, error } = await supabase.from("pets").select("id, owner_id, name, photo_url").not("photo_url", "is", null).order("created_at", { ascending: true });
    if (error) setLoadError(error.message);
    else setPets((data || []).filter((pet) => Boolean(pet.photo_url)) as PetPhotoRow[]);
    setLoading(false);
  };

  useEffect(() => { void loadPets(); }, []);

  const migratePhotos = async () => {
    if (!oldPhotos.length || running) return;
    if (!window.confirm(`سيتم نسخ ${oldPhotos.length} صورة من Supabase إلى R2 وتحديث روابط الحيوانات بعد نجاح كل نسخة. لن تُحذف الصور القديمة. متابعة؟`)) return;

    setRunning(true); setProgress(0); setMigrated(0); setFailures([]); setNotice("");
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setRunning(false); setNotice("انتهت جلسة الدخول. سجّل الدخول مرة أخرى."); return;
    }

    const failed: Array<{ name: string; message: string }> = [];
    let completed = 0;
    for (const pet of oldPhotos) {
      setCurrentPet(pet.name);
      let uploadedKey = "";
      try {
        const sourceResponse = await fetch(pet.photo_url);
        if (!sourceResponse.ok) throw new Error(`تعذر تنزيل الصورة القديمة (${sourceResponse.status}).`);
        const sourceBlob = await sourceResponse.blob();
        const sourceFile = new File([sourceBlob], `${pet.id}.${sourceBlob.type.includes("webp") ? "webp" : "jpg"}`, { type: sourceBlob.type || "image/jpeg" });
        const compressed = await compressPetImage(sourceFile);
        const uploadResponse = await fetch("/api/pet-photo", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "image/webp",
            "x-pet-id": pet.id,
          },
          body: compressed,
        });
        const uploadResult = await uploadResponse.json();
        if (!uploadResponse.ok || typeof uploadResult.url !== "string" || typeof uploadResult.key !== "string") {
          throw new Error(uploadResult.error || "تعذر نسخ الصورة إلى R2.");
        }
        uploadedKey = uploadResult.key;

        const { error: updateError } = await supabase.rpc("admin_set_pet_photo", {
          target_pet_id: pet.id,
          new_photo_url: uploadResult.url,
        });
        if (updateError) throw new Error(`نُسخت الصورة لكن تعذر تحديث سجل الحيوان: ${updateError.message}`);
        setPets((items) => items.map((item) => item.id === pet.id ? { ...item, photo_url: uploadResult.url } : item));
        completed += 1; setMigrated(completed);
      } catch (error) {
        if (uploadedKey) {
          await fetch("/api/pet-photo", {
            method: "DELETE",
            headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ petId: pet.id, key: uploadedKey }),
          }).catch(() => undefined);
        }
        failed.push({ name: pet.name, message: error instanceof Error ? error.message : "فشل نقل الصورة." });
        setFailures([...failed]);
      }
      setProgress((value) => value + 1);
    }

    setCurrentPet(""); setRunning(false);
    setNotice(`اكتمل النقل: ${completed} صورة نجحت، ${failed.length} صورة تحتاج مراجعة. الصور القديمة ما زالت محفوظة في Supabase.`);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header title="تخزين صور الحيوانات" subtitle="نقل صور الحيوانات القديمة من Supabase Storage إلى Cloudflare R2" role="admin" />
      <main className="p-4 md:p-8 max-w-4xl w-full space-y-5">
        <Card className="border-border shadow-sm">
          <CardContent className="p-5 sm:p-7 space-y-5">
            <div className="flex items-start gap-3">
              <span className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><ImageIcon className="h-5 w-5" /></span>
              <div><h2 className="font-bold text-lg">ترحيل الصور القديمة</h2><p className="mt-1 text-sm text-muted-foreground">سيتم نقل الصور فقط، ثم تحديث رابط الصورة في ملف كل حيوان. النسخ القديمة لا تُحذف.</p></div>
            </div>

            {loadError && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">تعذر تحميل ملفات الحيوانات: {loadError}</p>}
            {loading ? <p className="text-sm text-muted-foreground">جارٍ فحص الصور...</p> : <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl bg-muted/50 p-4"><p className="text-xs text-muted-foreground">صور Supabase المتبقية</p><p className="mt-1 text-2xl font-bold">{oldPhotos.length}</p></div>
              <div className="rounded-xl bg-muted/50 p-4"><p className="text-xs text-muted-foreground">صور الحيوانات المفحوصة</p><p className="mt-1 text-2xl font-bold">{pets.length}</p></div>
              <div className="rounded-xl bg-muted/50 p-4"><p className="text-xs text-muted-foreground">تقدم العملية</p><p className="mt-1 text-2xl font-bold">{progress}/{oldPhotos.length}</p></div>
            </div>}

            {running && <div className="rounded-xl border border-primary/20 p-4 space-y-2">
              <div className="flex justify-between gap-3 text-sm"><span>جارٍ نقل صورة: {currentPet}</span><span>{oldPhotos.length ? Math.round((progress / oldPhotos.length) * 100) : 0}%</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-all" style={{ width: `${oldPhotos.length ? (progress / oldPhotos.length) * 100 : 0}%` }} /></div>
            </div>}

            {notice && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800 flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />{notice}</p>}
            {failures.length > 0 && <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 space-y-2">
              <p className="font-bold flex items-center gap-2"><TriangleAlert className="h-4 w-4" /> صور لم تنتقل</p>
              <ul className="list-disc pe-5 space-y-1">{failures.map((failure, index) => <li key={`${failure.name}-${index}`}>{failure.name}: {failure.message}</li>)}</ul>
            </div>}

            {!loading && <Button onClick={migratePhotos} disabled={running || Boolean(loadError) || oldPhotos.length === 0} isLoading={running} className="gap-2">
              <ArrowDownToLine className="h-4 w-4" />{oldPhotos.length ? `نقل ${oldPhotos.length} صورة إلى R2` : "كل صور الحيوانات على R2"}
            </Button>}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
