import { ShieldAlertIcon, ShieldCheckIcon, AlertTriangleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AiRiskLevel } from "../../types";

interface AiRiskBadgeProps {
  level: AiRiskLevel | string;
  className?: string;
  showIcon?: boolean;
}

export function AiRiskBadge({ level, className, showIcon = true }: AiRiskBadgeProps) {
  switch (level) {
    case "HIGH":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
            className
          )}
        >
          {showIcon && <ShieldAlertIcon className="w-3.5 h-3.5" />}
          Rủi ro cao
        </span>
      );
    case "MEDIUM":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
            className
          )}
        >
          {showIcon && <AlertTriangleIcon className="w-3.5 h-3.5" />}
          Rủi ro trung bình
        </span>
      );
    case "LOW":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
            className
          )}
        >
          {showIcon && <ShieldCheckIcon className="w-3.5 h-3.5" />}
          Rủi ro thấp / An toàn
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
          {level}
        </span>
      );
  }
}
