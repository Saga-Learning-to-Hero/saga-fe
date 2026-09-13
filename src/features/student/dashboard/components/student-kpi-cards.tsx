"use client";

import {
  CheckSquareIcon,
  FileTextIcon,
  GitCommitIcon,
  Link2Icon,
} from "lucide-react";
import type { ProgressCommitBreakdown, ProgressTaskBreakdown } from "../types/student-analytics";
import {
  formatCompletionPercent,
  formatLinkedCommitRatio,
  NO_TASK_DATA_LABEL,
} from "@/features/progress/lib/progress-format";

interface StudentKPICardsProps {
  tasks: ProgressTaskBreakdown;
  commits: ProgressCommitBreakdown;
  evidenceCount: number;
  isAllTeamSelected?: boolean;
}

export function StudentKPICards({
  tasks,
  commits,
  evidenceCount,
  isAllTeamSelected = false,
}: StudentKPICardsProps) {
  const completionLabel = formatCompletionPercent(tasks.completionPercent);
  const hasTasks = tasks.total > 0 && tasks.completionPercent !== null;
  const linkedRatio = formatLinkedCommitRatio(commits.linked, commits.total);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {isAllTeamSelected ? "Tỉ lệ hoàn thành task nhóm" : "Tỉ lệ hoàn thành task"}
          </span>
          <div className="flex size-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <CheckSquareIcon className="size-4" />
          </div>
        </div>
        <div className="my-2">
          <p className="font-mono text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            {hasTasks ? completionLabel : NO_TASK_DATA_LABEL}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {hasTasks ? `${tasks.done}/${tasks.total} task đã xong` : "Chưa có dữ liệu task"}
          </p>
        </div>
        {hasTasks ? (
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, Math.round(tasks.completionPercent ?? 0)))}%` }}
            />
          </div>
        ) : null}
      </div>

      <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {isAllTeamSelected ? "Tổng commit nhóm" : "Commit"}
          </span>
          <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <GitCommitIcon className="size-4" />
          </div>
        </div>
        <div className="my-2">
          <p className="font-mono text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            {commits.total}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {commits.linked} commit đã liên kết task
          </p>
        </div>
      </div>

      <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Commit đã liên kết task
          </span>
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Link2Icon className="size-4" />
          </div>
        </div>
        <div className="my-2">
          <p className="font-mono text-2xl font-black tracking-tight text-primary sm:text-3xl">
            {linkedRatio}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {commits.linked}/{commits.total} commit có liên kết
          </p>
        </div>
      </div>

      <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Minh chứng
          </span>
          <div className="flex size-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <FileTextIcon className="size-4" />
          </div>
        </div>
        <div className="my-2">
          <p className="font-mono text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            {evidenceCount}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Phiên làm việc, tệp, liên kết và xác nhận
          </p>
        </div>
      </div>
    </div>
  );
}
