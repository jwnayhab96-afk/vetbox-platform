import React from "react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { ShieldAlert, PhoneCall, Mail, MapPin, ExternalLink, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card text-foreground">
      {/* Emergency Notice Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 py-3 px-4">
        <div className="container flex items-center justify-center gap-2 text-xs md:text-sm text-amber-900 text-center font-medium">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
          <span>
            تنبيه طبي: منصة فيت بوكس وسيلة لتنظيم وإدارة السجلات الطبية. في الحالات الحرجة الطارئة يرجى التوجه فوراً لأقرب مستشفى أو عيادة بيطرية مجهزة.
          </span>
        </div>
      </div>

      <div className="container space-y-8 py-8 md:space-y-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand info & Official Social Channels */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="lg" subtitle="" />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              المنظومة الرقمية الشاملة لربط مربي الحيوانات الأليفة والمواشي بالأطباء والعيادات البيطرية المعتمدة في مصر، وحفظ بطاقة الهوية الطبية والملف الصحي طوال حياة الحيوان.
            </p>
            <div className="pt-2 flex flex-col space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>جمهورية مصر العربية — القاهرة، الجيزة، والإسكندرية</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <a
                  href="mailto:johnehab.m@gmail.com"
                  className="hover:text-primary transition-colors font-medium font-sans"
                >
                  johnehab.m@gmail.com
                </a>
              </div>
            </div>

            {/* Official Platform Social Links */}
            <div className="pt-3 space-y-2">
              <span className="text-xs font-bold text-foreground block">
                تابع VETBOX على منصات التواصل:
              </span>
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Facebook */}
                <a
                  href="https://www.facebook.com/profile.php?id=61587479442053"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 px-3 rounded-xl bg-muted hover:bg-[#1877F2] hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5 group cursor-pointer"
                  title="صفحة VetBox على فيسبوك"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Facebook</span>
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/vetbox_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 px-3 rounded-xl bg-muted hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5 group cursor-pointer"
                  title="حساب VetBox على انستجرام"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <span>Instagram</span>
                </a>

                {/* YouTube */}
                <a
                  href="https://www.youtube.com/@vetbox_eg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 px-3 rounded-xl bg-muted hover:bg-[#FF0000] hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5 group cursor-pointer"
                  title="قناة VetBox على يوتيوب"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  <span>YouTube</span>
                </a>

                {/* TikTok */}
                <a
                  href="https://www.tiktok.com/@vet.box"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 px-3 rounded-xl bg-muted hover:bg-black hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5 group cursor-pointer"
                  title="حساب VetBox على تيك توك"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97v7.69c.01 2.37-1.07 4.67-2.92 6.01-1.85 1.34-4.32 1.67-6.49.88-2.17-.79-3.86-2.67-4.39-4.89-.53-2.22.14-4.59 1.74-6.19 1.6-1.6 3.97-2.27 6.19-1.74.02.94.02 1.88.01 2.82-1.39-.46-2.95-.14-4.04.81-1.09.95-1.49 2.52-1 3.92.49 1.4 1.87 2.33 3.36 2.27 1.49-.06 2.77-1.13 3.07-2.58.12-.58.15-1.18.15-1.78V.02z" />
                  </svg>
                  <span>TikTok</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick links 1 */}
          <div className="hidden space-y-3 md:block">
            <h4 className="text-sm font-semibold text-foreground tracking-wide">الخدمات والاكتشاف</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/clinics" className="hover:text-primary transition-colors">
                  دليل العيادات والمستشفيات
                </Link>
              </li>
              <li>
                <Link href="/veterinarians" className="hover:text-primary transition-colors">
                  الأطباء البيطريين المعتمدين
                </Link>
              </li>
              <li>
                <Link href="/learn" className="hover:text-primary transition-colors">
                  موسوعة الرعاية البيطرية
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  عن منصة فيت بوكس
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick links 2 */}
          <div className="hidden space-y-3 md:block">
            <h4 className="text-sm font-semibold text-foreground tracking-wide">للمربين والحيوانات</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/owner/pets/new" className="hover:text-primary transition-colors">
                  إضافة حيوان جديد
                </Link>
              </li>
              <li>
                <Link href="/owner/dashboard" className="hover:text-primary transition-colors">
                  بطاقة الهوية والملف الطبي
                </Link>
              </li>
              <li>
                <Link href="/owner/reminders" className="hover:text-primary transition-colors">
                  مواعيد التطعيمات والجرعات
                </Link>
              </li>
              <li>
                <Link href="/owner/veterinarians" className="hover:text-primary transition-colors">
                  ربط الطبيب المعالج
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick links 3 */}
          <div className="hidden space-y-3 md:block">
            <h4 className="text-sm font-semibold text-foreground tracking-wide">للأطباء والعيادات</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/veterinarian/dashboard" className="hover:text-primary transition-colors">
                  بوابة الطبيب البيطري
                </Link>
              </li>
              <li>
                <Link href="/veterinarian/verification" className="hover:text-primary transition-colors">
                  اعتماد ترخيص النقابة
                </Link>
              </li>
              <li>
                <Link href="/veterinarian/patients" className="hover:text-primary transition-colors">
                  إدارة ملفات المرضى
                </Link>
              </li>
              <li>
                <Link href="/admin/dashboard" className="hover:text-primary transition-colors">
                  إدارة النظام
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* BESPOKE FOUNDER & EXECUTIVE LEADERSHIP SHOWCASE */}
        <div className="relative overflow-hidden rounded-3xl border border-emerald-800/30 bg-gradient-to-br from-[#062017] via-[#082b20] to-[#03130d] p-5 text-white shadow-2xl sm:p-9 md:p-11">
          {/* Ambient Lighting & Luxury Watermark */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
          <span className="absolute -bottom-6 -left-6 text-8xl md:text-9xl font-brand font-black text-white/[0.03] select-none pointer-events-none tracking-widest">
            VETBOX
          </span>

          <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:gap-12 lg:flex-row lg:items-center">
            {/* Right: Editorial Creed & Vision */}
            <div className="space-y-4 text-right max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/20 text-emerald-300 text-xs font-bold tracking-wider font-brand">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>FOUNDER&apos;S VISION • رؤية القيادة والمؤسس</span>
              </div>

              <blockquote className="text-base sm:text-lg md:text-xl font-medium text-emerald-50/95 leading-relaxed font-display">
                &ldquo;الرعاية البيطرية ليست رفاهية، بل مسؤولية وأمانة. أطلقنا VETBOX لنمنح كل كائن في مصر هويته الصحية الموثقة، ونصل بين اهتمام المربي وخبرة الطبيب بأحدث حلول التكنولوجيا الرقمية.&rdquo;
              </blockquote>

              <p className="text-xs text-emerald-200/60 leading-relaxed font-sans">
                المنظومة الرقمية الوطنية لإدارة السجلات الطبية البيطرية، التطعيمات، والروشتات المعتمدة على مستوى الجمهورية.
              </p>
            </div>

            {/* Left: Identity & Executive Contact Hub */}
            <div className="flex flex-col items-start lg:items-end space-y-4 w-full lg:w-auto shrink-0 border-t lg:border-t-0 lg:border-r border-emerald-800/40 pt-6 lg:pt-0 lg:pr-8">
              {/* Single, Distinctive Founder Name & Role */}
              <div className="space-y-1 text-right lg:text-left">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-signature font-bold text-4xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-white to-amber-200 tracking-wide drop-shadow-sm">
                    John Ehab
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold tracking-wide font-sans border border-emerald-400/30">
                    مؤسس ورئيس المنصة
                  </span>
                </div>
                <p className="text-xs text-emerald-300/80 font-mono tracking-wider uppercase">
                  Founder &amp; Chief Executive Officer
                </p>
              </div>

              {/* Direct Executive Social Channels (Platform Names Only) */}
              <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto justify-start lg:justify-end pt-1">
                {/* WhatsApp */}
                <a
                  href="https://wa.me/201155278995"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 px-4 rounded-xl border border-emerald-400/30 bg-emerald-500/20 hover:bg-emerald-500 hover:text-white text-emerald-200 hover:shadow-lg hover:shadow-emerald-500/20 transition-all text-xs font-semibold flex items-center gap-2 group cursor-pointer"
                  title="WhatsApp"
                >
                  <svg className="h-4 w-4 fill-current text-emerald-400 group-hover:text-white transition-colors" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  <span className="font-brand font-semibold">WhatsApp</span>
                </a>

                {/* Facebook */}
                <a
                  href="https://www.facebook.com/john.ehab.morris/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 px-4 rounded-xl border border-white/10 bg-white/5 hover:border-[#1877F2]/60 hover:bg-[#1877F2]/20 hover:text-white transition-all text-xs font-semibold flex items-center gap-2 group cursor-pointer"
                  title="Facebook"
                >
                  <svg className="h-4 w-4 fill-current text-white/70 group-hover:text-[#1877F2] transition-colors" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="font-brand font-semibold">Facebook</span>
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/j.o.h.n_e.h.a.b/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 px-4 rounded-xl border border-white/10 bg-white/5 hover:border-rose-500/60 hover:bg-rose-500/20 hover:text-white transition-all text-xs font-semibold flex items-center gap-2 group cursor-pointer"
                  title="Instagram"
                >
                  <svg className="h-4 w-4 fill-current text-white/70 group-hover:text-rose-400 transition-colors" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <span className="font-brand font-semibold">Instagram</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & legal */}
        <div className="pt-4 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} VETBOX. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              سياسة الخصوصية
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              شروط الاستخدام
            </Link>
            <span className="text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/40 font-medium text-[11px]">
              بيانات بيطرية مشفرة ومعتمدة
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
