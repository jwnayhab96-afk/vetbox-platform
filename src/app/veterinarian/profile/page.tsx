"use client";

import React, { useState } from "react";
import { Header } from "@/components/shared/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { store } from "@/lib/data/store";
import { Stethoscope, Check } from "lucide-react";

export default function VetProfilePage() {
  const vetId = "33333333-3333-3333-3333-333333333333";
  const [vet, setVet] = useState(() => store.getVeterinarianById(vetId) || store.getVeterinarians()[0]);

  const [bio, setBio] = useState(vet.bio || "");
  const [clinicName, setClinicName] = useState(vet.clinic_affiliation_name || "");
  const [fee, setFee] = useState(vet.consultation_fee);
  const [emergency, setEmergency] = useState(vet.emergency_available);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    vet.bio = bio;
    vet.clinic_affiliation_name = clinicName;
    vet.consultation_fee = Number(fee);
    vet.emergency_available = emergency;
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
