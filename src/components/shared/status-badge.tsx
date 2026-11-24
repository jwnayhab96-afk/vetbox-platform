import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, AlertTriangle, ShieldCheck } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  type?: "connection" | "verification" | "visit" | "reminder";
  className?: string;
}

export function StatusBadge({ status, type = "connection", className }: StatusBadgeProps) {
  if (type === "verification") {
    switch (status) {
      case "verified":
        return (
          <Badge variant="success" className={className}>
            <ShieldCheck className="w-3.5 h-3.5 ml-1 text-emerald-600" />
            طبيب معتمد
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="warning" className={className}>
            <Clock className="w-3.5 h-3.5 ml-1 text-amber-600" />
            قيد المراجعة
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className={className}>
            <XCircle className="w-3.5 h-3.5 ml-1" />
            مرفوض
          </Badge>
        );
      default:
        return <Badge variant="neutral" className={className}>غير موثق</Badge>;
    }
  }

  if (type === "connection") {
    switch (status) {
      case "accepted":
        return (
          <Badge variant="success" className={className}>
            <CheckCircle2 className="w-3.5 h-3.5 ml-1 text-emerald-600" />
            مربوط ومعتمد
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="warning" className={className}>
            <Clock className="w-3.5 h-3.5 ml-1 text-amber-600" />
            في انتظار الموافقة
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className={className}>
            <XCircle className="w-3.5 h-3.5 ml-1" />
            تم الرفض
          </Badge>
        );
      case "revoked":
        return (
          <Badge variant="neutral" className={className}>
            تم إلغاء الربط
          </Badge>
        );
      default:
        return <Badge variant="neutral" className={className}>{status}</Badge>;
    }
  }

  if (type === "reminder") {
    if (status === "completed") {
      return (
        <Badge variant="success" className={className}>
          <CheckCircle2 className="w-3.5 h-3.5 ml-1" />
          مكتمل
        </Badge>
      );
    }
    return (
      <Badge variant="warning" className={className}>
        <Clock className="w-3.5 h-3.5 ml-1" />
        مستحق
      </Badge>
    );
  }

  return <Badge variant="outline" className={className}>{status}</Badge>;
}
