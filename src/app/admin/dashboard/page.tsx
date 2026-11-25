"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/shared/header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { formatArabicDateTime, formatArabicDate } from "@/lib/utils";
import {
  Users,
  ShieldCheck,
  Building,
  PawPrint,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  ChevronLeft,
  Activity,
  AlertTriangle,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [vets, setVets] = useState<any[]>([]);
  const [pets, setPets] = useState<any[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadErrors, setLoadErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    setLoading(true);
    const supabase = createClient();
    const [usersResult, vetsResult, petsResult, clinicsResult, logsResult] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact" }),
      supabase.from("veterinarian_profiles").select("*, profile:profiles(*)"),
      supabase.from("pets").select("id, name, owner_id"),
      supabase.from("clinics").select("*"),
      supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(20),
    ]);
    const results = [usersResult, vetsResult, petsResult, clinicsResult, logsResult];
    setLoadErrors(results.flatMap((result) => result.error ? [result.error.message] : []));
    if (usersResult.data) setUsers(usersResult.data);
    if (vetsResult.data) setVets(vetsResult.data);
    if (petsResult.data) setPets(petsResult.data);
    if (clinicsResult.data) setClinics(clinicsResult.data);
    if (logsResult.data) setAuditLogs(logsResult.data);
    setLoading(false);
  };
  useEffect(() => { loadDashboard(); }, []);

  const pendingVets = vets.filter((v) => v.verification_status === "pending");
  const verifiedVets = vets.filter((v) => v.verification_status === "verified");

  const handleVerifyVet = async (vetId: string, status: "verified" | "rejected") => {
    const { error } = await createClient().rpc("review_veterinarian", {
      target_vet_id: vetId, new_status: status, reason: status === "rejected" ? "بيانات الترخيص غير مطابقة" : null,
    });
    if (error) { window.alert(error.message); return; }
    await loadDashboard();
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="لوحة الإدارة والرقابة المركزية"
        subtitle="متابعة الحسابات، اعتماد تراخيص الأطباء، ومراجعة سجلات التدقيق"
        role="admin"
      />

      <div className="p-4 md:p-8 space-y-8 max-w-7xl">
        {loadErrors.length > 0 && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold">بعض بيانات لوحة الإدارة لم تُحمّل من Supabase</p><ul dir="ltr" className="mt-2 list-disc space-y-1 pl-5 text-xs">{loadErrors.map((message, index) => <li key={`${index}-${message}`} className="break-all">{message}</li>)}</ul></div><Button size="sm" variant="outline" onClick={() => void loadDashboard()}>إعادة المحاولة</Button></div></div>}
        {loading && <p className="text-sm text-muted-foreground">جارٍ تحميل بيانات الإدارة...</p>}
        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="border-border/80 shadow-xs">
            <CardContent className="p-5 flex items-center justify-between text-right">
              <div>
                <p className="text-xs text-muted-foreground font-medium">إجمالي المستخدمين</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">{users.length}</h3>
              </div>
              <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-xs">
            <CardContent className="p-5 flex items-center justify-between text-right">
              <div><p className="text-xs text-muted-foreground font-medium">العيادات المسجلة</p><h3 className="text-2xl font-bold text-foreground mt-1">{clinics.length}</h3></div>
              <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Building className="h-5 w-5" /></div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-xs">
            <CardContent className="p-5 flex items-center justify-between text-right">
              <div>
                <p className="text-xs text-muted-foreground font-medium">الأطباء المعتمدين</p>
                <h3 className="text-2xl font-bold text-emerald-600 mt-1">{verifiedVets.length}</h3>
              </div>
              <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-xs">
            <CardContent className="p-5 flex items-center justify-between text-right">
              <div>
                <p className="text-xs text-muted-foreground font-medium">طلبات الاعتماد العالقة</p>
                <h3 className="text-2xl font-bold text-amber-600 mt-1">{pendingVets.length}</h3>
              </div>
              <div className="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-xs">
            <CardContent className="p-5 flex items-center justify-between text-right">
              <div>
                <p className="text-xs text-muted-foreground font-medium">الحيوانات المسجلة</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">{pets.length}</h3>
              </div>
              <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <PawPrint className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SECTION: VET VERIFICATION QUEUE */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                طابور تدقيق واعتماد تراخيص الأطباء الجدد
              </h3>
              <p className="text-xs text-muted-foreground">
                مراجعة قيد نقابة الأطباء البيطريين وتراخيص مزاولة المهنة
              </p>
            </div>
            <Link href="/admin/veterinarians">
              <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">
                <span>إدارة كل الأطباء</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingVets.length === 0 ? (
              <div className="col-span-2 p-8 text-center rounded-2xl border border-dashed border-border bg-card/60">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground">لا توجد طلبات اعتماد عالقة في الطابور</p>
                <p className="text-xs text-muted-foreground mt-0.5">تم فحص وتدقيق كافة التراخيص المقدمة بنجاح.</p>
              </div>
            ) : (
              pendingVets.map((v) => (
                <Card key={v.id} className="border-amber-500/40 bg-amber-500/5 p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-base text-foreground">{v.profile?.full_name}</h4>
                      <p className="text-xs text-muted-foreground">{v.education}</p>
                      <p className="text-xs text-foreground font-mono mt-1">
                        رقم القيد: <strong>{v.license_number}</strong>
                      </p>
                    </div>
                    <Badge variant="warning" className="text-xs">قيد الفحص</Badge>
                  </div>

                  <p className="text-xs text-muted-foreground bg-card p-2.5 rounded-lg border border-border">
                    {v.bio}
                  </p>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-amber-500/20">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleVerifyVet(v.id, "rejected")}
                      className="text-xs h-8"
                    >
                      <XCircle className="h-3.5 w-3.5 ml-1" />
                      رفض الترخيص
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleVerifyVet(v.id, "verified")}
                      className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 ml-1" />
                      اعتماد وتوثيق الحساب
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* SECTION: AUDIT TRAIL */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Activity className="h-5 w-5 text-secondary" />
                سجل الرقابة والتدقيق الأمني (Operational Audit Trail)
              </h3>
              <p className="text-xs text-muted-foreground">تسجيل فوري لكافة العمليات الحساسة وتغييرات الصلاحيات</p>
            </div>
            <Link href="/admin/reports">
              <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">
                <span>عرض السجل الكامل</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <Card className="border-border/80 overflow-hidden">
            <div className="divide-y divide-border/60">
              {auditLogs.length === 0 ? <p className="p-6 text-center text-sm text-muted-foreground">{loading ? "جارٍ تحميل سجل التدقيق..." : "لا توجد سجلات تدقيق مسجلة حتى الآن."}</p> : auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between text-xs text-right">
                  <div className="space-y-0.5">
                    <span className="font-mono font-bold text-primary block">{log.action}</span>
                    <span className="text-muted-foreground">
                      المورد: <strong className="text-foreground">{log.resource_type}</strong> (ID: {log.resource_id})
                    </span>
                    {log.metadata && (
                      <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                        {JSON.stringify(log.metadata)}
                      </p>
                    )}
                  </div>
                  <div className="text-left text-muted-foreground">
                    <span className="block">{formatArabicDateTime(log.created_at)}</span>
                    <span className="text-[10px] font-mono">{log.ip_address || "127.0.0.1"}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
