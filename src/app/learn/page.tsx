"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { BookOpen, Search, Clock, ShieldCheck, ArrowRight } from "lucide-react";

export default function LearnPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [articles, setArticles] = useState<any[]>([]);
  useEffect(() => {
    createClient().from("published_articles").select("*").order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("Unable to load articles", error);
        else setArticles(data || []);
      });
  }, []);

  const filtered = articles.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(search.toLowerCase()) ||
      art.summary.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === "all" || art.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-10 md:py-16">
        <div className="container space-y-8">
          {/* Header */}
          <div className="text-right space-y-2 max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground font-display">
              موسوعة المعرفة البيطرية المعتمدة
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              إرشادات صحية، بروتوكولات تطعيم، وإسعافات أولية مراجعة بواسطة أطباء بيطريين متخصصين.
            </p>
          </div>

          {/* Search & Categories */}
          <div className="p-4 rounded-2xl bg-card border border-border shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="ابحث في المقالات (تطعيمات، مغص الخيل، مسالك بولية)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<Search className="h-4 w-4" />}
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setCategoryFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  categoryFilter === "all" ? "bg-primary text-primary-foreground shadow-xs" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                جميع المقالات
              </button>
              <button
                onClick={() => setCategoryFilter("preventive_care")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  categoryFilter === "preventive_care" ? "bg-primary text-primary-foreground shadow-xs" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                الرعاية الوقائية والتطعيمات
              </button>
              <button
                onClick={() => setCategoryFilter("symptoms")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  categoryFilter === "symptoms" ? "bg-primary text-primary-foreground shadow-xs" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                الأعراض والأمراض
              </button>
              <button
                onClick={() => setCategoryFilter("emergency_care")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  categoryFilter === "emergency_care" ? "bg-primary text-primary-foreground shadow-xs" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                طوارئ وإسعافات أولية
              </button>
            </div>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((art) => (
              <Card key={art.id} className="overflow-hidden border-border/80 bg-card hover:border-primary/50 transition-all flex flex-col justify-between">
                <div>
                  <div className="h-48 w-full bg-muted relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={art.cover_image_url || ""}
                      alt={art.title}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute top-3 right-3 bg-background/90 backdrop-blur-md text-foreground text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                      {art.species_target === "dogs" ? "كلاب" : art.species_target === "cats" ? "قطط" : art.species_target === "horses" ? "خيول" : "عام"}
                    </span>
                  </div>

                  <CardContent className="p-6 space-y-3 text-right">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {art.read_time_minutes} دقائق قراءة
                      </span>
                      <span className="flex items-center gap-1 text-emerald-700">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        مراجعة طبية بيطرية
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-foreground leading-snug">
                      {art.title}
                    </h3>

                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {art.summary}
                    </p>
                  </CardContent>
                </div>

                <div className="p-6 pt-0 border-t border-border/60 mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    مراجعة: {art.reviewer?.profile?.full_name || "غير محدد"}
                  </span>
                  <Link href={`/learn/article?slug=${encodeURIComponent(art.slug)}`}>
                    <Button size="sm" variant="outline" className="text-xs">
                      قراءة المقال ←
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
