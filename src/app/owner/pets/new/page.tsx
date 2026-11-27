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
    const newPetId = crypto.randomUUID();

    let uploadedPhotoUrl: string | null = null;

    const { error } = await supabase.from("pets").insert({
      id: newPetId,
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
    });

    if (error) {
      setLoading(false);
      window.alert(error?.message || "تعذر حفظ بيانات الحيوان.");
      return;
    }

    if (photoFile) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        await supabase.from("pets").delete().eq("id", newPetId).eq("owner_id", ownerId);
        setLoading(false);
        router.replace("/auth/login");
        return;
      }

      let uploadedObjectKey = "";
      try {
        const uploadResponse = await fetch("/api/pet-photo", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "image/webp",
            "x-pet-id": newPetId,
          },
          body: photoFile,
        });
        const uploadResult = await uploadResponse.json();
        if (!uploadResponse.ok || typeof uploadResult.url !== "string" || typeof uploadResult.key !== "string") {
          throw new Error(uploadResult.error || "تعذر رفع الصورة إلى مساحة التخزين.");
        }
        uploadedPhotoUrl = uploadResult.url;
        uploadedObjectKey = uploadResult.key;
      } catch (uploadError) {
        await supabase.from("pets").delete().eq("id", newPetId).eq("owner_id", ownerId);
        setLoading(false);
        window.alert(uploadError instanceof Error ? uploadError.message : "تعذر رفع الصورة.");
        return;
      }

      const { error: photoUpdateError } = await supabase.from("pets")
        .update({ photo_url: uploadedPhotoUrl })
        .eq("id", newPetId)
        .eq("owner_id", ownerId);
      if (photoUpdateError) {
        await fetch("/api/pet-photo", {
          method: "DELETE",
          headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ petId: newPetId, key: uploadedObjectKey }),
        }).catch(() => undefined);
        await supabase.from("pets").delete().eq("id", newPetId).eq("owner_id", ownerId);
        setLoading(false);
        window.alert(`تم رفع الصورة لكن تعذر ربطها بملف الحيوان: ${photoUpdateError.message}`);
        return;
      }
    }

    triggerConfetti();

    setLoading(false);
    router.push(`/owner/pets/detail?id=${encodeURIComponent(newPetId)}`);
  };

  const stepClass = (n: number) =>
    step >= n
      ? "bg-primary text-primary-foreground border-primary"
      : "bg-card text-muted-foreground border-border";
  const stepIcon = (n: number) =>
    step > n ? (
      <Check className="h-4 w-4" />
    ) : step === n ? (
      <span className="h-3 w-3 rounded-full bg-current animate-pulse" />
    ) : (
      <span className="h-3 w-3 rounded-full border-2 border-current opacity-50" />
    );

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-muted/20">
      <Header
        title="إضافة حيوان جديد"
        subtitle="إنشاء بطاقة هوية طبية وملف صحي متكامل"
        role="owner"
      />

      <div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto w-full space-y-5 md:space-y-6">
        {/* Step Progress Indicators */}
        <div className="space-y-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${step * 25}%` }} />
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-[11px] sm:text-xs font-bold leading-snug">
            <div className={`flex flex-col items-center justify-center gap-1.5 min-h-[72px] p-2 rounded-2xl border transition-all ${stepClass(1)} ${step === 1 ? "shadow-md ring-2 ring-primary/30" : ""}`}>
              {stepIcon(1)}
              <span>1. الفصيلة والاسم</span>
            </div>
            <div className={`flex flex-col items-center justify-center gap-1.5 min-h-[72px] p-2 rounded-2xl border transition-all ${stepClass(2)} ${step === 2 ? "shadow-md ring-2 ring-primary/30" : ""}`}>
              {stepIcon(2)}
              <span>2. العمر والميلاد</span>
            </div>
            <div className={`flex flex-col items-center justify-center gap-1.5 min-h-[72px] p-2 rounded-2xl border transition-all ${stepClass(3)} ${step === 3 ? "shadow-md ring-2 ring-primary/30" : ""}`}>
              {stepIcon(3)}
              <span>3. المواصفات والشريحة</span>
            </div>
            <div className={`flex flex-col items-center justify-center gap-1.5 min-h-[72px] p-2 rounded-2xl border transition-all ${stepClass(4)} ${step === 4 ? "shadow-md ring-2 ring-primary/30" : ""}`}>
              {stepIcon(4)}
              <span>4. التأكيد والحفظ</span>
            </div>
          </div>
        </div>

        <Card className="border-border/70 shadow-lg rounded-[2rem] overflow-hidden p-0 gap-0">
          <form onSubmit={handleSubmit}>
            {/* STEP 1: Basic Info & Species */}
            {step === 1 && (
              <CardContent className="p-0 text-right">
                <CardHeader className="p-5 sm:px-8 sm:py-6 bg-primary/5 border-b border-border/70">
                  <div className="flex items-start gap-3.5">
                    <span className="h-12 w-12 shrink-0 rounded-2xl bg-primary text-white flex items-center justify-center shadow-sm">
                      <PawPrint className="h-6 w-6" />
                    </span>
                    <div className="min-w-0 space-y-1">
                      <CardTitle className="text-lg sm:text-xl leading-snug">الخطوة 1: المعلومات الأساسية ونوع الفصيلة</CardTitle>
                      <CardDescription>حدد نوع الحيوان واسمه وسلالته</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <div className="p-5 sm:p-8 space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="petName" required>اسم الحيوان</Label>
                    <Input
                      id="petName"
                      required
                      placeholder="مثال: روكي، لونا، زعفرانة..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-12 rounded-2xl text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label required>نوع الحيوان والفصيلة</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pt-1">
                      {Object.entries(SPECIES_LABELS).map(([key, val]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSpecies(key as any)}
                          className={`min-h-14 p-3 rounded-2xl border-2 text-center text-sm font-bold transition-all active:scale-95 cursor-pointer ${
                            species === key
                              ? "bg-primary text-primary-foreground border-primary shadow-md ring-4 ring-primary/15"
                              : "bg-card text-foreground border-border hover:border-primary/50 hover:bg-primary/5"
                          }`}
                        >
                          {val.ar}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <Label htmlFor="breed">السلالة أو النوع (اختياري)</Label>
                      <Input
                        id="breed"
                        placeholder="مثال: جيرمن شيبرد، شيرازي، هافربد..."
                        value={breed}
                        onChange={(e) => setBreed(e.target.value)}
                        className="h-12 rounded-2xl text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="gender" required>الجنس</Label>
                      <select
                        id="gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value as any)}
                        className="flex h-12 w-full rounded-2xl border border-input bg-muted/40 px-4 text-sm cursor-pointer transition-colors hover:border-primary/50 focus:ring-2 focus:ring-primary focus:outline-none"
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
              <CardContent className="p-0 text-right">
                <CardHeader className="p-5 sm:px-8 sm:py-6 bg-primary/5 border-b border-border/70">
                  <div className="flex items-start gap-3.5">
                    <span className="h-12 w-12 shrink-0 rounded-2xl bg-primary text-white flex items-center justify-center shadow-sm">
                      <Calendar className="h-6 w-6" />
                    </span>
                    <div className="min-w-0 space-y-1">
                      <CardTitle className="text-lg sm:text-xl leading-snug">الخطوة 2: تاريخ الميلاد أو تقدير العمر</CardTitle>
                      <CardDescription>
                        إذا كنت لا تعرف تاريخ الميلاد الدقيق، يمكنك إدخال العمر التقديري بالشهور.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <div className="p-5 sm:p-8 space-y-5">
                  <div className="flex items-center gap-3.5 min-h-14 p-4 rounded-2xl bg-muted/40 border border-border">
                    <input
                      type="checkbox"
                      id="estimateAge"
                      checked={isAgeEstimated}
                      onChange={(e) => setIsAgeEstimated(e.target.checked)}
                      className="h-6 w-6 shrink-0 rounded-lg border-2 border-border text-primary focus:ring-primary cursor-pointer"
                    />
                    <label htmlFor="estimateAge" className="flex-1 py-1 text-sm font-semibold leading-relaxed cursor-pointer">
                      لا أعرف تاريخ الميلاد الدقيق (أريد إدخال عمر تقريبي)
                    </label>
                  </div>

                  {!isAgeEstimated ? (
                    <div className="space-y-1.5">
                      <Label htmlFor="birthDate">تاريخ الميلاد الدقيق</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        icon={<Calendar className="h-4 w-4" />}
                        className="h-12 rounded-2xl text-sm"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <Label htmlFor="estMonths">العمر التقديري الحالي (بالشهور)</Label>
                      <Input
                        id="estMonths"
                        type="number"
                        min="1"
                        max="600"
                        placeholder="مثال: 12 شهر (سنة واحدة)، 6 شهور..."
                        value={estimatedMonths}
                        onChange={(e) => setEstimatedMonths(e.target.value === "" ? "" : Number(e.target.value))}
                        className="h-12 rounded-2xl text-sm"
                      />
                      {estimatedMonths !== "" && (
                        <p className="inline-block rounded-full bg-primary/10 px-3.5 py-1.5 text-xs sm:text-sm text-primary font-bold mt-1.5">
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
              <CardContent className="p-0 text-right">
                <CardHeader className="p-5 sm:px-8 sm:py-6 bg-primary/5 border-b border-border/70">
                  <div className="flex items-start gap-3.5">
                    <span className="h-12 w-12 shrink-0 rounded-2xl bg-primary text-white flex items-center justify-center shadow-sm">
                      <Scale className="h-6 w-6" />
                    </span>
                    <div className="min-w-0 space-y-1">
                      <CardTitle className="text-lg sm:text-xl leading-snug">الخطوة 3: المواصفات، الوزن، والشريحة</CardTitle>
                      <CardDescription>بيانات الهوية الفردية للمساعدة في التعرف على الحيوان والتسجيل الطبي</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <div className="p-5 sm:p-8 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="weight">الوزن الحالي بالكيلوجرام (اختياري)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.01"
                        placeholder="مثال: 4.5 أو 30"
                        value={weightKg}
                        onChange={(e) => setWeightKg(e.target.value === "" ? "" : Number(e.target.value))}
                        icon={<Scale className="h-4 w-4" />}
                        className="h-12 rounded-2xl text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="color">اللون والعلامات المميزة</Label>
                      <Input
                        id="color"
                        placeholder="مثال: أبيض ناصع، بني مع أسود..."
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="h-12 rounded-2xl text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="microchip">رقم الشريحة الإلكترونية / Microchip (إن وجد)</Label>
                    <Input
                      id="microchip"
                      placeholder="رقم الـ 15 رقماً الدولي للشريحة..."
                      value={microchipNumber}
                      onChange={(e) => setMicrochipNumber(e.target.value)}
                      icon={<QrCode className="h-4 w-4" />}
                      className="h-12 rounded-2xl text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="photo">صورة الحيوان (اختياري)</Label>
                    <input
                      id="photo"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      className="sr-only"
                      onChange={handlePhotoSelect}
                    />
                    {photoPreview ? (
                      <div className="flex items-center gap-4 rounded-3xl border border-border bg-card p-3 shadow-sm">
                        <img src={photoPreview} alt="معاينة صورة الحيوان" className="h-24 w-24 rounded-2xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold">{photoFile?.name}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            تم ضغط الصورة تلقائيًا إلى {((photoFile?.size || 0) / 1024).toFixed(0)} كيلوبايت
                          </p>
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={clearPhoto} aria-label="إزالة الصورة" className="h-11 w-11 shrink-0 rounded-2xl">
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                    ) : (
                      <label htmlFor="photo" className="flex cursor-pointer items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 min-h-28 text-sm font-bold text-primary transition-colors hover:bg-primary/10 active:scale-[0.99]">
                        {compressingPhoto ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                        <span>{compressingPhoto ? "جارٍ ضغط الصورة..." : "اختر صورة من الجهاز"}</span>
                      </label>
                    )}
                    <p className="text-xs text-muted-foreground">تُحوّل الصورة إلى WebP وتُضغط تلقائيًا قبل رفعها.</p>
                  </div>

                  <div className="flex items-center gap-3.5 min-h-14 p-4 rounded-2xl bg-muted/40 border border-border">
                    <input
                      type="checkbox"
                      id="spayed"
                      checked={isSpayedNeutered}
                      onChange={(e) => setIsSpayedNeutered(e.target.checked)}
                      className="h-6 w-6 shrink-0 rounded-lg border-2 border-border text-primary focus:ring-primary cursor-pointer"
                    />
                    <label htmlFor="spayed" className="flex-1 py-1 text-sm font-semibold leading-relaxed cursor-pointer">
                      تم إجراء عملية تعقيم / إخصاء (Spayed / Neutered)
                    </label>
                  </div>
                </div>
              </CardContent>
            )}

            {/* STEP 4: Review & Confirmation */}
            {step === 4 && (
              <CardContent className="p-0 text-right">
                <CardHeader className="p-5 sm:px-8 sm:py-6 bg-primary/5 border-b border-border/70">
                  <div className="flex items-start gap-3.5">
                    <span className="h-12 w-12 shrink-0 rounded-2xl bg-primary text-white flex items-center justify-center shadow-sm">
                      <Sparkles className="h-6 w-6" />
                    </span>
                    <div className="min-w-0 space-y-1">
                      <CardTitle className="text-lg sm:text-xl leading-snug">الخطوة 4: مراجعة البيانات وتأكيد الإنشاء</CardTitle>
                      <CardDescription>تأكد من صحة بيانات الجواز الرقمي قبل الحفظ النهائي</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <div className="p-5 sm:p-8 space-y-5">
                  <div className="px-4 sm:px-5 py-2 rounded-3xl bg-card border border-border/80 shadow-sm text-sm">
                    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-border/50">
                      <span className="text-muted-foreground">اسم الحيوان:</span>
                      <strong className="text-foreground text-base">{name}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-border/50">
                      <span className="text-muted-foreground">الفصيلة والسلالة:</span>
                      <span className="text-foreground font-semibold">{SPECIES_LABELS[species]?.ar} {breed && `(${breed})`}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-border/50">
                      <span className="text-muted-foreground">الجنس:</span>
                      <span className="text-foreground font-semibold">{gender === "male" ? "ذكر" : gender === "female" ? "أنثى" : "غير محدد"}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-border/50 last:border-b-0">
                      <span className="text-muted-foreground">العمر:</span>
                      <span className="text-foreground font-semibold">
                        {isAgeEstimated
                          ? `عمر تقديري (${estimatedMonths || 0} شهر)`
                          : birthDate
                          ? birthDate
                          : "غير محدد"}
                      </span>
                    </div>
                    {weightKg !== "" && (
                      <div className="flex items-center justify-between gap-4 py-3.5 border-b border-border/50 last:border-b-0">
                        <span className="text-muted-foreground">الوزن:</span>
                        <span className="text-foreground font-semibold">{weightKg} كجم</span>
                      </div>
                    )}
                    {microchipNumber && (
                      <div className="flex items-center justify-between gap-4 py-3.5 border-b border-border/50 last:border-b-0">
                        <span className="text-muted-foreground">الشريحة:</span>
                        <span className="text-foreground font-mono font-semibold break-all">{microchipNumber}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/20 border-s-4 border-s-primary text-xs sm:text-sm text-primary font-medium leading-relaxed">
                    <Sparkles className="h-5 w-5 shrink-0 mt-0.5" />
                    <span>بمجرد إنشاء الملف، ستتمكن من ربطه فوراً بطبيبك البيطري المعتمد لمشاركة السجلات وإضافة التقارير الطبية.</span>
                  </div>
                </div>
              </CardContent>
            )}

            {/* Navigation buttons */}
            <div className="p-4 sm:p-6 border-t border-border/60 bg-muted/30 flex items-center justify-between gap-3">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={handlePrev} className="gap-1.5 min-h-12 px-5 rounded-2xl font-bold shrink-0 active:scale-95 transition-transform">
                  <ChevronRight className="h-4 w-4" />
                  السابق
                </Button>
              ) : (
                <Link href="/owner/pets" className="shrink-0">
                  <Button type="button" variant="ghost" className="min-h-12 px-5 rounded-2xl font-semibold">إلغاء</Button>
                </Link>
              )}

              {step < 4 ? (
                <Button type="button" onClick={handleNext} className="gap-1.5 font-bold min-h-12 px-8 rounded-2xl shadow-md flex-1 sm:flex-none active:scale-95 transition-transform">
                  التالي
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" className="gap-1.5 font-bold px-6 min-h-12 h-auto py-3 rounded-2xl shadow-md flex-1 sm:flex-none whitespace-normal active:scale-95 transition-transform" isLoading={loading || compressingPhoto}>
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
