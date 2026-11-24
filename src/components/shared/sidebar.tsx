"use client";

import React from "react";
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
  Sparkles,
} from "lucide-react";
import { store } from "@/lib/data/store";
import { Logo } from "@/components/shared/logo";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  role: "owner" | "veterinarian" | "admin";
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentProfile = store.getCurrentProfile();

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
  ];

  const links = role === "owner" ? ownerLinks : role === "veterinarian" ? vetLinks : adminLinks;

  const handleRoleSwitch = (newRole: "owner" | "veterinarian" | "admin") => {
    store.setCurrentRole(newRole);
    if (newRole === "owner") router.push("/owner/dashboard");
    else if (newRole === "veterinarian") router.push("/veterinarian/dashboard");
    else router.push("/admin/dashboard");
  };

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

        {/* Fast Role Switcher */}
        <div className="px-4 pt-3 pb-2">
          <div className="p-2.5 rounded-xl bg-muted/50 border border-border/60">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-primary" /> تبديل الحساب التجريبي:
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-[11px]">
              <button
                onClick={() => handleRoleSwitch("owner")}
                className={`py-1.5 rounded-lg font-bold transition-all ${
                  role === "owner" ? "bg-primary text-white shadow-xs" : "bg-card text-muted-foreground hover:bg-card/80"
                }`}
              >
                مربي
              </button>
              <button
                onClick={() => handleRoleSwitch("veterinarian")}
                className={`py-1.5 rounded-lg font-bold transition-all ${
                  role === "veterinarian" ? "bg-primary text-white shadow-xs" : "bg-card text-muted-foreground hover:bg-card/80"
                }`}
              >
                طبيب
              </button>
              <button
                onClick={() => handleRoleSwitch("admin")}
                className={`py-1.5 rounded-lg font-bold transition-all ${
                  role === "admin" ? "bg-primary text-white shadow-xs" : "bg-card text-muted-foreground hover:bg-card/80"
                }`}
              >
                مشرف
              </button>
            </div>
          </div>
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
            {currentProfile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={currentProfile.avatar_url} alt={currentProfile.full_name} className="h-full w-full object-cover" />
            ) : (
              currentProfile.full_name.charAt(0)
            )}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-bold text-foreground truncate">{currentProfile.full_name}</span>
            <span className="text-[11px] text-muted-foreground capitalize font-medium">{role}</span>
          </div>
        </div>

        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full py-2 text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>الخروج إلى الموقع العام</span>
        </Link>
      </div>
    </aside>
  );
}
