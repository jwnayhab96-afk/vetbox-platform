"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/shared/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { FileText, Plus, Eye, CheckCircle2 } from "lucide-react";

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  useEffect(() => {
    createClient().from("articles").select("*, reviewer:veterinarian_profiles(*, profile:profiles(*))").order("created_at", { ascending: false })
      .then(({ data, error }) => { if (error) console.error(error); else setArticles(data || []); });
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="إدارة المقالات والمحتوى التعليمي"
        subtitle="مراجعة المحتوى الطبي وضمان مطابقته للمعايير البيطرية المعتمدة"
        role="admin"
      />

      <div className="p-4 md:p-8 space-y-6 max-w-6xl">
        <div className="space-y-4">
          {articles.map((art) => (
            <Card key={art.id} className="border-border/80 bg-card p-5 flex items-center justify-between gap-4">
              <div className="space-y-1 text-right">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-foreground">{art.title}</h3>
                  <Badge variant="success" className="text-[10px]">منشور</Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">{art.summary}</p>
                <span className="text-[11px] text-muted-foreground block">
                  مراجعة: {art.reviewer?.profile?.full_name || "غير محدد"} • الفصيلة المستهدفة: {art.species_target}
                </span>
              </div>

              <Link href={`/learn/${art.slug}`}>
                <Button variant="outline" size="sm" className="text-xs gap-1 shrink-0">
                  <Eye className="h-3.5 w-3.5" />
                  معاينة المقال
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
