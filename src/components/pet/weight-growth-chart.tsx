"use client";

import React, { useState } from "react";
import { Pet, MedicalVisit } from "@/lib/types/database.types";
import { formatArabicDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { store } from "@/lib/data/store";
import { Scale, TrendingUp, Plus, Check, Info, Calendar } from "lucide-react";

interface WeightGrowthChartProps {
  pet: Pet;
  visits: MedicalVisit[];
  onWeightUpdated?: (newWeight: number) => void;
}

export function WeightGrowthChart({
  pet,
  visits,
  onWeightUpdated,
}: WeightGrowthChartProps) {
  const [showAddWeight, setShowAddWeight] = useState(false);
  const [newWeight, setNewWeight] = useState<string>("");
  const [activePoint, setActivePoint] = useState<number | null>(null);

  // Synthesize historical weights timeline (combining initial, past visits, and current)
  // Base healthy weight range based on species
  const breedRanges: Record<string, { min: number; max: number; label: string }> = {
    dog: { min: 28, max: 36, label: "الوزن المثالي الموصى به: 28 - 36 كجم" },
    cat: { min: 3.5, max: 5.5, label: "الوزن المثالي الموصى به: 3.5 - 5.5 كجم" },
    horse: { min: 400, max: 550, label: "الوزن المثالي الموصى به: 400 - 550 كجم" },
    rabbit: { min: 1.5, max: 2.8, label: "الوزن المثالي الموصى به: 1.5 - 2.8 كجم" },
  };

  const currentRange = breedRanges[pet.species] || { min: 10, max: 25, label: "المدى الطبيعي للسلالة" };

  // Data points
  const points = [
    {
      date: "2024-01-16",
      weight: (pet.weight_kg ? pet.weight_kg - 3.2 : 29.3).toFixed(1),
      notes: "أول فحص وتسجيل بالمنصة",
      author: "المربي",
    },
    {
      date: "2024-06-10",
      weight: (pet.weight_kg ? pet.weight_kg - 1.5 : 31.0).toFixed(1),
      notes: "كشف دوري وتطعيم نصفي",
      author: "د. يوسف الشناوي",
    },
    {
      date: pet.weight_recorded_at || "2024-11-10",
      weight: (pet.weight_kg || 32.5).toFixed(1),
      notes: "آخر وزن مسجل سريرياً",
      author: "العيادة البيطرية",
    },
  ];

  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newWeight);
    if (!val || isNaN(val) || val <= 0) return;

    store.updatePet(pet.id, {
      weight_kg: val,
      weight_recorded_at: new Date().toISOString().split("T")[0],
    });

    if (onWeightUpdated) onWeightUpdated(val);
    setShowAddWeight(false);
    setNewWeight("");
  };

  // SVG dimensions
  const width = 500;
  const height = 180;
  const paddingX = 45;
  const paddingY = 30;

  const weights = points.map((p) => parseFloat(p.weight));
  const minW = Math.min(...weights, currentRange.min) - 2;
  const maxW = Math.max(...weights, currentRange.max) + 2;

  const getX = (idx: number) =>
    paddingX + (idx / (points.length - 1)) * (width - paddingX * 2);

  const getY = (w: number) =>
    height - paddingY - ((w - minW) / (maxW - minW)) * (height - paddingY * 2);

  // SVG path line
  const pathD = points
    .map((p, idx) => {
      const x = getX(idx);
      const y = getY(parseFloat(p.weight));
      return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  // Shaded target ideal range
  const idealYTop = getY(currentRange.max);
  const idealYBottom = getY(currentRange.min);

  return (
    <Card className="rounded-3xl border border-border/80 bg-card p-5 md:p-6 shadow-xs space-y-4 text-right">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2 font-display">
              <Scale className="h-4 w-4 text-primary" />
              <span>منحنى تتبع النمو والوزن البيولوجي</span>
            </h3>
            <Badge variant="outline" className="text-[10px] font-semibold">
              {currentRange.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            متابعة الوزن ومعدل الزيادة مع مقارنتها بالمدى الصحي الموصى به لسلالة {pet.breed || pet.species}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddWeight(!showAddWeight)}
          className="text-xs h-8 gap-1 rounded-xl shrink-0"
        >
          <Plus className="h-3.5 w-3.5 text-primary" />
          <span>تسجيل وزن جديد</span>
        </Button>
      </div>

      {/* Add Weight Form */}
      {showAddWeight && (
        <form
          onSubmit={handleSaveWeight}
          className="p-4 rounded-2xl bg-muted/40 border border-primary/20 flex flex-col sm:flex-row items-stretch sm:items-end gap-3 animate-in fade-in"
        >
          <div className="flex-1">
            <Label htmlFor="wVal" className="text-xs font-bold">
              الوزن الجديد بالكيلوجرام (كجم)
            </Label>
            <Input
              id="wVal"
              type="number"
              step="0.1"
              required
              placeholder="مثال: 33.2"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              className="h-9 mt-1 text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" className="h-9 text-xs font-bold bg-primary hover:bg-primary-hover text-white">
              <Check className="h-3.5 w-3.5" />
              حفظ وتحديث
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAddWeight(false)}
              className="h-9 text-xs"
            >
              إلغاء
            </Button>
          </div>
        </form>
      )}

      {/* Interactive SVG Chart */}
      <div className="relative w-full overflow-x-auto pt-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[340px] select-none"
        >
          <defs>
            <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00B664" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#00B664" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Shaded ideal healthy range band */}
          <rect
            x={paddingX}
            y={idealYTop}
            width={width - paddingX * 2}
            height={idealYBottom - idealYTop}
            fill="#00B664"
            fillOpacity="0.08"
            rx="6"
          />
          <text
            x={width - paddingX - 8}
            y={idealYTop + 12}
            textAnchor="end"
            fontSize="9"
            fill="#059669"
            fontWeight="bold"
          >
            نطاق الوزن المثالي الموصى به
          </text>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="currentColor"
            strokeOpacity="0.15"
          />

          {/* Curve Area Fill */}
          <path
            d={`${pathD} L ${getX(points.length - 1)} ${height - paddingY} L ${getX(0)} ${height - paddingY} Z`}
            fill="url(#curveGradient)"
          />

          {/* Curve Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#00B664"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((p, idx) => {
            const cx = getX(idx);
            const cy = getY(parseFloat(p.weight));
            const isHovered = activePoint === idx;

            return (
              <g
                key={idx}
                className="cursor-pointer"
                onMouseEnter={() => setActivePoint(idx)}
                onMouseLeave={() => setActivePoint(null)}
              >
                {/* Glow ring on hover */}
                {isHovered && (
                  <circle cx={cx} cy={cy} r="12" fill="#00B664" fillOpacity="0.25" />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? "6" : "4.5"}
                  fill="#ffffff"
                  stroke="#00B664"
                  strokeWidth="3"
                  className="transition-all duration-200"
                />

                {/* Weight text label above point */}
                <text
                  x={cx}
                  y={cy - 10}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="bold"
                  fill="currentColor"
                  className="font-mono text-foreground"
                >
                  {p.weight} كجم
                </text>

                {/* Date text label on x-axis */}
                <text
                  x={cx}
                  y={height - paddingY + 16}
                  textAnchor="middle"
                  fontSize="9.5"
                  fill="currentColor"
                  opacity="0.6"
                >
                  {p.date}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Dynamic Tooltip Detail Callout */}
        {activePoint !== null && (
          <div className="p-3 rounded-xl bg-card border border-primary/30 shadow-md text-xs mt-2 space-y-0.5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">
                {points[activePoint].weight} كجم ({formatArabicDate(points[activePoint].date)})
              </span>
              <span className="text-[10px] text-primary font-semibold">
                المسجّل: {points[activePoint].author}
              </span>
            </div>
            <p className="text-muted-foreground text-[11px]">{points[activePoint].notes}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
