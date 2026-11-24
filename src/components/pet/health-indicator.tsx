import React from "react";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Clock, AlertCircle } from "lucide-react";

interface HealthIndicatorProps {
  hasRecentExam: boolean;
  hasOverdueVaccine: boolean;
  isOwnerReportedOnly: boolean;
  className?: string;
}

export function HealthIndicator({
  hasRecentExam,
  hasOverdueVaccine,
  isOwnerReportedOnly,
  className,
}: HealthIndicatorProps) {
  if (hasOverdueVaccine) {
    return (
      <Badge variant="warning" className={className}>
        <AlertCircle className="w-3.5 h-3.5 ml-1 text-amber-600" />
        تطعيم وقائي مستحق
      </Badge>
    );
  }

  if (hasRecentExam) {
    return (
      <Badge variant="success" className={className}>
        <ShieldCheck className="w-3.5 h-3.5 ml-1 text-emerald-600" />
        مفحوص طبياً حديثاً
      </Badge>
    );
  }

  if (isOwnerReportedOnly) {
    return (
      <Badge variant="neutral" className={className}>
        <Clock className="w-3.5 h-3.5 ml-1 text-muted-foreground" />
        سجل مسجل بواسطة المربي
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={className}>
      <Clock className="w-3.5 h-3.5 ml-1 text-muted-foreground" />
      بانتظار أول فحص سريري
    </Badge>
  );
}
