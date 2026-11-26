import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/shared/logo";
import { ShieldCheck, PawPrint, Stethoscope, Users, CheckCircle2 } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="relative isolate flex-1 overflow-hidden py-12 md:py-20">
        {/* Decorative backdrop (visual only) */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 -end-32 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute top-1/2 -start-40 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-[28rem] text-primary/10 [background-image:radial-gradient(circle,currentColor_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
          <PawPrint className="absolute -bottom-10 end-4 h-72 w-72 -rotate-12 text-primary/[0.04]" />
        </div>

        <div className="container max-w-4xl space-y-16 text-right">
          {/* HERO */}
          <div className="mx-auto flex max-w-2xl flex-col items-center space-y-5 text-center animate-in fade-in slide-in-from-bottom-3 duration-500 motion-reduce:animate-none">
            <div className="rounded-3xl bg-card/70 p-4 shadow-xl shadow-primary/10 ring-1 ring-primary/20 backdrop-blur-sm">
              <Logo size="lg" subtitle="" />
            </div>
            <h1 className="font-display text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
              عن منصة{" "}
              <span className="bg-gradient-to-l from-primary to-secondary bg-clip-text text-transparent">
                فيت بوكس (VET BOX)
              </span>
            </h1>
            <div aria-hidden className="flex items-center gap-2">
              <span className="h-1 w-10 rounded-full bg-gradient-to-l from-primary to-secondary" />
              <span className="h-1 w-2 rounded-full bg-primary/40" />
              <span className="h-1 w-1 rounded-full bg-primary/25" />
            </div>
            <p className="rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-sm font-medium leading-relaxed text-muted-foreground md:text-base">
              منظومة الرعاية الصحية البيطرية الرقمية الموحدة في جمهورية مصر العربية
            </p>
          </div>

          <div className="max-w-none space-y-14 text-sm leading-relaxed text-foreground md:text-base">
            {/* VISION */}
            <section className="space-y-5">
              <div className="flex items-center gap-3">
                <span aria-hidden className="h-8 w-1.5 rounded-full bg-gradient-to-b from-primary to-secondary" />
                <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">رؤيتنا</h2>
              </div>
              <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-secondary/10 p-6 shadow-lg shadow-primary/5 md:p-9">
                <PawPrint
                  aria-hidden
                  className="pointer-events-none absolute -bottom-8 -start-8 h-40 w-40 rotate-12 text-primary/[0.07]"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-y-6 end-0 w-1.5 rounded-s-full bg-gradient-to-b from-primary to-secondary"
                />
                <p className="relative text-base leading-loose text-muted-foreground md:text-lg md:leading-loose">
                  تأسست فيت بوكس لتحقيق تحول نوعي في مستوى الرعاية البيطرية وربط المربين بشبكة موثوقة من الأطباء والعيادات البيطرية المرخصة. نؤمن بأن كل حيوان يستحق ملفاً صحياً رقمياً موثقاً يرافقه مدى الحياة ويضمن حفظ تاريخه الطبي وتطعيماته بدقة وأمان.
                </p>
              </div>
            </section>

            {/* PILLARS */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <span aria-hidden className="h-8 w-1.5 rounded-full bg-gradient-to-b from-primary to-secondary" />
                <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">ركائز المنصة الأساسية</h2>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Card className="group relative overflow-hidden rounded-3xl border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                  <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-primary to-secondary opacity-60 transition-opacity group-hover:opacity-100" />
                  <div aria-hidden className="pointer-events-none absolute -bottom-10 -start-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-100" />
                  <CardContent className="relative space-y-3 p-6 text-right">
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/25 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 motion-reduce:transition-none">
                        <Stethoscope className="h-6 w-6" />
                      </div>
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 font-mono font-bold text-primary ring-1 ring-primary/20">
                        1
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-foreground">التوثيق الطبي الصارم</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      فصل واضح بين ملاحظات المربي والكشوفات السريرية المعتمدة بواسطة الأطباء المرخصين، لمنع التضليل أو الفتاوى الطبية المغلوطة.
                    </p>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden rounded-3xl border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                  <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-primary to-secondary opacity-60 transition-opacity group-hover:opacity-100" />
                  <div aria-hidden className="pointer-events-none absolute -bottom-10 -start-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-100" />
                  <CardContent className="relative space-y-3 p-6 text-right">
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/25 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 motion-reduce:transition-none">
                        <PawPrint className="h-6 w-6" />
                      </div>
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 font-mono font-bold text-primary ring-1 ring-primary/20">
                        2
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-foreground">شمول جميع الفصائل</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      دعم متكامل للحيوانات الأليفة (كلاب وقطط وأرانب)، الخيول، الماشية والأغنام، والطيور، مع مراعاة الخصائص الفسيولوجية لكل نوع.
                    </p>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden rounded-3xl border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                  <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-primary to-secondary opacity-60 transition-opacity group-hover:opacity-100" />
                  <div aria-hidden className="pointer-events-none absolute -bottom-10 -start-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-100" />
                  <CardContent className="relative space-y-3 p-6 text-right">
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/25 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 motion-reduce:transition-none">
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 font-mono font-bold text-primary ring-1 ring-primary/20">
                        3
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-foreground">الخصوصية والأمان الرقمي</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      لا يتم تبادل السجلات الطبية إلا بموافقة صريحة قائمة على تصاريح محددة بين المربي والطبيب البيطري المعالج.
                    </p>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden rounded-3xl border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                  <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-primary to-secondary opacity-60 transition-opacity group-hover:opacity-100" />
                  <div aria-hidden className="pointer-events-none absolute -bottom-10 -start-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-100" />
                  <CardContent className="relative space-y-3 p-6 text-right">
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/25 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 motion-reduce:transition-none">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 font-mono font-bold text-primary ring-1 ring-primary/20">
                        4
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-foreground">الامتثال للوائح النقابة</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      التحقق الصارم من شهادات التخرج وتراخيص مزاولة المهنة وكارنيهات النقابة العامة للأطباء البيطريين لضمان سلامة المرضى.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>
        </div>
      </main>

    </div>
  );
}
