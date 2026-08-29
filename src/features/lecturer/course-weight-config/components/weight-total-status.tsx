"use client";

import { CheckCircle2Icon, AlertCircleIcon, XCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContributionWeights } from "../types/course-weight-config";
import { getTotalWeight } from "../lib/weight-config-utils";

interface WeightTotalStatusProps {
  weights: ContributionWeights;
}

export function WeightTotalStatus({ weights }: WeightTotalStatusProps) {
  const total = getTotalWeight(weights);
  const isValid = total === 100;
  const isMissing = total < 100;
  const isOver = total > 100;

  let message = "Cấu hình hợp lệ";
  let Icon = CheckCircle2Icon;
  let statusCls = "text-success bg-success/10 border-success/20";
  let barColor = "bg-success";

  if (isMissing) {
    message = `Còn thiếu ${100 - total}% để có thể lưu`;
    Icon = AlertCircleIcon;
    statusCls = "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20";
    barColor = "bg-amber-500";
  } else if (isOver) {
    message = `Đang vượt quá ${total - 100}%`;
    Icon = XCircleIcon;
    statusCls = "text-destructive bg-destructive/10 border-destructive/20";
    barColor = "bg-destructive";
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Tổng trọng số</span>
        <span className={cn("font-mono font-bold text-lg", isValid ? "text-success" : (isOver ? "text-destructive" : "text-amber-600"))}>
          {total}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-300", barColor)} 
          style={{ width: `${Math.min(total, 100)}%` }} 
        />
      </div>

      {/* Status Message */}
      <div className={cn("flex items-center gap-2 p-2.5 rounded-lg border text-xs font-semibold", statusCls)}>
        <Icon className="w-4 h-4 shrink-0" />
        {message}
      </div>
    </div>
  );
}
