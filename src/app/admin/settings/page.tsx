"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/shared/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, Check, LoaderCircle } from "lucide-react";

export default function AdminSettingsPage() {
  const [platformName, setPlatformName] = useState("فيت بوكس (VetBox)");
  const [supportEmail, setSupportEmail] = useState("johnehab.m@gmail.com");
  const [emergencyHotline, setEmergencyHotline] = useState("0227508900");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    const loadSettings = async () => {
      const { data, error } = await createClient()
        .from("platform_settings")
        .select("platform_name, support_email, emergency_hotline")
        .eq("id", 1)
        .single();

      if (!active) return;
      if (error) setLoadError(error.message);
      else if (data) {
        setPlatformName(data.platform_name);
        setSupportEmail(data.support_email);
        setEmergencyHotline(data.emergency_hotline);
      }
      setLoading(false);
    };
    void loadSettings().catch((error) => {
      if (active) {
        setLoadError(error instanceof Error ? error.message : "تعذر تحميل الإعدادات.");
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      setSaveError(authError?.message || "انتهت جلسة الدخول. سجّل الدخول مجددًا.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("platform_settings").update({
      platform_name: platformName.trim(),
      support_email: supportEmail.trim(),
      emergency_hotline: emergencyHotline.trim(),
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    }).eq("id", 1);
    if (error) {
      setSaveError(error.message);
      setSaving(false);
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="إعدادات المنصة العامة"
        subtitle="تكوين معلومات الاتصال، الطوارئ، والسياسات العامة"
        role="admin"
      />

      <div className="p-4 md:p-8 max-w-2xl space-y-6">
        {loading ? (
          <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
            <LoaderCircle className="h-4 w-4 animate-spin" /> جاري تحميل إعدادات المنصة...
          </div>
        ) : loadError ? (
          <Card className="border-rose-200 bg-rose-50/70">
            <CardContent className="flex items-start gap-3 p-5 text-sm text-rose-800">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div className="space-y-2">
                <p className="font-semibold">تعذر تحميل إعدادات المنصة من قاعدة البيانات.</p>
                <p dir="ltr" className="break-words text-xs">{loadError}</p>
                <Button type="button" variant="outline" onClick={() => window.location.reload()}>إعادة المحاولة</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
        <Card className="border-border shadow-xs">
          <CardHeader>
            <CardTitle className="text-lg">إعدادات المنظومة</CardTitle>
          </CardHeader>
          <form onSubmit={handleSave}>
            <CardContent className="space-y-4 text-right">
              <div>
                <Label htmlFor="pName">اسم المنصة</Label>
                <Input id="pName" value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="sMail">بريد الدعم الفني والشكاوى</Label>
                <Input id="sMail" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="eLine">خط الطوارئ الساخن الموحد</Label>
                <Input id="eLine" value={emergencyHotline} onChange={(e) => setEmergencyHotline(e.target.value)} />
              </div>

              {saveError && <p role="alert" className="text-xs text-rose-700">تعذر حفظ الإعدادات: {saveError}</p>}
              {saved && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  تم حفظ الإعدادات بنجاح.
                </div>
              )}

              <Button type="submit" className="font-semibold" isLoading={saving}>
                حفظ الإعدادات في المنصة
              </Button>
            </CardContent>
          </form>
        </Card>
        )}
      </div>
    </div>
  );
}
