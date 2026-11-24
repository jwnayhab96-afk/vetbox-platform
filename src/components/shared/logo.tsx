import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  href?: string;
  subtitle?: string;
}

export function Logo({
  className,
  size = "md",
  showText = true,
  href = "/",
  subtitle = "VETERINARY PLATFORM",
}: LogoProps) {
  const iconDimensions = {
    sm: { wrapper: "h-8 w-7" },
    md: { wrapper: "h-10 w-9" },
    lg: { wrapper: "h-14 w-12" },
  }[size];

  const titleSizes = {
    sm: "text-lg tracking-tight",
    md: "text-2xl tracking-tight",
    lg: "text-3xl md:text-4xl tracking-tighter",
  }[size];

  const content = (
    <div className={cn("inline-flex items-center gap-2.5 group select-none", className)}>
      {/* Official VET BOX Isometric Green Box + Paw Logo */}
      <div className={cn("relative shrink-0 transition-transform duration-300 group-hover:scale-105", iconDimensions.wrapper)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/vetbox-logo.png"
          alt="VET BOX Logo"
          className="h-full w-auto object-contain drop-shadow-xs"
        />
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          {/* Distinctive English-only Brand Typography */}
          <div className="flex items-center leading-none">
            <span className={cn("font-brand font-black text-foreground uppercase select-none transition-colors", titleSizes)}>
              VET<span className="text-primary font-black">BOX</span>
            </span>
          </div>
          {subtitle && (
            <span className="text-[9px] md:text-[10px] font-brand font-extrabold uppercase tracking-[0.18em] text-muted-foreground mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
