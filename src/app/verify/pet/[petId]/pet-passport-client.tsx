"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { SPECIES_LABELS, formatArabicDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PawPrint, ShieldCheck, AlertCircle } from "lucide-react";

export default function PetPassportVerificationClient({ petId }: { petId: string }) {
  const [pet, setPet] = useState<any>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    createClient().rpc("verify_pet_passport", { target_pet_id: petId })
      .then(({ data, error }) => {
        if (error) console.error("Pet passport verification failed", error);
        setPet(data || null); setChecked(true);
      });
  }, [petId]);

  if (!checked) return <main className="min-h-screen grid place-items-center">جارٍ التحقق من جواز الحيوان…</main>;
  if (!pet) return (
    <main className="min-h-screen grid place-items-center bg-muted/40 p-4">
      <Card className="max-w-md p-8 text-center space-y-3">
        <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
        <h1 className="text-xl font-bold">تعذر التحقق من جواز الحيوان</h1>
        <Link href="/" className="text-primary underline">العودة للرئيسية</Link>
      </Card>
    </main>
  );

  return (
    <main className="min-h-screen bg-muted/40 p-4 md:p-10" dir="rtl">
      <Card className="mx-auto max-w-xl overflow-hidden">
        <div className="bg-primary p-6 text-primary-foreground flex items-center gap-3">
          <ShieldCheck className="h-8 w-8" />
          <div><h1 className="text-xl font-bold">جواز صحي رقمي موثق</h1><p className="text-sm opacity-85">معرّف الحيوان: {pet.id.slice(0, 8).toUpperCase()}</p></div>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-4">
            {pet.photo_url ? <img src={pet.photo_url} alt="" className="h-20 w-20 rounded-2xl object-cover" /> : <div className="h-20 w-20 rounded-2xl bg-primary/10 text-primary grid place-items-center"><PawPrint /></div>}
            <div><h2 className="text-2xl font-bold">{pet.name}</h2><p className="text-muted-foreground">{SPECIES_LABELS[pet.species]?.ar || pet.species}{pet.breed ? ` • ${pet.breed}` : ""}</p></div>
            <Badge variant="success" className="mr-auto gap-1"><ShieldCheck className="h-3.5 w-3.5" /> تم التحقق</Badge>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-muted/50 p-3"><dt className="text-muted-foreground">الجنس</dt><dd className="font-semibold">{pet.gender === "male" ? "ذكر" : pet.gender === "female" ? "أنثى" : "غير محدد"}</dd></div>
            <div className="rounded-xl bg-muted/50 p-3"><dt className="text-muted-foreground">تاريخ التسجيل</dt><dd className="font-semibold">{formatArabicDate(pet.created_at)}</dd></div>
            {pet.microchip_number && <div className="rounded-xl bg-muted/50 p-3 col-span-2"><dt className="text-muted-foreground">رقم الشريحة</dt><dd className="font-mono font-semibold">{pet.microchip_number}</dd></div>}
            {pet.identifying_marks && <div className="rounded-xl bg-muted/50 p-3 col-span-2"><dt className="text-muted-foreground">علامات مميزة</dt><dd className="font-semibold">{pet.identifying_marks}</dd></div>}
          </dl>
          <p className="text-xs text-muted-foreground">يعرض هذا الرابط معلومات تعريف الحيوان فقط، ولا يعرض سجله الطبي الخاص.</p>
        </div>
      </Card>
    </main>
  );
}
