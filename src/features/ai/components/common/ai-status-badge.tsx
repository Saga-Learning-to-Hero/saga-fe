import { Loader2Icon, CheckCircle2Icon, AlertCircleIcon, ClockIcon, XCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AiAnalysisStatus } from "../../types";

interface AiStatusBadgeProps {
  status: AiAnalysisStatus | string;
  className?: string;
}

export function AiStatusBadge({ status, className }: AiStatusBadgeProps) {
  switch (status) {
    case "COMPLETED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
            className
          )}
        >
          <CheckCircle2Icon className="w-3.5 h-3.5" />
          Đã hoàn thành
        </span>
      );
    case "RUNNING":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 animate-pulse",
            className
          )}
        >
          <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
          Đang phân tích
        </span>
      );
    case "QUEUED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
            className
          )}
        >
          <ClockIcon className="w-3.5 h-3.5" />
          Đang chờ xử lý
        </span>
      );
    case "FAILED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
            className
          )}
        >
          <AlertCircleIcon className="w-3.5 h-3.5" />
          Phân tích thất bại
        </span>
      );
    case "CANCELLED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border",
            className
          )}
        >
          <XCircleIcon className="w-3.5 h-3.5" />
          Đã hủy
        </span>
      );
    default:
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border",
            className
          )}
        >
          {status}
        </span>
      );
  }
}
