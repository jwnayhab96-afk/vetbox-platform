import React from "react";
import { Navbar } from "@/components/shared/navbar";
import { ScrollText } from "lucide-react";

export default function TermsPage() {
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
                <ScrollText className="h-7 w-7" />
              </span>
              <h1 className="text-2xl font-extrabold leading-snug text-white font-display sm:text-4xl">شروط الاستخدام والخدمة</h1>
              <p className="rounded-full border border-white/20 bg-white/15 px-4 py-1.5 text-xs font-semibold text-white/90 sm:text-sm">آخر تحديث: نوفمبر 2024</p>
            </div>
          </div>

          <div className="space-y-4 md:space-y-5">
            <section className="space-y-3 rounded-3xl border border-border/70 border-s-[6px] border-s-primary bg-card p-5 shadow-sm sm:p-7">
              <h2 className="text-lg font-extrabold text-foreground sm:text-xl">1. الأهلية والتسجيل</h2>
              <p className="text-sm leading-loose text-muted-foreground sm:text-base">
                يجب أن يكون مستخدم المنصة قد بلغ السن القانوني لإنشاء الحسابات. يشترط في الأطباء البيطريين المسجلين الحصول على بكالوريوس طب بيطري معتمد من إحدى الجامعات المصرية أو ما يعادلها، والقيد الفعلي بنقابة الأطباء البيطريين.
              </p>
            </section>

            <section className="space-y-3 rounded-3xl border border-amber-500/30 border-s-[6px] border-s-amber-500 bg-amber-500/10 p-5 shadow-sm sm:p-7">
              <h2 className="text-lg font-extrabold text-foreground sm:text-xl">2. طبيعة الخدمة وإخلاء المسؤولية</h2>
              <p className="text-sm leading-loose text-muted-foreground sm:text-base">
                منصة فيت بوكس هي وسيلة تنظيمية تقنية لإدارة وتوثيق السجلات والمواعيد والتواصل مع الأطباء. لا تقدم المنصة بذاتها تشخيصات طبية مستقلة أو بدائل للكشف السريري الفعلي في العيادات أو المستشفيات البيطرية.
              </p>
            </section>

            <section className="space-y-3 rounded-3xl border border-border/70 border-s-[6px] border-s-primary bg-card p-5 shadow-sm sm:p-7">
              <h2 className="text-lg font-extrabold text-foreground sm:text-xl">3. مسؤولية المحتوى</h2>
              <p className="text-sm leading-loose text-muted-foreground sm:text-base">
                يتحمل الطبيب البيطري المسؤولية الأخلاقية والمهنية الكاملة عن دقة الكشوفات والتشخيصات والوصفات الطبية المدونة من قبله داخل المنصة.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
