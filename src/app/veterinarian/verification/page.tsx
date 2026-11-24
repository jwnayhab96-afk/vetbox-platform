"use client";

import React, { useState } from "react";
import { Header } from "@/components/shared/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { store } from "@/lib/data/store";
import { formatArabicDate } from "@/lib/utils";
import { ShieldCheck, Award, FileCheck, UploadCloud, Clock, Check } from "lucide-react";

export default function VetVerificationPage() {
  const vetId = "33333333-3333-3333-3333-333333333333";
  const [vet, setVet] = useState(() => store.getVeterinarianById(vetId) || store.getVeterinarians()[0]);

  const [licenseNumber, setLicenseNumber] = useState(vet.license_number || "EGY-VET-48920");
  const [experience, setExperience] = useState(vet.years_of_experience);
  const [education, setEducation] = useState(vet.education || "بكالوريوس طب وجراحة بيطرية - جامعة القاهرة");
  const [saved, setSaved] = useState(false);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    vet.license_number = licenseNumber;
    vet.years_of_experience = Number(experience);
    vet.education = education;
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="اعتماد ترخيص مزاولة المهنة والنقابة"
        subtitle="توثيق الحساب المهني وفقاً للوائح النقابة العامة للأطباء البيطريين"
        role="veterinarian"
      />

      <div className="p-4 md:p-8 space-y-6 max-w-4xl">
        {/* Verification Status Card */}
        <Card className={`border shadow-xs ${vet.verification_status === "verified" ? "border-emerald-300 bg-emerald-50/50" : "border-amber-300 bg-amber-50/50"}`}>
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-right">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-white shrink-0 ${vet.verification_status === "verified" ? "bg-emerald-600" : "bg-amber-600"}`}>
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-foreground">
                    {vet.verification_status === "verified" ? "حساب مهني معتمد رسمياً" : "الطلب قيد المراجعة والتدقيق"}
                  </h3>
                  <Badge variant={vet.verification_status === "verified" ? "success" : "warning"} className="text-xs">
                    {vet.verification_status === "verified" ? "معتمد" : "قيد الفحص"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  رقم ترخيص النقابة: <strong className="font-mono text-foreground">{vet.license_number}</strong>
                  {vet.verified_at && ` • تاريخ الاعتماد: ${formatArabicDate(vet.verified_at)}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Form & Documents */}
        <Card className="border-border shadow-xs">
          <CardHeader className="text-right">
            <CardTitle className="text-lg">بيانات القيد النقابي والشهادات</CardTitle>
            <CardDescription>
              يتم التحقق من صحة هذه البيانات عبر مطابقتها مع سجلات النقابة العامة للأطباء البيطريين.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleUpdate}>
            <CardContent className="space-y-5 text-right">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="licNum" required>رقم القيد بسجل النقابة</Label>
                  <Input
                    id="licNum"
                    required
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    icon={<Award className="h-4 w-4" />}
                  />
                </div>
                <div>
                  <Label htmlFor="expYrs" required>سنوات الخبرة العملية</Label>
                  <Input
                    id="expYrs"
                    type="number"
                    min="0"
                    required
                    value={experience}
                    onChange={(e) => setExperience(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edu" required>الدرجة العلمية والجامعة</Label>
                <Input
                  id="edu"
                  required
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                />
              </div>

              {/* Upload Document Box */}
              <div className="space-y-2">
                <Label>صورة كارنيه النقابة وترخيص مزاولة المهنة</Label>
                <div className="p-6 border-2 border-dashed border-border/80 rounded-2xl bg-muted/20 text-center space-y-2">
                  <UploadCloud className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-xs text-foreground font-semibold">اسحب الملف هنا أو اضغط للاختيار</p>
                  <p className="text-[11px] text-muted-foreground">PNG, JPG أو PDF بحد أقصى 5 ميجابايت</p>
                  <span className="inline-block text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md font-medium border border-emerald-200">
                    تم رفع ملف كارنيه النقابة والتحقق بنجاح ✓
                  </span>
                </div>
              </div>

              {saved && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  تم تحديث بيانات الاعتماد بنجاح.
                </div>
              )}

              <Button type="submit" className="font-semibold">
                حفظ وتحديث البيانات
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}
