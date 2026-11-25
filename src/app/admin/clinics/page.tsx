"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Header } from "@/components/shared/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { MapPin, Phone, ShieldCheck, Plus, LoaderCircle, AlertCircle } from "lucide-react";

export default function AdminClinicsPage() {
  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const loadClinics = useCallback(async () => {
    setLoading(true);
    const { data, error } = await createClient().from("clinics").select("*").order("created_at", { ascending: false });
    if (error) setError(error.message);
    else { setClinics(data || []); setError(null); }
    setLoading(false);
  }, []);

  useEffect(() => { void loadClinics(); }, [loadClinics]);

  const createClinic = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setSaving(true);
    setError(null);
    const values = new FormData(form);
    const { error } = await createClient().from("clinics").insert({
      name: String(values.get("name") || "").trim(),
      name_ar: String(values.get("name_ar") || "").trim() || null,
      phone: String(values.get("phone") || "").trim(),
      address: String(values.get("address") || "").trim(),
      governorate: String(values.get("governorate") || "").trim(),
      city: String(values.get("city") || "").trim(),
      is_verified: false,
    });
    setSaving(false);
    if (error) { setError(error.message); return; }
    form.reset();
    setShowForm(false);
    await loadClinics();
  };

  const toggleVerification = async (clinic: any) => {
    setActionId(clinic.id);
    setError(null);
    const { error } = await createClient().from("clinics").update({ is_verified: !clinic.is_verified }).eq("id", clinic.id);
    if (error) setError(error.message);
    else await loadClinics();
    setActionId(null);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header title="إدارة العيادات والمستشفيات البيطرية" subtitle="إضافة الجهات البيطرية ومراجعة اعتمادها وخدمات الطوارئ" role="admin" />
      <div className="p-4 md:p-8 space-y-6 max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{clinics.length} عيادة مسجلة</p>
          <Button onClick={() => setShowForm((value) => !value)}><Plus className="h-4 w-4 ml-2" />{showForm ? "إغلاق النموذج" : "إضافة عيادة"}</Button>
        </div>
        {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><div className="flex gap-2"><AlertCircle className="h-5 w-5 shrink-0" /><div><p className="font-semibold">تعذر تنفيذ العملية أو تحميل بيانات العيادات</p><p dir="ltr" className="mt-1 break-all text-xs">{error}</p><Button className="mt-3" size="sm" variant="outline" onClick={() => void loadClinics()}>إعادة المحاولة</Button></div></div></div>}
        {showForm && <Card className="p-5"><form onSubmit={createClinic} className="grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor="clinic-name">الاسم بالإنجليزية *</Label><Input id="clinic-name" name="name" required /></div>
          <div><Label htmlFor="clinic-name-ar">الاسم بالعربية</Label><Input id="clinic-name-ar" name="name_ar" /></div>
          <div><Label htmlFor="clinic-phone">الهاتف *</Label><Input id="clinic-phone" name="phone" required /></div>
          <div><Label htmlFor="clinic-governorate">المحافظة *</Label><Input id="clinic-governorate" name="governorate" required /></div>
          <div><Label htmlFor="clinic-city">المدينة *</Label><Input id="clinic-city" name="city" required /></div>
          <div><Label htmlFor="clinic-address">العنوان *</Label><Input id="clinic-address" name="address" required /></div>
          <div className="sm:col-span-2"><Button type="submit" isLoading={saving}>حفظ العيادة</Button></div>
        </form></Card>}
        {loading ? <div className="flex items-center justify-center gap-2 py-14 text-sm text-muted-foreground"><LoaderCircle className="h-4 w-4 animate-spin" />جارٍ تحميل العيادات...</div> : error ? null : clinics.length === 0 ? <Card className="p-10 text-center text-sm text-muted-foreground">لا توجد عيادات مسجلة حتى الآن. استخدم «إضافة عيادة» لإدخال أول عيادة.</Card> :
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{clinics.map((clinic) => (
            <Card key={clinic.id} className="border-border/80 bg-card p-6 space-y-3">
              <div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-base text-foreground">{clinic.name_ar || clinic.name}</h3><p className="text-xs text-muted-foreground">{clinic.name}</p></div><Badge variant={clinic.is_verified ? "success" : "neutral"} className="text-xs">{clinic.is_verified ? "معتمد" : "غير معتمد"}</Badge></div>
              <div className="text-xs text-muted-foreground space-y-2"><div className="flex gap-2"><MapPin className="h-4 w-4 shrink-0" />{clinic.address}، {clinic.city}، {clinic.governorate}</div><div className="flex gap-2"><Phone className="h-4 w-4 shrink-0" />{clinic.phone}</div>{clinic.is_emergency_247 && <div className="text-rose-600 font-semibold">مجهز بطوارئ 24 ساعة</div>}</div>
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/60">{(clinic.services || []).map((service: string, idx: number) => <span key={idx} className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground">{service}</span>)}</div>
              <Button variant={clinic.is_verified ? "outline" : "default"} size="sm" disabled={actionId === clinic.id} onClick={() => void toggleVerification(clinic)}><ShieldCheck className="h-4 w-4 ml-2" />{actionId === clinic.id ? "جارٍ الحفظ..." : clinic.is_verified ? "إلغاء الاعتماد" : "اعتماد العيادة"}</Button>
            </Card>
          ))}</div>}
      </div>
    </div>
  );
}
