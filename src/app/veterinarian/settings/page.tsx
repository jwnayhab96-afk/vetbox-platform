"use client";

import React, { useState } from "react";
import { Header } from "@/components/shared/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { store } from "@/lib/data/store";
import { Check } from "lucide-react";

export default function VetSettingsPage() {
  const vetId = "33333333-3333-3333-3333-333333333333";
  const vet = store.getVeterinarianById(vetId) || store.getVeterinarians()[0];
  const profile = vet.profile || store.getCurrentProfile();

  const [name, setName] = useState(profile.full_name);
  const [phone, setPhone] = useState(profile.phone || "");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    profile.full_name = name;
    profile.phone = phone;
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="إعدادات الحساب الطبي"
        subtitle="إدارة بيانات الدخول والتواصل الشخصي"
        role="veterinarian"
      />

      <div className="p-4 md:p-8 max-w-2xl space-y-6">
        <Card className="border-border shadow-xs">
          <CardHeader>
            <CardTitle className="text-lg">بيانات الحساب</CardTitle>
          </CardHeader>
          <form onSubmit={handleSave}>
            <CardContent className="space-y-4 text-right">
              <div>
                <Label htmlFor="vName">الاسم واللقب المهني</Label>
                <Input id="vName" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="vPhone">رقم هاتف التواصل</Label>
                <Input id="vPhone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>

              {saved && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  تم حفظ التعديلات بنجاح.
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
