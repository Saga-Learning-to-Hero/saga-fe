import { CheckCircle2Icon, AlertCircleIcon, SparklesIcon, CircleDashedIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AiTaskEvidenceStrength } from "../../types";

interface AiEvidenceStrengthBadgeProps {
  strength: AiTaskEvidenceStrength | string;
  className?: string;
}

export function AiEvidenceStrengthBadge({
  strength,
  className,
}: AiEvidenceStrengthBadgeProps) {
  switch (strength) {
    case "COMPLETED_EVIDENCE":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
            className
          )}
        >
          <CheckCircle2Icon className="w-3.5 h-3.5" />
          Minh chứng đầy đủ
        </span>
      );
    case "SUBSTANTIAL_EVIDENCE":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20",
            className
          )}
        >
          <SparklesIcon className="w-3.5 h-3.5" />
          Minh chứng vững chắc
        </span>
      );
    case "ACTIVE_PROGRESS":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
            className
          )}
        >
          <CircleDashedIcon className="w-3.5 h-3.5" />
          Đang có tiến triển tốt
        </span>
      );
    case "EARLY_EVIDENCE":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20",
            className
          )}
        >
          Minh chứng bước đầu
        </span>
      );
    case "INSUFFICIENT_EVIDENCE":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
            className
          )}
        >
          <AlertCircleIcon className="w-3.5 h-3.5" />
          Chưa đủ minh chứng
        </span>
      );
    case "NO_EVIDENCE":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
            className
          )}
        >
          <AlertCircleIcon className="w-3.5 h-3.5" />
          Không có minh chứng
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
          {strength}
        </span>
      );
  }
}
