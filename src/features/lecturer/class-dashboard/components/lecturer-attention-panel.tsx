import Link from "next/link";
import { AlertTriangleIcon, InfoIcon, XCircleIcon, ChevronRightIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { DashboardAlert, AlertSeverity } from "../types/course-dashboard";

export function LecturerAttentionPanel({ alerts }: { alerts: DashboardAlert[] }) {
  const getSeverityConfig = (severity: AlertSeverity) => {
    switch (severity) {
      case "CRITICAL":
        return { icon: <XCircleIcon className="size-4" />, color: "text-destructive", bg: "bg-destructive/10" };
      case "WARNING":
        return { icon: <AlertTriangleIcon className="size-4" />, color: "text-warning", bg: "bg-warning/10" };
      case "INFO":
        return { icon: <InfoIcon className="size-4" />, color: "text-blue-500", bg: "bg-blue-500/10" };
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <h3 className="text-base font-bold text-foreground">Cần giảng viên chú ý</h3>
        <p className="text-xs text-muted-foreground">Các nhóm và sinh viên cần hỗ trợ</p>
      </div>

      <div className="flex flex-col gap-3">
        {alerts.map((alert) => {
          const config = getSeverityConfig(alert.severity);
          return (
            <div key={alert.id} className="group relative flex flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-saga-xs transition-colors hover:border-primary/50 hover:bg-primary/5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full ${config.bg} ${config.color}`}>
                    {config.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold leading-tight">{alert.title}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">{alert.reason}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{alert.timeAgo}</span>
                <Link
                  href={alert.actionUrl}
                  className={buttonVariants({ variant: "link", size: "sm", className: "h-auto p-0 text-xs font-semibold" })}
                >
                  {alert.actionLabel}
                  <ChevronRightIcon className="ml-1 size-3" />
                </Link>
              </div>
            </div>
          );
        })}

        {alerts.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border p-6 text-center">
            <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <InfoIcon className="size-5" />
            </div>
            <p className="text-sm font-semibold text-foreground">Tất cả đều ổn định</p>
            <p className="text-xs text-muted-foreground">Không có vấn đề nào cần xử lý ngay.</p>
          </div>
        )}
      </div>
    </div>
  );
}
