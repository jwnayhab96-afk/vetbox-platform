import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Arabic date formatting using standard Intl
export function formatArabicDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "غير محدد";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "تاريخ غير صالح";

  return new Intl.DateTimeFormat("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatArabicDateTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "غير محدد";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "تاريخ غير صالح";

  return new Intl.DateTimeFormat("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// Currency formatter for Egyptian Pounds
export function formatCurrencyEGP(amount: number | null | undefined): string {
  if (amount == null) return "غير محدد";
  return `${amount.toLocaleString("ar-EG")} ج.م`;
}

// Calculate approximate age in Arabic
export function calculateAge(birthDate: string | null | undefined, estimatedMonths?: number | null): string {
  if (estimatedMonths && (!birthDate || estimatedMonths > 0)) {
    if (estimatedMonths < 12) {
      return `${estimatedMonths} ${estimatedMonths === 1 ? "شهر" : estimatedMonths === 2 ? "شهران" : estimatedMonths <= 10 ? "أشهر" : "شهر"}`;
    }
    const years = Math.floor(estimatedMonths / 12);
    const months = estimatedMonths % 12;
    if (months === 0) {
      return `${years} ${years === 1 ? "سنة" : years === 2 ? "سنتان" : years <= 10 ? "سنوات" : "سنة"}`;
    }
    return `${years} ${years <= 10 ? "سنوات" : "سنة"} و ${months} أشهر`;
  }

  if (!birthDate) return "العمر غير محدد بدقة";

  const birth = new Date(birthDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - birth.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30.44);

  if (diffMonths < 1) {
    return `${diffDays} يوم`;
  }
  if (diffMonths < 12) {
    return `${diffMonths} ${diffMonths === 1 ? "شهر" : diffMonths === 2 ? "شهران" : diffMonths <= 10 ? "أشهر" : "شهر"}`;
  }

  const years = Math.floor(diffMonths / 12);
  const remainingMonths = diffMonths % 12;
  if (remainingMonths === 0) {
    return `${years} ${years === 1 ? "سنة" : years === 2 ? "سنتان" : years <= 10 ? "سنوات" : "سنة"}`;
  }
  return `${years} ${years <= 10 ? "سنوات" : "سنة"} و ${remainingMonths} ${remainingMonths === 1 ? "شهر" : remainingMonths <= 10 ? "أشهر" : "شهر"}`;
}

// Translation dictionaries for species, roles, statuses
export const SPECIES_LABELS: Record<string, { ar: string; en: string; icon: string }> = {
  dog: { ar: "كلب", en: "Dog", icon: "Dog" },
  cat: { ar: "قطة", en: "Cat", icon: "Cat" },
  rabbit: { ar: "أرنب", en: "Rabbit", icon: "Rabbit" },
  bird: { ar: "طائر", en: "Bird", icon: "Bird" },
  horse: { ar: "حصان", en: "Horse", icon: "Horse" },
  cattle: { ar: "أبقار/عجول", en: "Cattle", icon: "Beef" },
  sheep: { ar: "أغنام", en: "Sheep", icon: "Sheep" },
  goat: { ar: "ماعز", en: "Goat", icon: "Goat" },
  exotic: { ar: "حيوان نادر/غريب", en: "Exotic", icon: "Sparkles" },
};

export const GENDER_LABELS: Record<string, string> = {
  male: "ذكر",
  female: "أنثى",
  unknown: "غير محدد",
};

export const VISIT_TYPE_LABELS: Record<string, string> = {
  routine_checkup: "كشف دوري شامل",
  emergency: "حالة طارئة عاجلة",
  follow_up: "إعادة كشف ومتابعة",
  surgery: "عملية جراحية",
  vaccination: "تطعيم ووقاية",
  home_visit: "كشف منزلي",
  owner_observation: "ملاحظة صحية من المربي",
};

export const REMINDER_TYPE_LABELS: Record<string, string> = {
  vaccination: "تطعيم وقائي",
  medication: "جرعة علاجية",
  visit_followup: "متابعة كشف",
  deworming: "جرعة طارد الديدان",
  hygiene: "عناية ونظافة",
  general: "تذكير عام",
};
