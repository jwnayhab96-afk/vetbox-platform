"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/shared/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { formatArabicDate } from "@/lib/utils";
import { ShieldCheck, Award, UploadCloud, Check, AlertCircle, LoaderCircle, FileText } from "lucide-react";

export default function VetVerificationPage() {
  const [vet, setVet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [experience, setExperience] = useState(0);
  const [education, setEducation] = useState("");
  const [saved, setSaved] = useState(false);
  const [documentPath, setDocumentPath] = useState<string | null>(null);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [documentError, setDocumentError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!user) {
          if (active) window.location.assign("/auth/login");
          return;
        }
        if (authError) throw authError;

        const { data, error } = await supabase.from("veterinarian_profiles").select("*").eq("id", user.id).single();
        if (error) throw error;
        if (!data) throw new Error("ملف الطبيب غير موجود في قاعدة البيانات.");

        if (active) {
          setVet(data);
          setLicenseNumber(data.license_number || "");
          setExperience(data.years_of_experience || 0);
          setEducation(data.education || "");
          setDocumentPath(data.syndicate_card_url || null);
          setLoadError(null);
        }
      } catch (error) {
        if (active) setLoadError(error instanceof Error ? error.message : "تعذر تحميل بيانات اعتماد الطبيب.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !vet) return;

    const allowedTypes: Record<string, string> = {
      "application/pdf": "pdf",
      "image/jpeg": "jpg",
      "image/png": "png",
    };
    const extension = allowedTypes[file.type];
    if (!extension) {
      setDocumentError("اختر صورة JPG أو PNG أو ملف PDF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setDocumentError("الحد الأقصى لحجم المستند 5 ميجابايت.");
      return;
    }

    setUploadingDocument(true);
    setDocumentError(null);
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.id !== vet.id) {
      setDocumentError("انتهت جلسة الدخول. سجّل الدخول مجددًا ثم أعد المحاولة.");
      setUploadingDocument(false);
      return;
    }

    const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("vet-verification-documents")
      .upload(path, file, { contentType: file.type, cacheControl: "3600", upsert: false });

    if (uploadError) {
      setDocumentError(uploadError.message);
      setUploadingDocument(false);
      return;
    }

    const { error: profileError } = await supabase
      .from("veterinarian_profiles")
      .update({ syndicate_card_url: path, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (profileError) {
      await supabase.storage.from("vet-verification-documents").remove([path]);
      setDocumentError(profileError.message);
      setUploadingDocument(false);
      return;
    }

    const previousPath = documentPath;
    setDocumentPath(path);
    setVet((current: any) => ({ ...current, syndicate_card_url: path }));
    if (previousPath && !previousPath.startsWith("http")) {
      await supabase.storage.from("vet-verification-documents").remove([previousPath]);
    }
    setUploadingDocument(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await createClient().rpc("submit_veterinarian_verification", {
      license: licenseNumber, experience_years: Number(experience), education_text: education,
    });
    if (error) { window.alert(error.message); return; }
    setVet((value: any) => ({ ...value, license_number: licenseNumber, years_of_experience: Number(experience), education, verification_status: value?.verification_status === "rejected" ? "pending" : value?.verification_status }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const pageHeader = (
    <Header
      title="اعتماد ترخيص مزاولة المهنة والنقابة"
      subtitle="توثيق الحساب المهني وفقاً للوائح النقابة العامة للأطباء البيطريين"
      role="veterinarian"
    />
  );

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        {pageHeader}
        <div className="flex flex-1 items-center justify-center gap-3 p-8 text-sm text-muted-foreground">
          <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
          جاري تحميل بيانات الاعتماد...
        </div>
      </div>
    );
  }

  if (loadError || !vet) {
    return (
      <div className="flex min-h-screen flex-col">
        {pageHeader}
        <div className="w-full max-w-3xl p-4 md:p-8">
          <Card className="border-rose-200 bg-rose-50/70">
            <CardContent className="flex items-start gap-3 p-5 text-right text-sm text-rose-800">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="space-y-3">
                <p className="font-semibold">تعذر تحميل بيانات اعتماد الطبيب.</p>
                <p dir="ltr" className="break-words text-xs">{loadError || "ملف الطبيب غير موجود."}</p>
                <Button type="button" variant="outline" onClick={() => window.location.reload()}>
                  إعادة المحاولة
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {pageHeader}

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
                <div className="p-5 border-2 border-dashed border-border/80 rounded-2xl bg-muted/20 text-center space-y-3">
                  <input
                    id="vet-verification-document"
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    className="sr-only"
                    onChange={handleDocumentUpload}
                    disabled={uploadingDocument}
                  />
                  <UploadCloud className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-xs text-foreground font-semibold">اختر صورة الكارنيه أو ملف الترخيص من جهازك</p>
                  <p className="text-[11px] text-muted-foreground">PNG أو JPG أو PDF — بحد أقصى 5 ميجابايت</p>
                  <label
                    htmlFor="vet-verification-document"
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white ${uploadingDocument ? "pointer-events-none opacity-60" : "hover:bg-primary-hover"}`}
                  >
                    {uploadingDocument && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    {uploadingDocument ? "جارٍ رفع المستند..." : "اختيار مستند"}
                  </label>
                  {documentPath && (
                    <div className="flex items-center justify-center gap-2 text-xs font-medium text-emerald-700">
                      <FileText className="h-4 w-4" />
                      <span>تم رفع المستند — بانتظار مراجعة الإدارة</span>
                    </div>
                  )}
                  {documentError && <p role="alert" className="text-xs text-rose-700">تعذر رفع المستند: {documentError}</p>}
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
