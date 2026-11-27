"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
  const [governorate, setGovernorate] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [minimumRating, setMinimumRating] = useState(0);
  const [vets, setVets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    createClient().from("veterinarian_directory").select("*")
      .then(({ data, error }) => {
        if (error) { console.error("Unable to load veterinarians", error); setLoadError("تعذر تحميل دليل الأطباء. أعد المحاولة بعد قليل."); }
        else setVets(data || []);
        setLoading(false);
      });
  }, []);

  const filtered = vets.filter((v) => {
    const q = search.trim().toLowerCase();
    const nameMatch = (v.profile?.full_name || "").toLowerCase().includes(q);
    const bioMatch = (v.bio || "").toLowerCase().includes(q);
    const specs = Array.isArray(v.specializations) ? v.specializations : [];
    const specMatch = specs.some((s: string) => s.toLowerCase().includes(q));
    return (!q || nameMatch || bioMatch || specMatch)
      && (!governorate || v.profile?.governorate === governorate)
      && (!specialty || specs.includes(specialty))
      && Number(v.average_rating || 0) >= minimumRating;
  });
  const governorates = [...new Set(vets.map((v) => v.profile?.governorate).filter(Boolean))].sort();
  const specialties = [...new Set(vets.flatMap((v) => Array.isArray(v.specializations) ? v.specializations : []))].sort();

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
          <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-4">
            <Input
              placeholder="ابحث باسم الطبيب، التخصص (جراحة، قطط، جلدية)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
            <div className="grid gap-3 sm:grid-cols-3 text-right">
              <div className="space-y-1"><Label htmlFor="vet-governorate">المحافظة</Label><select id="vet-governorate" value={governorate} onChange={(e) => setGovernorate(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"><option value="">كل المحافظات</option>{governorates.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
              <div className="space-y-1"><Label htmlFor="vet-specialty">التخصص</Label><select id="vet-specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"><option value="">كل التخصصات</option>{specialties.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
              <div className="space-y-1"><Label htmlFor="vet-rating">التقييم</Label><select id="vet-rating" value={minimumRating} onChange={(e) => setMinimumRating(Number(e.target.value))} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"><option value={0}>كل التقييمات</option><option value={3}>3 نجوم فأكثر</option><option value={4}>4 نجوم فأكثر</option><option value={4.5}>4.5 نجوم فأكثر</option></select></div>
            </div>
          </div>

          {/* Grid */}
          {loading ? <p className="py-12 text-center text-sm text-muted-foreground">جارٍ تحميل الأطباء المعتمدين...</p> : loadError ? <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{loadError}</p> : filtered.length === 0 ? <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">لا توجد نتائج مطابقة. جرّب تغيير المحافظة أو التخصص أو التقييم.</p> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <p className="text-xs text-muted-foreground"><MapPin className="inline h-3 w-3 ml-1" />{vet.profile?.governorate || "المحافظة غير محددة"}</p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed pt-3 line-clamp-3">
                    {vet.bio}
                  </p>

                  <div className="flex items-center justify-between pt-2 text-xs">
                    <span className="font-semibold text-amber-700">★ {Number(vet.average_rating || 0).toFixed(1)} <span className="font-normal text-muted-foreground">({vet.rating_count || 0} تقييم)</span></span>
                    {Array.isArray(vet.specializations) && vet.specializations.length > 0 && <span className="truncate text-muted-foreground">{vet.specializations.slice(0, 2).join(" • ")}</span>}
                  </div>

                  <div className="pt-3 border-t border-border/60 text-xs text-muted-foreground space-y-1.5">
                    {vet.clinic_affiliation_name && (
                      <div className="flex items-center gap-1.5 text-foreground font-medium">
                        <Building className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">{vet.clinic_affiliation_name}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-1.5"><Clock className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" /><span>{Object.entries(vet.opening_hours || {}).filter(([, value]) => Boolean(value)).slice(0, 3).map(([day, value]) => `${day}: ${value}`).join(" • ") || "ساعات العمل غير محددة"}</span></div>
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
                  <Link href={`/veterinarians/detail?id=${encodeURIComponent(vet.id)}`}>
                    <Button size="sm" variant="outline" className="text-xs">
                      عرض الملف الشخصي
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>}
        </div>
      </main>

    </div>
  );
}
