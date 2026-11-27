"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import {
  Stethoscope,
  ShieldCheck,
  Building,
  ArrowRight,
  Check,
} from "lucide-react";

export default function VetDetailClient({ id: propId }: { id?: string }) {
  const params = useParams();
  const vetId = propId || (params?.id as string);
  const [vet, setVet] = useState<any>(null);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [userPets, setUserPets] = useState<any[]>([]);
  const [petsLoading, setPetsLoading] = useState(false);
  const [petsLoadError, setPetsLoadError] = useState("");
  const [eligibleToReview, setEligibleToReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewSaving, setReviewSaving] = useState(false);

  const [selectedPet, setSelectedPet] = useState("");
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const supabase = createClient();
      const [{ data: vetData }, { data: { user } }] = await Promise.all([
        supabase.from("veterinarian_directory").select("*").eq("id", vetId).single(),
        supabase.auth.getUser(),
      ]);
      if (!active) return;
      setVet(vetData);
      if (user) {
        setPetsLoading(true);
        const [profileResult, petsResult] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).single(),
          supabase.from("pets").select("id, name, species, breed").eq("owner_id", user.id).order("name"),
        ]);
        if (active) {
          setCurrentProfile(profileResult.data || { id: user.id });
          setUserPets(petsResult.data || []);
          setPetsLoadError(petsResult.error ? `تعذر تحميل حيواناتك: ${petsResult.error.message}` : "");
          setPetsLoading(false);
        }
        if (!petsResult.error && (petsResult.data || []).length > 0) {
          const { data: completedVisits } = await supabase.from("medical_visits").select("id").eq("vet_id", vetId).eq("author_role", "veterinarian").eq("status", "finalized").in("pet_id", petsResult.data.map((pet) => pet.id)).limit(1);
          if (active) setEligibleToReview(Boolean(completedVisits?.length));
        }
      }
    };
    load();
    return () => { active = false; };
  }, [vetId]);

  if (!vet) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <div className="container py-20 text-center space-y-4">
          <h2 className="text-xl font-bold">الطبيب غير موجود</h2>
          <Link href="/veterinarians">
            <Button variant="outline">العودة لدليل الأطباء</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPet || !currentProfile) { window.location.assign("/auth/login"); return; }
    const supabase = createClient();
    const { error } = await supabase.from("pet_vet_links").insert({
      pet_id: selectedPet,
      vet_id: vet.id,
      requested_by: currentProfile.id,
      status: "pending",
      permission_scope: "full_clinical_access",
    });
    if (error) { window.alert(error.message); return; }
    setRequested(true);
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault(); setReviewSaving(true); setReviewMessage("");
    const { error } = await createClient().rpc("submit_veterinarian_review", { target_vet_id: vet.id, target_rating: rating, target_review: reviewText.trim() || null });
    setReviewSaving(false);
    setReviewMessage(error ? "لم نتمكن من حفظ التقييم. تأكد من وجود زيارة مكتملة مع هذا الطبيب، ثم حاول مرة أخرى." : "تم حفظ تقييمك، شكرًا لمشاركتنا تجربتك.");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-10 md:py-16">
        <div className="container max-w-4xl space-y-8">
          <Link href="/veterinarians" className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline">
            <ArrowRight className="h-4 w-4" />
            العودة لكل الأطباء البيطريين
          </Link>

          {/* Profile Card */}
          <Card className="border-border shadow-xs bg-card p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="h-24 w-24 md:h-28 md:w-28 rounded-2xl bg-muted overflow-hidden shrink-0 border-2 border-primary/20">
                {vet.profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={vet.profile.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-primary bg-primary/10">
                    <Stethoscope className="h-10 w-10" />
                  </div>
                )}
              </div>

              <div className="space-y-1.5 text-right flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-foreground">{vet.profile?.full_name}</h1>
                  <Badge variant="success" className="text-xs">
                    <ShieldCheck className="h-3.5 w-3.5 ml-1" />
                    طبيب بيطري معتمد
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{vet.education}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 flex-wrap">
                  <span className="font-mono bg-muted px-2 py-0.5 rounded">رقم القيد: {vet.license_number}</span>
                  <span>الخبرة: <strong>{vet.years_of_experience} سنوات</strong></span>
                  <span>الكشف: <strong>{vet.consultation_fee} ج.م</strong></span>
                </div>
                <p className="text-sm font-semibold text-amber-700">★ {Number(vet.average_rating || 0).toFixed(1)} <span className="font-normal text-muted-foreground">({vet.rating_count || 0} تقييم)</span></p>
              </div>
            </div>

            <div className="pt-6 border-t border-border/60 mt-6 space-y-4 text-right">
              <h3 className="font-bold text-base text-foreground">عن الطبيب والخبرات السريرية</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{vet.bio}</p>

              {vet.clinic_affiliation_name && (
                <div className="p-4 rounded-xl bg-muted/40 border border-border/60 flex items-center gap-3">
                  <Building className="h-5 w-5 text-primary" />
                  <div>
                    <span className="text-xs text-muted-foreground block">العيادة أو المستشفى:</span>
                    <strong className="text-sm text-foreground">{vet.clinic_affiliation_name}</strong>
                  </div>
                </div>
              )}
              <div className="rounded-xl bg-muted/40 border border-border/60 p-4">
                <strong className="text-sm">ساعات العمل</strong>
                <div className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                  {Object.entries(vet.opening_hours || {}).filter(([, value]) => Boolean(value)).map(([day, value]) => <span key={day}>{day}: {String(value)}</span>)}
                  {!Object.values(vet.opening_hours || {}).some(Boolean) && <span>لم يضف الطبيب ساعات العمل بعد.</span>}
                </div>
              </div>
            </div>

            {eligibleToReview && <form onSubmit={handleReview} className="mt-6 space-y-3 border-t border-border/60 pt-5 text-right">
              <h3 className="font-bold">قيّم تجربتك بعد الزيارة</h3>
              <p className="text-xs text-muted-foreground">التقييم متاح لأصحاب الحيوانات التي لديها زيارة مكتملة مسجلة مع الطبيب.</p>
              <div className="flex flex-wrap items-center gap-3"><label htmlFor="vet-rating" className="text-sm">التقييم</label><select id="vet-rating" value={rating} onChange={(e) => setRating(Number(e.target.value))} className="h-10 rounded-lg border border-input bg-background px-3"><option value={5}>5 نجوم</option><option value={4}>4 نجوم</option><option value={3}>3 نجوم</option><option value={2}>نجمتان</option><option value={1}>نجمة واحدة</option></select></div>
              <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} maxLength={1200} rows={3} placeholder="اكتب رأيك (اختياري)" className="w-full rounded-xl border border-input bg-background p-3 text-sm" />
              <Button type="submit" disabled={reviewSaving}>{reviewSaving ? "جارٍ الحفظ..." : "حفظ التقييم"}</Button>
              {reviewMessage && <p role="status" className="text-sm text-muted-foreground">{reviewMessage}</p>}
            </form>}

            {/* Connect Section */}
            <div className="pt-6 border-t border-border/60 mt-6 text-right space-y-3">
              <h3 className="font-bold text-base text-foreground">ربط حيوانك بهذا الطبيب</h3>
              {requested ? (
                <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 text-xs flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  تم إرسال طلب الربط بنجاح إلى الطبيب. ستصلك رسالة فور اعتماده.
                </div>
              ) : (
                <form onSubmit={handleConnect} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <select
                    value={selectedPet}
                    onChange={(e) => setSelectedPet(e.target.value)}
                    required
                    className="flex-1 h-10 rounded-lg border border-input bg-card px-3 text-xs md:text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="">{petsLoading ? "جارٍ تحميل حيواناتك..." : "-- اختر الحيوان الذي تريد ربطه --"}</option>
                    {userPets.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.breed || p.species})</option>
                    ))}
                  </select>
                  <Button type="submit" className="font-semibold text-xs h-10">
                    إرسال طلب ربط طبي
                  </Button>
                  {petsLoadError && <p role="alert" className="text-xs text-destructive">{petsLoadError}</p>}
                  {!petsLoading && !petsLoadError && userPets.length === 0 && (
                    <p className="text-xs text-muted-foreground">لا توجد حيوانات مسجلة في حسابك. <Link className="text-primary underline" href="/owner/pets/new">أضف حيوانًا أولًا</Link>.</p>
                  )}
                </form>
              )}
            </div>
          </Card>
        </div>
      </main>

    </div>
  );
}
