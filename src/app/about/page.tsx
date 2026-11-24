import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/shared/logo";
import { ShieldCheck, PawPrint, Stethoscope, Users, CheckCircle2 } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-12 md:py-20">
        <div className="container max-w-4xl space-y-12 text-right">
          <div className="space-y-4 text-center max-w-2xl mx-auto flex flex-col items-center">
            <Logo size="lg" subtitle="" />
            <h1 className="text-3xl md:text-5xl font-black text-foreground font-display">
              عن منصة فيت بوكس (VET BOX)
            </h1>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              منظومة الرعاية الصحية البيطرية الرقمية الموحدة في جمهورية مصر العربية
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none text-foreground space-y-6 text-sm md:text-base leading-relaxed">
            <h2 className="text-2xl font-bold text-foreground">رؤيتنا</h2>
            <p className="text-muted-foreground">
              تأسست فيت بوكس لتحقيق تحول نوعي في مستوى الرعاية البيطرية وربط المربين بشبكة موثوقة من الأطباء والعيادات البيطرية المرخصة. نؤمن بأن كل حيوان يستحق ملفاً صحياً رقمياً موثقاً يرافقه مدى الحياة ويضمن حفظ تاريخه الطبي وتطعيماته بدقة وأمان.
            </p>

            <h2 className="text-2xl font-bold text-foreground">ركائز المنصة الأساسية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
              <Card className="border-border">
                <CardContent className="p-5 space-y-2 text-right">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    1
                  </div>
                  <h3 className="font-bold text-base text-foreground">التوثيق الطبي الصارم</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    فصل واضح بين ملاحظات المربي والكشوفات السريرية المعتمدة بواسطة الأطباء المرخصين، لمنع التضليل أو الفتاوى الطبية المغلوطة.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="p-5 space-y-2 text-right">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    2
                  </div>
                  <h3 className="font-bold text-base text-foreground">شمول جميع الفصائل</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    دعم متكامل للحيوانات الأليفة (كلاب وقطط وأرانب)، الخيول، الماشية والأغنام، والطيور، مع مراعاة الخصائص الفسيولوجية لكل نوع.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="p-5 space-y-2 text-right">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    3
                  </div>
                  <h3 className="font-bold text-base text-foreground">الخصوصية والأمان الرقمي</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    لا يتم تبادل السجلات الطبية إلا بموافقة صريحة قائمة على تصاريح محددة بين المربي والطبيب البيطري المعالج.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="p-5 space-y-2 text-right">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    4
                  </div>
                  <h3 className="font-bold text-base text-foreground">الامتثال للوائح النقابة</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    التحقق الصارم من شهادات التخرج وتراخيص مزاولة المهنة وكارنيهات النقابة العامة للأطباء البيطريين لضمان سلامة المرضى.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
