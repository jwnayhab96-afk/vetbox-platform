"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/shared/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { formatArabicDate } from "@/lib/utils";
import { ShieldCheck, CheckCircle2, XCircle, Search, Clock, Award } from "lucide-react";

export default function AdminVeterinariansPage() {
  const [vets, setVets] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "verified" | "rejected">("all");

  const loadVeterinarians = async () => {
    const { data, error } = await createClient().from("veterinarian_profiles").select("*, profile:profiles(*)").order("created_at", { ascending: false });
    if (error) { console.error("Unable to load veterinarian applications", error); return; }
    setVets(data || []);
  };
  useEffect(() => { loadVeterinarians(); }, []);

  const handleStatusChange = async (vetId: string, status: "verified" | "rejected") => {
    const reason = status === "rejected" ? "تم رفض الاعتماد لعدم استيفاء الشروط" : null;
    const { error } = await createClient().rpc("review_veterinarian", { target_vet_id: vetId, new_status: status, reason });
    if (error) { window.alert(error.message); return; }
    await loadVeterinarians();
  };

  const filtered = vets.filter((v) => {
    if (filter === "all") return true;
    return v.verification_status === filter;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="إدارة واعتماد الأطباء البيطريين"
        subtitle="مراجعة التراخيص، كارنيهات النقابة، والتحقق من المؤهلات"
        role="admin"
      />

      <div className="p-4 md:p-8 space-y-6 max-w-7xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
              filter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            الكل ({vets.length})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
              filter === "pending" ? "bg-amber-600 text-white" : "bg-muted text-muted-foreground"
            }`}
          >
            قيد الانتظار ({vets.filter((v) => v.verification_status === "pending").length})
          </button>
          <button
            onClick={() => setFilter("verified")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
              filter === "verified" ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"
            }`}
          >
            المعتمدين ({vets.filter((v) => v.verification_status === "verified").length})
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((vet) => (
            <Card key={vet.id} className="border-border/80 bg-card p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-foreground">{vet.profile?.full_name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{vet.education}</p>
                  <p className="text-xs text-foreground font-mono mt-1">قيد: {vet.license_number}</p>
                </div>
                <Badge
                  variant={
                    vet.verification_status === "verified"
                      ? "success"
                      : vet.verification_status === "pending"
                      ? "warning"
                      : "destructive"
                  }
                  className="text-xs"
                >
                  {vet.verification_status === "verified"
                    ? "معتمد"
                    : vet.verification_status === "pending"
                    ? "قيد الفحص"
                    : "مرفوض"}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2">{vet.bio}</p>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                {vet.verification_status !== "verified" && (
                  <Button
                    size="sm"
                    className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleStatusChange(vet.id, "verified")}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 ml-1" />
                    اعتماد الترخيص
                  </Button>
                )}
                {vet.verification_status !== "rejected" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 text-destructive hover:bg-destructive/10"
                    onClick={() => handleStatusChange(vet.id, "rejected")}
                  >
                    <XCircle className="h-3.5 w-3.5 ml-1" />
                    رفض
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
