import React from "react";
import { Navbar } from "@/components/shared/navbar";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-12 md:py-20">
        <div className="container max-w-3xl space-y-6 text-right">
          <h1 className="text-3xl font-extrabold text-foreground font-display">سياسة الخصوصية وأمن البيانات</h1>
          <p className="text-xs text-muted-foreground">آخر تحديث: نوفمبر 2024</p>
          <div className="prose prose-sm dark:prose-invert max-w-none space-y-4 text-muted-foreground leading-relaxed">
            <h2 className="text-lg font-bold text-foreground">1. جمع واستخدام البيانات</h2>
            <p>
              تجمع منصة فيت بوكس البيانات اللازمة لإنشاء الحسابات الشخصية والمهنية وتوثيق السجلات الصحية للحيوانات، بما في ذلك أسماء المربين، أرقام الهواتف، العناوين، وبيانات الحيوانات الطبية.
            </p>
            <h2 className="text-lg font-bold text-foreground">2. سرية السجلات الطبية والملفات</h2>
            <p>
              تُعامل السجلات الطبية البيطرية، صور الأشعة، والتقارير المعملية بأعلى درجات السرية، ولا يمكن لأي طبيب الاطلاع عليها دون طلب ربط صريح وموافقة متبادلة وموثقة.
            </p>
            <h2 className="text-lg font-bold text-foreground">3. عدم مشاركة البيانات لأغراض تجارية</h2>
            <p>
              لا تبيع منصة فيت بوكس أي بيانات شخصية أو سجلات طبية لأي جهات تسويقية خارجية أو شركات أدوية دون إذن كتابي مسبق.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
