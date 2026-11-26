"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { SpeciesIcon } from "@/components/pet/species-icon";
import {
  FadeIn,
  SlideUp,
  StaggerContainer,
  StaggerItem,
  FloatingElement,
  PulseGlow,
  ScaleOnHover,
  HolographicCard,
  AnimatedCounter,
  motion,
} from "@/components/ui/motion";
import {
  PawPrint,
  ShieldCheck,
  CalendarCheck,
  Stethoscope,
  ArrowLeft,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  PhoneCall,
  Search,
  QrCode,
  Heart,
  Activity,
  Award,
  Zap,
  ArrowRight,
  ChevronLeft,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [heroSearch, setHeroSearch] = useState("");

  const [clinics, setClinics] = useState<any[]>([]);
  const [vets, setVets] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("clinics").select("*").eq("is_verified", true).limit(3),
      supabase.from("veterinarian_directory").select("*").limit(2),
      supabase.from("published_articles").select("*").order("created_at", { ascending: false }).limit(3),
    ]).then(([clinicResult, vetResult, articleResult]) => {
      setClinics(clinicResult.data || []);
      setVets(vetResult.data || []);
      setArticles(articleResult.data || []);
    });
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroSearch.trim()) {
      router.push("/clinics");
    } else {
      router.push(`/clinics?q=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  const speciesList = [
    { id: "dog", name: "كلاب", desc: "تطعيمات، كشف، وسلوك" },
    { id: "cat", name: "قطط", desc: "رعاية، مسالك بولية، وفحص" },
    { id: "horse", name: "خيول", desc: "عرج، تناسليات، ومغص" },
    { id: "bird", name: "طيور", desc: "ريش، تنفس، وتغذية" },
    { id: "rabbit", name: "أرانب", desc: "وقاية، أسنان، وتغذية" },
    { id: "cattle", name: "مواشي", desc: "صحة القطيع والولادة" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/15 selection:text-primary overflow-x-clip">
      <Navbar />

      <main className="flex-1">
        {/* ───────────── HERO: immersive brand panel ───────────── */}
        <section className="relative bg-background pt-3 pb-14 md:pt-5 md:pb-24">
          <div className="container">
            <div className="relative overflow-hidden rounded-[1.75rem] sm:rounded-[2.25rem] md:rounded-[2.75rem] bg-primary text-white shadow-2xl shadow-primary/30 px-5 py-10 sm:px-9 md:px-14 md:py-16 lg:py-20">
              {/* Layered decoration */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.22)_1px,transparent_0)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom_left,black,transparent_70%)]"
              />
              <div aria-hidden className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-white/15 blur-3xl" />
              <div aria-hidden className="pointer-events-none absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-secondary/50 blur-3xl" />
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/0 via-black/0 to-black/25" />
              <PawPrint
                aria-hidden
                className="pointer-events-none absolute -bottom-16 -left-12 h-72 w-72 md:h-[26rem] md:w-[26rem] -rotate-12 text-white/[0.06]"
              />

              <div className="relative z-10 space-y-10 md:space-y-12">
                {/* Tagline pill */}
                <FadeIn direction="down" duration={0.4}>
                  <div className="flex justify-center lg:justify-start">
                    <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-2.5 px-4 py-2 rounded-full bg-white/10 border border-white/25 backdrop-blur-md text-[11px] sm:text-xs font-bold text-white">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/images/vetbox-logo.png" alt="" className="h-4 w-4 object-contain brightness-0 invert" />
                      </span>
                      <span>المنظومة الرقمية المعتمدة للرعاية البيطرية في مصر</span>
                      <span className="text-white font-black font-brand tracking-[0.2em]">VETBOX</span>
                    </div>
                  </div>
                </FadeIn>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
                  {/* Text column */}
                  <StaggerContainer className="lg:col-span-7 space-y-7 text-center lg:text-right" staggerChildren={0.1}>
                    <StaggerItem>
                      <h1 className="text-[2.5rem] sm:text-6xl lg:text-7xl font-black tracking-tight text-white font-display leading-[1.12]">
                        كل رعاية حيوانك
                        <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-l from-white via-white to-white/60">
                          في مكان واحد وبأمان تام
                        </span>
                      </h1>
                    </StaggerItem>

                    <StaggerItem>
                      <p className="text-base sm:text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
                        ملف طبي رقمي موحد، متابعة التطعيمات والجرعات الوقائية، وربط فوري بأفضل العيادات والأطباء البيطريين المرخصين بالنقابة في القاهرة، الجيزة، والإسكندرية.
                      </p>
                    </StaggerItem>

                    {/* Search */}
                    <StaggerItem>
                      <form onSubmit={handleHeroSearch} className="max-w-xl mx-auto lg:mx-0">
                        <div className="p-1.5 sm:p-2 rounded-[1.25rem] bg-white shadow-2xl shadow-black/25 ring-4 ring-white/20 flex items-center gap-1.5 sm:gap-2 transition-all focus-within:ring-white/45">
                          <Search className="hidden sm:block h-5 w-5 text-slate-400 shrink-0 mr-2" />
                          <Input
                            type="text"
                            value={heroSearch}
                            onChange={(e) => setHeroSearch(e.target.value)}
                            placeholder="ابحث عن دكتور، عيادة، تخصص، أو تطعيم قريب منك..."
                            className="min-w-0 flex-1 border-0 shadow-none focus-visible:ring-0 text-sm h-12 bg-transparent px-3 text-right text-slate-900 placeholder:text-slate-400"
                          />
                          <Button type="submit" size="default" className="h-12 px-4 sm:px-7 rounded-2xl font-bold bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/30 gap-1.5 shrink-0">
                            <Search className="h-4 w-4 sm:hidden" />
                            بحث سريع
                          </Button>
                        </div>
                      </form>
                    </StaggerItem>

                    {/* Primary actions */}
                    <StaggerItem>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-1">
                        <Link href="/owner/dashboard" className="w-full sm:w-auto">
                          <Button size="lg" className="w-full sm:w-auto text-base px-8 h-14 shadow-xl shadow-black/25 font-extrabold gap-2.5 rounded-2xl bg-white !text-primary hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98]">
                            <PawPrint className="h-5 w-5" />
                            أنشئ بطاقة الهوية الطبية مجاناً
                          </Button>
                        </Link>
                        <Link href="/veterinarians" className="w-full sm:w-auto">
                          <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-7 h-14 gap-2.5 rounded-2xl border-white/35 bg-white/10 backdrop-blur-md !text-white hover:!bg-white/20 hover:!text-white font-bold transition-all hover:scale-[1.02] active:scale-[0.98]">
                            <Stethoscope className="h-5 w-5 text-white" />
                            الأطباء المعتمدين
                          </Button>
                        </Link>
                      </div>
                    </StaggerItem>

                    {/* Trust stats */}
                    <StaggerItem>
                      <div className="pt-4 grid grid-cols-3 gap-2.5 sm:gap-4 text-xs text-right">
                        <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md p-3 sm:p-4">
                          <div className="text-xl sm:text-3xl font-black text-white font-display flex items-baseline">
                            <span>+</span>
                            <AnimatedCounter to={1200} duration={1.5} />
                          </div>
                          <p className="text-white/70 mt-1 leading-snug">طبيب بيطري معتمد</p>
                        </div>
                        <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md p-3 sm:p-4">
                          <div className="text-xl sm:text-3xl font-black text-white font-display flex items-baseline">
                            <span>+</span>
                            <AnimatedCounter to={350} duration={1.5} />
                          </div>
                          <p className="text-white/70 mt-1 leading-snug">عيادة ومستشفى مجهز</p>
                        </div>
                        <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md p-3 sm:p-4">
                          <div className="text-xl sm:text-3xl font-black text-white font-display flex items-center gap-1.5">
                            <PulseGlow>
                              <span className="block h-2.5 w-2.5 rounded-full bg-white" />
                            </PulseGlow>
                            <span>24 / 7</span>
                          </div>
                          <p className="text-white/70 mt-1 leading-snug">طوارئ وإنقاذ عاجل</p>
                        </div>
                      </div>
                    </StaggerItem>
                  </StaggerContainer>

                  {/* Digital passport */}
                  <div className="lg:col-span-5">
                    <FloatingElement offset={8} duration={4.5}>
                      <div className="relative mx-auto max-w-md lg:rotate-[2deg]">
                        <div className="absolute -inset-3 rounded-[2rem] bg-white/20 blur-2xl -z-10" />

                        {/* Floating trust badge */}
                        <div className="absolute -top-4 -right-3 z-20 hidden sm:flex items-center gap-1.5 bg-white text-slate-900 shadow-xl px-3.5 py-2 rounded-full text-xs font-extrabold">
                          <Sparkles className="h-3.5 w-3.5 text-primary" />
                          <span>تحديث فوري للسجلات</span>
                        </div>

                        <HolographicCard className="rounded-[1.75rem] border border-white/60 bg-card/95 backdrop-blur-md p-5 sm:p-6 shadow-2xl shadow-black/30 space-y-5 text-right">
                          {/* Header */}
                          <div className="flex items-center justify-between gap-2 pb-4 border-b border-border/70">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-11 w-10 relative shrink-0 rounded-xl bg-primary/10 p-1.5">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="/images/vetbox-logo.png" alt="" className="h-full w-auto object-contain" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="font-extrabold text-sm text-foreground">بطاقة الهوية الطبية</span>
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase font-mono">
                                    PASS-9904
                                  </span>
                                </div>
                                <span className="text-[11px] text-muted-foreground">فيت بوكس للرعاية البيطرية المعتمدة</span>
                              </div>
                            </div>

                            <Badge variant="success" className="text-[10px] gap-1 shadow-xs shrink-0">
                              <ShieldCheck className="h-3 w-3" />
                              موثق رسمياً
                            </Badge>
                          </div>

                          {/* Pet snapshot */}
                          <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-gradient-to-l from-primary/10 to-muted/40 border border-primary/15">
                            <div className="h-16 w-16 rounded-2xl bg-primary/10 overflow-hidden shrink-0 ring-2 ring-white shadow-md">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src="https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=300&q=80"
                                alt="Rocky"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-extrabold text-base text-foreground">روكي (Rocky)</h3>
                              <p className="text-xs text-muted-foreground">جيرمن شيبرد • 32.5 كجم • ذكر معقم</p>
                              <p className="text-[11px] text-primary font-mono mt-0.5 flex items-center gap-1 break-all">
                                <QrCode className="h-3.5 w-3.5 shrink-0" />
                                شريحة: 900182001928374
                              </p>
                            </div>
                          </div>

                          {/* Vitals */}
                          <div className="grid grid-cols-3 gap-2 text-center text-xs">
                            <div className="p-2.5 rounded-xl bg-card border border-border/80 shadow-xs">
                              <span className="text-muted-foreground text-[10px] block">الحرارة الطبيعية</span>
                              <strong className="text-foreground text-[12px] leading-tight font-bold block mt-0.5">يُسجل بعد الكشف</strong>
                            </div>
                            <div className="p-2.5 rounded-xl bg-card border border-border/80 shadow-xs">
                              <span className="text-muted-foreground text-[10px] block">نبض القلب</span>
                              <strong className="text-foreground text-[12px] leading-tight font-bold block mt-0.5">يُسجل بعد الكشف</strong>
                            </div>
                            <div className="p-2.5 rounded-xl bg-card border border-border/80 shadow-xs">
                              <span className="text-muted-foreground text-[10px] block">تغطية التطعيم</span>
                              <strong className="text-emerald-600 text-[12px] leading-tight font-bold block mt-0.5">تظهر بعد تسجيل التطعيمات</strong>
                            </div>
                          </div>

                          {/* Timeline preview */}
                          <div className="space-y-2 pt-1 text-xs">
                            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold block">سجل التطعيمات الموثق</span>
                                <span className="text-[11px] text-emerald-800">تظهر هنا بيانات التطعيمات التي يسجلها طبيبك</span>
                              </div>
                            </div>

                            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-950">
                              <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold block">مواعيد الرعاية والتذكيرات</span>
                                <span className="text-[11px] text-amber-800">سجّل تذكيراتك لمتابعة الرعاية الوقائية</span>
                              </div>
                            </div>
                          </div>

                          {/* CTA */}
                          <Link href="/owner/dashboard" className="block pt-1">
                            <Button variant="outline" className="w-full text-xs font-bold justify-between border-primary/30 hover:bg-primary hover:text-white transition-all shadow-xs">
                              <span>فتح لوحة تحكم المربي واستعراض السجلات</span>
                              <ArrowLeft className="h-4 w-4" />
                            </Button>
                          </Link>
                        </HolographicCard>
                      </div>
                    </FloatingElement>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Species selector: floating card overlapping the hero */}
          <div className="container relative z-10 mt-6 md:-mt-10">
            <div className="rounded-[1.75rem] bg-card border border-border/70 shadow-xl shadow-primary/10 p-5 md:p-7">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                <span className="text-sm font-extrabold text-foreground flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <PawPrint className="h-4 w-4" />
                  </span>
                  رعاية طبية مخصصة بحسب نوع وفصيلة حيوانك:
                </span>
                <Link href="/owner/pets/new" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                  أضف فصيلة حيوانك الآن ←
                </Link>
              </div>

              <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3" staggerChildren={0.06}>
                {speciesList.map((sp) => (
                  <StaggerItem key={sp.id}>
                    <ScaleOnHover scale={1.03}>
                      <Link
                        href={`/clinics?species=${sp.id}`}
                        className="p-4 rounded-2xl bg-muted/50 border border-transparent hover:bg-primary hover:border-primary hover:shadow-lg hover:shadow-primary/25 transition-all text-right group block h-full"
                      >
                        <div className="h-11 w-11 rounded-xl bg-card text-primary shadow-xs flex items-center justify-center mb-3 group-hover:scale-110 transition-all">
                          <SpeciesIcon species={sp.id} className="h-5 w-5" />
                        </div>
                        <span className="font-extrabold text-sm text-foreground block group-hover:text-white transition-colors">
                          {sp.name}
                        </span>
                        <span className="text-[11px] text-muted-foreground block line-clamp-1 mt-0.5 group-hover:text-white/80 transition-colors">
                          {sp.desc}
                        </span>
                      </Link>
                    </ScaleOnHover>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </div>
        </section>

        {/* ───────────── TRUST PILLARS: bento grid ───────────── */}
        <section className="py-16 md:py-24 bg-muted/40 border-y border-border/60">
          <div className="container">
            <FadeIn className="text-center max-w-2xl mx-auto space-y-4 mb-12 md:mb-16">
              <Badge variant="outline" className="text-xs font-bold px-4 py-1.5 text-primary border-primary/30 bg-primary/5 rounded-full">
                معايير طبية لا تهاون فيها
              </Badge>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground font-display leading-tight">
                لماذا يثق المربون والأطباء في فيت بوكس؟
              </h2>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                منظومة مصممة لتجعل تجربة الرعاية البيطرية سلسة، منظمة، ومرتبطة بأطباء مرخصين فعلياً.
              </p>
            </FadeIn>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" staggerChildren={0.08}>
              {/* 1 — feature (wide, brand colour) */}
              <StaggerItem className="md:col-span-2 lg:col-span-2">
                <ScaleOnHover scale={1.01} className="h-full">
                  <Card className="relative overflow-hidden !bg-primary border-0 shadow-xl shadow-primary/20 rounded-[1.75rem] h-full">
                    <PawPrint aria-hidden className="absolute -bottom-10 -left-8 h-56 w-56 -rotate-12 text-white/10" />
                    <div aria-hidden className="absolute -top-20 -right-10 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
                    <CardContent className="relative p-7 md:p-9 space-y-4 text-right min-h-[14rem] flex flex-col justify-end">
                      <div className="h-14 w-14 rounded-2xl bg-white/15 border border-white/25 text-white flex items-center justify-center backdrop-blur">
                        <PawPrint className="h-7 w-7" />
                      </div>
                      <h3 className="font-extrabold text-2xl md:text-3xl text-white font-display">ملف طبي رقمي مدى الحياة</h3>
                      <p className="text-sm md:text-base text-white/80 leading-relaxed max-w-lg">
                        ودّع الكروت الورقية الضائعة. ملف رقمي موثق يرافق حيوانك ويسجل الأمراض، التحاليل، والعمليات.
                      </p>
                    </CardContent>
                  </Card>
                </ScaleOnHover>
              </StaggerItem>

              {/* 2 */}
              <StaggerItem>
                <ScaleOnHover scale={1.02} className="h-full">
                  <Card className="group border-border/70 shadow-sm hover:shadow-xl hover:border-primary/40 transition-all rounded-[1.75rem] h-full">
                    <CardContent className="p-7 space-y-4 text-right">
                      <div className="h-14 w-14 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CalendarCheck className="h-7 w-7" />
                      </div>
                      <h3 className="font-extrabold text-lg text-foreground">جدول تطعيمات وتذكيرات ذكية</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        تنبيهات تلقائية قبل كل جرعة تنشيطية أو قرص وقاية لمنع أي تأخير يهدد مناعة وصحة حيوانك.
                      </p>
                    </CardContent>
                  </Card>
                </ScaleOnHover>
              </StaggerItem>

              {/* 3 */}
              <StaggerItem>
                <ScaleOnHover scale={1.02} className="h-full">
                  <Card className="group border-border/70 shadow-sm hover:shadow-xl hover:border-primary/40 transition-all rounded-[1.75rem] h-full">
                    <CardContent className="p-7 space-y-4 text-right">
                      <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MapPin className="h-7 w-7" />
                      </div>
                      <h3 className="font-extrabold text-lg text-foreground">شبكة عيادات ومستشفيات 24/7</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        وصول سريع لأقرب عيادة أو مركز طوارئ مجهز بأحدث أجهزة السونار والأشعة والعمليات في مصر.
                      </p>
                    </CardContent>
                  </Card>
                </ScaleOnHover>
              </StaggerItem>

              {/* 4 — wide, secondary colour */}
              <StaggerItem className="md:col-span-2 lg:col-span-2">
                <ScaleOnHover scale={1.01} className="h-full">
                  <Card className="relative overflow-hidden !bg-secondary border-0 shadow-xl shadow-secondary/20 rounded-[1.75rem] h-full">
                    <ShieldCheck aria-hidden className="absolute -bottom-12 -left-10 h-60 w-60 -rotate-12 text-white/10" />
                    <div aria-hidden className="absolute -top-20 -right-10 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
                    <CardContent className="relative p-7 md:p-9 space-y-4 text-right min-h-[14rem] flex flex-col justify-end">
                      <div className="h-14 w-14 rounded-2xl bg-white/15 border border-white/25 text-white flex items-center justify-center backdrop-blur">
                        <ShieldCheck className="h-7 w-7" />
                      </div>
                      <h3 className="font-extrabold text-2xl md:text-3xl text-white font-display">أطباء معتمدون ومراجعون</h3>
                      <p className="text-sm md:text-base text-white/85 leading-relaxed max-w-lg">
                        لا حسابات مجهولة. يتم التحقق من قيد نقابة الأطباء البيطريين وتراخيص مزاولة المهنة رسمياً.
                      </p>
                    </CardContent>
                  </Card>
                </ScaleOnHover>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </section>

        {/* ───────────── HOW IT WORKS ───────────── */}
        <section className="py-16 md:py-24 bg-background border-b border-border/60">
          <div className="container">
            <FadeIn className="text-center max-w-2xl mx-auto space-y-4 mb-14 md:mb-20">
              <Badge variant="outline" className="text-xs px-4 py-1.5 font-bold rounded-full border-primary/30 bg-primary/5 text-primary">
                بساطة وفاعلية في 3 خطوات
              </Badge>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground font-display leading-tight">
                كيف تبدأ رحلة الرعاية مع فيت بوكس؟
              </h2>
            </FadeIn>

            <div className="relative">
              {/* dashed connector (desktop) */}
              <div aria-hidden className="hidden md:block absolute inset-x-[17%] top-[3.75rem] border-t-2 border-dashed border-primary/30" />

              <StaggerContainer className="relative grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8" staggerChildren={0.12}>
                <StaggerItem>
                  <ScaleOnHover scale={1.02} className="h-full">
                    <div className="p-7 rounded-[1.75rem] bg-card border border-border/70 shadow-sm hover:shadow-xl transition-shadow space-y-4 text-center h-full">
                      <div className="h-16 w-16 rounded-2xl bg-primary text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary/30 ring-8 ring-card">
                        1
                      </div>
                      <h3 className="font-extrabold text-xl text-foreground">سجل حيوانك وأنشئ بطاقة الهوية</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        أدخل اسم حيوانك، فصيلته، تاريخ الميلاد أو السن التقديري، ورقمه التعريفي.
                      </p>
                    </div>
                  </ScaleOnHover>
                </StaggerItem>

                <StaggerItem>
                  <ScaleOnHover scale={1.02} className="h-full">
                    <div className="p-7 rounded-[1.75rem] bg-card border border-border/70 shadow-sm hover:shadow-xl transition-shadow space-y-4 text-center h-full">
                      <div className="h-16 w-16 rounded-2xl bg-secondary text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-secondary/30 ring-8 ring-card">
                        2
                      </div>
                      <h3 className="font-extrabold text-xl text-foreground">اربطه بطبيبك البيطري المعتمد</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        اختر طبيبك من الدليل وأرسل طلب ربط آمن لتفعيل مشاركة السجل السريري.
                      </p>
                    </div>
                  </ScaleOnHover>
                </StaggerItem>

                <StaggerItem>
                  <ScaleOnHover scale={1.02} className="h-full">
                    <div className="p-7 rounded-[1.75rem] bg-card border border-border/70 shadow-sm hover:shadow-xl transition-shadow space-y-4 text-center h-full">
                      <div className="h-16 w-16 rounded-2xl bg-primary text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary/30 ring-8 ring-card">
                        3
                      </div>
                      <h3 className="font-extrabold text-xl text-foreground">تابع تاريخه وتلقَ التنبيهات</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        استقبل تقارير الكشوفات فور تسجيلها واحصل على تذكيرات قبل مواعيد التطعيم.
                      </p>
                    </div>
                  </ScaleOnHover>
                </StaggerItem>
              </StaggerContainer>
            </div>
          </div>
        </section>

        {/* ───────────── CLINIC & VET PREVIEW ───────────── */}
        <section className="py-16 md:py-24 bg-card border-b border-border/60">
          <div className="container">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-5 mb-10 md:mb-12">
              <div className="space-y-3 text-right">
                <span className="block h-1.5 w-14 rounded-full bg-primary" />
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground font-display leading-tight">
                  عيادات ومستشفيات بيطرية معتمدة
                </h2>
                <p className="text-muted-foreground text-sm md:text-base">
                  أفضل المراكز الطبية البيطرية المجهزة بأحدث أجهزة التشخيص في مصر.
                </p>
              </div>
              <Link href="/clinics" className="w-full md:w-auto">
                <Button variant="outline" className="w-full md:w-auto gap-2 rounded-2xl h-12 px-6 font-bold border-primary/30 text-primary hover:bg-primary hover:text-white transition-all hover:scale-[1.02]">
                  <span>عرض جميع العيادات ({clinics.length + 1})</span>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6" staggerChildren={0.1}>
              {clinics.map((clinic) => (
                <StaggerItem key={clinic.id}>
                  <ScaleOnHover scale={1.02} className="h-full">
                    <Card className="group overflow-hidden border-border/70 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 transition-all rounded-[1.75rem] flex flex-col justify-between h-full shadow-sm">
                      <div>
                        <div className="h-52 w-full bg-muted overflow-hidden relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={clinic.cover_image_url || ""}
                            alt={clinic.name_ar || clinic.name}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />
                          {clinic.is_emergency_247 && (
                            <div className="absolute top-3 right-3">
                              <PulseGlow color="rgba(225, 29, 72, 0.4)">
                                <span className="bg-rose-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                                  <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                                  طوارئ 24/7
                                </span>
                              </PulseGlow>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-5 md:p-6 space-y-3 text-right">
                          <h3 className="font-extrabold text-xl text-foreground">{clinic.name_ar || clinic.name}</h3>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span>{clinic.address}</span>
                          </p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {clinic.services.slice(0, 3).map((s: string, idx: number) => (
                              <span key={idx} className="text-[11px] bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">
                                {s}
                              </span>
                            ))}
                          </div>
                        </CardContent>
                      </div>

                      <div className="px-5 md:px-6 py-4 border-t border-border/60 bg-muted/30 flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-mono">
                          <PhoneCall className="h-3.5 w-3.5 text-primary" />
                          {clinic.phone}
                        </span>
                        <Link href={`/clinics/detail?id=${encodeURIComponent(clinic.id)}`}>
                          <Button size="sm" className="text-xs bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-md shadow-primary/25">
                            التفاصيل والخدمات ←
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  </ScaleOnHover>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ───────────── KNOWLEDGE PREVIEW ───────────── */}
        <section className="py-16 md:py-24 bg-muted/40">
          <div className="container">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-5 mb-10 md:mb-12">
              <div className="space-y-3 text-right">
                <span className="block h-1.5 w-14 rounded-full bg-secondary" />
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground font-display leading-tight">
                  موسوعة الرعاية والمعرفة البيطرية
                </h2>
                <p className="text-muted-foreground text-sm md:text-base">
                  مقالات طبية مراجعة ومعتمدة من أساتذة وأطباء بيطريين متخصصين.
                </p>
              </div>
              <Link href="/learn" className="w-full md:w-auto">
                <Button variant="outline" className="w-full md:w-auto gap-2 rounded-2xl h-12 px-6 font-bold border-primary/30 text-primary hover:bg-primary hover:text-white transition-all hover:scale-[1.02]">
                  <span>تصفح كل المقالات</span>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6" staggerChildren={0.1}>
              {articles.map((art) => (
                <StaggerItem key={art.id}>
                  <ScaleOnHover scale={1.02} className="h-full">
                    <Card className="group overflow-hidden border-border/70 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 transition-all rounded-[1.75rem] flex flex-col justify-between h-full shadow-sm">
                      <div>
                        <div className="h-48 w-full bg-muted overflow-hidden relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={art.cover_image_url || ""}
                            alt={art.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                        </div>
                        <div className="p-5 md:p-6 space-y-3 text-right">
                          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-[10px] font-bold rounded-full border-primary/30 bg-primary/5 text-primary">
                              {art.species_target === "dogs" ? "كلاب" : art.species_target === "cats" ? "قطط" : "خيول"}
                            </Badge>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {art.read_time_minutes} دقائق قراءة
                            </span>
                          </div>
                          <h3 className="font-extrabold text-lg text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                            {art.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {art.summary}
                          </p>
                        </div>
                      </div>
                      <div className="px-5 md:px-6 pb-5 md:pb-6">
                        <Link href={`/learn/article?slug=${encodeURIComponent(art.slug)}`}>
                          <Button variant="link" className="text-sm font-bold text-primary p-0 h-auto">
                            قراءة المقال كاملاً ←
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  </ScaleOnHover>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      </main>

    </div>
  );
}
