"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { store } from "@/lib/data/store";
import {
  Clock,
  ShieldCheck,
  ArrowRight,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

export default function ArticleDetailClient({ slug: propSlug }: { slug?: string }) {
  const params = useParams();
  const slug = propSlug || (params?.slug as string);
  const article = store.getArticleBySlug(slug);

  if (!article) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <div className="container py-20 text-center space-y-4">
          <h2 className="text-xl font-bold">المقال غير موجود</h2>
          <Link href="/learn">
            <Button variant="outline">العودة لمكتبة المقالات</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-10 md:py-16">
        <div className="container max-w-4xl space-y-8">
          <Link href="/learn" className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline">
            <ArrowRight className="h-4 w-4" />
            العودة للموسوعة البيطرية
          </Link>

          {/* Article Header */}
          <article className="space-y-6 text-right">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {article.category === "preventive_care" ? "الرعاية الوقائية والتطعيمات" : article.category === "symptoms" ? "الأعراض المرضية" : "طوارئ"}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {article.read_time_minutes} دقائق قراءة
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold text-foreground font-display leading-[1.25]">
                {article.title}
              </h1>

              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                {article.summary}
              </p>
            </div>

            {/* Medical Reviewer Box */}
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  <ShieldCheck className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">مراجعة وتدقيق طبي بيطري:</span>
                  <strong className="text-sm text-foreground">د. {article.reviewer?.profile?.full_name || "يوسف الشناوي"}</strong>
                  <span className="text-xs text-muted-foreground mr-1.5">(استشاري جراحة وطب حيوانات أليفة)</span>
                </div>
              </div>
              <Badge variant="success" className="text-xs">محتوى معتمد</Badge>
            </div>

            {/* Cover Image */}
            {article.cover_image_url && (
              <div className="h-72 md:h-96 w-full rounded-3xl overflow-hidden border border-border shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={article.cover_image_url} alt={article.title} className="h-full w-full object-cover" />
              </div>
            )}

            {/* Article Body Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none text-foreground leading-loose pt-4 space-y-4 whitespace-pre-line text-sm md:text-base">
              {article.body}
            </div>

            {/* Medical Disclaimer Banner */}
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-950 space-y-1 mt-10">
              <span className="font-bold flex items-center gap-1.5 text-amber-900">
                <AlertTriangle className="h-4 w-4" />
                إخلاء مسؤولية طبية:
              </span>
              <p className="leading-relaxed">
                المعلومات الواردة في هذا المقال هي لأغراض التثقيف والإرشاد العام فقط، ولا تغني بأي حال عن الفحص الإكلينيكي المباشر والتشخيص السريري بواسطة طبيب بيطري مرخص. في حال ظهور أي أعراض مرضية حادة، يرجى التوجه فوراً لأقرب عيادة بيطرية.
              </p>
            </div>

            {/* References */}
            {article.references_list && article.references_list.length > 0 && (
              <div className="p-5 rounded-2xl bg-card border border-border mt-6 space-y-2 text-right">
                <h4 className="font-bold text-sm text-foreground">المراجع العلمية والبروتوكولات المعتمدة:</h4>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {article.references_list.map((ref, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span>•</span>
                      <span>{ref.title} {ref.year && `(${ref.year})`}</span>
                      {ref.url && (
                        <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
                          رابط المرجع
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
