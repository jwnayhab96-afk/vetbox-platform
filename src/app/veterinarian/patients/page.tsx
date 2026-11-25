"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/shared/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { SPECIES_LABELS, calculateAge } from "@/lib/utils";
import { Users, Search, Plus, Stethoscope, ChevronLeft, Calendar } from "lucide-react";

export default function VetPatientsPage() {
  const [links, setLinks] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.assign("/auth/login"); return; }
      const { data, error } = await supabase.from("pet_vet_links").select("*, pet:pets(*)").eq("vet_id", user.id).eq("status", "accepted");
      if (!error) setLinks(data || []);
    };
    load();
  }, []);

  const filteredLinks = links.filter((l) => {
    if (!l.pet) return false;
    return (
      l.pet.name.toLowerCase().includes(search.toLowerCase()) ||
      (l.pet.breed && l.pet.breed.toLowerCase().includes(search.toLowerCase())) ||
      (l.pet.microchip_number && l.pet.microchip_number.includes(search))
    );
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="قائمة المرضى والحالات"
        subtitle="الحيوانات المعتمدة والمصرح لك بمتابعتها طبياً"
        role="veterinarian"
        action={{
          label: "تسجيل كشف سريري جديد",
          href: "/veterinarian/visits/new",
          icon: <Plus className="h-4 w-4" />,
        }}
      />

      <div className="p-4 md:p-8 space-y-6 max-w-7xl">
        {/* Search */}
        <div className="max-w-md">
          <Input
            placeholder="ابحث بالاسم، السلالة، أو الشريحة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>

        {/* Patients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLinks.length === 0 ? (
            <div className="col-span-3 p-12 text-center rounded-2xl border border-dashed border-border bg-card/60">
              <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">لا توجد حالات مطابقة</p>
            </div>
          ) : (
            filteredLinks.map((lnk) => {
              const p = lnk.pet!;
              const age = calculateAge(p.birth_date, p.estimated_age_months);
              return (
                <Card key={lnk.id} className="border-border/80 bg-card p-5 space-y-4 hover:border-primary/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-muted overflow-hidden shrink-0 border border-border">
                      {p.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.photo_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-primary bg-primary/10">
                          <Stethoscope className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-foreground">{p.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {SPECIES_LABELS[p.species]?.ar} {p.breed && `• ${p.breed}`}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        العمر: {age} • الوزن: {p.weight_kg ? `${p.weight_kg} كجم` : "غير مسجل"}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                    <Link href={`/veterinarian/patients/detail?petId=${encodeURIComponent(p.id)}`}>
                      <Button variant="outline" size="sm" className="text-xs">
                        فتح السجل الطبي
                      </Button>
                    </Link>
                    <Link href={`/veterinarian/visits/new?petId=${p.id}`}>
                      <Button size="sm" className="text-xs gap-1">
                        <Plus className="h-3.5 w-3.5" />
                        كشف سريري
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
