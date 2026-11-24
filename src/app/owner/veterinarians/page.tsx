"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/shared/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { store } from "@/lib/data/store";
import { formatArabicDate } from "@/lib/utils";
import { Stethoscope, ShieldCheck, Phone, MapPin, Search, Plus, UserX } from "lucide-react";

export default function OwnerVeterinariansPage() {
  const currentProfile = store.getCurrentProfile();
  const pets = store.getPets(currentProfile.id);
  const links = pets.flatMap((p) => store.getLinksForPet(p.id));

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="أطبائي البيطريين المعتمدين"
        subtitle="إدارة الأطباء المصرح لهم بالوصول إلى الملفات الطبية لحيواناتك"
        role="owner"
        action={{
          label: "استكشاف أطباء جدد",
          href: "/veterinarians",
          icon: <Search className="h-4 w-4" />,
        }}
      />

      <div className="p-4 md:p-8 space-y-6 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {links.length === 0 ? (
            <div className="col-span-2 p-12 text-center rounded-2xl border border-dashed border-border bg-card/60">
              <Stethoscope className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="font-bold text-lg text-foreground">لم تقم بربط أي طبيب بيطري حتى الآن</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                يمكنك البحث في دليل الأطباء البيطريين المعتمدين وإرسال طلب ربط لملف حيوانك لمشاركة الفحوصات والتقارير.
              </p>
              <Link href="/veterinarians" className="inline-block mt-4">
                <Button className="gap-2">
                  <Search className="h-4 w-4" />
                  تصفح دليل الأطباء
                </Button>
              </Link>
            </div>
          ) : (
            links.map((lnk) => (
              <Card key={lnk.id} className="border-border/80 bg-card p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg overflow-hidden border border-primary/20">
                      {lnk.vet?.profile?.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={lnk.vet.profile.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Stethoscope className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-foreground">
                        {lnk.vet?.profile?.full_name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {lnk.vet?.clinic_affiliation_name || "طبيب ممارس حر"}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={lnk.status === "accepted" ? "success" : lnk.status === "pending" ? "warning" : "destructive"}
                    className="text-xs"
                  >
                    {lnk.status === "accepted" ? "معتمد ومربوط" : lnk.status === "pending" ? "قيد المراجعة" : "مرفوض"}
                  </Badge>
                </div>

                <div className="p-3 rounded-xl bg-muted/40 text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>الحيوان المربوط:</span>
                    <strong className="text-foreground">{lnk.pet?.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>تاريخ الطلب:</span>
                    <span>{formatArabicDate(lnk.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>نطاق الصلاحيات:</span>
                    <span className="text-emerald-700 font-medium">سجل سريري كامل</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <Link href={`/owner/pets/${lnk.pet_id}`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      عرض سجل الحيوان
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      if (confirm("هل أنت متأكد من رغبتك في إلغاء ربط هذا الطبيب؟")) {
                        store.updateConnectionStatus(lnk.id, "revoked", currentProfile.id);
                        alert("تم إلغاء الربط بنجاح.");
                      }
                    }}
                  >
                    إلغاء الربط
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
