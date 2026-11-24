"use client";

import React, { useState } from "react";
import { Header } from "@/components/shared/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

export default function AdminSettingsPage() {
  const [platformName, setPlatformName] = useState("فيت بوكس (VetBox)");
  const [supportEmail, setSupportEmail] = useState("johnehab.m@gmail.com");
  const [emergencyHotline, setEmergencyHotline] = useState("0227508900");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="إعدادات المنصة العامة"
        subtitle="تكوين معلومات الاتصال، الطوارئ، والسياسات العامة"
        role="admin"
      />

      <div className="p-4 md:p-8 max-w-2xl space-y-6">
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

              {saved && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  تم حفظ الإعدادات بنجاح.
                </div>
              )}

              <Button type="submit" className="font-semibold">
                حفظ الإعدادات
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}
