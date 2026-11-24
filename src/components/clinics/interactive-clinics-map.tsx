"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Clinic } from "@/lib/types/database.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, PhoneCall, Navigation, Clock, ShieldCheck, ExternalLink, X } from "lucide-react";

interface InteractiveClinicsMapProps {
  clinics: Clinic[];
  selectedClinicId?: string | null;
  onSelectClinic?: (clinic: Clinic) => void;
  userCoords?: { latitude: number; longitude: number } | null;
}

export function InteractiveClinicsMap({
  clinics,
  selectedClinicId,
  onSelectClinic,
  userCoords,
}: InteractiveClinicsMapProps) {
  const [activeClinic, setActiveClinic] = useState<Clinic | null>(() => {
    if (selectedClinicId) {
      return clinics.find((c) => c.id === selectedClinicId) || clinics[0] || null;
    }
    return clinics[0] || null;
  });

  // Geographic bounds for Greater Cairo & Alexandria viewport:
  // Longitude: 29.5 (Alex West) to 31.8 (Cairo East)
  // Latitude: 29.8 (South Cairo) to 31.3 (Alex Coast)
  const minLng = 29.5;
  const maxLng = 31.8;
  const minLat = 29.8;
  const maxLat = 31.3;

  const getPinCoordinates = (lat?: number | null, lng?: number | null) => {
    const defaultLat = 30.0444;
    const defaultLng = 31.2357;
    const currentLat = lat || defaultLat;
    const currentLng = lng || defaultLng;

    // Convert to percentage
    // X axis: West to East (Longitude)
    const x = ((currentLng - minLng) / (maxLng - minLng)) * 100;
    // Y axis: North to South (Latitude inverted: higher lat is higher up)
    const y = 100 - ((currentLat - minLat) / (maxLat - minLat)) * 100;

    return {
      x: Math.max(8, Math.min(92, x)),
      y: Math.max(8, Math.min(92, y)),
    };
  };

  return (
    <div className="relative w-full h-[520px] rounded-3xl border border-emerald-900/30 overflow-hidden bg-slate-950 text-white shadow-xl flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* Background stylized vector grid & Nile River curve representation */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00B664" strokeWidth="0.75" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mapGrid)" />
        {/* Stylized Mediterranean Sea coast */}
        <path
          d="M 0,35 Q 250,55 500,45 T 1000,50"
          fill="none"
          stroke="#0284c7"
          strokeWidth="3"
          strokeOpacity="0.5"
        />
        {/* Stylized Nile River Delta branching */}
        <path
          d="M 680,500 Q 640,320 620,240 T 480,45 M 620,240 Q 670,160 760,50"
          fill="none"
          stroke="#00b664"
          strokeWidth="3.5"
          strokeOpacity="0.4"
        />
      </svg>

      {/* Top Map Status Bar */}
      <div className="relative z-10 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 bg-slate-900/90 border border-white/10 px-3.5 py-1.5 rounded-2xl backdrop-blur-md">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="font-bold text-slate-200">
            خريطة التغطية البيطرية المباشرة (القاهرة • الجيزة • الإسكندرية)
          </span>
        </div>

        <span className="bg-emerald-600/90 text-white font-bold px-3 py-1 rounded-xl shadow-xs">
          {clinics.length} مواقع معتمدة
        </span>
      </div>

      {/* Geographic Landmark Labels */}
      <div className="absolute top-12 left-12 text-[10px] font-mono tracking-wider text-sky-400/60 uppercase pointer-events-none">
        البحر المتوسط • Mediterranean
      </div>
      <div className="absolute top-1/4 left-1/4 text-[10px] font-bold text-slate-400/50 pointer-events-none">
        الإسكندرية (Alexandria)
      </div>
      <div className="absolute top-1/2 right-1/4 text-[10px] font-bold text-slate-400/50 pointer-events-none">
        القاهرة والجيزة (Cairo & Giza)
      </div>
      <div className="absolute top-2/3 right-12 text-[10px] font-bold text-slate-400/50 pointer-events-none">
        القاهرة الجديدة والتجمع
      </div>

      {/* Interactive Map Pins Container */}
      <div className="relative w-full h-full my-auto">
        {/* User GPS Location Pin */}
        {userCoords && (
          <div
            style={{
              left: `${getPinCoordinates(userCoords.latitude, userCoords.longitude).x}%`,
              top: `${getPinCoordinates(userCoords.latitude, userCoords.longitude).y}%`,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
          >
            <span className="absolute -inset-3 rounded-full bg-sky-400/30 animate-ping" />
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-sky-500 text-white font-black text-[11px] shadow-lg shadow-sky-500/40 border-2 border-white">
              <Navigation className="h-3.5 w-3.5" />
              <span>موقعك الحالي 📍</span>
            </div>
          </div>
        )}

        {clinics.map((clinic) => {
          const { x, y } = getPinCoordinates(clinic.latitude, clinic.longitude);
          const isSelected = activeClinic?.id === clinic.id;

          return (
            <div
              key={clinic.id}
              style={{ left: `${x}%`, top: `${y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer"
              onClick={() => {
                setActiveClinic(clinic);
                if (onSelectClinic) onSelectClinic(clinic);
              }}
            >
              {/* Pulse ring when selected */}
              {isSelected && (
                <span className="absolute -inset-2 rounded-full bg-emerald-400/30 animate-ping pointer-events-none" />
              )}

              {/* Pin marker icon */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full shadow-lg transition-all transform duration-200 ${
                  isSelected
                    ? "bg-emerald-500 text-slate-950 font-black scale-110 shadow-emerald-500/50"
                    : clinic.is_emergency_247
                    ? "bg-rose-600 text-white hover:scale-105"
                    : "bg-slate-800 text-slate-200 border border-white/20 hover:bg-slate-700"
                }`}
              >
                <MapPin className="h-3.5 w-3.5" />
                <span className="text-[11px] font-bold max-w-[100px] truncate">
                  {clinic.name_ar?.split(" ")[1] || clinic.name.split(" ")[0]}
                </span>
                {clinic.is_emergency_247 && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Floating Clinic Preview Card */}
      {activeClinic && (
        <div className="relative z-30 p-4 rounded-2xl bg-slate-900/95 border border-emerald-500/40 backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 text-right space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm sm:text-base text-white">
                  {activeClinic.name_ar || activeClinic.name}
                </h4>
                {activeClinic.is_emergency_247 && (
                  <Badge variant="destructive" className="text-[10px] bg-rose-600">
                    طوارئ 24/7
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-emerald-400 shrink-0" />
                <span>{activeClinic.address}</span>
              </p>
            </div>

            <button
              onClick={() => setActiveClinic(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              aria-label="إغلاق"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <a
                href={`tel:${activeClinic.phone}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                <PhoneCall className="h-3 w-3" />
                <span>اتصال ({activeClinic.phone})</span>
              </a>
              {activeClinic.emergency_phone && (
                <a
                  href={`tel:${activeClinic.emergency_phone}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-xs"
                >
                  <span>طوارئ: {activeClinic.emergency_phone}</span>
                </a>
              )}
            </div>

            <Link href={`/clinics/${activeClinic.id}`}>
              <Button size="sm" variant="outline" className="text-xs h-8 border-white/20 text-white hover:bg-white/10">
                <span>الملف الكامل والخدمات</span>
                <ExternalLink className="h-3 w-3 mr-1" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
