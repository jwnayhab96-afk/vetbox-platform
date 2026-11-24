"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { store } from "@/lib/data/store";
import {
  MapPin,
  PhoneCall,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Navigation,
} from "lucide-react";

export default function ClinicDetailClient({ id: propId }: { id?: string }) {
  const params = useParams();
  const clinicId = propId || (params?.id as string);
  const clinic = store.getClinicById(clinicId);

  if (!clinic) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <div className="container py-20 text-center space-y-4">
          <h2 className="text-xl font-bold">العيادة غير موجودة</h2>
          <Link href="/clinics">
            <Button variant="outline">العودة لدليل العيادات</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-10 md:py-16">
        <div className="container max-w-5xl space-y-8">
          <Link href="/clinics" className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline">
            <ArrowRight className="h-4 w-4" />
            العودة لكل العيادات والمستشفيات
          </Link>

          {/* Hero Banner */}
          <div className="rounded-3xl overflow-hidden border border-border shadow-sm bg-card">
            <div className="h-64 md:h-80 w-full relative bg-muted overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={clinic.cover_image_url || ""}
                alt={clinic.name_ar || clinic.name}
                className="h-full w-full object-cover"
              />
              {clinic.is_emergency_247 && (
                <span className="absolute top-4 right-4 bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  خدمات طوارئ واستقبال 24 ساعة
                </span>
              )}
            </div>

            <div className="p-6 md:p-8 space-y-4 text-right">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                      {clinic.name_ar || clinic.name}
                    </h1>
                    <Badge variant="success" className="text-xs">
                      <ShieldCheck className="h-3.5 w-3.5 ml-1" />
                      منشأة معتمدة
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span>{clinic.address}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  {clinic.latitude && clinic.longitude && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${clinic.latitude},${clinic.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none"
                    >
                      <Button variant="outline" className="w-full gap-2 font-semibold shadow-xs border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10">
                        <Navigation className="h-4 w-4" />
                        الاتجاهات (Google Maps)
                      </Button>
                    </a>
                  )}

                  <a href={`tel:${clinic.phone}`} className="flex-1 sm:flex-none">
                    <Button className="w-full gap-2 font-semibold shadow-xs">
                      <PhoneCall className="h-4 w-4" />
                      اتصال بالاستقبال
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Services */}
            <Card className="md:col-span-2 border-border/80">
              <CardContent className="p-6 space-y-4 text-right">
                <h3 className="font-bold text-lg text-foreground">الخدمات الطبية والتجهيزات</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {clinic.services.map((srv, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-foreground bg-muted/30 p-2.5 rounded-xl border border-border/50">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{srv}</span>
                    </div>
                  ))}
                </div>

                <h4 className="font-bold text-base text-foreground pt-4">الفصائل والحيوانات التي يتم علاجها</h4>
                <div className="flex flex-wrap gap-2 pt-1">
                  {clinic.species_treated.map((sp, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs px-3 py-1">
                      {sp}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contact & Hours */}
            <Card className="border-border/80">
              <CardContent className="p-6 space-y-4 text-right">
                <h3 className="font-bold text-lg text-foreground">أرقام التواصل وساعات العمل</h3>
                <div className="space-y-3 text-xs text-muted-foreground">
                  <div>
                    <span className="font-semibold block text-foreground mb-0.5">الهاتف الرئيسي:</span>
                    <a href={`tel:${clinic.phone}`} className="text-primary hover:underline text-sm font-mono">
                      {clinic.phone}
                    </a>
                  </div>
                  {clinic.emergency_phone && (
                    <div>
                      <span className="font-semibold block text-foreground mb-0.5">طوارئ الليل:</span>
                      <a href={`tel:${clinic.emergency_phone}`} className="text-rose-600 hover:underline text-sm font-mono">
                        {clinic.emergency_phone}
                      </a>
                    </div>
                  )}
                  {clinic.email && (
                    <div>
                      <span className="font-semibold block text-foreground mb-0.5">البريد الإلكتروني:</span>
                      <span>{clinic.email}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-border/60">
                    <span className="font-semibold block text-foreground mb-0.5">مواعيد العمل:</span>
                    <span className="text-foreground">
                      {clinic.is_emergency_247 ? "مفتوح على مدار 24 ساعة يومياً" : "يومياً من 10:00 صباحاً حتى 10:00 مساءً"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
