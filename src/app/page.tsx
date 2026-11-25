"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
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
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/10 selection:text-primary">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION WITH PROFESSIONAL MOTION */}
        <section className="relative overflow-hidden pt-10 pb-20 md:pt-16 md:pb-32 bg-gradient-to-b from-primary/5 via-background to-background border-b border-border/50">
          {/* Subtle Ambient Backdrops */}
          <div className="absolute top-1/4 right-5 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute bottom-10 left-5 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="container relative z-10 space-y-10">
            {/* Top Tagline Pill with Stagger */}
            <FadeIn direction="down" duration={0.4}>
              <div className="flex justify-center md:justify-start">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-card border border-primary/30 shadow-xs text-xs font-bold text-foreground">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/vetbox-logo.png" alt="" className="h-4 w-4 object-contain brightness-0 invert" />
                  </span>
                  <span>المنظومة الرقمية المعتمدة للرعاية البيطرية في مصر</span>
                  <span className="text-primary font-black font-brand tracking-wider">VETBOX</span>
                </div>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Text content with Stagger */}
              <StaggerContainer className="lg:col-span-7 space-y-6 text-right" staggerChildren={0.1}>
                <StaggerItem>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground font-display leading-[1.18]">
                    كل رعاية حيوانك
                    <span className="block text-primary mt-1.5 drop-shadow-xs">
                      في مكان واحد وبأمان تام
                    </span>
                  </h1>
                </StaggerItem>

                <StaggerItem>
                  <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl font-normal">
                    ملف طبي رقمي موحد، متابعة التطعيمات والجرعات الوقائية، وربط فوري بأفضل العيادات والأطباء البيطريين المرخصين بالنقابة في القاهرة، الجيزة، والإسكندرية.
                  </p>
                </StaggerItem>

                {/* Instant Live Search Box */}
                <StaggerItem>
                  <form onSubmit={handleHeroSearch} className="max-w-xl">
                    <div className="p-2 rounded-2xl bg-card border-2 border-primary/30 shadow-md flex items-center gap-2 focus-within:border-primary transition-all">
                      <Input
                        type="text"
                        value={heroSearch}
                        onChange={(e) => setHeroSearch(e.target.value)}
                        placeholder="ابحث عن دكتور، عيادة، تخصص، أو تطعيم قريب منك..."
                        className="border-0 shadow-none focus-visible:ring-0 text-sm h-11 bg-transparent px-3 text-right"
                      />
                      <Button type="submit" size="default" className="h-11 px-6 rounded-xl font-bold bg-primary hover:bg-primary-hover text-white shadow-xs gap-1.5 shrink-0">
                        <Search className="h-4 w-4" />
                        بحث سريع
                      </Button>
                    </div>
                  </form>
                </StaggerItem>

                {/* Primary Action Buttons */}
                <StaggerItem>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                    <Link href="/owner/dashboard">
                      <Button size="lg" className="w-full sm:w-auto text-base px-8 h-12 shadow-sm font-bold gap-2 rounded-xl bg-primary hover:bg-primary-hover text-white transition-all hover:scale-[1.02] active:scale-[0.98]">
                        <PawPrint className="h-5 w-5" />
                        أنشئ بطاقة الهوية الطبية مجاناً
                      </Button>
                    </Link>
                    <Link href="/veterinarians">
                      <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-6 h-12 gap-2 rounded-xl border-border hover:border-primary/50 font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]">
                        <Stethoscope className="h-5 w-5 text-secondary" />
                        الأطباء المعتمدين
                      </Button>
                    </Link>
                  </div>
                </StaggerItem>

                {/* Animated Trust Stats Bar */}
                <StaggerItem>
                  <div className="pt-6 grid grid-cols-3 gap-4 border-t border-border/70 text-xs">
                    <div>
                      <div className="text-xl sm:text-2xl font-black text-foreground font-display flex items-baseline">
                        <span>+</span>
                        <AnimatedCounter to={1200} duration={1.5} />
                      </div>
                      <p className="text-muted-foreground mt-0.5">طبيب بيطري معتمد</p>
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-black text-foreground font-display flex items-baseline">
                        <span>+</span>
                        <AnimatedCounter to={350} duration={1.5} />
                      </div>
                      <p className="text-muted-foreground mt-0.5">عيادة ومستشفى مجهز</p>
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-black text-primary font-display flex items-center gap-1.5">
                        <PulseGlow>
                          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                        </PulseGlow>
                        <span>24 / 7</span>
                      </div>
                      <p className="text-muted-foreground mt-0.5">طوارئ وإنقاذ عاجل</p>
                    </div>
                  </div>
                </StaggerItem>
              </StaggerContainer>

              {/* Visual Card: The Digital Passport Hero with Holographic Sheen & Floating Movement */}
              <div className="lg:col-span-5">
                <FloatingElement offset={8} duration={4.5}>
                  <div className="relative mx-auto max-w-md">
                    {/* Decorative glowing backdrops */}
                    <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-primary to-secondary opacity-25 blur-xl -z-10" />

                    {/* Floating Trust Badge */}
                    <div className="absolute -top-4 -right-4 z-20 hidden sm:flex items-center gap-1.5 bg-background border border-primary/40 shadow-lg px-3 py-1.5 rounded-full text-xs font-bold text-foreground">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      <span>تحديث فوري للسجلات</span>
                    </div>

                    <HolographicCard className="rounded-3xl border-2 border-primary/30 bg-card/95 backdrop-blur-md p-6 shadow-2xl space-y-5 text-right">
                      {/* Passport Card Header */}
                      <div className="flex items-center justify-between pb-4 border-b border-border/70">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-9 relative shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/images/vetbox-logo.png" alt="" className="h-full w-auto object-contain" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-sm text-foreground">بطاقة الهوية الطبية</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase font-mono">
                                PASS-9904
                              </span>
                            </div>
                            <span className="text-[11px] text-muted-foreground">فيت بوكس للرعاية البيطرية المعتمدة</span>
                          </div>
                        </div>

                        <Badge variant="success" className="text-[10px] gap-1 shadow-xs">
                          <ShieldCheck className="h-3 w-3" />
                          موثق رسمياً
                        </Badge>
                      </div>

                      {/* Pet Snapshot */}
                      <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-muted/40 border border-border/60">
                        <div className="h-16 w-16 rounded-xl bg-primary/10 overflow-hidden shrink-0 border border-primary/20">
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
                          <p className="text-[11px] text-primary font-mono mt-0.5 flex items-center gap-1">
                            <QrCode className="h-3.5 w-3.5" />
                            شريحة: 900182001928374
                          </p>
                        </div>
                      </div>

                      {/* Vitals and Health Status Gauge */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2.5 rounded-xl bg-card border border-border/80">
                          <span className="text-muted-foreground text-[10px] block">الحرارة الطبيعية</span>
                          <strong className="text-foreground text-sm font-bold">يُسجل بعد الكشف</strong>
                        </div>
                        <div className="p-2.5 rounded-xl bg-card border border-border/80">
                          <span className="text-muted-foreground text-[10px] block">نبض القلب</span>
                          <strong className="text-foreground text-sm font-bold">يُسجل بعد الكشف</strong>
                        </div>
                        <div className="p-2.5 rounded-xl bg-card border border-border/80">
                          <span className="text-muted-foreground text-[10px] block">تغطية التطعيم</span>
                          <strong className="text-emerald-600 text-sm font-bold">تظهر بعد تسجيل التطعيمات</strong>
                        </div>
                      </div>

                      {/* Active Medical Timeline Preview */}
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

                      {/* Open full preview CTA */}
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

            {/* SPECIES SELECTOR STRIP WITH HOVER MOTION */}
            <div className="pt-6 border-t border-border/60">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                <span className="text-xs font-bold text-foreground flex items-center gap-2">
                  <PawPrint className="h-4 w-4 text-primary" />
                  رعاية طبية مخصصة بحسب نوع وفصيلة حيوانك:
                </span>
                <Link href="/owner/pets/new" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                  أضف فصيلة حيوانك الآن ←
                </Link>
              </div>

              <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3" staggerChildren={0.06}>
                {speciesList.map((sp) => (
                  <StaggerItem key={sp.id}>
                    <ScaleOnHover scale={1.03}>
                      <Link
                        href={`/clinics?species=${sp.id}`}
                        className="p-4 rounded-2xl bg-card border border-border/80 hover:border-primary/60 hover:shadow-md transition-all text-right group block"
                      >
                        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2.5 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                          <SpeciesIcon species={sp.id} className="h-5 w-5" />
                        </div>
                        <span className="font-extrabold text-sm text-foreground block group-hover:text-primary transition-colors">
                          {sp.name}
                        </span>
                        <span className="text-[11px] text-muted-foreground block line-clamp-1 mt-0.5">
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

        {/* TRUST AND VALUE PILLARS */}
        <section className="py-16 md:py-24 bg-card border-b border-border/60">
          <div className="container">
            <FadeIn className="text-center max-w-2xl mx-auto space-y-3 mb-14">
              <Badge variant="outline" className="text-xs font-bold px-3 py-1 text-primary border-primary/30">
                معايير طبية لا تهاون فيها
              </Badge>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground font-display">
                لماذا يثق المربون والأطباء في فيت بوكس؟
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">
                منظومة مصممة لتجعل تجربة الرعاية البيطرية سلسة، منظمة، ومرتبطة بأطباء مرخصين فعلياً.
              </p>
            </FadeIn>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" staggerChildren={0.08}>
              <StaggerItem>
                <ScaleOnHover scale={1.02} className="h-full">
                  <Card className="border-border/80 shadow-xs hover:border-primary/50 transition-all rounded-3xl h-full">
                    <CardContent className="p-6 space-y-3 text-right">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                        <PawPrint className="h-6 w-6" />
                      </div>
                      <h3 className="font-bold text-lg text-foreground">ملف طبي رقمي مدى الحياة</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        ودّع الكروت الورقية الضائعة. ملف رقمي موثق يرافق حيوانك ويسجل الأمراض، التحاليل، والعمليات.
                      </p>
                    </CardContent>
                  </Card>
                </ScaleOnHover>
              </StaggerItem>

              <StaggerItem>
                <ScaleOnHover scale={1.02} className="h-full">
                  <Card className="border-border/80 shadow-xs hover:border-primary/50 transition-all rounded-3xl h-full">
                    <CardContent className="p-6 space-y-3 text-right">
                      <div className="h-12 w-12 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center">
                        <CalendarCheck className="h-6 w-6" />
                      </div>
                      <h3 className="font-bold text-lg text-foreground">جدول تطعيمات وتذكيرات ذكية</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        تنبيهات تلقائية قبل كل جرعة تنشيطية أو قرص وقاية لمنع أي تأخير يهدد مناعة وصحة حيوانك.
                      </p>
                    </CardContent>
                  </Card>
                </ScaleOnHover>
              </StaggerItem>

              <StaggerItem>
                <ScaleOnHover scale={1.02} className="h-full">
                  <Card className="border-border/80 shadow-xs hover:border-primary/50 transition-all rounded-3xl h-full">
                    <CardContent className="p-6 space-y-3 text-right">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                        <MapPin className="h-6 w-6" />
                      </div>
                      <h3 className="font-bold text-lg text-foreground">شبكة عيادات ومستشفيات 24/7</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        وصول سريع لأقرب عيادة أو مركز طوارئ مجهز بأحدث أجهزة السونار والأشعة والعمليات في مصر.
                      </p>
                    </CardContent>
                  </Card>
                </ScaleOnHover>
              </StaggerItem>

              <StaggerItem>
                <ScaleOnHover scale={1.02} className="h-full">
                  <Card className="border-border/80 shadow-xs hover:border-primary/50 transition-all rounded-3xl h-full">
                    <CardContent className="p-6 space-y-3 text-right">
                      <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                      <h3 className="font-bold text-lg text-foreground">أطباء معتمدون ومراجعون</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        لا حسابات مجهولة. يتم التحقق من قيد نقابة الأطباء البيطريين وتراخيص مزاولة المهنة رسمياً.
                      </p>
                    </CardContent>
                  </Card>
                </ScaleOnHover>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-16 md:py-24 bg-background border-b border-border/60">
          <div className="container">
            <FadeIn className="text-center max-w-2xl mx-auto space-y-3 mb-16">
              <Badge variant="outline" className="text-xs px-3 py-1 font-bold">بساطة وفاعلية في 3 خطوات</Badge>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground font-display">
                كيف تبدأ رحلة الرعاية مع فيت بوكس؟
              </h2>
            </FadeIn>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8" staggerChildren={0.12}>
              <StaggerItem>
                <ScaleOnHover scale={1.02} className="h-full">
                  <div className="p-7 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4 text-center h-full">
                    <div className="h-14 w-14 rounded-2xl bg-primary text-white font-black text-xl flex items-center justify-center mx-auto shadow-md">
                      1
                    </div>
                    <h3 className="font-bold text-xl text-foreground">سجل حيوانك وأنشئ بطاقة الهوية</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      أدخل اسم حيوانك، فصيلته، تاريخ الميلاد أو السن التقديري، ورقمه التعريفي.
                    </p>
                  </div>
                </ScaleOnHover>
              </StaggerItem>

              <StaggerItem>
                <ScaleOnHover scale={1.02} className="h-full">
                  <div className="p-7 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4 text-center h-full">
                    <div className="h-14 w-14 rounded-2xl bg-secondary text-white font-black text-xl flex items-center justify-center mx-auto shadow-md">
                      2
                    </div>
                    <h3 className="font-bold text-xl text-foreground">اربطه بطبيبك البيطري المعتمد</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      اختر طبيبك من الدليل وأرسل طلب ربط آمن لتفعيل مشاركة السجل السريري.
                    </p>
                  </div>
                </ScaleOnHover>
              </StaggerItem>

              <StaggerItem>
                <ScaleOnHover scale={1.02} className="h-full">
                  <div className="p-7 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4 text-center h-full">
                    <div className="h-14 w-14 rounded-2xl bg-primary text-white font-black text-xl flex items-center justify-center mx-auto shadow-md">
                      3
                    </div>
                    <h3 className="font-bold text-xl text-foreground">تابع تاريخه وتلقَ التنبيهات</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      استقبل تقارير الكشوفات فور تسجيلها واحصل على تذكيرات قبل مواعيد التطعيم.
                    </p>
                  </div>
                </ScaleOnHover>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </section>

        {/* CLINIC & VET PREVIEW */}
        <section className="py-16 md:py-24 bg-card border-b border-border/60">
          <div className="container">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-10">
              <div className="space-y-1 text-right">
                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground font-display">
                  عيادات ومستشفيات بيطرية معتمدة
                </h2>
                <p className="text-muted-foreground text-sm">
                  أفضل المراكز الطبية البيطرية المجهزة بأحدث أجهزة التشخيص في مصر.
                </p>
              </div>
              <Link href="/clinics">
                <Button variant="outline" className="gap-2 rounded-xl font-bold transition-all hover:scale-[1.02]">
                  <span>عرض جميع العيادات ({clinics.length + 1})</span>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6" staggerChildren={0.1}>
              {clinics.map((clinic) => (
                <StaggerItem key={clinic.id}>
                  <ScaleOnHover scale={1.02} className="h-full">
                    <Card className="overflow-hidden border-border/80 hover:border-primary/50 transition-all rounded-3xl flex flex-col justify-between h-full shadow-xs">
                      <div>
                        <div className="h-44 w-full bg-muted overflow-hidden relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={clinic.cover_image_url || ""}
                            alt={clinic.name_ar || clinic.name}
                            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                          {clinic.is_emergency_247 && (
                            <div className="absolute top-3 right-3">
                              <PulseGlow color="rgba(225, 29, 72, 0.4)">
                                <span className="bg-rose-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
                                  <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                                  طوارئ 24/7
                                </span>
                              </PulseGlow>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-5 space-y-3 text-right">
                          <h3 className="font-extrabold text-lg text-foreground">{clinic.name_ar || clinic.name}</h3>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span>{clinic.address}</span>
                          </p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {clinic.services.slice(0, 3).map((s: string, idx: number) => (
                              <span key={idx} className="text-[11px] bg-muted px-2.5 py-0.5 rounded-lg text-muted-foreground font-medium">
                                {s}
                              </span>
                            ))}
                          </div>
                        </CardContent>
                      </div>

                      <div className="p-5 pt-0 border-t border-border/60 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                          <PhoneCall className="h-3.5 w-3.5 text-primary" />
                          {clinic.phone}
                        </span>
                        <Link href={`/clinics/detail?id=${encodeURIComponent(clinic.id)}`}>
                          <Button size="sm" variant="ghost" className="text-xs text-primary font-bold hover:bg-primary/10">
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

        {/* KNOWLEDGE PREVIEW */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-10">
              <div className="space-y-1 text-right">
                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground font-display">
                  موسوعة الرعاية والمعرفة البيطرية
                </h2>
                <p className="text-muted-foreground text-sm">
                  مقالات طبية مراجعة ومعتمدة من أساتذة وأطباء بيطريين متخصصين.
                </p>
              </div>
              <Link href="/learn">
                <Button variant="outline" className="gap-2 rounded-xl font-bold transition-all hover:scale-[1.02]">
                  <span>تصفح كل المقالات</span>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6" staggerChildren={0.1}>
              {articles.map((art) => (
                <StaggerItem key={art.id}>
                  <ScaleOnHover scale={1.02} className="h-full">
                    <Card className="overflow-hidden border-border/80 hover:border-primary/50 transition-all rounded-3xl flex flex-col justify-between h-full shadow-xs">
                      <div>
                        <div className="h-44 w-full bg-muted overflow-hidden relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={art.cover_image_url || ""}
                            alt={art.title}
                            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                        </div>
                        <div className="p-5 space-y-2 text-right">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-[10px] font-bold">
                              {art.species_target === "dogs" ? "كلاب" : art.species_target === "cats" ? "قطط" : "خيول"}
                            </Badge>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {art.read_time_minutes} دقائق قراءة
                            </span>
                          </div>
                          <h3 className="font-bold text-base text-foreground line-clamp-2 leading-snug">
                            {art.title}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {art.summary}
                          </p>
                        </div>
                      </div>
                      <div className="p-5 pt-0">
                        <Link href={`/learn/article?slug=${encodeURIComponent(art.slug)}`}>
                          <Button variant="link" className="text-xs font-bold text-primary p-0">
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

      <Footer />
    </div>
  );
}
