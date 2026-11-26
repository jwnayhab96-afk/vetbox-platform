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
import { FileText, Plus, Eye, Pencil, X } from "lucide-react";

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any | null>(null);
  const loadArticles = async () => {
    const { data, error } = await createClient().from("articles").select("*, reviewer:veterinarian_profiles!articles_reviewer_id_fkey(*, profile:profiles!veterinarian_profiles_id_fkey(*))").order("created_at", { ascending: false });
    if (error) setError(error.message); else { setArticles(data || []); setError(null); }
    setLoading(false);
  };
  useEffect(() => {
    void loadArticles();
  }, []);

  const saveArticle = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) { setError(authError?.message || "انتهت جلسة الدخول. سجّل الدخول مجددًا."); setSaving(false); return; }
    const articleData = {
      title: String(values.get("title") || "").trim(),
      slug: String(values.get("slug") || "").trim(),
      summary: String(values.get("summary") || "").trim(),
      body: String(values.get("body") || "").trim(),
      cover_image_url: String(values.get("cover_image_url") || "").trim() || null,
      category: String(values.get("category") || "general").trim(),
      species_target: String(values.get("species_target") || "all"),
      is_published: values.get("is_published") === "on",
      updated_at: new Date().toISOString(),
    };
    const { error } = editingArticle
      ? await supabase.from("articles").update(articleData).eq("id", editingArticle.id)
      : await supabase.from("articles").insert({ ...articleData, author_id: user.id });
    setSaving(false);
    if (error) { setError(error.message); return; }
    form.reset();
    setShowForm(false);
    setEditingArticle(null);
    setLoading(true);
    await loadArticles();
  };

  const startEditing = (article: any) => {
    setEditingArticle(article);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeForm = () => {
    setEditingArticle(null);
    setShowForm(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="إدارة المقالات والمحتوى التعليمي"
        subtitle="مراجعة المحتوى الطبي وضمان مطابقته للمعايير البيطرية المعتمدة"
        role="admin"
      />

      <div className="p-4 md:p-8 space-y-6 max-w-6xl">
        <div className="flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground">{articles.length} مقال</p><Button onClick={() => { if (showForm) closeForm(); else { setEditingArticle(null); setShowForm(true); } }}><Plus className="ml-2 h-4 w-4" />{showForm ? "إغلاق النموذج" : "إضافة مقال"}</Button></div>
        {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><p className="font-semibold">تعذر تحميل المقالات أو حفظها</p><p dir="ltr" className="mt-1 break-all text-xs">{error}</p></div>}
        {showForm && <Card className="p-5"><form key={editingArticle?.id || "new-article"} onSubmit={saveArticle} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 flex items-center justify-between"><h3 className="font-bold">{editingArticle ? "تعديل المقال" : "مقال جديد"}</h3><Button type="button" size="sm" variant="ghost" onClick={closeForm}><X className="ml-1 h-4 w-4" />إلغاء</Button></div>
          <div><Label htmlFor="article-title">عنوان المقال *</Label><Input id="article-title" name="title" required defaultValue={editingArticle?.title || ""} /></div>
          <div><Label htmlFor="article-slug">الرابط المختصر (Slug) *</Label><Input id="article-slug" name="slug" required dir="ltr" placeholder="pet-vaccination-guide" defaultValue={editingArticle?.slug || ""} /></div>
          <div><Label htmlFor="article-category">التصنيف *</Label><Input id="article-category" name="category" required defaultValue={editingArticle?.category || ""} /></div>
          <div><Label htmlFor="article-species">الفصيلة المستهدفة</Label><select id="article-species" name="species_target" defaultValue={editingArticle?.species_target || "all"} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"><option value="all">كل الحيوانات</option><option value="dog">كلاب</option><option value="cat">قطط</option><option value="bird">طيور</option></select></div>
          <div className="sm:col-span-2"><Label htmlFor="article-cover-image">رابط صورة المقال</Label><Input id="article-cover-image" name="cover_image_url" type="url" dir="ltr" placeholder="https://example.com/article-image.jpg" defaultValue={editingArticle?.cover_image_url || ""} /><p className="mt-1 text-xs text-muted-foreground">اختياري — ستظهر الصورة في بطاقة المقال وصفحته.</p></div>
          <div className="sm:col-span-2"><Label htmlFor="article-summary">ملخص المقال *</Label><Input id="article-summary" name="summary" required defaultValue={editingArticle?.summary || ""} /></div>
          <div className="sm:col-span-2"><Label htmlFor="article-body">محتوى المقال *</Label><textarea id="article-body" name="body" required rows={10} defaultValue={editingArticle?.body || ""} className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_published" defaultChecked={editingArticle ? editingArticle.is_published : true} /> نشر المقال</label>
          <div className="sm:col-span-2"><Button type="submit" isLoading={saving}>{editingArticle ? "حفظ التعديلات" : "حفظ المقال"}</Button></div>
        </form></Card>}
        <div className="space-y-4">
          {loading && <p className="py-8 text-center text-sm text-muted-foreground">جارٍ تحميل المقالات...</p>}
          {!loading && !error && articles.length === 0 && <Card className="p-10 text-center text-sm text-muted-foreground">لا توجد مقالات مسجلة حتى الآن. أضف مقالًا لبدء بناء مكتبة المحتوى.</Card>}
          {articles.map((art) => (
            <Card key={art.id} className="border-border/80 bg-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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

              <div className="flex shrink-0 items-center justify-end gap-2">
              <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => startEditing(art)}>
                <Pencil className="h-3.5 w-3.5" />تعديل / فتح
              </Button>
              {art.is_published && <Link href={`/learn/article?slug=${encodeURIComponent(art.slug)}`}>
                <Button variant="outline" size="sm" className="text-xs gap-1 shrink-0">
                  <Eye className="h-3.5 w-3.5" />
                  معاينة المقال
                </Button>
              </Link>}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
