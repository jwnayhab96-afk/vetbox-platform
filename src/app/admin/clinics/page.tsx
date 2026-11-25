"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/shared/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { Building, MapPin, Phone, ShieldCheck, Plus } from "lucide-react";

export default function AdminClinicsPage() {
  const [clinics, setClinics] = useState<any[]>([]);
  useEffect(() => {
    createClient().from("clinics").select("*").order("created_at", { ascending: false })
      .then(({ data, error }) => { if (error) console.error(error); else setClinics(data || []); });
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="إدارة العيادات والمستشفيات البيطرية"
        subtitle="الاعتماد والتحقق من التجهيزات وخدمات الطوارئ"
        role="admin"
      />

      <div className="p-4 md:p-8 space-y-6 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clinics.map((clinic) => (
            <Card key={clinic.id} className="border-border/80 bg-card p-6 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-foreground">{clinic.name_ar || clinic.name}</h3>
                  <p className="text-xs text-muted-foreground">{clinic.address}</p>
                </div>
                <Badge variant={clinic.is_verified ? "success" : "neutral"} className="text-xs">
                  {clinic.is_verified ? "معتمد" : "غير مفحوص"}
                </Badge>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <div>الهاتف: <strong className="font-mono text-foreground">{clinic.phone}</strong></div>
                {clinic.is_emergency_247 && (
                  <div className="text-rose-600 font-semibold">مجهز بطوارئ 24 ساعة</div>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/60">
                {clinic.services.map((s: string, idx: number) => (
                  <span key={idx} className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground">
                    {s}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
