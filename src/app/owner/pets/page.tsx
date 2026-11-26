"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/shared/header";
import { PetCard } from "@/components/pet/pet-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { PawPrint, Plus, Search, Filter } from "lucide-react";

export default function OwnerPetsPage() {
  const [pets, setPets] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");

  useEffect(() => {
    let active = true;
    const loadPets = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.assign("/auth/login"); return; }
      const { data, error } = await supabase.from("pets").select("*").eq("owner_id", user.id).order("created_at", { ascending: false });
      if (error) { console.error("Unable to load pets", error); return; }
      if (active) setPets(data || []);
    };
    loadPets();
    return () => { active = false; };
  }, []);

  const filteredPets = pets.filter((pet) => {
    const matchesSearch =
      pet.name.toLowerCase().includes(search.toLowerCase()) ||
      (pet.breed && pet.breed.toLowerCase().includes(search.toLowerCase())) ||
      (pet.microchip_number && pet.microchip_number.includes(search));

    const matchesSpecies = speciesFilter === "all" || pet.species === speciesFilter;
    return matchesSearch && matchesSpecies;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-muted/20">
      <Header
        title="دفتر الحيوانات (بطاقات الهوية والملفات الطبية)"
        subtitle="إدارة بيانات حيواناتك، سجلاتها الطبية، وتراخيصها"
        role="owner"
        action={{
          label: "إضافة حيوان جديد",
          href: "/owner/pets/new",
          icon: <Plus className="h-4 w-4" />,
        }}
      />

      <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 max-w-7xl w-full">
        {/* Search & Filter Bar */}
        <div className="relative overflow-hidden rounded-3xl bg-card border border-border/70 shadow-md p-3 sm:p-4 flex flex-col sm:flex-row items-stretch gap-3">
          <div className="pointer-events-none absolute -start-10 -top-12 h-32 w-32 rounded-full bg-primary/5" />
          <div className="relative flex-1 min-w-0">
            <Input
              placeholder="ابحث بالاسم، السلالة، أو رقم الشريحة الإلكترونية..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="h-4 w-4" />}
              className="h-12 rounded-2xl text-sm"
            />
          </div>

          <div className="relative flex items-center gap-2.5 sm:w-64 shrink-0">
            <span className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Filter className="h-5 w-5" />
            </span>
            <select
              value={speciesFilter}
              onChange={(e) => setSpeciesFilter(e.target.value)}
              className="h-12 flex-1 min-w-0 rounded-2xl border border-input bg-muted/40 px-4 text-sm font-semibold text-foreground cursor-pointer transition-colors hover:border-primary/50 focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="all">كل الفصائل والأنواع</option>
              <option value="dog">كلاب</option>
              <option value="cat">قطط</option>
              <option value="horse">خيول</option>
              <option value="bird">طيور</option>
              <option value="rabbit">أرانب</option>
              <option value="cattle">أبقار/مواشي</option>
              <option value="sheep">أغنام/ماعز</option>
              <option value="exotic">أخرى/نادرة</option>
            </select>
          </div>
        </div>

        {/* Pets Grid */}
        {filteredPets.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-primary/25 bg-card p-2 sm:p-4">
            <EmptyState
              icon={PawPrint}
              title={pets.length === 0 ? "لسه مفيش حيوانات مضافة" : "لا توجد نتائج مطابقة لبحثك"}
              description={
                pets.length === 0
                  ? "ابدأ بتسجيل أول حيوان لتوثيق تاريخه الطبي ومتابعة تطعيماته."
                  : "جرب تعديل كلمة البحث أو فلتر الفصيلة لإظهار الحيوانات المطلوبة."
              }
              action={
                pets.length === 0 ? (
                  <Link href="/owner/pets/new">
                    <Button className="gap-2 min-h-12 px-6 rounded-2xl font-bold shadow-md active:scale-95 transition-transform">
                      <Plus className="h-4 w-4" />
                      أضف أول حيوان
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="outline"
                    className="min-h-12 px-6 rounded-2xl font-bold active:scale-95 transition-transform"
                    onClick={() => {
                      setSearch("");
                      setSpeciesFilter("all");
                    }}
                  >
                    إعادة ضبط البحث
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredPets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
