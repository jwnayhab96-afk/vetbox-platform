"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/shared/header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { createClient } from "@/lib/supabase/client";
import { formatArabicDate, SPECIES_LABELS } from "@/lib/utils";
import {
  Stethoscope,
  Users,
  Activity,
  Plus,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

export default function VetDashboardPage() {
  const [vetId, setVetId] = useState("");
  const [vet, setVet] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dataWarning, setDataWarning] = useState<string | null>(null);

  const load = async (userId: string) => {
    setLoading(true);
    setLoadError(null);
    try {
      const supabase = createClient();
      const [vetResult, linkResult, visitResult] = await Promise.all([
        supabase.from("veterinarian_profiles").select("*, profile:profiles!veterinarian_profiles_id_fkey(*)").eq("id", userId).single(),
        supabase.from("pet_vet_links").select("*, pet:pets(*)").eq("vet_id", userId).order("created_at", { ascending: false }),
        supabase.from("medical_visits").select("*").eq("vet_id", userId).order("visit_date", { ascending: false }),
      ]);
      if (vetResult.error) throw vetResult.error;
      if (!vetResult.data) throw new Error("ملف الطبيب غير موجود في قاعدة البيانات.");

      setVet(vetResult.data);
      setLinks(linkResult.data || []);
      setVisits(visitResult.data || []);
      const secondaryError = linkResult.error || visitResult.error;
      setDataWarning(secondaryError ? `تعذر تحميل بعض بيانات اللوحة: ${secondaryError.message}` : null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "تعذر تحميل لوحة الطبيب.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    let active = true;
    const initialize = async () => {
      try {
        const { data: { user }, error } = await createClient().auth.getUser();
        if (!user) { window.location.assign("/auth/login"); return; }
        if (error) throw error;
        if (active) {
          setVetId(user.id);
          await load(user.id);
        }
      } catch (error) {
        if (active) {
          setLoadError(error instanceof Error ? error.message : "تعذر التحقق من جلسة الطبيب.");
          setLoading(false);
        }
      }
    };
    void initialize();
    return () => { active = false; };
  }, []);

  const pendingRequests = links.filter((l) => l.status === "pending");
  const acceptedPatients = links.filter((l) => l.status === "accepted");
  const handleAction = async (linkId: string, status: "accepted" | "rejected") => {
    const { error } = await createClient().from("pet_vet_links").update({ status, responded_at: new Date().toISOString() }).eq("id", linkId).eq("vet_id", vetId);
    if (error) { window.alert(error.message); return; }
    await load(vetId);
  };

  const pageHeader = (
    <Header
      title={vet ? `مرحباً، ${vet.profile?.full_name || ""}` : "لوحة الطبيب"}
      subtitle={vet ? `بوابة الطبيب البيطري${vet.clinic_affiliation_name ? ` • ${vet.clinic_affiliation_name}` : ""}` : "إدارة المرضى والطلبات المهنية"}
      role="veterinarian"
      action={{
        label: "تسجيل كشف سريري جديد",
        href: "/veterinarian/visits/new",
        icon: <Plus className="h-4 w-4" />,
      }}
    />
  );

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        {pageHeader}
        <div className="flex flex-1 items-center justify-center gap-3 p-8 text-sm text-muted-foreground">
          <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
          جاري تحميل لوحة الطبيب...
        </div>
      </div>
    );
  }

  if (loadError || !vet) {
    return (
      <div className="flex min-h-screen flex-col">
        {pageHeader}
        <div className="w-full max-w-3xl p-4 md:p-8">
          <Card className="border-rose-200 bg-rose-50/70">
            <CardContent className="flex items-start gap-3 p-5 text-right text-sm text-rose-800">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="space-y-3">
                <p className="font-semibold">تعذر تحميل بيانات لوحة الطبيب.</p>
                <p dir="ltr" className="break-words text-xs">{loadError || "ملف الطبيب غير موجود."}</p>
                <Button type="button" variant="outline" onClick={() => window.location.reload()}>
                  إعادة المحاولة
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {pageHeader}

      <div className="p-4 md:p-8 space-y-8 max-w-7xl">
        {dataWarning && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{dataWarning}</span>
          </div>
        )}
        {/* Verification Status Banner */}
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-right ${vet.verification_status === "verified" ? "bg-emerald-50 border-emerald-200/80" : "bg-amber-50 border-amber-200/80"}`}>
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl text-white flex items-center justify-center shrink-0 ${vet.verification_status === "verified" ? "bg-emerald-600" : "bg-amber-600"}`}>
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-emerald-950">{vet.verification_status === "verified" ? "حساب طبيب معتمد ومرخص" : "بيانات الترخيص قيد المراجعة"}</h4>
                <Badge variant={vet.verification_status === "verified" ? "success" : "warning"} className="text-[10px]">{vet.verification_status === "verified" ? "موثق بالنقابة" : "قيد الفحص"}</Badge>
              </div>
              <p className="text-xs text-emerald-800">
                رقم القيد النقابي: <strong className="font-mono">{vet.license_number || "غير مسجل"}</strong> • النقابة العامة للأطباء البيطريين
              </p>
            </div>
          </div>
          <Link href="/veterinarian/verification">
            <Button variant="outline" size="sm" className="text-xs bg-white text-emerald-900 border-emerald-300">
              عرض تفاصيل الترخيص
            </Button>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/80 shadow-xs">
            <CardContent className="p-5 flex items-center justify-between text-right">
              <div>
                <p className="text-xs text-muted-foreground font-medium">المرضى المعتمدين</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">{acceptedPatients.length}</h3>
              </div>
              <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-xs">
            <CardContent className="p-5 flex items-center justify-between text-right">
              <div>
                <p className="text-xs text-muted-foreground font-medium">طلبات الربط الجديدة</p>
                <h3 className="text-2xl font-bold text-amber-600 mt-1">{pendingRequests.length}</h3>
              </div>
              <div className="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-xs">
            <CardContent className="p-5 flex items-center justify-between text-right">
              <div>
                <p className="text-xs text-muted-foreground font-medium">الكشوفات المسجلة</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">{visits.length}</h3>
              </div>
              <div className="h-11 w-11 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center">
                <Activity className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-xs">
            <CardContent className="p-5 flex items-center justify-between text-right">
              <div>
                <p className="text-xs text-muted-foreground font-medium">سعر الكشف المعتمد</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">{vet.consultation_fee} ج.م</h3>
              </div>
              <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Stethoscope className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SECTION: PENDING CONNECTION REQUESTS */}
        {pendingRequests.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-600" />
                  طلبات ربط جديدة في انتظار موافقتك ({pendingRequests.length})
                </h3>
                <p className="text-xs text-muted-foreground">
                  قام المربون باختيارك كطبيب معالج ويرغبون في منحك صلاحية الوصول للسجل الطبي.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((req) => (
                <Card key={req.id} className="border-amber-500/30 bg-amber-500/5 p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-base text-foreground">{req.pet?.name || "حيوان أليف"}</h4>
                      <p className="text-xs text-muted-foreground">
                        الفصيلة: {SPECIES_LABELS[req.pet?.species || "dog"]?.ar} {req.pet?.breed && `(${req.pet.breed})`}
                      </p>
                    </div>
                    <Badge variant="warning" className="text-[10px]">قيد المراجعة</Badge>
                  </div>

                  {req.notes && (
                    <p className="text-xs text-muted-foreground bg-card/80 p-2.5 rounded-lg border border-border/60">
                      رسالة المربي: &quot;{req.notes}&quot;
                    </p>
                  )}

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-amber-500/20">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleAction(req.id, "rejected")}
                      className="text-xs h-8"
                    >
                      <XCircle className="h-3.5 w-3.5 ml-1" />
                      رفض
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAction(req.id, "accepted")}
                      className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 ml-1" />
                      قبول وتفعيل الربط
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* SECTION: AUTHORIZED PATIENT LIST */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">قائمة المرضى والحالات المعتمدة</h3>
              <p className="text-xs text-muted-foreground">الحيوانات المصرح لك بالاطلاع على سجلاتها الطبية الكاملة</p>
            </div>
            <Link href="/veterinarian/patients">
              <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">
                <span>عرض كل المرضى</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {acceptedPatients.length === 0 ? (
              <div className="col-span-3 p-12 text-center rounded-2xl border border-dashed border-border bg-card/60">
                <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground">لا يوجد مرضى مربوطين حالياً</p>
                <p className="text-xs text-muted-foreground mt-1">
                  عند قبول طلبات الربط من المربين، ستظهر ملفات المرضى هنا.
                </p>
              </div>
            ) : (
              acceptedPatients.map((lnk) => {
                if (!lnk.pet) return null;
                const petVisits = visits.filter((visit) => visit.pet_id === lnk.pet.id);
                return (
                  <Card key={lnk.id} className="border-border/80 bg-card p-5 space-y-4 hover:border-primary/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 rounded-2xl bg-muted overflow-hidden shrink-0 border border-border">
                        {lnk.pet.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={lnk.pet.photo_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-primary bg-primary/10">
                            <Stethoscope className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-foreground">{lnk.pet.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {SPECIES_LABELS[lnk.pet.species]?.ar} {lnk.pet.breed && `• ${lnk.pet.breed}`}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          عدد الزيارات المسجلة: <strong>{petVisits.length}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
                      <Link href={`/veterinarian/patients/detail?petId=${encodeURIComponent(lnk.pet.id)}`}>
                        <Button variant="outline" size="sm" className="text-xs">
                          الملف الطبي الكامل
                        </Button>
                      </Link>
                      <Link href={`/veterinarian/visits/new?petId=${lnk.pet.id}`}>
                        <Button size="sm" className="text-xs gap-1">
                          <Plus className="h-3.5 w-3.5" />
                          تسجيل كشف
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
