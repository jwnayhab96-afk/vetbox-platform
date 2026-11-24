"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  PhoneCall,
  MapPin,
  Clock,
  ShieldAlert,
  X,
  Navigation,
  HeartPulse,
  Flame,
  Info,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function EmergencySosModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"hospitals" | "firstaid">("hospitals");

  const emergencyHospitals = [
    {
      name: "مستشفى النيل البيطري التخصصي",
      city: "القاهرة الجديدة والتجمع الخامس",
      address: "شارع التسعين الشمالي، التجمع الخامس",
      phone: "01234567890",
      landline: "0227508900",
      is247: true,
      hasICU: true,
      mapsUrl: "https://maps.google.com/?q=New+Cairo+Veterinary+Hospital",
      specialties: "عناية مركزة، جراحة طوارئ، أشعة وسونار، بنك دم حيوانات",
    },
    {
      name: "مركز واحة الأليف للطوارئ والحالات الحرجة",
      city: "الشيخ زايد و 6 أكتوبر",
      address: "ميدان الحصري، المحور المركزي، الجيزة",
      phone: "01055554433",
      landline: "0238514230",
      is247: true,
      hasICU: true,
      mapsUrl: "https://maps.google.com/?q=Sheikh+Zayed+Veterinary+Clinic",
      specialties: "كشف فوري، تسمم، إنعاش قلبي، ولادة متعسرة",
    },
    {
      name: "مركز الإسكندرية لطب وجراحة الخيول والماشية",
      city: "الإسكندرية والساحل الشمالي",
      address: "طريق برج العرب، كينج مريوط",
      phone: "01088776655",
      landline: "034298100",
      is247: true,
      hasICU: true,
      mapsUrl: "https://maps.google.com/?q=Borg+El+Arab+Veterinary+Clinic",
      specialties: "طوارئ مغص الخيل (Colic)، جراحة أوتار، ولادات قيصرية، وحدة متنقلة",
    },
  ];

  const firstAidProtocols = [
    {
      title: "اشتباه التسمم الحاد (Poisoning)",
      icon: "🧪",
      urgency: "طوارئ قصوى - خلال 30 دقيقة",
      steps: [
        "احفظ العبوة أو المادة المسببة للتسمم (مبيد حشري، شوكولاتة، دواء بشري، نبات سام) لتريها للطبيب.",
        "لا تُجبر الحيوان على التقيؤ إذا كان فاقداً للوعي أو إذا كانت المادة مبيضة أو كاوية (حمض/قلوي).",
        "اتصل فوراً بمستشفى الطوارئ لإبلاغهم بوصول حالة تسمم لتجهيز مضادات السموم وغسيل المعدة.",
      ],
    },
    {
      title: "التواء المعدة والانتفاخ الحاد (GDV / Bloat)",
      icon: "⚠️",
      urgency: "خطر يهدد الحياة خلال 60 دقيقة",
      steps: [
        "الأعراض: انتفاخ صلب ومفاجئ في البطن، محاولة التقيؤ دون إخراج شيء، سيلان لعاب مفرط، وألم حاد.",
        "ممنوع إعطاء أي ماء أو مسكنات في المنزل.",
        "توجه فوراً لأقرب مستشفى بيطري مجهز بغرفة عمليات؛ التدخل الجراحي الفوري ضروري لإنقاذ الحياة.",
      ],
    },
    {
      title: "مغص الخيل والالتواء المعوي (Equine Colic)",
      icon: "🐎",
      urgency: "تدخل عاجل خلال ساعة",
      steps: [
        "امنع الحصان من التدحرج العنيف على الأرض لتجنب تمزق المعدة أو التواء الأمعاء الدقيقة.",
        "أوقف كل مصادر الغذاء والماء فوراً لحين وصول الطبيب البيطري.",
        "قُد الحصان بالمشي الهادئ البطيء في مسار مستقيم للمساعدة على تقليل الضغط الغازي.",
      ],
    },
    {
      title: "ضربة الشمس والإجهاد الحراري (Heatstroke)",
      icon: "☀️",
      urgency: "طوارئ عاجلة",
      steps: [
        "انقل الحيوان فوراً إلى مكان مكيف أو مظلل وجيد التهوية.",
        "بلل أطراف الحيوان، الرقبة، وأسفل البطن بماء فاتر أو مائل للبرودة (تجنب تماماً استخدام الثلج أو الماء شديد البرودة لتفادي الصدمة الوعائية).",
        "وفر كمية قليلة من ماء الشرب العادي واصطحبه للمستشفى لفحص المؤشرات الحيوية ووظائف الكلى.",
      ],
    },
  ];

  return (
    <>
      {/* Floating Emergency SOS Beacon */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 group flex items-center gap-2.5 px-4 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-xl hover:shadow-2xl hover:shadow-rose-600/30 transition-all duration-300 hover:scale-105 select-none focus:outline-none focus:ring-4 focus:ring-rose-500/30"
        aria-label="طوارئ بيطرية سريعة 24/7"
        title="طوارئ بيطرية سريعة 24/7"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
        </span>
        <AlertTriangle className="h-4 w-4" />
        <span className="font-bold text-xs tracking-wide font-brand uppercase">SOS طوارئ 24/7</span>
      </button>

      {/* Emergency Modal Dialog */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl bg-card text-foreground rounded-3xl shadow-2xl border-2 border-rose-500/40 overflow-hidden text-right my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Red Emergency Pulse */}
            <div className="p-6 bg-gradient-to-r from-rose-600 to-rose-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 border border-white/20">
                  <ShieldAlert className="h-7 w-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black font-display text-white">
                      مركز الاستجابة للطوارئ البيطرية (24/7)
                    </h2>
                    <span className="text-[10px] bg-white text-rose-700 px-2 py-0.5 rounded-full font-bold">
                      مباشر
                    </span>
                  </div>
                  <p className="text-xs text-rose-100 mt-0.5">
                    اتصال فوري بالمستشفيات المجهزة بغرف عناية مركزة وجراحة طوارئ على مدار الساعة
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="إغلاق"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-border bg-muted/30 px-6 pt-3 gap-2">
              <button
                onClick={() => setActiveTab("hospitals")}
                className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === "hospitals"
                    ? "border-rose-600 text-rose-600"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <PhoneCall className="h-4 w-4" />
                <span>مستشفيات الطوارئ 24/7 ({emergencyHospitals.length})</span>
              </button>
              <button
                onClick={() => setActiveTab("firstaid")}
                className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === "firstaid"
                    ? "border-rose-600 text-rose-600"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <HeartPulse className="h-4 w-4" />
                <span>بروتوكولات الإسعاف الأولي العاجل</span>
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 max-h-[65vh] overflow-y-auto space-y-4">
              {activeTab === "hospitals" ? (
                <div className="space-y-3.5">
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 leading-relaxed flex items-start gap-2">
                    <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      في الحالات الحرجة، اتصل بالمستشفى <strong>أثناء تحركك في الطريق</strong> لإبلاغ طاقم الطوارئ بتجهيز الأكسجين وغرفة العمليات فور وصولك.
                    </span>
                  </div>

                  {emergencyHospitals.map((hosp, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl border border-border bg-card shadow-xs hover:border-rose-500/30 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm sm:text-base text-foreground">
                              {hosp.name}
                            </h4>
                            <Badge variant="success" className="text-[10px] bg-emerald-600 text-white">
                              مفتوح 24 ساعة
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-rose-500" />
                            {hosp.city} — {hosp.address}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-foreground/80 bg-muted/40 p-2.5 rounded-xl">
                        🏥 <strong>تجهيزات الطوارئ:</strong> {hosp.specialties}
                      </p>

                      <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${hosp.phone}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all"
                          >
                            <PhoneCall className="h-3.5 w-3.5" />
                            <span>اتصال فوري بالطوارئ ({hosp.phone})</span>
                          </a>
                          <a
                            href={`tel:${hosp.landline}`}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-foreground transition-all"
                          >
                            <span>أرضي: {hosp.landline}</span>
                          </a>
                        </div>

                        <a
                          href={hosp.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary font-medium"
                        >
                          <Navigation className="h-3.5 w-3.5" />
                          <span>فتح الموقع بالخريطة</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {firstAidProtocols.map((proto, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-border bg-card space-y-2.5 text-right shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{proto.icon}</span>
                          <h4 className="font-bold text-sm text-foreground">{proto.title}</h4>
                        </div>
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                          {proto.urgency}
                        </span>
                      </div>

                      <ul className="space-y-1.5 text-xs text-foreground/90 pr-2">
                        {proto.steps.map((st, sIdx) => (
                          <li key={sIdx} className="flex items-start gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                            <span className="leading-relaxed">{st}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Direct Hotline Callout */}
            <div className="p-4 bg-muted/40 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-muted-foreground">
                شبكة الطوارئ البيطرية الموحدة — VETBOX EGYPT
              </span>
              <a
                href="https://wa.me/201155278995?text=طوارئ+بيطرية+عاجلة"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>طلب مساعدة فورية عبر واتساب الإدارة</span>
                <ChevronRight className="h-3.5 w-3.5 rotate-180" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
