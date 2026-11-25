"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import {
  Stethoscope,
  ShieldCheck,
  Search,
  MapPin,
  Clock,
  Phone,
  Building,
  Sparkles,
} from "lucide-react";

export default function VetsDirectoryPage() {
  const [search, setSearch] = useState("");
  const [vets, setVets] = useState<any[]>([]);
  useEffect(() => {
    createClient().from("veterinarian_directory").select("*")
      .then(({ data, error }) => {
        if (error) console.error("Unable to load veterinarians", error);
        else setVets(data || []);
      });
  }, []);

  const filtered = vets.filter((v) => {
    const nameMatch = v.profile?.full_name.toLowerCase().includes(search.toLowerCase());
    const bioMatch = v.bio?.toLowerCase().includes(search.toLowerCase());
    const specMatch = (v.specializations as string[]).some((s: string) => s.toLowerCase().includes(search.toLowerCase()));
    return nameMatch || bioMatch || specMatch;
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-10 md:py-16">
        <div className="container space-y-8">
          {/* Header */}
          <div className="text-right space-y-2 max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground font-display">
              دليل الأطباء البيطريين المعتمدين
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              تواصل مع نخبة من الأطباء البيطريين المرخصين بالنقابة، واستكشف تخصصات الجراحة، الباطنة، والجلدية.
            </p>
          </div>

          {/* Search */}
          <div className="p-4 rounded-2xl bg-card border border-border shadow-xs max-w-xl">
            <Input
              placeholder="ابحث باسم الطبيب، التخصص (جراحة، قطط، جلدية)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((vet) => (
              <Card key={vet.id} className="border-border/80 bg-card p-6 space-y-4 hover:border-primary/50 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-muted overflow-hidden shrink-0 border-2 border-primary/20">
                      {vet.profile?.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={vet.profile.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-primary bg-primary/10">
                          <Stethoscope className="h-8 w-8" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 text-right flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-bold text-lg text-foreground truncate">{vet.profile?.full_name}</h3>
                        <Badge variant="success" className="text-[10px] shrink-0">
                          <ShieldCheck className="h-3 w-3 ml-1" />
                          معتمد
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        خبرة {vet.years_of_experience} سنوات • {vet.education}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed pt-3 line-clamp-3">
                    {vet.bio}
                  </p>

                  <div className="pt-3 border-t border-border/60 text-xs text-muted-foreground space-y-1.5">
                    {vet.clinic_affiliation_name && (
                      <div className="flex items-center gap-1.5 text-foreground font-medium">
                        <Building className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">{vet.clinic_affiliation_name}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span>قيمة الكشف: <strong>{vet.consultation_fee} ج.م</strong></span>
                      {vet.emergency_available && (
                        <span className="text-rose-600 font-semibold">متاح للطوارئ 24/7</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-muted-foreground">
                    قيد: {vet.license_number}
                  </span>
                  <Link href={`/veterinarians/${vet.id}`}>
                    <Button size="sm" variant="outline" className="text-xs">
                      عرض الملف الشخصي
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
