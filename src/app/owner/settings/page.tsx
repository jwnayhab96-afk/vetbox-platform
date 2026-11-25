"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/shared/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { User, Phone, MapPin, Check } from "lucide-react";

export default function OwnerSettingsPage() {
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.assign("/auth/login"); return; }
      setUserId(user.id);
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (!error && data) {
        setName(data.full_name || ""); setPhone(data.phone || "");
        setCity(data.city || ""); setGovernorate(data.governorate || "");
      }
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await createClient().from("profiles").update({ full_name: name, phone, city, governorate, updated_at: new Date().toISOString() }).eq("id", userId);
    if (error) { window.alert(error.message); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="إعدادات الحساب"
        subtitle="تعديل بيانات الملف الشخصي ووسائل التواصل"
        role="owner"
      />

      <div className="p-4 md:p-8 max-w-2xl space-y-6">
        <Card className="border-border shadow-xs">
          <CardHeader>
            <CardTitle className="text-lg">الملف الشخصي</CardTitle>
          </CardHeader>
          <form onSubmit={handleSave}>
            <CardContent className="space-y-4 text-right">
              <div>
                <Label htmlFor="sName">الاسم بالكامل</Label>
                <Input id="sName" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="sPhone">رقم الهاتف المحمول</Label>
                <Input id="sPhone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sGov">المحافظة</Label>
                  <Input id="sGov" value={governorate} onChange={(e) => setGovernorate(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="sCity">المدينة أو الحي</Label>
                  <Input id="sCity" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
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
