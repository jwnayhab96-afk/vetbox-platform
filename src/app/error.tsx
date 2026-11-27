"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Application route error", error); }, [error]);
  return <main className="flex min-h-screen items-center justify-center p-5"><section className="max-w-lg space-y-4 rounded-2xl border bg-card p-6 text-right"><h1 className="text-2xl font-bold">تعذر فتح الصفحة</h1><p className="text-sm text-muted-foreground">لم تكتمل هذه الخطوة. أعد المحاولة، وإذا استمرت المشكلة أرسل بلاغًا للدعم ليساعدك الفريق.</p><div className="flex flex-wrap gap-2"><Button onClick={reset}>إعادة المحاولة</Button><Link href="/support"><Button variant="outline">إبلاغ الدعم</Button></Link></div></section></main>;
}
