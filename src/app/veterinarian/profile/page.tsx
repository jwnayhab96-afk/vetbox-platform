"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/shared/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Stethoscope, Check } from "lucide-react";

export default function VetProfilePage() {
  const [vetId, setVetId] = useState("");
  const [bio, setBio] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [fee, setFee] = useState(0);
  const [emergency, setEmergency] = useState(false);
  const [openingHours, setOpeningHours] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.assign("/auth/login"); return; }
      setVetId(user.id);
      const { data, error } = await supabase.from("veterinarian_profiles").select("*").eq("id", user.id).single();
      if (!error && data) { setBio(data.bio || ""); setClinicName(data.clinic_affiliation_name || ""); setFee(data.consultation_fee || 0); setEmergency(!!data.emergency_available); setOpeningHours(data.opening_hours || {}); }
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await createClient().from("veterinarian_profiles").update({ bio, clinic_affiliation_name: clinicName, consultation_fee: Number(fee), emergency_available: emergency, opening_hours: openingHours, updated_at: new Date().toISOString() }).eq("id", vetId);
    if (error) { window.alert(error.message); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="الملف المهني والعيادة"
        subtitle="البيانات المعروضة للجمهور في دليل الأطباء والعيادات"
        role="veterinarian"
      />

      <div className="p-4 md:p-8 max-w-3xl space-y-6">
        <Card className="border-border shadow-xs">
          <CardHeader className="text-right">
            <CardTitle className="text-lg">البيانات التعريفية والخدمات</CardTitle>
          </CardHeader>
          <form onSubmit={handleSave}>
            <CardContent className="space-y-4 text-right">
              <div>
                <Label htmlFor="bio" required>نبذة تعريفية عن الخبرة والتخصص (Bio)</Label>
                <Textarea
                  id="bio"
                  rows={4}
                  required
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="cName">العيادة أو المستشفى التابع لها</Label>
                <Input
                  id="cName"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  placeholder="مثال: مستشفى النيل البيطري التخصصي"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fee">سعر الكشف المبدئي (بالجنيه المصري)</Label>
                  <Input
                    id="fee"
                    type="number"
                    value={fee}
                    onChange={(e) => setFee(Number(e.target.value))}
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="emrg"
                    checked={emergency}
                    onChange={(e) => setEmergency(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                  />
                  <label htmlFor="emrg" className="text-sm font-medium cursor-pointer">
                    متاح للحالات الطارئة العاجلة 24/7
                  </label>
                </div>
              </div>

              <fieldset className="space-y-3 rounded-xl border border-border p-4">
                <legend className="px-2 text-sm font-bold">ساعات العمل المعروضة للمرضى</legend>
                <p className="text-xs text-muted-foreground">اكتب الفترة مثل 10:00 - 18:00 أو «مغلق».</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"].map((day) => (
                    <div key={day} className="flex items-center gap-2">
                      <Label htmlFor={`hours-${day}`} className="w-20 shrink-0">{day}</Label>
                      <Input id={`hours-${day}`} value={openingHours[day] || ""} onChange={(e) => setOpeningHours((hours) => ({ ...hours, [day]: e.target.value }))} placeholder="10:00 - 18:00 / مغلق" />
                    </div>
                  ))}
                </div>
              </fieldset>

              {saved && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  تم تحديث الملف المهني بنجاح.
                </div>
              )}

              <Button type="submit" className="font-semibold">
                حفظ التغييرات
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}
