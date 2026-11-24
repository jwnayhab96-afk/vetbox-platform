import React from "react";
import { Sidebar } from "@/components/shared/sidebar";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Role Sidebar */}
      <div className="hidden md:block">
        <Sidebar role="owner" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}
