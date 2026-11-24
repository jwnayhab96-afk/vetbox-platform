"use client";

import React from "react";
import { Header } from "@/components/shared/header";
import { Card } from "@/components/ui/card";
import { store } from "@/lib/data/store";
import { formatArabicDateTime } from "@/lib/utils";
import { Activity, Shield } from "lucide-react";

export default function AdminReportsPage() {
  const auditLogs = store.getAuditLogs();

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="سجلات الرقابة والتدقيق الأمني"
        subtitle="سجل غير قابل للتعديل لجميع العمليات الحساسة في النظام"
        role="admin"
      />

      <div className="p-4 md:p-8 space-y-6 max-w-6xl">
        <Card className="border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border/60">
                <tr>
                  <th className="p-3.5">العملية (Action)</th>
                  <th className="p-3.5">نوع المورد</th>
                  <th className="p-3.5">معرف المورد (ID)</th>
                  <th className="p-3.5">التفاصيل والبيانات</th>
                  <th className="p-3.5">الوقت</th>
                  <th className="p-3.5">عنوان IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5 font-bold font-mono text-primary">{log.action}</td>
                    <td className="p-3.5 font-medium">{log.resource_type}</td>
                    <td className="p-3.5 font-mono text-muted-foreground text-[11px]">{log.resource_id}</td>
                    <td className="p-3.5 text-muted-foreground text-[11px] max-w-xs truncate">
                      {JSON.stringify(log.metadata)}
                    </td>
                    <td className="p-3.5 text-muted-foreground">{formatArabicDateTime(log.created_at)}</td>
                    <td className="p-3.5 font-mono text-muted-foreground">{log.ip_address || "127.0.0.1"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
