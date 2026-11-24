import React from "react";
import { Sidebar } from "@/components/shared/sidebar";

export default function VetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden md:block">
        <Sidebar role="veterinarian" />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}
