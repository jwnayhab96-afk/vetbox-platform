import React from "react";
import { Navbar } from "@/components/shared/navbar";
import { ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <Navbar />
      <main className="flex-1 py-8 md:py-16">
        <div className="container max-w-3xl space-y-5 md:space-y-6 text-right">
          {/* Hero */}
          <div className="relative overflow-hidden rounded-[2rem] bg-primary p-6 text-white shadow-lg sm:p-9">
            <div className="pointer-events-none absolute -start-16 -top-20 h-56 w-56 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -end-12 -bottom-24 h-64 w-64 rounded-full bg-black/10" />
            <div className="relative flex flex-col items-start gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/25 bg-white/20 backdrop-blur-sm">
                <ShieldCheck className="h-7 w-7" />
              </span>
              <h1 className="text-2xl font-extrabold leading-snug text-white font-display sm:text-4xl">سياسة الخصوصية وأمن البيانات</h1>
              <p className="rounded-full border border-white/20 bg-white/15 px-4 py-1.5 text-xs font-semibold text-white/90 sm:text-sm">آخر تحديث: نوفمبر 2024</p>
            </div>
          </div>

          <div className="space-y-4 md:space-y-5">
            <section className="space-y-3 rounded-3xl border border-border/70 border-s-[6px] border-s-primary bg-card p-5 shadow-sm sm:p-7">
              <h2 className="text-lg font-extrabold text-foreground sm:text-xl">1. جمع واستخدام البيانات</h2>
              <p className="text-sm leading-loose text-muted-foreground sm:text-base">
                تجمع منصة فيت بوكس البيانات اللازمة لإنشاء الحسابات الشخصية والمهنية وتوثيق السجلات الصحية للحيوانات، بما في ذلك أسماء المربين، أرقام الهواتف، العناوين، وبيانات الحيوانات الطبية.
              </p>
            </section>

            <section className="space-y-3 rounded-3xl border border-emerald-500/30 border-s-[6px] border-s-emerald-500 bg-emerald-500/10 p-5 shadow-sm sm:p-7">
              <h2 className="text-lg font-extrabold text-foreground sm:text-xl">2. سرية السجلات الطبية والملفات</h2>
              <p className="text-sm leading-loose text-muted-foreground sm:text-base">
                تُعامل السجلات الطبية البيطرية، صور الأشعة، والتقارير المعملية بأعلى درجات السرية، ولا يمكن لأي طبيب الاطلاع عليها دون طلب ربط صريح وموافقة متبادلة وموثقة.
              </p>
            </section>

            <section className="space-y-3 rounded-3xl border border-border/70 border-s-[6px] border-s-primary bg-card p-5 shadow-sm sm:p-7">
              <h2 className="text-lg font-extrabold text-foreground sm:text-xl">3. عدم مشاركة البيانات لأغراض تجارية</h2>
              <p className="text-sm leading-loose text-muted-foreground sm:text-base">
                لا تبيع منصة فيت بوكس أي بيانات شخصية أو سجلات طبية لأي جهات تسويقية خارجية أو شركات أدوية دون إذن كتابي مسبق.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
