"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/shared/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { VISIT_TYPE_LABELS, SPECIES_LABELS } from "@/lib/utils";
import { triggerConfetti } from "@/components/ui/motion";
import {
  Stethoscope,
  Activity,
  Heart,
  Thermometer,
  Calendar,
  Clock,
  ShieldCheck,
  Check,
  ArrowRight,
  ClipboardList,
  Syringe,
  Pill,
} from "lucide-react";

function ClinicalVisitForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultPetId = searchParams.get("petId") || "";

  const [vetId, setVetId] = useState("");
  const [authorizedLinks, setAuthorizedLinks] = useState<any[]>([]);

  // Form states
  const [petId, setPetId] = useState(defaultPetId);
  const [visitType, setVisitType] = useState<any>("routine_checkup");
  const [visitReason, setVisitReason] = useState("");
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split("T")[0]);
  const [complaints, setComplaints] = useState("");
  const [clinicalExam, setClinicalExam] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatmentPlan, setTreatmentPlan] = useState("");

  // Vitals
  const [temp, setTemp] = useState<number | "">("");
  const [heartRate, setHeartRate] = useState<number | "">("");
  const [respRate, setRespRate] = useState<number | "">("");

  // Follow-up
  const [nextDate, setNextDate] = useState("");
  const [followupNotes, setFollowupNotes] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/auth/login"); return; }
      setVetId(user.id);
      const { data, error } = await supabase.from("pet_vet_links")
        .select("*, pet:pets(*)").eq("vet_id", user.id).eq("status", "accepted");
      if (!error) setAuthorizedLinks(data || []);
    };
    load();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!petId || !visitReason) {
      alert("يرجى اختيار المريض وتحديد سبب الكشف");
      return;
    }

    if (!vetId || !authorizedLinks.some((link) => link.pet_id === petId)) {
      alert("لا تملك صلاحية تسجيل كشف لهذا الحيوان.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("medical_visits").insert({
      pet_id: petId,
      vet_id: vetId,
      created_by: vetId,
      author_role: "veterinarian",
      visit_date: new Date(visitDate).toISOString(),
      visit_type: visitType,
      visit_reason: visitReason,
      presenting_complaints: complaints || null,
      clinical_examination: clinicalExam || null,
      diagnosis: diagnosis || null,
      treatment_plan: treatmentPlan || null,
      temperature_celsius: temp !== "" ? Number(temp) : null,
      heart_rate_bpm: heartRate !== "" ? Number(heartRate) : null,
      respiratory_rate_bpm: respRate !== "" ? Number(respRate) : null,
      is_verified_diagnosis: true,
      next_appointment_date: nextDate || null,
      follow_up_recommendations: followupNotes || null,
      status: "finalized",
    });

    if (error) {
      setLoading(false);
      alert(error.message);
      return;
    }

    triggerConfetti();

    setLoading(false);
    router.push(`/veterinarian/patients/${petId}`);
  };

  return (
    <Card className="border-border shadow-xs rounded-3xl overflow-hidden">
      <form onSubmit={handleSubmit}>
        <CardHeader className="p-6 md:p-8 pb-4 text-right border-b border-border/70 bg-primary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-bold text-base md:text-lg">
              <ShieldCheck className="h-6 w-6" />
              <span>تقرير كشف سريري معتمد بنظام SOAP الطبي البيطري</span>
            </div>
            <Badge variant="success" className="text-xs">
              توثيق رسمي
            </Badge>
          </div>
          <CardDescription className="text-xs mt-1">
            سيتم اعتماد هذا التقرير تلقائياً وتثبيته في السجل الطبي الرقمي للمريض بختم الطبيب المعالج.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 md:p-8 space-y-7 text-right">
          {/* Patient Selector & Visit Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="petSelect" required>المريض (الحالات المصرح بها)</Label>
              <select
                id="petSelect"
                required
                value={petId}
                onChange={(e) => setPetId(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-input bg-card px-3 text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="">-- حدد الحيوان المريض --</option>
                {authorizedLinks.map((lnk) => (
                  <option key={lnk.pet_id} value={lnk.pet_id}>
                    {lnk.pet?.name} ({SPECIES_LABELS[lnk.pet?.species || ""]?.ar} - {lnk.pet?.breed || "مختلط"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="visitType" required>نوع الكشف أو الزيارة</Label>
              <select
                id="visitType"
                value={visitType}
                onChange={(e) => setVisitType(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-input bg-card px-3 text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
              >
                {Object.entries(VISIT_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reason & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="reason" required>سبب الزيارة أو الكشف الرئيسي</Label>
              <Input
                id="reason"
                required
                placeholder="مثال: فحص دوري شامل، اشتباه مغص، عرج مفاجئ، حكة جلدية..."
                value={visitReason}
                onChange={(e) => setVisitReason(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="date" required>تاريخ الكشف</Label>
              <Input
                id="date"
                type="date"
                required
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          {/* SOAP: Section 1 - Subjective */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-2">
            <span className="text-xs font-bold text-primary block flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4" />
              1. الأعراض وتاريخ الحالة من المربي (Subjective - History)
            </span>
            <Textarea
              id="complaints"
              placeholder="وصف المربي للأعراض، تاريخ البداية، الشهية، النشاط، وأي أدوية سابقة..."
              value={complaints}
              onChange={(e) => setComplaints(e.target.value)}
              className="rounded-xl min-h-[80px]"
            />
          </div>

          {/* SOAP: Section 2 - Objective & Vitals */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-3">
            <span className="text-xs font-bold text-primary block flex items-center gap-1.5">
              <Activity className="h-4 w-4" />
              2. نتائج الفحص الإكلينيكي والمؤشرات الحيوية (Objective - Clinical Exam)
            </span>

            {/* Vital Signs Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-card border border-border">
                <Label htmlFor="temp" className="text-xs font-semibold flex items-center gap-1">
                  <Thermometer className="h-3.5 w-3.5 text-amber-600" />
                  درجة الحرارة (°C)
                </Label>
                <Input
                  id="temp"
                  type="number"
                  step="0.1"
                  placeholder="38.5"
                  value={temp}
                  onChange={(e) => setTemp(e.target.value === "" ? "" : Number(e.target.value))}
                  className="mt-1 h-9 rounded-lg"
                />
              </div>

              <div className="p-3 rounded-xl bg-card border border-border">
                <Label htmlFor="hr" className="text-xs font-semibold flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5 text-rose-500" />
                  النبض (BPM)
                </Label>
                <Input
                  id="hr"
                  type="number"
                  placeholder="95"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value === "" ? "" : Number(e.target.value))}
                  className="mt-1 h-9 rounded-lg"
                />
              </div>

              <div className="p-3 rounded-xl bg-card border border-border">
                <Label htmlFor="rr" className="text-xs font-semibold flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5 text-sky-500" />
                  معدل التنفس (دورة/د)
                </Label>
                <Input
                  id="rr"
                  type="number"
                  placeholder="24"
                  value={respRate}
                  onChange={(e) => setRespRate(e.target.value === "" ? "" : Number(e.target.value))}
                  className="mt-1 h-9 rounded-lg"
                />
              </div>
            </div>

            <Textarea
              id="exam"
              placeholder="الأغشية المخاطية، التسمع الصدري، جس البطن، العقد الليمفاوية، المفاصل..."
              value={clinicalExam}
              onChange={(e) => setClinicalExam(e.target.value)}
              className="rounded-xl min-h-[80px]"
            />
          </div>

          {/* SOAP: Section 3 - Assessment (Diagnosis) */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
            <span className="text-xs font-bold text-emerald-900 block flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              3. التشخيص الطبي البيطري المعتمد (Assessment / Diagnosis)
            </span>
            <Input
              id="diagnosis"
              required
              placeholder="مثال: التهاب أمعاء جرثومي حاد، التواء خفيف في الرباط الصليبي، التهاب أذن وسطى..."
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="h-11 rounded-xl bg-white border-emerald-300 font-bold text-foreground"
            />
          </div>

          {/* SOAP: Section 4 - Plan & Prescription */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-2">
            <span className="text-xs font-bold text-primary block flex items-center gap-1.5">
              <Pill className="h-4 w-4" />
              4. الخطة العلاجية والوصفة الطبية (Plan & Rx)
            </span>
            <Textarea
              id="treatment"
              required
              placeholder="الأدوية المقررة، الجرعات، التكرار ومدة العلاج، والتوصيات الغذائية الحالية..."
              value={treatmentPlan}
              onChange={(e) => setTreatmentPlan(e.target.value)}
              className="rounded-xl min-h-[90px]"
            />
          </div>

          {/* Follow-up & Next appointment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nextApp">تاريخ إعادة الكشف الموصى به (اختياري)</Label>
              <Input
                id="nextApp"
                type="date"
                value={nextDate}
                onChange={(e) => setNextDate(e.target.value)}
                icon={<Calendar className="h-4 w-4" />}
                className="h-11 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="followNotes">إرشادات متابعة إضافية للمربي</Label>
              <Input
                id="followNotes"
                placeholder="التدفئة، توفير مياه نظيفة، مراجعة الطوارئ في حال..."
                value={followupNotes}
                onChange={(e) => setFollowupNotes(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-border/70 flex items-center justify-between">
            <Link href="/veterinarian/patients">
              <Button type="button" variant="ghost">إلغاء</Button>
            </Link>
            <Button type="submit" size="lg" className="font-bold gap-2 px-8 rounded-xl bg-primary hover:bg-primary-hover text-white shadow-sm" isLoading={loading}>
              <Check className="h-4 w-4" />
              اعتماد الكشف وتثبيته في السجل الطبي
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}

export default function NewClinicalVisitPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="تسجيل تقرير كشف سريري معتمد"
        subtitle="توثيق الفحص، التشخيص البيطري، والعلاج الطبي"
        role="veterinarian"
      />

      <div className="p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6">
        <Suspense fallback={<div className="p-12 text-center text-muted-foreground">جاري تحميل النموذج...</div>}>
          <ClinicalVisitForm />
        </Suspense>
      </div>
    </div>
  );
}
