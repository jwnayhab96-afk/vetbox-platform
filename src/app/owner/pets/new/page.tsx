"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/shared/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { SPECIES_LABELS, calculateAge } from "@/lib/utils";
import { triggerConfetti, motion, AnimatePresence } from "@/components/ui/motion";
import {
  PawPrint,
  Check,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Scale,
  QrCode,
  Sparkles,
  Upload,
  X,
  LoaderCircle,
} from "lucide-react";
import { compressPetImage } from "@/lib/image/compress-image";

export default function AddPetPage() {
  const router = useRouter();

  // Multi-step state: 1, 2, 3, 4
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [species, setSpecies] = useState<"dog" | "cat" | "rabbit" | "bird" | "horse" | "cattle" | "sheep" | "goat" | "exotic">("dog");
  const [breed, setBreed] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "unknown">("male");

  // Age Fields
  const [isAgeEstimated, setIsAgeEstimated] = useState(false);
  const [birthDate, setBirthDate] = useState("");
  const [estimatedMonths, setEstimatedMonths] = useState<number | "">("");

  // Physical & ID
  const [weightKg, setWeightKg] = useState<number | "">("");
  const [color, setColor] = useState("");
  const [microchipNumber, setMicrochipNumber] = useState("");
  const [identifyingMarks, setIdentifyingMarks] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [compressingPhoto, setCompressingPhoto] = useState(false);
  const [isSpayedNeutered, setIsSpayedNeutered] = useState(false);

  // Species conditional attribute
  const [customAttribute, setCustomAttribute] = useState("");

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (!user) router.replace("/auth/login");
    });
  }, [router]);

  useEffect(() => () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  const handlePhotoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    event.target.value = "";
    if (!selected) return;

    setCompressingPhoto(true);
    try {
      const compressed = await compressPetImage(selected);
      setPhotoFile(compressed);
      setPhotoPreview(URL.createObjectURL(compressed));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "تعذر معالجة الصورة.");
    } finally {
      setCompressingPhoto(false);
    }
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleNext = () => {
    if (step === 1 && !name.trim()) {
      alert("يرجى كتابة اسم الحيوان");
      return;
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const speciesAttributes: Record<string, any> = {};
    if (customAttribute) {
      if (species === "horse") speciesAttributes.discipline = customAttribute;
      else if (species === "cat") speciesAttributes.lifestyle = customAttribute;
      else if (species === "bird") speciesAttributes.cage_setup = customAttribute;
      else speciesAttributes.notes = customAttribute;
    }

    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      setLoading(false);
      router.replace("/auth/login");
      return;
    }
    const ownerId = user.id;

    let uploadedPhotoPath: string | null = null;
    let uploadedPhotoUrl: string | null = null;

    if (photoFile) {
      uploadedPhotoPath = `${ownerId}/${crypto.randomUUID()}.webp`;
      const { error: uploadError } = await supabase.storage
        .from("pet-photos")
        .upload(uploadedPhotoPath, photoFile, {
          contentType: "image/webp",
          cacheControl: "31536000",
          upsert: false,
        });

      if (uploadError) {
        setLoading(false);
        window.alert(`تعذر رفع الصورة: ${uploadError.message}`);
        return;
      }
      uploadedPhotoUrl = supabase.storage.from("pet-photos").getPublicUrl(uploadedPhotoPath).data.publicUrl;
    }

    const { data: newPet, error } = await supabase.from("pets").insert({
      owner_id: ownerId,
      name,
      species,
      breed: breed || null,
      gender,
      birth_date: isAgeEstimated ? null : birthDate || null,
      is_age_estimated: isAgeEstimated,
      estimated_age_months: isAgeEstimated && estimatedMonths !== "" ? Number(estimatedMonths) : null,
      weight_kg: weightKg !== "" ? Number(weightKg) : null,
      weight_recorded_at: weightKg !== "" ? new Date().toISOString().split("T")[0] : null,
      color: color || null,
      microchip_number: microchipNumber || null,
      identifying_marks: identifyingMarks || null,
      photo_url: uploadedPhotoUrl,
      is_spayed_neutered: isSpayedNeutered,
      species_attributes: speciesAttributes,
      is_deceased: false,
    }).select("id").single();

    if (error || !newPet) {
      if (uploadedPhotoPath) {
        await supabase.storage.from("pet-photos").remove([uploadedPhotoPath]);
      }
      setLoading(false);
      window.alert(error?.message || "تعذر حفظ بيانات الحيوان.");
      return;
    }

    triggerConfetti();

    setLoading(false);
    router.push(`/owner/pets/detail?id=${encodeURIComponent(newPet.id)}`);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="إضافة حيوان جديد"
        subtitle="إنشاء بطاقة هوية طبية وملف صحي متكامل"
        role="owner"
      />

      <div className="p-4 md:p-8 max-w-3xl mx-auto w-full space-y-6">
        {/* Step Progress Indicators */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
          <div className={`p-2.5 rounded-xl border ${step >= 1 ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border"}`}>
            1. الفصيلة والاسم
          </div>
          <div className={`p-2.5 rounded-xl border ${step >= 2 ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border"}`}>
            2. العمر والميلاد
          </div>
          <div className={`p-2.5 rounded-xl border ${step >= 3 ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border"}`}>
            3. المواصفات والشريحة
          </div>
          <div className={`p-2.5 rounded-xl border ${step >= 4 ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border"}`}>
            4. التأكيد والحفظ
          </div>
        </div>

        <Card className="border-border shadow-xs">
          <form onSubmit={handleSubmit}>
            {/* STEP 1: Basic Info & Species */}
            {step === 1 && (
              <CardContent className="p-6 md:p-8 space-y-5 text-right">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-xl">الخطوة 1: المعلومات الأساسية ونوع الفصيلة</CardTitle>
                  <CardDescription>حدد نوع الحيوان واسمه وسلالته</CardDescription>
                </CardHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="petName" required>اسم الحيوان</Label>
                    <Input
                      id="petName"
                      required
                      placeholder="مثال: روكي، لونا، زعفرانة..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label required>نوع الحيوان والفصيلة</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pt-1">
                      {Object.entries(SPECIES_LABELS).map(([key, val]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSpecies(key as any)}
                          className={`p-3 rounded-xl border text-center text-xs font-medium transition-all ${
                            species === key
                              ? "bg-primary text-primary-foreground border-primary shadow-xs font-semibold ring-2 ring-primary/20"
                              : "bg-card text-foreground border-border hover:bg-muted"
                          }`}
                        >
                          {val.ar}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <Label htmlFor="breed">السلالة أو النوع (اختياري)</Label>
                      <Input
                        id="breed"
                        placeholder="مثال: جيرمن شيبرد، شيرازي، هافربد..."
                        value={breed}
                        onChange={(e) => setBreed(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender" required>الجنس</Label>
                      <select
                        id="gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value as any)}
                        className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                      >
                        <option value="male">ذكر</option>
                        <option value="female">أنثى</option>
                        <option value="unknown">غير محدد</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}

            {/* STEP 2: Age & Birth Date */}
            {step === 2 && (
              <CardContent className="p-6 md:p-8 space-y-5 text-right">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-xl">الخطوة 2: تاريخ الميلاد أو تقدير العمر</CardTitle>
                  <CardDescription>
                    إذا كنت لا تعرف تاريخ الميلاد الدقيق، يمكنك إدخال العمر التقديري بالشهور.
                  </CardDescription>
                </CardHeader>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/40 border border-border">
                    <input
                      type="checkbox"
                      id="estimateAge"
                      checked={isAgeEstimated}
                      onChange={(e) => setIsAgeEstimated(e.target.checked)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    />
                    <label htmlFor="estimateAge" className="text-sm font-medium cursor-pointer">
                      لا أعرف تاريخ الميلاد الدقيق (أريد إدخال عمر تقريبي)
                    </label>
                  </div>

                  {!isAgeEstimated ? (
                    <div>
                      <Label htmlFor="birthDate">تاريخ الميلاد الدقيق</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        icon={<Calendar className="h-4 w-4" />}
                      />
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="estMonths">العمر التقديري الحالي (بالشهور)</Label>
                      <Input
                        id="estMonths"
                        type="number"
                        min="1"
                        max="600"
                        placeholder="مثال: 12 شهر (سنة واحدة)، 6 شهور..."
                        value={estimatedMonths}
                        onChange={(e) => setEstimatedMonths(e.target.value === "" ? "" : Number(e.target.value))}
                      />
                      {estimatedMonths !== "" && (
                        <p className="text-xs text-primary font-medium mt-1.5">
                          العمر المحسوب: {calculateAge(null, Number(estimatedMonths))}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            )}

            {/* STEP 3: Identification & Physical */}
            {step === 3 && (
              <CardContent className="p-6 md:p-8 space-y-5 text-right">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-xl">الخطوة 3: المواصفات، الوزن، والشريحة</CardTitle>
                  <CardDescription>بيانات الهوية الفردية للمساعدة في التعرف على الحيوان والتسجيل الطبي</CardDescription>
                </CardHeader>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="weight">الوزن الحالي بالكيلوجرام (اختياري)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.01"
                        placeholder="مثال: 4.5 أو 30"
                        value={weightKg}
                        onChange={(e) => setWeightKg(e.target.value === "" ? "" : Number(e.target.value))}
                        icon={<Scale className="h-4 w-4" />}
                      />
                    </div>
                    <div>
                      <Label htmlFor="color">اللون والعلامات المميزة</Label>
                      <Input
                        id="color"
                        placeholder="مثال: أبيض ناصع، بني مع أسود..."
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="microchip">رقم الشريحة الإلكترونية / Microchip (إن وجد)</Label>
                    <Input
                      id="microchip"
                      placeholder="رقم الـ 15 رقماً الدولي للشريحة..."
                      value={microchipNumber}
                      onChange={(e) => setMicrochipNumber(e.target.value)}
                      icon={<QrCode className="h-4 w-4" />}
                    />
                  </div>

                  <div>
                    <Label htmlFor="photo">صورة الحيوان (اختياري)</Label>
                    <input
                      id="photo"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      className="sr-only"
                      onChange={handlePhotoSelect}
                    />
                    {photoPreview ? (
                      <div className="flex items-center gap-4 rounded-xl border border-border p-3">
                        <img src={photoPreview} alt="معاينة صورة الحيوان" className="h-20 w-20 rounded-lg object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{photoFile?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            تم ضغط الصورة تلقائيًا إلى {((photoFile?.size || 0) / 1024).toFixed(0)} كيلوبايت
                          </p>
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={clearPhoto} aria-label="إزالة الصورة">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <label htmlFor="photo" className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 p-5 text-sm hover:bg-muted/60">
                        {compressingPhoto ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        <span>{compressingPhoto ? "جارٍ ضغط الصورة..." : "اختر صورة من الجهاز"}</span>
                      </label>
                    )}
                    <p className="text-xs text-muted-foreground">تُحوّل الصورة إلى WebP وتُضغط تلقائيًا قبل رفعها.</p>
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/40 border border-border">
                    <input
                      type="checkbox"
                      id="spayed"
                      checked={isSpayedNeutered}
                      onChange={(e) => setIsSpayedNeutered(e.target.checked)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    />
                    <label htmlFor="spayed" className="text-sm font-medium cursor-pointer">
                      تم إجراء عملية تعقيم / إخصاء (Spayed / Neutered)
                    </label>
                  </div>
                </div>
              </CardContent>
            )}

            {/* STEP 4: Review & Confirmation */}
            {step === 4 && (
              <CardContent className="p-6 md:p-8 space-y-6 text-right">
                <CardHeader className="p-0 pb-2">
                  <CardTitle className="text-xl">الخطوة 4: مراجعة البيانات وتأكيد الإنشاء</CardTitle>
                  <CardDescription>تأكد من صحة بيانات الجواز الرقمي قبل الحفظ النهائي</CardDescription>
                </CardHeader>

                <div className="p-5 rounded-2xl bg-muted/30 border border-border/80 space-y-3 text-sm">
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">اسم الحيوان:</span>
                    <strong className="text-foreground">{name}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">الفصيلة والسلالة:</span>
                    <span className="text-foreground">{SPECIES_LABELS[species]?.ar} {breed && `(${breed})`}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">الجنس:</span>
                    <span className="text-foreground">{gender === "male" ? "ذكر" : gender === "female" ? "أنثى" : "غير محدد"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">العمر:</span>
                    <span className="text-foreground">
                      {isAgeEstimated
                        ? `عمر تقديري (${estimatedMonths || 0} شهر)`
                        : birthDate
                        ? birthDate
                        : "غير محدد"}
                    </span>
                  </div>
                  {weightKg !== "" && (
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">الوزن:</span>
                      <span className="text-foreground">{weightKg} كجم</span>
                    </div>
                  )}
                  {microchipNumber && (
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">الشريحة:</span>
                      <span className="text-foreground font-mono">{microchipNumber}</span>
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary leading-relaxed">
                  بمجرد إنشاء الملف، ستتمكن من ربطه فوراً بطبيبك البيطري المعتمد لمشاركة السجلات وإضافة التقارير الطبية.
                </div>
              </CardContent>
            )}

            {/* Navigation buttons */}
            <div className="p-6 border-t border-border/60 flex items-center justify-between">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={handlePrev} className="gap-1.5">
                  <ChevronRight className="h-4 w-4" />
                  السابق
                </Button>
              ) : (
                <Link href="/owner/pets">
                  <Button type="button" variant="ghost">إلغاء</Button>
                </Link>
              )}

              {step < 4 ? (
                <Button type="button" onClick={handleNext} className="gap-1.5 font-semibold">
                  التالي
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" className="gap-1.5 font-semibold px-6" isLoading={loading || compressingPhoto}>
                  <Check className="h-4 w-4" />
                  حفظ وإنشاء بطاقة الهوية الطبية
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
