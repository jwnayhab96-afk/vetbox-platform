"use client";

import React, { useState } from "react";
import { Header } from "@/components/shared/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { store } from "@/lib/data/store";
import { formatArabicDate, SPECIES_LABELS } from "@/lib/utils";
import { Users, CheckCircle2, XCircle, Clock, ShieldAlert } from "lucide-react";

export default function VetConnectionRequestsPage() {
  const vetId = "33333333-3333-3333-3333-333333333333";
  const [links, setLinks] = useState(() => store.getLinksForVet(vetId));

  const handleAction = (linkId: string, status: "accepted" | "rejected") => {
    store.updateConnectionStatus(linkId, status, vetId);
    setLinks([...store.getLinksForVet(vetId)]);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="طلبات الربط وإدارة العلاقات الطبية"
        subtitle="مراجعة طلبات المربين لمشاركة السجلات الطبية الكاملة لحالاتهم"
        role="veterinarian"
      />

      <div className="p-4 md:p-8 space-y-6 max-w-5xl">
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-right">
          <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-950 space-y-1">
            <span className="font-bold block">مبدأ حماية الخصوصية الطبية:</span>
            <p className="leading-relaxed">
              وفقاً لميثاق فيت بوكس، لا يُمنح أي طبيب حق الاطلاع على السجل الطبي أو إضافة كشوفات إلا بعد موافقة صريحة ومتبادلة بين المربي والطبيب المعالج.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {links.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/60">
              <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">لا توجد طلبات ربط حالياً</p>
            </div>
          ) : (
            links.map((lnk) => (
              <Card key={lnk.id} className="border-border/80 bg-card p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-base text-foreground">{lnk.pet?.name || "حيوان أليف"}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      الفصيلة: {SPECIES_LABELS[lnk.pet?.species || "dog"]?.ar} {lnk.pet?.breed && `(${lnk.pet.breed})`}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      تاريخ الطلب: {formatArabicDate(lnk.created_at)}
                    </p>
                  </div>
                  <Badge
                    variant={lnk.status === "accepted" ? "success" : lnk.status === "pending" ? "warning" : "destructive"}
                    className="text-xs"
                  >
                    {lnk.status === "accepted" ? "مربوط ومعتمد" : lnk.status === "pending" ? "قيد انتظار الموافقة" : "مرفوض"}
                  </Badge>
                </div>

                {lnk.notes && (
                  <p className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-xl border border-border/60">
                    ملاحظة المربي: &quot;{lnk.notes}&quot;
                  </p>
                )}

                {lnk.status === "pending" && (
                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-border/60">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleAction(lnk.id, "rejected")}
                      className="text-xs h-8"
                    >
                      <XCircle className="h-3.5 w-3.5 ml-1" />
                      رفض الطلب
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAction(lnk.id, "accepted")}
                      className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 ml-1" />
                      قبول الطلب وتفعيل الصلاحيات
                    </Button>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
