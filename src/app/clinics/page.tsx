"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { InteractiveClinicsMap } from "@/components/clinics/interactive-clinics-map";
import {
  calculateDistanceKm,
  formatArabicDistance,
  getCurrentPosition,
  Coordinates,
} from "@/lib/utils/geolocation";
import {
  MapPin,
  Search,
  PhoneCall,
  Clock,
  ShieldAlert,
  Building,
  CheckCircle2,
  Navigation,
  Map as MapIcon,
  List,
  Sparkles,
  Loader2,
  Crosshair,
  AlertCircle,
  X,
  ExternalLink,
} from "lucide-react";

export default function ClinicsDirectoryPage() {
  const [search, setSearch] = useState("");
  const [govFilter, setGovFilter] = useState("all");
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  // Geolocation states
  const [userCoords, setUserCoords] = useState<Coordinates | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [sortByDistance, setSortByDistance] = useState(false);
  const [rawClinics, setRawClinics] = useState<any[]>([]);

  useEffect(() => {
    createClient().from("clinics").select("*").order("name_ar", { ascending: true })
      .then(({ data, error }) => {
        if (error) console.error("Unable to load clinics", error);
        else setRawClinics(data || []);
      });
  }, []);

  // Handle GPS location request
  const handleGetLocation = async () => {
    setIsLocating(true);
    setLocationError(null);
    try {
      const coords = await getCurrentPosition();
      setUserCoords(coords);
      setSortByDistance(true);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "تعذر الحصول على موقعك الجغرافي.";
      setLocationError(errorMsg);
    } finally {
      setIsLocating(false);
    }
  };

  const handleClearLocation = () => {
    setUserCoords(null);
    setSortByDistance(false);
    setLocationError(null);
  };

  // Filtered & sorted clinics
  const displayedClinics = useMemo(() => {
    const list = rawClinics
      .map((c) => {
        let distanceKm: number | null = null;
        if (userCoords && c.latitude && c.longitude) {
          distanceKm = calculateDistanceKm(
            userCoords.latitude,
            userCoords.longitude,
            c.latitude,
            c.longitude
          );
        }
        return { ...c, distanceKm };
      })
      .filter((c) => {
        const nameMatch =
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          (c.name_ar && c.name_ar.includes(search)) ||
          c.address.toLowerCase().includes(search.toLowerCase());

        const govMatch = govFilter === "all" || c.governorate === govFilter;
        const emrgMatch = !emergencyOnly || c.is_emergency_247;

        return nameMatch && govMatch && emrgMatch;
      });

    if (sortByDistance && userCoords) {
      list.sort((a, b) => {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    }

    return list;
  }, [rawClinics, search, govFilter, emergencyOnly, sortByDistance, userCoords]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-10 md:py-16">
        <div className="container space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div className="text-right space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                <MapPin className="h-3.5 w-3.5" />
                <span>دليل المستشفيات والعيادات البيطرية المعتمدة</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-foreground font-display">
                اكتشف أقرب عيادة بيطرية
              </h1>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                ابحث في أكثر من 350 مركزاً ومستشفى بيطرياً مجهزاً بأحدث وحدات الأشعة، العمليات، والتطعيمات في مصر، واعرف المسافة الدقيقة لموقعك.
              </p>
            </div>

            {/* View Switcher: List vs Map */}
            <div className="p-1 rounded-xl bg-muted border border-border flex items-center gap-1 self-stretch md:self-auto">
              <button
                onClick={() => setViewMode("list")}
                className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "list" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="h-4 w-4" />
                <span>قائمة المراكز</span>
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "map" ? "bg-card text-primary shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MapIcon className="h-4 w-4" />
                <span>الخريطة التفاعلية</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Bar + GPS Action */}
          <div className="p-4 rounded-3xl bg-card border border-border shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            <div className="flex-1">
              <Input
                placeholder="ابحث باسم المستشفى، المنطقة، أو الشارع..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<Search className="h-4 w-4" />}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={govFilter}
                onChange={(e) => setGovFilter(e.target.value)}
                className="h-11 rounded-xl border border-input bg-card px-3 text-xs md:text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="all">كل المحافظات</option>
                <option value="Cairo">القاهرة (التجمع، المعادي، نصر)</option>
                <option value="Giza">الجيزة (الشيخ زايد، الدقي)</option>
                <option value="Alexandria">الإسكندرية (برج العرب، مريوط)</option>
              </select>

              <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer bg-muted/50 px-3 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors">
                <input
                  type="checkbox"
                  checked={emergencyOnly}
                  onChange={(e) => setEmergencyOnly(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 h-4 w-4 cursor-pointer"
                />
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                  طوارئ 24/7 فقط
                </span>
              </label>

              {/* GPS Geolocation Button */}
              {!userCoords ? (
                <Button
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className="h-11 rounded-xl px-4 font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-2 shrink-0 transition-transform active:scale-95"
                >
                  {isLocating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>جاري تحديد موقعك...</span>
                    </>
                  ) : (
                    <>
                      <Crosshair className="h-4 w-4" />
                      <span>أقرب عيادة لموقعي 📍</span>
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    onClick={() => setSortByDistance(!sortByDistance)}
                    variant={sortByDistance ? "default" : "outline"}
                    className={`h-11 rounded-xl px-3 font-bold text-xs flex items-center gap-1.5 ${
                      sortByDistance
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    <span>{sortByDistance ? "مرتبة بالأقرب لك ✓" : "ترتيب بالأقرب"}</span>
                  </Button>
                  <Button
                    onClick={handleClearLocation}
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                    title="إلغاء الموقع الجغرافي"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Location Active Status Banner */}
          {userCoords && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2 text-xs md:text-sm font-bold">
                <span className="relative flex h-3 w-3 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span>
                  تم تحديد إحداثياتك بنجاح ({userCoords.latitude.toFixed(4)}, {userCoords.longitude.toFixed(4)}) — أقرب عيادة لك تبعد{" "}
                  {displayedClinics[0]?.distanceKm !== null && displayedClinics[0]?.distanceKm !== undefined
                    ? formatArabicDistance(displayedClinics[0].distanceKm)
                    : "بضع دقائق"}
                  !
                </span>
              </div>
              <button
                onClick={handleClearLocation}
                className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-bold shrink-0"
              >
                إلغاء التحديد
              </button>
            </div>
          )}

          {/* Location Error Alert */}
          {locationError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2 text-xs md:text-sm font-medium">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{locationError}</span>
              </div>
              <button
                onClick={() => setLocationError(null)}
                className="text-rose-600 hover:text-rose-800 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* INTERACTIVE VECTOR MAP VIEW */}
          {viewMode === "map" && (
            <div className="space-y-3 animate-in fade-in duration-300">
              <InteractiveClinicsMap clinics={displayedClinics} userCoords={userCoords} />
            </div>
          )}

          {/* Clinics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedClinics.length === 0 ? (
              <div className="col-span-3 p-12 text-center rounded-3xl border border-dashed border-border bg-card/60">
                <Building className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="font-bold text-lg text-foreground">لا توجد عيادات مطابقة للبحث</h3>
                <p className="text-xs text-muted-foreground mt-1">جرب تغيير الفلتر أو كتابة كلمة بحث أخرى.</p>
              </div>
            ) : (
              displayedClinics.map((clinic) => (
                <Card key={clinic.id} className="overflow-hidden border-border/80 hover:border-primary/50 transition-all rounded-3xl flex flex-col justify-between shadow-xs hover:shadow-md">
                  <div>
                    <div className="h-48 w-full bg-muted relative overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={clinic.cover_image_url || ""}
                        alt={clinic.name_ar || clinic.name}
                        className="h-full w-full object-cover"
                      />
                      {clinic.is_emergency_247 && (
                        <span className="absolute top-3 right-3 bg-rose-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                          طوارئ 24 ساعة
                        </span>
                      )}

                      {/* Distance Badge on Image if Location Enabled */}
                      {clinic.distanceKm !== null && clinic.distanceKm !== undefined && (
                        <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 text-[11px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                          <Navigation className="h-3 w-3" />
                          <span>يبعد {formatArabicDistance(clinic.distanceKm)}</span>
                        </span>
                      )}
                    </div>

                    <CardContent className="p-6 space-y-3.5 text-right">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-extrabold text-lg text-foreground leading-snug">
                          {clinic.name_ar || clinic.name}
                        </h3>
                        <Badge variant="outline" className="text-[10px] font-bold shrink-0">
                          {clinic.clinic_type === "hospital" ? "مستشفى تخصصي" : "عيادة بيطرية"}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground flex items-start gap-1.5 leading-relaxed">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{clinic.address}</span>
                      </p>

                      {clinic.distanceKm !== null && clinic.distanceKm !== undefined && (
                        <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                          <span className="flex items-center gap-1">
                            <Navigation className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>المسافة من موقعك:</span>
                          </span>
                          <span className="font-mono text-sm">{formatArabicDistance(clinic.distanceKm)}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {clinic.services.slice(0, 4).map((srv: string, idx: number) => (
                          <span key={idx} className="text-[11px] bg-muted px-2.5 py-0.5 rounded-lg text-muted-foreground font-medium">
                            {srv}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </div>

                  <div className="p-6 pt-0 border-t border-border/60 mt-2 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <a
                        href={`tel:${clinic.phone}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline font-mono"
                      >
                        <PhoneCall className="h-3.5 w-3.5" />
                        {clinic.phone}
                      </a>

                      {clinic.latitude && clinic.longitude && (
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${clinic.latitude},${clinic.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>خرائط جوجل 🧭</span>
                        </a>
                      )}
                    </div>

                    <Link href={`/clinics/detail?id=${encodeURIComponent(clinic.id)}`} className="w-full">
                      <Button size="sm" variant="outline" className="w-full text-xs font-bold rounded-xl border-border hover:border-primary">
                        التفاصيل وحجز موعد ←
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>

    </div>
  );
}
