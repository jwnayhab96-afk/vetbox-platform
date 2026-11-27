"use client";

import { FormEvent, useEffect, useState } from "react";
import { Navbar } from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

const categories = [
  ["account", "الحساب وتسجيل الدخول"], ["pet_link", "ربط حيوان بطبيب"], ["medical_record", "السجل الطبي"],
  ["notification", "الإشعارات"], ["technical", "مشكلة تقنية"], ["other", "موضوع آخر"],
];

export default function SupportPage() {
  const [userId, setUserId] = useState("");
  const [category, setCategory] = useState("technical");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [tickets, setTickets] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.assign("/auth/login?next=%2Fsupport"); return; }
      setUserId(user.id);
      const { data } = await supabase.from("support_tickets").select("id, subject, status, admin_response, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10);
      setTickets(data || []);
    };
    void load();
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setMessage("");
    const { error } = await createClient().from("support_tickets").insert({ user_id: userId, category, subject: subject.trim(), description: description.trim(), page_path: window.location.pathname });
    setBusy(false);
    if (error) { setMessage("تعذر تسجيل طلبك. أعد المحاولة، أو تواصل مع الدعم عبر البريد الموضح في إعدادات المنصة."); return; }
    setMessage("وصل طلبك إلى فريق الإدارة. يمكنك متابعة الرد من هذه الصفحة."); setSubject(""); setDescription("");
    const { data } = await createClient().from("support_tickets").select("id, subject, status, admin_response, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(10);
    setTickets(data || []);
  };

  return <div className="min-h-screen bg-background"><Navbar /><main className="container max-w-3xl space-y-6 py-10">
    <header className="text-right"><h1 className="text-3xl font-black">الدعم ومتابعة المشكلة</h1><p className="mt-2 text-sm text-muted-foreground">اكتب ما حدث والخطوة التي كنت تنفذها، وسيصل الطلب إلى فريق الإدارة.</p></header>
    <Card><CardContent className="p-5"><form onSubmit={submit} className="space-y-4 text-right">
      <div><Label htmlFor="support-category">نوع المشكلة</Label><select id="support-category" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-input bg-background px-3">{categories.map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></div>
      <div><Label htmlFor="support-subject">عنوان مختصر</Label><Input id="support-subject" required minLength={3} maxLength={160} value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
      <div><Label htmlFor="support-description">التفاصيل</Label><Textarea id="support-description" required minLength={5} maxLength={4000} rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="ما الذي حدث؟ وما الخطوة التي سبقت المشكلة؟" /></div>
      {message && <p role="status" className="text-sm text-primary">{message}</p>}
      <Button disabled={busy || !userId}>{busy ? "جارٍ الإرسال..." : "إرسال طلب الدعم"}</Button>
    </form></CardContent></Card>
    {tickets.length > 0 && <section className="space-y-3 text-right"><h2 className="text-xl font-bold">طلباتي السابقة</h2>{tickets.map((ticket) => <Card key={ticket.id}><CardContent className="space-y-2 p-4"><div className="flex justify-between gap-3"><strong>{ticket.subject}</strong><span className="text-xs text-muted-foreground">{ticket.status === "resolved" ? "تم الحل" : ticket.status === "in_progress" ? "قيد المتابعة" : "جديد"}</span></div>{ticket.admin_response && <p className="rounded-lg bg-primary/5 p-3 text-sm">رد الإدارة: {ticket.admin_response}</p>}</CardContent></Card>)}</section>}
  </main></div>;
}
