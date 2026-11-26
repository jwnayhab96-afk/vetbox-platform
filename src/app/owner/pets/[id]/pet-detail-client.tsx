"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/shared/header";
import { TimelineItem } from "@/components/medical/timeline-item";
import { HealthIndicator } from "@/components/pet/health-indicator";
import { SpeciesIcon } from "@/components/pet/species-icon";
import { PetIdCardModal } from "@/components/pet/pet-id-card-modal";
import { PrescriptionModal } from "@/components/medical/prescription-modal";
import { WellnessGauge } from "@/components/pet/wellness-gauge";
import { WeightGrowthChart } from "@/components/pet/weight-growth-chart";
import { Prescription } from "@/lib/types/database.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { calculateAge, formatArabicDate, SPECIES_LABELS } from "@/lib/utils";
import { HolographicCard, triggerConfetti, FadeIn, motion, AnimatePresence } from "@/components/ui/motion";
import {
  PawPrint,
  Calendar,
  Scale,
  QrCode,
  ShieldCheck,
  Stethoscope,
  Plus,
  Clock,
  Pill,
  Syringe,
  FileText,
  UserCheck,
  AlertCircle,
  Share2,
  ChevronLeft,
  CheckCircle2,
  Printer,
  Sparkles,
  Award,
} from "lucide-react";

export default function PetDetailClient({ id: propId }: { id?: string }) {
  const params = useParams();
  const router = useRouter();
  const petId = propId || (params?.id as string);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [pet, setPet] = useState<any>(null);
  const [visits, setVisits] = useState<any[]>([]);
  const [vaccinations, setVaccinations] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [allVets, setAllVets] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/auth/login"); return; }
      const [profileResult, petResult, visitsResult, vaccinationsResult, plansResult, medsResult, rxResult, linksResult, vetsResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("pets").select("*").eq("id", petId).single(),
        supabase.from("medical_visits").select("*").eq("pet_id", petId).order("visit_date", { ascending: false }),
        supabase.from("vaccination_records").select("*").eq("pet_id", petId).order("administration_date", { ascending: false }),
        supabase.from("vaccination_plans").select("*").eq("pet_id", petId).order("recommended_date"),
        supabase.from("medications").select("*").eq("pet_id", petId).order("created_at", { ascending: false }),
        supabase.from("prescriptions").select("*").eq("pet_id", petId).order("created_at", { ascending: false }),
        supabase.from("pet_vet_links").select("*, vet:veterinarian_profiles!pet_vet_links_vet_id_fkey(*, profile:profiles!veterinarian_profiles_id_fkey(*))").eq("pet_id", petId),
        supabase.from("veterinarian_directory").select("*"),
      ]);
      if (!active) return;
      if (profileResult.data) setCurrentProfile(profileResult.data);
      if (petResult.data) setPet(petResult.data);
      setVisits(visitsResult.data || []); setVaccinations(vaccinationsResult.data || []);
      setPlans(plansResult.data || []); setMedications(medsResult.data || []);
      setPrescriptions(rxResult.data || []); setLinks(linksResult.data || []); setAllVets(vetsResult.data || []);
    };
    load().catch((error) => console.error("Unable to load pet medical record", error));
    return () => { active = false; };
  }, [petId, router]);

  // Modal states
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedVetId, setSelectedVetId] = useState("");
  const [linkNotes, setLinkNotes] = useState("");
  const [linkSaving, setLinkSaving] = useState(false);

  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [showRxModal, setShowRxModal] = useState(false);

  const handleOpenPrescription = (rx: Prescription) => {
    setSelectedPrescription(rx);
    setShowRxModal(true);
  };

  if (!pet) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[500px]">
        <AlertCircle className="h-12 w-12 text-destructive mb-3" />
        <h2 className="text-xl font-bold">الحيوان غير موجود أو تم حذفه</h2>
        <Link href="/owner/pets" className="mt-4">
          <Button variant="outline">العودة لقائمة الحيوانات</Button>
        </Link>
      </div>
    );
  }

  const speciesMeta = SPECIES_LABELS[pet.species] || { ar: pet.species, icon: "Sparkles" };
  const ageDisplay = calculateAge(pet.birth_date, pet.estimated_age_months);
  const hasRecentExam = visits.some((v) => v.author_role === "veterinarian");

  const handleSaveOwnerNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle || !noteContent) return;

    setNoteSaving(true);
    const { data, error } = await createClient().from("medical_visits").insert({
      pet_id: pet.id,
      created_by: currentProfile.id,
      author_role: "owner",
      visit_date: new Date().toISOString(),
      visit_type: "owner_observation",
      visit_reason: noteTitle,
      presenting_complaints: noteContent,
      is_verified_diagnosis: false,
      status: "finalized",
    }).select("*").single();
    setNoteSaving(false);
    if (error || !data) { window.alert(error?.message || "تعذر حفظ الملاحظة"); return; }
    setVisits((items) => [data, ...items]);
    setShowAddNote(false); setNoteTitle(""); setNoteContent(""); triggerConfetti();
  };

  const handleSendLinkRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVetId) return;

    setLinkSaving(true);
    const { data, error } = await createClient().from("pet_vet_links").insert({
      pet_id: pet.id, vet_id: selectedVetId, requested_by: currentProfile.id,
      permission_scope: "full_clinical_access", notes: linkNotes || null, status: "pending",
    }).select("*, vet:veterinarian_profiles!pet_vet_links_vet_id_fkey(*, profile:profiles!veterinarian_profiles_id_fkey(*))").single();
    setLinkSaving(false);
    if (error || !data) { window.alert(error?.message || "تعذر إرسال طلب الربط"); return; }
    setLinks((items) => [...items, data]); setShowLinkModal(false); setSelectedVetId(""); setLinkNotes(""); triggerConfetti();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title={`الملف الطبي: ${pet.name}`}
        subtitle={`بطاقة الهوية الطبية المعتمدة • كود: ${pet.id.substring(0, 8).toUpperCase()}`}
        role="owner"
      />

      <div className="p-4 md:p-8 space-y-8 max-w-7xl">
        {/* OFFICIAL DIGITAL PET MEDICAL ID CARD */}
        <FadeIn direction="up" duration={0.4}>
          <HolographicCard className="relative isolate overflow-hidden rounded-3xl border border-primary/25 bg-card shadow-xl shadow-primary/10 ring-1 ring-inset ring-white/40 print:shadow-none">
            {/* Decorative backdrop (visual only) */}
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute -top-24 -end-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
              <div className="absolute -bottom-28 -start-20 h-72 w-72 rounded-full bg-secondary/15 blur-3xl" />
              <div className="absolute inset-0 text-primary/10 [background-image:radial-gradient(circle,currentColor_1px,transparent_1px)] [background-size:18px_18px]" />
              <PawPrint className="absolute -bottom-8 end-8 h-48 w-48 -rotate-12 text-primary/[0.06]" />
            </div>

            {/* Top Medical ID Ribbon Banner */}
            <div className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-2 bg-gradient-to-r from-primary via-primary to-secondary px-5 py-3 text-white md:px-8">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"
              />
              <div className="flex min-w-0 items-center gap-2.5 text-xs font-bold md:text-[13px]">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30 backdrop-blur-sm">
                  <Award className="h-4 w-4" />
                </span>
                <span className="leading-snug">بطاقة الهوية الطبية البيطرية الرسمية — جمهورية مصر العربية</span>
              </div>
              <span
                dir="ltr"
                className="rounded-full bg-black/15 px-3 py-1 font-mono text-[11px] font-bold tracking-widest ring-1 ring-white/25 backdrop-blur-sm"
              >
                ID: {pet.id.substring(0, 13).toUpperCase()}
              </span>
            </div>

            <div className="relative grid gap-6 p-5 sm:p-6 md:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-8">
              <div className="flex min-w-0 flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-7">
                {/* Pet Photo with gradient frame */}
                <div className="relative shrink-0">
                  <div className="rounded-[1.75rem] bg-gradient-to-br from-primary via-primary/50 to-secondary p-1 shadow-xl shadow-primary/25">
                    <div className="h-28 w-28 overflow-hidden rounded-3xl bg-card md:h-36 md:w-36">
                      {pet.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={pet.photo_url} alt={pet.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-secondary/15 text-primary">
                          <SpeciesIcon species={pet.species} className="h-14 w-14 opacity-50" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -end-2 flex h-9 w-9 items-center justify-center rounded-xl bg-card text-primary shadow-lg ring-4 ring-card">
                    <SpeciesIcon species={pet.species} className="h-4 w-4" />
                  </div>
                </div>

                <div className="min-w-0 space-y-3 text-right">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <h2 className="font-display text-3xl font-black tracking-tight text-foreground md:text-4xl">
                      {pet.name}
                    </h2>
                    <Badge
                      variant="outline"
                      className="rounded-full border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary"
                    >
                      {speciesMeta.ar}
                    </Badge>
                    <HealthIndicator
                      hasRecentExam={hasRecentExam}
                      hasOverdueVaccine={false}
                      isOwnerReportedOnly={!hasRecentExam}
                    />
                  </div>

                  <p className="text-sm font-medium text-muted-foreground md:text-base">
                    {pet.breed || "سلالة غير محددة"} • {pet.gender === "male" ? "ذكر" : pet.gender === "female" ? "أنثى" : "غير محدد"}
                    {pet.is_spayed_neutered && " • (معقم/مخصي)"}
                  </p>

                  {/* Passport Meta Strip */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-2 rounded-2xl border border-border/70 bg-background/70 py-1.5 pe-3.5 ps-1.5 shadow-xs backdrop-blur-sm">
                      <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Calendar className="h-3.5 w-3.5" />
                      </span>
                      <span>
                        العمر: <strong className="text-sm font-bold text-foreground">{ageDisplay}</strong>
                      </span>
                    </span>
                    {pet.weight_kg && (
                      <span className="flex items-center gap-2 rounded-2xl border border-border/70 bg-background/70 py-1.5 pe-3.5 ps-1.5 shadow-xs backdrop-blur-sm">
                        <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Scale className="h-3.5 w-3.5" />
                        </span>
                        <span>
                          الوزن: <strong className="text-sm font-bold text-foreground">{pet.weight_kg} كجم</strong>
                        </span>
                      </span>
                    )}
                    {pet.microchip_number && (
                      <span className="flex items-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-gradient-to-l from-primary/15 to-primary/5 py-1.5 pe-3.5 ps-1.5 font-mono font-bold text-primary">
                        <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary text-white shadow-xs">
                          <QrCode className="h-3.5 w-3.5" />
                        </span>
                        شريحة: {pet.microchip_number}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid w-full grid-cols-2 gap-2.5 lg:w-80 lg:border-s lg:border-border/60 lg:ps-8">
                {/* Pet ID Card Download Modal Trigger */}
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowIdCardModal(true)}
                  className="col-span-2 h-11 gap-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition-all hover:-translate-y-0.5 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-xl"
                >
                  <QrCode className="h-4 w-4" />
                  <span>تحميل كارت الهوية (ID Card)</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="h-10 gap-1.5 rounded-xl border-border bg-background/70 text-xs font-bold transition-all hover:-translate-y-0.5 hover:border-primary hover:bg-primary/5"
                >
                  <Printer className="h-4 w-4 text-primary" />
                  طباعة الكارت
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddNote(true)}
                  className="h-10 gap-1.5 rounded-xl border-border bg-background/70 text-xs font-bold transition-all hover:-translate-y-0.5 hover:border-primary hover:bg-primary/5"
                >
                  <Plus className="h-4 w-4 text-primary" />
                  رصد ملاحظة
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowLinkModal(true)}
                  className="col-span-2 h-11 gap-1.5 rounded-xl bg-primary text-xs font-bold text-white shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:bg-primary-hover"
                >
                  <Stethoscope className="h-4 w-4" />
                  ربط بطبيب
                </Button>
              </div>
            </div>

            {/* Bottom accent line */}
            <div aria-hidden className="h-1 bg-gradient-to-r from-secondary via-primary to-secondary opacity-80" />
          </HolographicCard>
        </FadeIn>

        {/* OWNER OBSERVATION MODAL */}
        {showAddNote && (
          <Card className="border-primary/40 bg-card p-6 shadow-md animate-in fade-in space-y-4 rounded-3xl">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                إضافة ملاحظة صحية أو رصد أعراض (مسجلة من المربي)
              </h3>
              <button onClick={() => setShowAddNote(false)} className="text-muted-foreground text-xs hover:text-foreground">
                إلغاء
              </button>
            </div>
            <form onSubmit={handleSaveOwnerNote} className="space-y-3.5 text-right">
              <div>
                <Label htmlFor="noteTitle" required>عنوان الملاحظة أو العَرَض</Label>
                <Input
                  id="noteTitle"
                  required
                  placeholder="مثال: فقدان شهية خفيف، حكة في الأذن، عرج مفاجئ..."
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="noteContent" required>التفاصيل والملاحظات</Label>
                <Textarea
                  id="noteContent"
                  required
                  placeholder="صف ما لاحظته على حيوانك ومتى بدأ العَرَض..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                />
              </div>
              <div className="p-3 rounded-xl bg-muted/40 text-[11px] text-muted-foreground">
                * ملاحظتك ستُحفظ في السجل الزمني وستظهر للطبيب البيطري المعالج كملاحظة من المربي وليست ككشف طبي معتمد.
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddNote(false)}>
                  إلغاء
                </Button>
                <Button type="submit" size="sm" isLoading={noteSaving}>
                  حفظ في السجل
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* LINK VET MODAL */}
        {showLinkModal && (
          <Card className="border-secondary/40 bg-card p-6 shadow-md animate-in fade-in space-y-4 rounded-3xl">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-secondary" />
                طلب ربط مع طبيب بيطري معتمد
              </h3>
              <button onClick={() => setShowLinkModal(false)} className="text-muted-foreground text-xs hover:text-foreground">
                إلغاء
              </button>
            </div>
            <form onSubmit={handleSendLinkRequest} className="space-y-3.5 text-right">
              <div>
                <Label htmlFor="vetSelect" required>اختر الطبيب البيطري</Label>
                <select
                  id="vetSelect"
                  required
                  value={selectedVetId}
                  onChange={(e) => setSelectedVetId(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="">-- حدد الطبيب من القائمة --</option>
                  {allVets.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.profile?.full_name} ({v.clinic_affiliation_name || "عيادة خاصة"})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="linkNotes">رسالة أو ملاحظة للطبيب (اختياري)</Label>
                <Input
                  id="linkNotes"
                  placeholder="مثال: نرغب في المتابعة الدورية والتطعيمات..."
                  value={linkNotes}
                  onChange={(e) => setLinkNotes(e.target.value)}
                />
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 text-[11px] text-amber-900 leading-relaxed">
                * لن يتمكن الطبيب من الوصول للسجل الطبي الكامل إلا بعد موافقته الصريحة على طلب الربط من بوابة الأطباء.
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowLinkModal(false)}>
                  إلغاء
                </Button>
                <Button type="submit" size="sm" isLoading={linkSaving}>
                  إرسال طلب الربط
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* BIOMETRICS & WELLNESS COCKPIT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WellnessGauge
            pet={pet}
            vaccinations={vaccinations}
            visits={visits}
            links={links}
          />
          <WeightGrowthChart
            pet={pet}
            visits={visits}
            onWeightUpdated={(w) => setPet((prev: any) => (prev ? { ...prev, weight_kg: w } : undefined))}
          />
        </div>

        {/* TABS NAVIGATION */}
        <Tabs defaultValue="medical-history" className="w-full">
          <TabsList className="bg-muted/70 p-1.5 rounded-2xl border border-border/60">
            <TabsTrigger value="medical-history" className="gap-2 text-xs md:text-sm font-bold rounded-xl">
              <FileText className="h-4 w-4" />
              <span>التاريخ الطبي والكشوفات ({visits.length})</span>
            </TabsTrigger>
            <TabsTrigger value="vaccinations" className="gap-2 text-xs md:text-sm font-bold rounded-xl">
              <Syringe className="h-4 w-4" />
              <span>التطعيمات الوقائية ({vaccinations.length})</span>
            </TabsTrigger>
            <TabsTrigger value="medications" className="gap-2 text-xs md:text-sm font-bold rounded-xl">
              <Pill className="h-4 w-4" />
              <span>الروشتات والأدوية ({prescriptions.length + medications.length})</span>
            </TabsTrigger>
            <TabsTrigger value="care-team" className="gap-2 text-xs md:text-sm font-bold rounded-xl">
              <Stethoscope className="h-4 w-4" />
              <span>فريق الرعاية والأطباء ({links.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: MEDICAL VISITS TIMELINE */}
          <TabsContent value="medical-history" className="space-y-6 pt-4">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-foreground font-display">السجل الطبي والفحوصات السريرية</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">مرتب زمنياً من الأحدث إلى الأقدم مع إيضاح هوية الطبيب وتأكيد التشخيص</p>
                </div>
              </div>

              {visits.length === 0 ? (
                <div className="p-12 text-center rounded-3xl border border-dashed border-border bg-card/60">
                  <FileText className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
                  <h4 className="font-semibold text-foreground">لا توجد زيارات أو تقارير مسجلة بعد</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    عند قيام الطبيب البيطري المعتمد بالكشف على حيوانك، ستظهر التقارير الطبية ونتائج الفحص هنا.
                  </p>
                </div>
              ) : (
                <div className="pt-2">
                  {visits.map((visit) => (
                    <TimelineItem key={visit.id} visit={visit} />
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* TAB 2: VACCINATIONS */}
          <TabsContent value="vaccinations" className="space-y-6 pt-4">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
            {/* Administered Vaccinations */}
            <div className="space-y-3">
              <div>
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2 font-display">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  التطعيمات المعتمدة المعطاة
                </h3>
                <p className="text-xs text-muted-foreground">الجرعات التي تم إعطاؤها وتوثيق أرقام تشغيلاتها بواسطة طبيب بيطري</p>
              </div>

              {vaccinations.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-card/40 text-xs text-muted-foreground">
                  لا توجد تطعيمات موثقة بعد.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vaccinations.map((vac) => (
                    <Card key={vac.id} className="border-border/80 bg-card p-6 space-y-3 rounded-2xl shadow-xs">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-base text-foreground">{vac.vaccine_name}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">{vac.target_diseases || "وقاية عامة"}</p>
                        </div>
                        <Badge variant="success" className="text-[10px]">
                          <ShieldCheck className="h-3 w-3 ml-1" />
                          موثق بيطرياً
                        </Badge>
                      </div>

                      <div className="text-xs space-y-1.5 pt-2 text-muted-foreground border-t border-border/60">
                        <div className="flex justify-between">
                          <span>تاريخ الحقن:</span>
                          <strong className="text-foreground">{formatArabicDate(vac.administration_date)}</strong>
                        </div>
                        {vac.next_due_date && (
                          <div className="flex justify-between text-amber-900 bg-amber-500/10 p-2 rounded-xl">
                            <span>الجرعة المنشطة القادمة:</span>
                            <strong>{formatArabicDate(vac.next_due_date)}</strong>
                          </div>
                        )}
                        {vac.batch_number && (
                          <div className="flex justify-between font-mono">
                            <span>رقم التشغيلة (Batch):</span>
                            <span>{vac.batch_number}</span>
                          </div>
                        )}
                        {vac.manufacturer && (
                          <div className="flex justify-between">
                            <span>الشركة المصنعة:</span>
                            <span>{vac.manufacturer}</span>
                          </div>
                        )}
                      </div>
                      {vac.notes && <p className="text-xs text-muted-foreground italic bg-muted/40 p-2 rounded-lg">{vac.notes}</p>}
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Future Vaccination Plans */}
            <div className="space-y-3 pt-6 border-t border-border">
              <div>
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2 font-display">
                  <Clock className="h-5 w-5 text-amber-600" />
                  خطة التطعيمات المستقبلية الموصى بها
                </h3>
                <p className="text-xs text-muted-foreground">بروتوكول وقائي وضعه الطبيب البيطري للجرعات القادمة</p>
              </div>

              {plans.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-card/40 text-xs text-muted-foreground">
                  لا توجد خطة تطعيمات مستقبلية مجدولة حالياً.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plans.map((pl) => (
                    <Card key={pl.id} className="border-amber-500/30 bg-amber-500/5 p-6 space-y-2 rounded-2xl">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-base text-foreground">{pl.vaccine_name}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">{pl.target_disease}</p>
                        </div>
                        <Badge variant="warning" className="text-[10px]">مخطط له</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground pt-1">
                        <span>الموعد الموصى به: <strong className="text-foreground">{formatArabicDate(pl.recommended_date)}</strong></span>
                      </div>
                      {pl.notes && <p className="text-xs text-amber-900 leading-relaxed pt-1">{pl.notes}</p>}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </TabsContent>

        {/* TAB 3: MEDICATIONS & E-PRESCRIPTIONS */}
        <TabsContent value="medications" className="space-y-6 pt-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* E-PRESCRIPTIONS SECTION */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-2 font-display">
                    <span className="text-xl font-serif italic text-primary">℞</span>
                    <span>الروشتات الطبية الإلكترونية المعتمدة (E-Prescriptions)</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    روشتات علاجية رسمية موثقة بختم الطبيب المعالج وترخيص النقابة مع رمز QR للتحقق السريع
                  </p>
                </div>
                <Badge variant="outline" className="text-xs font-semibold px-2.5 py-1 gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  <span>{prescriptions.length} روشتة مسجلة</span>
                </Badge>
              </div>

              {prescriptions.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-card/40 text-xs text-muted-foreground">
                  لا توجد روشتات إلكترونية صادرة لهذا الحيوان بعد.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {prescriptions.map((rx) => (
                    <Card
                      key={rx.id}
                      className="border-primary/20 bg-card p-5 space-y-3.5 rounded-2xl shadow-xs hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-serif italic text-primary font-black text-base">℞</span>
                            <span className="font-mono text-xs font-bold text-foreground bg-primary/10 px-2 py-0.5 rounded">
                              {rx.rx_number}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-foreground">{rx.clinic_name}</h4>
                          <p className="text-xs text-muted-foreground">
                            الطبيب: <strong className="text-foreground">{rx.veterinarian_name}</strong> (ترخيص: {rx.veterinarian_license})
                          </p>
                        </div>
                        <Badge
                          variant={rx.status === "active" ? "success" : "neutral"}
                          className="text-[10px] shrink-0"
                        >
                          {rx.status === "active" ? "صالحة للصرف" : "تم الصرف"}
                        </Badge>
                      </div>

                      {/* Diagnosis */}
                      <div className="p-2.5 rounded-xl bg-muted/40 text-xs space-y-0.5">
                        <span className="text-[10px] text-muted-foreground font-semibold block">التشخيص الطبي:</span>
                        <p className="text-foreground font-medium">{rx.diagnosis}</p>
                      </div>

                      {/* Medication summary */}
                      <div className="text-xs text-muted-foreground space-y-1">
                        <span className="text-[11px] font-semibold text-foreground block">
                          الأدوية المقررة ({rx.items.length}):
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-[11px] pr-1">
                          {rx.items.map((it) => (
                            <li key={it.id} className="text-foreground/90">
                              <strong>{it.medication_name}</strong> — {it.dosage} ({it.frequency})
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                        <span className="text-muted-foreground text-[11px]">
                          تاريخ: {formatArabicDate(rx.issue_date)}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenPrescription(rx)}
                            className="text-xs h-8 gap-1 rounded-lg border-primary/30 text-primary hover:bg-primary/5 font-semibold"
                          >
                            <Printer className="h-3.5 w-3.5" />
                            <span>عرض وطباعة الروشتة</span>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* DETAILED MEDICATIONS TABLE / CARDS */}
            <div className="space-y-3 pt-6 border-t border-border">
              <div>
                <h3 className="text-xl font-bold text-foreground font-display">سجل الجرعات والمتابعة الفردية للأدوية</h3>
                <p className="text-xs text-muted-foreground">جدول مواعيد تناول كل دواء والتعليمات التحذيرية الخاصة به</p>
              </div>

              {medications.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-card/40 text-xs text-muted-foreground">
                  لا توجد أدوية مسجلة حالياً.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {medications.map((med) => (
                    <Card key={med.id} className="border-border/80 bg-card p-5 space-y-3 rounded-2xl shadow-xs">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-base text-foreground">{med.medication_name}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">الجرعة: {med.dosage}</p>
                        </div>
                        <Badge variant={med.status === "active" ? "success" : "neutral"} className="text-[10px]">
                          {med.status === "active" ? "علاج نشط" : "مكتمل"}
                        </Badge>
                      </div>

                      <div className="text-xs space-y-1.5 text-muted-foreground border-t border-border/60 pt-2">
                        <div className="flex justify-between">
                          <span>التكرار:</span>
                          <strong className="text-foreground">{med.frequency}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>تاريخ البدء:</span>
                          <span>{formatArabicDate(med.start_date)}</span>
                        </div>
                        {med.end_date && (
                          <div className="flex justify-between">
                            <span>تاريخ الانتهاء:</span>
                            <span>{formatArabicDate(med.end_date)}</span>
                          </div>
                        )}
                      </div>

                      {med.instructions_warnings && (
                        <p className="text-xs bg-muted/40 p-2.5 rounded-xl text-foreground leading-relaxed">
                          ⚠️ {med.instructions_warnings}
                        </p>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </TabsContent>

        {/* TAB 4: CARE TEAM & VET LINKS */}
        <TabsContent value="care-team" className="space-y-4 pt-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-foreground font-display">فريق الرعاية والأطباء البيطريين</h3>
                <p className="text-xs text-muted-foreground">إدارة صلاحيات الوصول لسجل حيوانك الطبي</p>
              </div>
              <Button size="sm" onClick={() => setShowLinkModal(true)} className="gap-1.5 text-xs font-bold rounded-xl">
                <Plus className="h-3.5 w-3.5" />
                طلب ربط دكتور جديد
              </Button>
            </div>

            {links.length === 0 ? (
              <div className="p-12 text-center rounded-3xl border border-dashed border-border bg-card/40 text-xs text-muted-foreground">
                لم يتم ربط أي طبيب بيطري بهذا الحيوان بعد.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {links.map((lnk) => (
                  <Card key={lnk.id} className="border-border/80 bg-card p-6 space-y-3 rounded-2xl shadow-xs">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                          <Stethoscope className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-foreground">
                            {lnk.vet?.profile?.full_name || "طبيب بيطري"}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {lnk.vet?.clinic_affiliation_name || "عيادة خاصة"}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          lnk.status === "accepted" ? "success" : lnk.status === "pending" ? "warning" : "destructive"
                        }
                        className="text-[10px]"
                      >
                        {lnk.status === "accepted" ? "مربوط ومعتمد" : lnk.status === "pending" ? "قيد انتظار الموافقة" : "مرفوض"}
                      </Badge>
                    </div>

                    <div className="text-xs text-muted-foreground pt-2 border-t border-border/60 space-y-1">
                      <div>نطاق الصلاحية: <strong>وصول سريري كامل للسجل الطبي</strong></div>
                      <div>تاريخ الطلب: {formatArabicDate(lnk.created_at)}</div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        </TabsContent>
        </Tabs>
      </div>

      {/* Downloadable Pet ID Card Modal */}
      <PetIdCardModal
        isOpen={showIdCardModal}
        onClose={() => setShowIdCardModal(false)}
        pet={pet}
        owner={currentProfile}
      />

      {/* Official E-Prescription Modal */}
      <PrescriptionModal
        isOpen={showRxModal}
        onClose={() => setShowRxModal(false)}
        prescription={selectedPrescription}
      />
    </div>
  );
}
