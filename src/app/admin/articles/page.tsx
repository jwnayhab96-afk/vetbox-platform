"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/shared/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { FileText, Plus, Eye } from "lucide-react";

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const loadArticles = async () => {
    const { data, error } = await createClient().from("articles").select("*, reviewer:veterinarian_profiles(*, profile:profiles(*))").order("created_at", { ascending: false });
    if (error) setError(error.message); else { setArticles(data || []); setError(null); }
    setLoading(false);
  };
  useEffect(() => {
    void loadArticles();
  }, []);

  const createArticle = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) { setError(authError?.message || "انتهت جلسة الدخول. سجّل الدخول مجددًا."); setSaving(false); return; }
    const { error } = await supabase.from("articles").insert({
      title: String(values.get("title") || "").trim(),
      slug: String(values.get("slug") || "").trim(),
      summary: String(values.get("summary") || "").trim(),
      body: String(values.get("body") || "").trim(),
      category: String(values.get("category") || "general").trim(),
      species_target: String(values.get("species_target") || "all"),
      author_id: user.id,
      is_published: values.get("is_published") === "on",
    });
    setSaving(false);
    if (error) { setError(error.message); return; }
    form.reset();
    setShowForm(false);
    setLoading(true);
    await loadArticles();
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="إدارة المقالات والمحتوى التعليمي"
        subtitle="مراجعة المحتوى الطبي وضمان مطابقته للمعايير البيطرية المعتمدة"
        role="admin"
      />

      <div className="p-4 md:p-8 space-y-6 max-w-6xl">
        <div className="flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground">{articles.length} مقال</p><Button onClick={() => setShowForm((value) => !value)}><Plus className="ml-2 h-4 w-4" />{showForm ? "إغلاق النموذج" : "إضافة مقال"}</Button></div>
        {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><p className="font-semibold">تعذر تحميل المقالات من Supabase</p><p dir="ltr" className="mt-1 break-all text-xs">{error}</p></div>}
        {showForm && <Card className="p-5"><form onSubmit={createArticle} className="grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor="article-title">عنوان المقال *</Label><Input id="article-title" name="title" required /></div>
          <div><Label htmlFor="article-slug">الرابط المختصر (Slug) *</Label><Input id="article-slug" name="slug" required dir="ltr" placeholder="pet-vaccination-guide" /></div>
          <div><Label htmlFor="article-category">التصنيف *</Label><Input id="article-category" name="category" required /></div>
          <div><Label htmlFor="article-species">الفصيلة المستهدفة</Label><select id="article-species" name="species_target" defaultValue="all" className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"><option value="all">كل الحيوانات</option><option value="dog">كلاب</option><option value="cat">قطط</option><option value="bird">طيور</option></select></div>
          <div className="sm:col-span-2"><Label htmlFor="article-summary">ملخص المقال *</Label><Input id="article-summary" name="summary" required /></div>
          <div className="sm:col-span-2"><Label htmlFor="article-body">محتوى المقال *</Label><textarea id="article-body" name="body" required rows={10} className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_published" defaultChecked /> نشر المقال مباشرة</label>
          <div className="sm:col-span-2"><Button type="submit" isLoading={saving}>حفظ المقال</Button></div>
        </form></Card>}
        <div className="space-y-4">
          {loading && <p className="py-8 text-center text-sm text-muted-foreground">جارٍ تحميل المقالات...</p>}
          {!loading && !error && articles.length === 0 && <Card className="p-10 text-center text-sm text-muted-foreground">لا توجد مقالات مسجلة حتى الآن. أضف مقالًا لبدء بناء مكتبة المحتوى.</Card>}
          {articles.map((art) => (
            <Card key={art.id} className="border-border/80 bg-card p-5 flex items-center justify-between gap-4">
              <div className="space-y-1 text-right">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-foreground">{art.title}</h3>
                  <Badge variant={art.is_published ? "success" : "neutral"} className="text-[10px]">{art.is_published ? "منشور" : "مسودة"}</Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">{art.summary}</p>
                <span className="text-[11px] text-muted-foreground block">
                  مراجعة: {art.reviewer?.profile?.full_name || "غير محدد"} • الفصيلة المستهدفة: {art.species_target}
                </span>
              </div>

              {art.is_published && <Link href={`/learn/article?slug=${encodeURIComponent(art.slug)}`}>
                <Button variant="outline" size="sm" className="text-xs gap-1 shrink-0">
                  <Eye className="h-3.5 w-3.5" />
                  معاينة المقال
                </Button>
              </Link>}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
