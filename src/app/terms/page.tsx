import React from "react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-12 md:py-20">
        <div className="container max-w-3xl space-y-6 text-right">
          <h1 className="text-3xl font-extrabold text-foreground font-display">شروط الاستخدام والخدمة</h1>
          <p className="text-xs text-muted-foreground">آخر تحديث: نوفمبر 2024</p>
          <div className="prose prose-sm dark:prose-invert max-w-none space-y-4 text-muted-foreground leading-relaxed">
            <h2 className="text-lg font-bold text-foreground">1. الأهلية والتسجيل</h2>
            <p>
              يجب أن يكون مستخدم المنصة قد بلغ السن القانوني لإنشاء الحسابات. يشترط في الأطباء البيطريين المسجلين الحصول على بكالوريوس طب بيطري معتمد من إحدى الجامعات المصرية أو ما يعادلها، والقيد الفعلي بنقابة الأطباء البيطريين.
            </p>
            <h2 className="text-lg font-bold text-foreground">2. طبيعة الخدمة وإخلاء المسؤولية</h2>
            <p>
              منصة فيت بوكس هي وسيلة تنظيمية تقنية لإدارة وتوثيق السجلات والمواعيد والتواصل مع الأطباء. لا تقدم المنصة بذاتها تشخيصات طبية مستقلة أو بدائل للكشف السريري الفعلي في العيادات أو المستشفيات البيطرية.
            </p>
            <h2 className="text-lg font-bold text-foreground">3. مسؤولية المحتوى</h2>
            <p>
              يتحمل الطبيب البيطري المسؤولية الأخلاقية والمهنية الكاملة عن دقة الكشوفات والتشخيصات والوصفات الطبية المدونة من قبله داخل المنصة.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
