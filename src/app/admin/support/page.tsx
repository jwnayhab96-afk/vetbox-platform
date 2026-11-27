"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/shared/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const load = async () => {
    const { data, error: loadError } = await createClient().from("support_tickets").select("*").order("created_at", { ascending: false });
    if (loadError) setError("تعذر تحميل الطلبات. تأكد من تطبيق Migration الدعم في Supabase.");
    else { setError(""); setTickets(data || []); }
  };
  useEffect(() => { void load(); }, []);
  const update = async (ticket: any, status: string) => {
    setBusyId(ticket.id);
    const { error: updateError } = await createClient().from("support_tickets").update({ status, admin_response: responses[ticket.id] ?? ticket.admin_response, updated_at: new Date().toISOString() }).eq("id", ticket.id);
    setBusyId("");
    if (updateError) setError("تعذر حفظ الرد. تحقق من صلاحيات الإدارة في Supabase."); else await load();
  };
  return <div className="flex min-h-screen flex-col"><Header title="طلبات الدعم" subtitle="متابعة مشكلات الحسابات والربط والسجلات الطبية" role="admin" /><main className="w-full max-w-5xl space-y-4 p-4 md:p-8">
    {error && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
    {!tickets.length && !error && <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">لا توجد طلبات دعم حاليًا.</p>}
    {tickets.map((ticket) => <Card key={ticket.id}><CardContent className="space-y-3 p-4 text-right"><div className="flex flex-wrap justify-between gap-2"><h2 className="font-bold">{ticket.subject}</h2><span className="text-xs text-muted-foreground">{ticket.status} · {new Date(ticket.created_at).toLocaleString("ar-EG")}</span></div><p className="text-xs text-muted-foreground">{ticket.category} · الحساب {ticket.user_id}</p><p className="whitespace-pre-wrap text-sm">{ticket.description}</p>{ticket.page_path && <p dir="ltr" className="text-left text-xs text-muted-foreground">{ticket.page_path}</p>}<Textarea value={responses[ticket.id] ?? ticket.admin_response ?? ""} onChange={(e) => setResponses((items) => ({ ...items, [ticket.id]: e.target.value }))} rows={3} placeholder="اكتب ردًا للمستخدم" /><div className="flex flex-wrap gap-2"><Button disabled={busyId === ticket.id} onClick={() => void update(ticket, "in_progress")}>حفظ الرد · قيد المتابعة</Button><Button disabled={busyId === ticket.id} variant="outline" onClick={() => void update(ticket, "resolved")}>حفظ الرد · تم الحل</Button></div></CardContent></Card>)}
  </main></div>;
}
