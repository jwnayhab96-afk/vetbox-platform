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
    <div className="flex-1 flex flex-col min-h-screen bg-muted/20">
      <Header
        title="إعدادات الحساب"
        subtitle="تعديل بيانات الملف الشخصي ووسائل التواصل"
        role="owner"
      />

      <div className="p-4 sm:p-6 md:p-8 max-w-2xl w-full space-y-6">
        <Card className="border-border/70 shadow-lg rounded-[2rem] overflow-hidden p-0 gap-0">
          <CardHeader className="relative overflow-hidden bg-primary p-5 sm:px-8 sm:py-7 text-white">
            <div className="pointer-events-none absolute -start-14 -top-16 h-44 w-44 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -end-10 -bottom-20 h-48 w-48 rounded-full bg-black/10" />
            <div className="relative flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/25 bg-white/20 backdrop-blur-sm">
                <User className="h-7 w-7" />
              </span>
              <CardTitle className="text-xl sm:text-2xl font-extrabold text-white">الملف الشخصي</CardTitle>
            </div>
          </CardHeader>
          <form onSubmit={handleSave}>
            <CardContent className="space-y-5 p-5 sm:p-8 text-right">
              <div className="space-y-1.5">
                <Label htmlFor="sName">الاسم بالكامل</Label>
                <Input id="sName" value={name} onChange={(e) => setName(e.target.value)} icon={<User className="h-4 w-4" />} className="h-12 rounded-2xl text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sPhone">رقم الهاتف المحمول</Label>
                <Input id="sPhone" value={phone} onChange={(e) => setPhone(e.target.value)} icon={<Phone className="h-4 w-4" />} className="h-12 rounded-2xl text-sm" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="sGov">المحافظة</Label>
                  <Input id="sGov" value={governorate} onChange={(e) => setGovernorate(e.target.value)} icon={<MapPin className="h-4 w-4" />} className="h-12 rounded-2xl text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sCity">المدينة أو الحي</Label>
                  <Input id="sCity" value={city} onChange={(e) => setCity(e.target.value)} icon={<MapPin className="h-4 w-4" />} className="h-12 rounded-2xl text-sm" />
                </div>
              </div>

              {saved && (
                <div role="status" className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 border-s-4 border-s-emerald-500 text-emerald-800 text-sm font-semibold flex items-center gap-3 animate-in fade-in">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Check className="h-4 w-4" />
                  </span>
                  <span>تم حفظ التعديلات بنجاح.</span>
                </div>
              )}

              <div className="pt-4 border-t border-border/60">
                <Button type="submit" className="w-full sm:w-auto min-h-12 px-8 rounded-2xl font-bold shadow-md active:scale-95 transition-transform">
                  حفظ التغييرات
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}
