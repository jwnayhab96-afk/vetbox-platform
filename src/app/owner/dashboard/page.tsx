"use client";

import React, { useState, useEffect } from "react";
import OnboardingProgress from "@/components/OnboardingProgress";
import MedicalTimeline from "@/components/MedicalTimeline";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Header } from "@/components/shared/header";
import { PetCard } from "@/components/pet/pet-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatArabicDate } from "@/lib/utils";
import {
  FadeIn,
  SlideUp,
  StaggerContainer,
  StaggerItem,
  ScaleOnHover,
  PulseGlow,
  AnimatedCounter,
} from "@/components/ui/motion";
import {
  PawPrint,
  CalendarCheck,
  Stethoscope,
  Plus,
  Clock,
  CheckCircle2,
  ChevronLeft,
  Activity,
  HeartHandshake,
  AlertTriangle,
  Zap,
  Sparkles,
  MapPin,
} from "lucide-react";

export default function OwnerDashboardPage() {
  const [currentProfile, setCurrentProfile] = useState<{ id: string; full_name: string; phone?: string | null; governorate?: string | null } | null>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    let ownerId = "";
    const supabase = createClient();
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      ownerId = user.id;
      const [{ data: profile }, { data: petRows }, { data: reminderRows }, { data: visitRows }, { data: linkRows }] = await Promise.all([
        supabase.from("profiles").select("id, full_name, phone, governorate").eq("id", user.id).single(),
        supabase.from("pets").select("*").eq("owner_id", user.id).order("created_at", { ascending: false }),
        supabase.from("reminders").select("*").eq("user_id", user.id).order("due_date"),
        supabase.from("medical_visits").select("*, pets!inner(owner_id)").eq("pets.owner_id", user.id).order("visit_date", { ascending: false }),
        supabase.from("pet_vet_links").select("*, pets!inner(owner_id)").eq("pets.owner_id", user.id),
      ]);
      if (!active) return;
      if (profile) setCurrentProfile(profile);
      setPets(petRows || []);
      setReminders(reminderRows || []);
      setVisits(visitRows || []);
      setLinks(linkRows || []);
    };
    const refreshReminders = async () => {
      if (!ownerId) return;
      const { data } = await supabase.from("reminders").select("*").eq("user_id", ownerId).order("due_date");
      if (active && data) setReminders(data);
    };
    load().catch((error) => console.error("Unable to load owner dashboard", error));
    const refreshTimer = window.setInterval(() => { void refreshReminders(); }, 30_000);
    return () => { active = false; window.clearInterval(refreshTimer); };
  }, []);

  const nextReminder = reminders.filter(r => !r.is_completed).sort((a,b)=> new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0] || null;
  const overdueReminders = reminders.filter(r => !r.is_completed && new Date(r.due_date) < new Date());
  const lastVetVisit = visits.filter(v => v.author_role === 'veterinarian').sort((a,b)=> new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime())[0] || null;
  const today = new Date().toISOString().slice(0, 10);
  const nextReminder = activeReminders.filter((r) => r.due_date >= today).sort((a, b) => a.due_date.localeCompare(b.due_date))[0];
  const overdueReminders = activeReminders.filter((r) => r.due_date < today);
  const lastVetVisit = visits.find((visit) => visit.author_role === "veterinarian");

  const handleToggleReminder = async (id: string) => {
    const reminder = reminders.find((item) => item.id === id);
    if (!reminder) return;
    const isCompleted = !reminder.is_completed;
    const supabase = createClient();
    const { error } = await supabase.from("reminders").update({ is_completed: isCompleted, completed_at: isCompleted ? new Date().toISOString() : null }).eq("id", id);
    if (error) return;
    setReminders((items) => items.map((item) => item.id === id ? { ...item, is_completed: isCompleted } : item));
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-muted/20">
      <Header
        title={`أهلاً بك${currentProfile?.full_name ? `، ${currentProfile.full_name}` : ""}`}
        subtitle="لوحة المتابعة الصحية والرعاية اليومية لحيواناتك"
        role="owner"
        action={{
          label: "إضافة حيوان جديد",
          href: "/owner/pets/new",
          icon: <Plus className="h-4 w-4" />,
        }}
      />

      <div className="p-4 sm:p-6 md:p-8 space-y-7 md:space-y-10 max-w-7xl w-full">
        <OnboardingChecklist title="ابدأ بخطوات بسيطة" steps={[
          { label: "أكمل رقم الهاتف والمحافظة", href: "/owner/settings", done: Boolean(currentProfile?.phone && currentProfile?.governorate) },
          { label: "أضف أول حيوان", href: "/owner/pets/new", done: pets.length > 0 },
          { label: "اربط حيوانًا بطبيب", href: "/veterinarians", done: connectedLinks.some((link) => link.status === "accepted") },
          { label: "تابع المواعيد الطبية", href: "/owner/reminders", done: reminders.length > 0 },
        ]} />

        <section className="grid gap-3 sm:grid-cols-3" aria-label="ملخص الرعاية">
          <div className="rounded-2xl border border-border bg-card p-4 text-right">
            <p className="text-xs text-muted-foreground">أقرب موعد أو جرعة</p>
            {nextReminder ? <><p className="mt-1 font-bold">{nextReminder.title}</p><p className="mt-1 text-xs text-primary">{formatArabicDate(nextReminder.due_date)}</p></> : <Link href="/owner/reminders" className="mt-1 block text-sm font-semibold text-primary">لا يوجد موعد قادم — أضف تذكيرًا</Link>}
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 text-right">
            <p className="text-xs text-muted-foreground">آخر زيارة بيطرية</p>
            {lastVetVisit ? <><p className="mt-1 font-bold">{pets.find((pet) => pet.id === lastVetVisit.pet_id)?.name || "حيوانك"}</p><p className="mt-1 text-xs text-muted-foreground">{formatArabicDate(lastVetVisit.visit_date)}</p></> : <Link href="/veterinarians" className="mt-1 block text-sm font-semibold text-primary">لا توجد زيارة موثقة بعد — ابحث عن طبيب</Link>}
          </div>
          <div className={`rounded-2xl border p-4 text-right ${overdueReminders.length ? "border-amber-300 bg-amber-50" : "border-border bg-card"}`}>
            <p className="text-xs text-muted-foreground">حالة المتابعة</p>
            <p className="mt-1 font-bold">{overdueReminders.length ? `${overdueReminders.length} موعد متأخر` : pets.length ? "لا توجد مواعيد متأخرة" : "أضف حيوانًا لبدء المتابعة"}</p>
            {overdueReminders.length > 0 && <Link href="/owner/reminders" className="mt-1 inline-block text-xs font-semibold text-amber-800 underline">راجع المواعيد المتأخرة</Link>}
          </div>
        </section>

        {/* Support link */}
        <div className="mt-6 text-right">
          <Link href="/support" className="text-primary underline">دعم / تقارير الأخطاء</Link>
        </div>
        {/* Medical timeline for first pet */}
        {pets.length > 0 && (
          <MedicalTimeline petId={pets[0].id} />
        )}

        {activeReminders.length > 0 && (
          <FadeIn direction="down" duration={0.4}>
            <div className="relative overflow-hidden rounded-3xl border border-amber-300/60 border-s-[6px] border-s-amber-500 bg-amber-50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-right shadow-sm">
              <div className="pointer-events-none absolute -start-10 -top-10 h-32 w-32 rounded-full bg-amber-400/20" />
              <div className="relative flex items-center gap-3.5 min-w-0">
                <PulseGlow color="rgba(245, 158, 11, 0.4)">
                  <div className="h-12 w-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Clock className="h-6 w-6" />
                  </div>
                </PulseGlow>
                <div className="min-w-0">
                  <span className="font-extrabold text-sm sm:text-base text-amber-950 block leading-relaxed">
                    لديك {activeReminders.length} تذكيرات طبية قادمة ومستحقة:
                  </span>
                  <span className="text-xs sm:text-sm text-amber-900/80 block truncate">
                    {activeReminders[0].title} {activeReminders[0].pet_name && `• لـ ${activeReminders[0].pet_name}`}
                  </span>
                </div>
              </div>
              <Link href="/owner/reminders" className="relative w-full sm:w-auto shrink-0">
                <Button size="sm" variant="outline" className="w-full sm:w-auto min-h-12 px-5 rounded-xl text-sm bg-white text-amber-900 border-amber-300 font-bold transition-all hover:scale-105 active:scale-95">
                  عرض كل المواعيد
                </Button>
              </Link>
            </div>
          </FadeIn>
        )}

        {/* QUICK ACTIONS: APP-STYLE TILES */}
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4" staggerChildren={0.06}>
          <StaggerItem>
            <ScaleOnHover scale={1.03}>
              <Link
                href="/owner/pets/new"
                className="relative overflow-hidden rounded-3xl bg-primary text-white shadow-md hover:bg-primary-hover transition-all text-right flex flex-col justify-between gap-5 w-full min-h-[132px] p-4 sm:p-5 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
              >
                <div className="pointer-events-none absolute -end-8 -bottom-8 h-28 w-28 rounded-full bg-white/10" />
                <div className="relative h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <Plus className="h-6 w-6" />
                </div>
                <div className="relative min-w-0">
                  <span className="text-xs opacity-90 block truncate">إنشاء ملف جديد</span>
                  <strong className="text-base md:text-lg font-extrabold block truncate">إضافة حيوان</strong>
                </div>
              </Link>
            </ScaleOnHover>
          </StaggerItem>

          <StaggerItem>
            <ScaleOnHover scale={1.03}>
              <Link
                href="/clinics"
                className="group relative overflow-hidden rounded-3xl bg-card border border-border hover:border-primary/50 shadow-sm hover:shadow-md transition-all text-right flex flex-col justify-between gap-5 w-full min-h-[132px] p-4 sm:p-5 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs text-muted-foreground block truncate">أقرب عيادة وطوارئ</span>
                  <strong className="text-base md:text-lg font-extrabold text-foreground block truncate">بحث عن عيادة</strong>
                </div>
              </Link>
            </ScaleOnHover>
          </StaggerItem>

          <StaggerItem>
            <ScaleOnHover scale={1.03}>
              <Link
                href="/veterinarians"
                className="group relative overflow-hidden rounded-3xl bg-card border border-border hover:border-secondary/60 shadow-sm hover:shadow-md transition-all text-right flex flex-col justify-between gap-5 w-full min-h-[132px] p-4 sm:p-5 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <div className="h-12 w-12 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
                  <Stethoscope className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs text-muted-foreground block truncate">استشارة أو ربط</span>
                  <strong className="text-base md:text-lg font-extrabold text-foreground block truncate">طبيب بيطري</strong>
                </div>
              </Link>
            </ScaleOnHover>
          </StaggerItem>

          <StaggerItem>
            <ScaleOnHover scale={1.03}>
              <Link
                href="/owner/reminders"
                className="group relative overflow-hidden rounded-3xl bg-card border border-border hover:border-amber-400 shadow-sm hover:shadow-md transition-all text-right flex flex-col justify-between gap-5 w-full min-h-[132px] p-4 sm:p-5 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                  <CalendarCheck className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs text-muted-foreground block truncate">التطعيمات والجرعات</span>
                  <strong className="text-base md:text-lg font-extrabold text-foreground block truncate">جدول المواعيد</strong>
                </div>
              </Link>
            </ScaleOnHover>
          </StaggerItem>
        </StaggerContainer>

        {/* STATS HERO BAND */}
        <div className="relative overflow-hidden rounded-[2rem] bg-primary text-white shadow-lg p-4 sm:p-6">
          <div className="pointer-events-none absolute -start-16 -top-20 h-56 w-56 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -end-12 -bottom-24 h-64 w-64 rounded-full bg-black/10" />
          <StaggerContainer className="relative grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4" staggerChildren={0.07}>
            <StaggerItem>
              <div className="h-full rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm p-4 flex flex-col gap-3 text-right">
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <PawPrint className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-3xl font-black leading-none">
                    <AnimatedCounter to={pets.length} duration={1.2} />
                  </h3>
                  <p className="text-xs sm:text-sm text-white/85 font-semibold mt-1.5">الحيوانات المسجلة</p>
                </div>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="h-full rounded-2xl bg-amber-400/25 border border-amber-200/50 backdrop-blur-sm p-4 flex flex-col gap-3 text-right">
                <div className="h-10 w-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center">
                  <CalendarCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-3xl font-black leading-none text-amber-100">
                    <AnimatedCounter to={activeReminders.length} duration={1.2} />
                  </h3>
                  <p className="text-xs sm:text-sm text-white/85 font-semibold mt-1.5">التذكيرات المستحقة</p>
                </div>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="h-full rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm p-4 flex flex-col gap-3 text-right">
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-3xl font-black leading-none">
                    <AnimatedCounter to={allVisits.length} duration={1.2} />
                  </h3>
                  <p className="text-xs sm:text-sm text-white/85 font-semibold mt-1.5">الكشوفات الطبية</p>
                </div>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="h-full rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm p-4 flex flex-col gap-3 text-right">
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-3xl font-black leading-none">
                    <AnimatedCounter to={connectedLinks.filter((l) => l.status === "accepted").length} duration={1.2} />
                  </h3>
                  <p className="text-xs sm:text-sm text-white/85 font-semibold mt-1.5">الأطباء المربوطين</p>
                </div>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>

        {/* SECTION: PETS LIST */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <PawPrint className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-2xl font-extrabold text-foreground font-display leading-snug">دفتر الحيوانات (بطاقات الهوية والملفات الطبية)</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">الملفات الصحية المعتمدة لكل حيوان من حيواناتك</p>
              </div>
            </div>
            {pets.length > 0 && (
              <Link href="/owner/pets">
                <Button variant="ghost" size="sm" className="gap-1 min-h-11 px-4 rounded-full bg-primary/10 text-xs sm:text-sm text-primary font-bold hover:bg-primary/15 hover:scale-105 transition-all">
                  <span>عرض الكل ({pets.length})</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>

          {pets.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-primary/25 bg-card p-2">
              <EmptyState
                icon={PawPrint}
                title="لسه مفيش حيوانات مضافة"
                description="أضف حيوانك الأول لإنشاء دفتر طبي رقمي موثق، وتتبع التطعيمات، وربطه بطبيبك البيطري."
                action={
                  <Link href="/owner/pets/new">
                    <Button className="gap-2 min-h-12 px-6 rounded-2xl font-bold shadow-md">
                      <Plus className="h-4 w-4" />
                      أضف أول حيوان الآن
                    </Button>
                  </Link>
                }
              />
            </div>
          ) : (
            <StaggerContainer
              className="grid grid-flow-col auto-cols-[86%] sm:auto-cols-[48%] gap-4 overflow-x-auto snap-x snap-mandatory pb-3 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 md:pb-0 md:overflow-visible md:grid-flow-row md:auto-cols-auto md:grid-cols-2 lg:grid-cols-3 md:gap-6 [&>*]:snap-center"
              staggerChildren={0.08}
            >
              {pets.map((pet) => {
                const nextRem = reminders.find((r) => r.pet_id === pet.id && !r.is_completed);
                const hasExam = visits.some((visit) => visit.pet_id === pet.id && visit.author_role === "veterinarian");
                return (
                  <StaggerItem key={pet.id}>
                    <PetCard pet={pet} nextReminder={nextRem} hasRecentExam={hasExam} />
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          )}
        </section>

        {/* SECTION: UPCOMING REMINDERS & RECENT MEDICAL ACTIVITY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          {/* Reminders check list */}
          <div className="lg:col-span-5">
            <Card className="border-border/70 shadow-md rounded-3xl overflow-hidden h-full">
              <div className="flex items-center justify-between gap-2 px-4 sm:px-5 py-3 bg-primary/5 border-b border-border/70">
                <h3 className="font-extrabold text-base sm:text-lg text-foreground flex items-center gap-2.5">
                  <span className="h-9 w-9 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
                    <CalendarCheck className="h-5 w-5" />
                  </span>
                  <span>جدول التذكيرات القادمة</span>
                </h3>
                <Link href="/owner/reminders" className="text-xs sm:text-sm text-primary font-bold hover:underline inline-flex items-center min-h-11 px-3 rounded-full hover:bg-primary/10 shrink-0 transition-colors">
                  إدارة المواعيد
                </Link>
              </div>

              <CardContent className="p-3 sm:p-4 space-y-2.5">
                {reminders.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
                      <CalendarCheck className="h-7 w-7 text-muted-foreground/60" />
                    </div>
                    <p className="text-sm text-muted-foreground">لا توجد تذكيرات مسجلة حالياً.</p>
                  </div>
                ) : (
                  reminders.slice(0, 4).map((rem) => (
                    <div
                      key={rem.id}
                      onClick={() => handleToggleReminder(rem.id)}
                      className={`p-3.5 min-h-16 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 text-right active:scale-[0.98] ${
                        rem.is_completed
                          ? "bg-muted/40 border-border opacity-60"
                          : "bg-card border-border/80 border-s-4 border-s-amber-500 hover:border-primary/40 hover:shadow-sm"
                      }`}
                    >
                      <button
                        type="button"
                        className={`h-7 w-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          rem.is_completed ? "bg-primary border-primary text-white" : "border-amber-400 hover:border-primary"
                        }`}
                      >
                        {rem.is_completed && <CheckCircle2 className="h-4 w-4" />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <span className={`text-sm font-bold block truncate ${rem.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {rem.title}
                        </span>
                        <div className="flex items-center justify-between gap-2 mt-1">
                          {rem.pet_name ? (
                            <span className="text-xs text-primary font-semibold truncate">{rem.pet_name}</span>
                          ) : <span />}
                          <span className="text-[11px] text-muted-foreground font-mono shrink-0 whitespace-nowrap rounded-full bg-muted px-2.5 py-0.5">{rem.due_date}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Visits / Observations Feed */}
          <div className="lg:col-span-7">
            <Card className="border-border/70 shadow-md rounded-3xl overflow-hidden h-full">
              <div className="flex items-center justify-between gap-2 px-4 sm:px-5 py-3 bg-secondary/10 border-b border-border/70">
                <h3 className="font-extrabold text-base sm:text-lg text-foreground flex items-center gap-2.5">
                  <span className="h-9 w-9 rounded-xl bg-secondary text-white flex items-center justify-center shrink-0">
                    <Activity className="h-5 w-5" />
                  </span>
                  <span>آخر الفحوصات والملاحظات المسجلة</span>
                </h3>
              </div>

              <CardContent className="p-4 sm:p-5">
                {allVisits.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
                      <Activity className="h-7 w-7 text-muted-foreground/60" />
                    </div>
                    <p className="text-sm text-muted-foreground">لم يتم تسجيل أي كشوفات أو ملاحظات طبية بعد.</p>
                  </div>
                ) : (
                  <div className="border-s-2 border-border ps-5 space-y-5 ms-1.5">
                    {allVisits.slice(0, 3).map((visit) => {
                      const petData = pets.find((p) => p.id === visit.pet_id);
                      return (
                        <div key={visit.id} className="relative">
                          <span
                            className={`absolute -start-[27px] top-5 h-3 w-3 rounded-full ring-4 ring-card ${
                              visit.author_role === "veterinarian" ? "bg-emerald-500" : "bg-secondary"
                            }`}
                          />
                          <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3 text-right hover:border-primary/40 hover:shadow-sm transition-all">
                            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <Badge variant={visit.author_role === "veterinarian" ? "success" : "secondary"} className="text-[11px] shrink-0">
                                  {visit.author_role === "veterinarian" ? "فحص سريري موثق" : "ملاحظة مربي"}
                                </Badge>
                                <span className="text-sm font-extrabold text-foreground truncate">{petData?.name}</span>
                              </div>
                              <span className="text-xs text-muted-foreground rounded-full bg-muted px-2.5 py-1">{formatArabicDate(visit.visit_date)}</span>
                            </div>
                            <p className="text-sm text-foreground font-medium leading-relaxed">{visit.visit_reason || visit.presenting_complaints}</p>
                            {visit.diagnosis && (
                              <div className="text-xs sm:text-sm leading-relaxed text-emerald-900 bg-emerald-50 p-3 rounded-xl border border-emerald-200 border-s-4 border-s-emerald-500">
                                <strong>التشخيص المعتمد: </strong> {visit.diagnosis}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
