"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/shared/header";
import { PetCard } from "@/components/pet/pet-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
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
  const [currentProfile, setCurrentProfile] = useState<{ id: string; full_name: string } | null>(null);
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
        supabase.from("profiles").select("id, full_name").eq("id", user.id).single(),
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

  const allVisits = visits;
  const connectedLinks = links;
  const activeReminders = reminders.filter((r) => !r.is_completed);

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
    <div className="flex-1 flex flex-col min-h-screen">
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

      <div className="p-4 md:p-8 space-y-8 max-w-7xl">
        {/* ACTIVE REMINDERS BANNER IF ANY */}
        {activeReminders.length > 0 && (
          <FadeIn direction="down" duration={0.4}>
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-right shadow-xs">
              <div className="flex items-center gap-3">
                <PulseGlow color="rgba(245, 158, 11, 0.4)">
                  <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Clock className="h-5 w-5" />
                  </div>
                </PulseGlow>
                <div>
                  <span className="font-bold text-sm text-amber-950 block">
                    لديك {activeReminders.length} تذكيرات طبية قادمة ومستحقة:
                  </span>
                  <span className="text-xs text-amber-900/80">
                    {activeReminders[0].title} {activeReminders[0].pet_name && `• لـ ${activeReminders[0].pet_name}`}
                  </span>
                </div>
              </div>
              <Link href="/owner/reminders">
                <Button size="sm" variant="outline" className="text-xs bg-white text-amber-900 border-amber-300 font-bold transition-all hover:scale-105">
                  عرض كل المواعيد
                </Button>
              </Link>
            </div>
          </FadeIn>
        )}

        {/* QUICK ACTION BAR WITH STAGGER & HOVER */}
        <StaggerContainer className="grid grid-cols-2 sm:grid-cols-4 gap-3.5" staggerChildren={0.06}>
          <StaggerItem>
            <ScaleOnHover scale={1.03}>
              <Link
                href="/owner/pets/new"
                className="p-4 rounded-2xl bg-primary text-white shadow-xs hover:bg-primary-hover transition-all text-right group flex items-center justify-between block"
              >
                <div>
                  <span className="text-xs opacity-90 block">إنشاء ملف جديد</span>
                  <strong className="text-sm md:text-base font-bold block">إضافة حيوان</strong>
                </div>
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Plus className="h-5 w-5" />
                </div>
              </Link>
            </ScaleOnHover>
          </StaggerItem>

          <StaggerItem>
            <ScaleOnHover scale={1.03}>
              <Link
                href="/clinics"
                className="p-4 rounded-2xl bg-card border border-border hover:border-primary/50 shadow-xs transition-all text-right group flex items-center justify-between block"
              >
                <div>
                  <span className="text-xs text-muted-foreground block">أقرب عيادة وطوارئ</span>
                  <strong className="text-sm md:text-base font-bold text-foreground block">بحث عن عيادة</strong>
                </div>
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
              </Link>
            </ScaleOnHover>
          </StaggerItem>

          <StaggerItem>
            <ScaleOnHover scale={1.03}>
              <Link
                href="/veterinarians"
                className="p-4 rounded-2xl bg-card border border-border hover:border-primary/50 shadow-xs transition-all text-right group flex items-center justify-between block"
              >
                <div>
                  <span className="text-xs text-muted-foreground block">استشارة أو ربط</span>
                  <strong className="text-sm md:text-base font-bold text-foreground block">طبيب بيطري</strong>
                </div>
                <div className="h-10 w-10 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
                  <Stethoscope className="h-5 w-5" />
                </div>
              </Link>
            </ScaleOnHover>
          </StaggerItem>

          <StaggerItem>
            <ScaleOnHover scale={1.03}>
              <Link
                href="/owner/reminders"
                className="p-4 rounded-2xl bg-card border border-border hover:border-primary/50 shadow-xs transition-all text-right group flex items-center justify-between block"
              >
                <div>
                  <span className="text-xs text-muted-foreground block">التطعيمات والجرعات</span>
                  <strong className="text-sm md:text-base font-bold text-foreground block">جدول المواعيد</strong>
                </div>
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                  <CalendarCheck className="h-5 w-5" />
                </div>
              </Link>
            </ScaleOnHover>
          </StaggerItem>
        </StaggerContainer>

        {/* STATS OVERVIEW CARDS WITH COUNTERS */}
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4" staggerChildren={0.07}>
          <StaggerItem>
            <Card className="border-border/80 shadow-xs rounded-2xl hover:border-primary/40 transition-colors">
              <CardContent className="p-5 flex items-center justify-between text-right">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">الحيوانات المسجلة</p>
                  <h3 className="text-2xl font-black text-foreground mt-1">
                    <AnimatedCounter to={pets.length} duration={1.2} />
                  </h3>
                </div>
                <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <PawPrint className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="border-border/80 shadow-xs rounded-2xl hover:border-amber-400 transition-colors">
              <CardContent className="p-5 flex items-center justify-between text-right">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">التذكيرات المستحقة</p>
                  <h3 className="text-2xl font-black text-amber-600 mt-1">
                    <AnimatedCounter to={activeReminders.length} duration={1.2} />
                  </h3>
                </div>
                <div className="h-11 w-11 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <CalendarCheck className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="border-border/80 shadow-xs rounded-2xl hover:border-secondary/40 transition-colors">
              <CardContent className="p-5 flex items-center justify-between text-right">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">الكشوفات الطبية</p>
                  <h3 className="text-2xl font-black text-foreground mt-1">
                    <AnimatedCounter to={allVisits.length} duration={1.2} />
                  </h3>
                </div>
                <div className="h-11 w-11 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center">
                  <Activity className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="border-border/80 shadow-xs rounded-2xl hover:border-primary/40 transition-colors">
              <CardContent className="p-5 flex items-center justify-between text-right">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">الأطباء المربوطين</p>
                  <h3 className="text-2xl font-black text-foreground mt-1">
                    <AnimatedCounter to={connectedLinks.filter((l) => l.status === "accepted").length} duration={1.2} />
                  </h3>
                </div>
                <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Stethoscope className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        {/* SECTION: PETS LIST */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground font-display">دفتر الحيوانات (بطاقات الهوية والملفات الطبية)</h2>
              <p className="text-xs text-muted-foreground">الملفات الصحية المعتمدة لكل حيوان من حيواناتك</p>
            </div>
            {pets.length > 0 && (
              <Link href="/owner/pets">
                <Button variant="ghost" size="sm" className="gap-1 text-xs text-primary font-bold hover:scale-105 transition-transform">
                  <span>عرض الكل ({pets.length})</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>

          {pets.length === 0 ? (
            <EmptyState
              icon={PawPrint}
              title="لسه مفيش حيوانات مضافة"
              description="أضف حيوانك الأول لإنشاء دفتر طبي رقمي موثق، وتتبع التطعيمات، وربطه بطبيبك البيطري."
              action={
                <Link href="/owner/pets/new">
                  <Button className="gap-2 rounded-xl font-bold shadow-xs">
                    <Plus className="h-4 w-4" />
                    أضف أول حيوان الآن
                  </Button>
                </Link>
              }
            />
          ) : (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerChildren={0.08}>
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
          {/* Reminders check list */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-primary" />
                <span>جدول التذكيرات القادمة</span>
              </h3>
              <Link href="/owner/reminders" className="text-xs text-primary font-bold hover:underline">
                إدارة المواعيد
              </Link>
            </div>

            <Card className="border-border/80 shadow-xs rounded-2xl">
              <CardContent className="p-4 space-y-2.5">
                {reminders.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">لا توجد تذكيرات مسجلة حالياً.</p>
                ) : (
                  reminders.slice(0, 4).map((rem) => (
                    <div
                      key={rem.id}
                      onClick={() => handleToggleReminder(rem.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 text-right hover:border-primary/40 ${
                        rem.is_completed ? "bg-muted/40 border-border opacity-60" : "bg-card border-border/80 hover:shadow-xs"
                      }`}
                    >
                      <button
                        type="button"
                        className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          rem.is_completed ? "bg-primary border-primary text-white" : "border-border hover:border-primary"
                        }`}
                      >
                        {rem.is_completed && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-xs font-bold truncate ${rem.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {rem.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">{rem.due_date}</span>
                        </div>
                        {rem.pet_name && <span className="text-[11px] text-primary block mt-0.5 font-medium">{rem.pet_name}</span>}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Visits / Observations Feed */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <Activity className="h-5 w-5 text-secondary" />
                <span>آخر الفحوصات والملاحظات المسجلة</span>
              </h3>
            </div>

            <Card className="border-border/80 shadow-xs rounded-2xl">
              <CardContent className="p-4 space-y-3">
                {allVisits.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">لم يتم تسجيل أي كشوفات أو ملاحظات طبية بعد.</p>
                ) : (
                  allVisits.slice(0, 3).map((visit) => {
                    const petData = pets.find((p) => p.id === visit.pet_id);
                    return (
                      <div key={visit.id} className="p-3.5 rounded-xl bg-card border border-border/80 space-y-2 text-right hover:border-primary/40 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant={visit.author_role === "veterinarian" ? "success" : "secondary"} className="text-[10px]">
                              {visit.author_role === "veterinarian" ? "فحص سريري موثق" : "ملاحظة مربي"}
                            </Badge>
                            <span className="text-xs font-bold text-foreground">{petData?.name}</span>
                          </div>
                          <span className="text-[11px] text-muted-foreground">{formatArabicDate(visit.visit_date)}</span>
                        </div>
                        <p className="text-xs text-foreground font-medium">{visit.visit_reason || visit.presenting_complaints}</p>
                        {visit.diagnosis && (
                          <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                            <strong>التشخيص المعتمد: </strong> {visit.diagnosis}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
