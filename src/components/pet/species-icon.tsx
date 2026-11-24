import React from "react";
import { Dog, Cat, Rabbit, Bird, Sparkles } from "lucide-react";

interface SpeciesIconProps {
  species: string;
  className?: string;
}

export function SpeciesIcon({ species, className = "h-5 w-5" }: SpeciesIconProps) {
  switch (species.toLowerCase()) {
    case "dog":
      return <Dog className={className} aria-hidden="true" />;
    case "cat":
      return <Cat className={className} aria-hidden="true" />;
    case "rabbit":
      return <Rabbit className={className} aria-hidden="true" />;
    case "bird":
      return <Bird className={className} aria-hidden="true" />;
    case "horse":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          {/* Stylized Horse Head */}
          <path d="M5 21v-4a7 7 0 0 1 7-7h1l1-3 3-2 1 2-2 3h2l2 4-2 3-3 1-1 3" />
          <path d="M9 13h.01" />
          <path d="M7 21h8" />
        </svg>
      );
    case "cattle":
    case "cow":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          {/* Stylized Bovine / Cattle Horns & Head */}
          <path d="M7 6c-2-2-4-2-4 0 0 3 3 5 4 6" />
          <path d="M17 6c2-2 4-2 4 0 0 3-3 5-4 6" />
          <path d="M6 12a6 6 0 0 0 12 0v-2a6 6 0 0 0-12 0v2z" />
          <path d="M9 14h.01" />
          <path d="M15 14h.01" />
          <circle cx="12" cy="18" r="1.5" />
        </svg>
      );
    default:
      return <Sparkles className={className} aria-hidden="true" />;
  }
}
