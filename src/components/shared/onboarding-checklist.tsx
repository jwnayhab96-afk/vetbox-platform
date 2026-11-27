"use client";

import Link from "next/link";
import { CheckCircle2, Circle, ArrowLeft } from "lucide-react";

export type OnboardingStep = { label: string; href: string; done: boolean };

export function OnboardingChecklist({ title, steps }: { title: string; steps: OnboardingStep[] }) {
  const completed = steps.filter((step) => step.done).length;
  if (completed === steps.length) return null;

  return (
    <section className="rounded-2xl border border-primary/20 bg-card p-4 sm:p-5 text-right shadow-sm" aria-label={title}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-bold text-foreground">{title}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{completed} من {steps.length} خطوات مكتملة</p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{Math.round((completed / steps.length) * 100)}٪</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={completed} aria-valuemin={0} aria-valuemax={steps.length}>
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(completed / steps.length) * 100}%` }} />
      </div>
      <ol className="mt-3 grid gap-2 sm:grid-cols-2">
        {steps.map((step) => (
          <li key={step.label}>
            <Link href={step.href} className={`flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${step.done ? "text-muted-foreground" : "bg-muted/50 font-semibold text-foreground hover:bg-primary/10"}`}>
              {step.done ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> : <Circle className="h-4 w-4 shrink-0 text-primary" />}
              <span className="flex-1">{step.label}</span>
              {!step.done && <ArrowLeft className="h-4 w-4 text-primary" />}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
