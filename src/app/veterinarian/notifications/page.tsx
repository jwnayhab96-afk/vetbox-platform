"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/shared/header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Bell, Users } from "lucide-react";

type ClientRecipient = { id: string; full_name: string; pets: string[] };

export default function VeterinarianNotificationsPage() {
  const [clients, setClients] = useState<ClientRecipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [audience, setAudience] = useState("all");
  const [recipientId, setRecipientId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    let active = true;
    const loadClients = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.assign("/auth/login"); return; }
      const { data: links, error: linksError } = await supabase
        .from("pet_vet_links").select("pet_id").eq("vet_id", user.id).eq("status", "accepted");
      if (linksError) { if (active) { setLoadError(linksError.message); setLoading(false); } return; }
      const petIds = Array.from(new Set((links || []).map((link) => link.pet_id)));
      if (!petIds.length) { if (active) setLoading(false); return; }
      const { data: pets, error: petsError } = await supabase.from("pets").select("owner_id, name").in("id", petIds);
      if (petsError) { if (active) { setLoadError(petsError.message); setLoading(false); } return; }
      const petNamesByOwner = new Map<string, string[]>();
      for (const pet of pets || []) {
        petNamesByOwner.set(pet.owner_id, [...(petNamesByOwner.get(pet.owner_id) || []), pet.name]);
      }
      const ownerIds = Array.from(petNamesByOwner.keys());
      const { data: profiles, error: profilesError } = await supabase.from("profiles").select("id, full_name").in("id", ownerIds);
      if (!active) return;
      if (profilesError) setLoadError(profilesError.message);
      else setClients((profiles || []).map((profile) => ({ id: profile.id, full_name: profile.full_name, pets: petNamesByOwner.get(profile.id) || [] })));
      setLoading(false);
    };
    void loadClients();
    return () => { active = false; };
  }, []);

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault(); setSending(true); setFeedback("");
    const { data, error } = await createClient().functions.invoke("platform-actions", {
      body: {
        action: "send_notification",
        audience,
        targetUserId: audience === "user" ? recipientId : undefined,
        title,
        message,
      },
    });
    setSending(false);
    if (error || data?.error) { setFeedback(error?.message || data.error); return; }
    setFeedback(`تم إرسال الإشعار إلى ${data.count} من عملائك.`);
    setTitle(""); setMessage(""); setRecipientId("");
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header title="إشعارات العملاء" subtitle="أرسل تنبيهًا لكل عملائك المرتبطين أو لعميل محدد" role="veterinarian" />
      <main className="p-4 md:p-8 max-w-3xl w-full">
        <Card className="border-border shadow-sm">
          <CardContent className="p-5 sm:p-7">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><Bell className="h-5 w-5" /></span>
              <div><h2 className="font-bold text-lg">إرسال إشعار داخل المنصة</h2><p className="text-xs text-muted-foreground">يصل الإشعار إلى حساب العميل في VetBox.</p></div>
            </div>
            {loadError && <p role="alert" className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">تعذر تحميل العملاء: {loadError}</p>}
            <form onSubmit={handleSend} className="space-y-4 text-right">
              <div className="space-y-1.5">
                <Label htmlFor="audience">المستلمون</Label>
                <select id="audience" value={audience} onChange={(e) => setAudience(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" disabled={loading || clients.length === 0}>
                  <option value="all">كل العملاء المرتبطين بي</option>
                  <option value="user">عميل محدد</option>
                </select>
              </div>
              {audience === "user" && <div className="space-y-1.5">
                <Label htmlFor="recipient">العميل</Label>
                <select id="recipient" required value={recipientId} onChange={(e) => setRecipientId(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">اختر عميلًا</option>
                  {clients.map((client) => <option key={client.id} value={client.id}>{client.full_name} — {client.pets.join("، ")}</option>)}
                </select>
              </div>}
              <div className="space-y-1.5"><Label htmlFor="notificationTitle">عنوان الإشعار</Label><Input id="notificationTitle" required maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} /></div>
              <div className="space-y-1.5"><Label htmlFor="notificationMessage">نص الإشعار</Label><Textarea id="notificationMessage" required maxLength={2000} rows={5} value={message} onChange={(e) => setMessage(e.target.value)} /></div>
              {feedback && <p role="status" className="rounded-lg bg-muted p-3 text-sm">{feedback}</p>}
              {!loading && clients.length === 0 && !loadError && <p className="text-sm text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4" />لا يوجد لديك عملاء لديهم ربط مقبول بعد.</p>}
              <Button type="submit" isLoading={sending} disabled={loading || clients.length === 0 || Boolean(loadError)} className="w-full sm:w-auto">إرسال الإشعار</Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
