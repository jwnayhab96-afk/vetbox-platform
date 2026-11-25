"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  PawPrint,
  PlusCircle,
  CalendarCheck,
  Stethoscope,
  Bell,
  Settings,
  Users,
  FileText,
  Building2,
  ShieldCheck,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

interface SidebarProps {
  role: "owner" | "veterinarian" | "admin";
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentProfile, setCurrentProfile] = useState<any>(null);

  useEffect(() => {
    async function syncAuthUser() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.replace("/auth/login"); return; }
        {
          const { data: realProfile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (error || !realProfile || realProfile.role !== role) { router.replace("/auth/login"); return; }
          setCurrentProfile(realProfile);
        }
      } catch (e) {
        console.warn("Auth sync error:", e);
      }
    }
    syncAuthUser();
  }, [role, router]);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Sign out:", e);
    }
    router.push("/auth/login");
  };

  const ownerLinks = [
    { href: "/owner/dashboard", label: "نظرة عامة", icon: LayoutDashboard },
    { href: "/owner/pets", label: "حيواناتي (الدفتر الطبي)", icon: PawPrint },
    { href: "/owner/pets/new", label: "إضافة حيوان جديد", icon: PlusCircle },
    { href: "/owner/reminders", label: "المواعيد والتطعيمات", icon: CalendarCheck },
    { href: "/owner/veterinarians", label: "الأطباء المربوطين", icon: Stethoscope },
    { href: "/owner/notifications", label: "التنبيهات", icon: Bell },
    { href: "/owner/settings", label: "إعدادات الحساب", icon: Settings },
  ];

  const vetLinks = [
    { href: "/veterinarian/dashboard", label: "لوحة الطبيب", icon: LayoutDashboard },
    { href: "/veterinarian/patients", label: "قائمة المرضى والحالات", icon: PawPrint },
    { href: "/veterinarian/visits/new", label: "تسجيل كشف سريري", icon: PlusCircle },
    { href: "/veterinarian/connection-requests", label: "طلبات الربط الجديدة", icon: Users },
    { href: "/veterinarian/verification", label: "اعتماد ترخيص النقابة", icon: ShieldCheck },
    { href: "/veterinarian/profile", label: "ملفي المهني والعيادة", icon: Stethoscope },
    { href: "/veterinarian/settings", label: "الإعدادات", icon: Settings },
  ];

  const adminLinks = [
    { href: "/admin/dashboard", label: "لوحة التحكم الرئيسية", icon: LayoutDashboard },
    { href: "/admin/veterinarians", label: "اعتماد الأطباء الجدد", icon: ShieldCheck },
    { href: "/admin/users", label: "إدارة المستخدمين", icon: Users },
    { href: "/admin/clinics", label: "العيادات والمستشفيات", icon: Building2 },
    { href: "/admin/articles", label: "المقالات والمعرفة", icon: FileText },
    { href: "/admin/reports", label: "سجلات الرقابة والتدقيق", icon: FileText },
    { href: "/admin/settings", label: "إعدادات المنصة", icon: Settings },
  ];

  const links = role === "owner" ? ownerLinks : role === "veterinarian" ? vetLinks : adminLinks;

  return (
    <aside className="w-64 md:w-72 border-l border-border/80 bg-card flex flex-col justify-between shrink-0 min-h-screen">
      {/* Brand & Role Tag */}
      <div>
        <div className="p-5 border-b border-border/70 flex items-center justify-between">
          <Logo size="sm" subtitle={role === "owner" ? "OWNER PORTAL" : role === "veterinarian" ? "VET PORTAL" : "ADMIN PANEL"} />
          <Link href="/" title="الرئيسية" className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1">
          {links.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== `/${role}/dashboard` && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? "bg-primary text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-white" : "text-muted-foreground"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User profile footer */}
      <div className="p-4 border-t border-border/80 space-y-3">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-muted/40">
          <div className="h-9 w-9 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0 text-sm overflow-hidden border border-primary/20">
            {currentProfile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={currentProfile.avatar_url} alt={currentProfile.full_name} className="h-full w-full object-cover" />
            ) : (
              currentProfile?.full_name?.charAt(0) || "…"
            )}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-bold text-foreground truncate">{currentProfile?.full_name || ""}</span>
            <span className="text-[11px] text-muted-foreground capitalize font-medium">{role}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>العودة للموقع العام</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 w-full py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 transition-colors rounded-lg hover:bg-rose-500/10 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
