"use client";

import { AlertTriangleIcon, CheckSquareIcon, GitCommitIcon, UsersIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PipelineStats, PipelineAnomalyFilterType } from "../types/pipeline";

interface PipelineStatsBarProps {
  stats: PipelineStats;
  isLoadingCommits?: boolean;
  activeAnomalyType?: PipelineAnomalyFilterType | "ALL";
  onSelectAnomalyType?: (type: PipelineAnomalyFilterType | "ALL") => void;
}

export function PipelineStatsBar({
  stats,
  isLoadingCommits = false,
  activeAnomalyType = "ALL",
  onSelectAnomalyType,
}: PipelineStatsBarProps) {
  const linkedRatio =
    stats.totalTasks > 0
      ? Math.round((stats.tasksWithLinkedCommits / stats.totalTasks) * 100)
      : 0;

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-xl border border-border/80 bg-card/95 p-3 px-4 text-xs shadow-2xs sm:px-5">
      <div className="flex items-center gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <UsersIcon className="size-4" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Thành viên
          </p>
          <p className="font-mono text-sm font-black text-foreground">{stats.totalMembers}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <CheckSquareIcon className="size-4" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Task
          </p>
          <p className="font-mono text-sm font-black text-foreground">{stats.totalTasks}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
          <GitCommitIcon className="size-4" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Commit
          </p>
          {isLoadingCommits || stats.totalCommits === null ? (
            <div className="mt-1 h-4 w-12 animate-pulse rounded bg-muted" aria-label="Đang tải tổng Commit" />
          ) : (
            <p className="font-mono text-sm font-black text-foreground">{stats.totalCommits}</p>
          )}
        </div>
      </div>

      <div className="min-w-[180px]">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Task có Commit liên kết
        </p>
        <p className="font-mono text-sm font-black text-foreground">
          {stats.tasksWithLinkedCommits}/{stats.totalTasks} · {linkedRatio}%
        </p>
      </div>

      <div className="flex items-center gap-2">
        {stats.doneWithoutLinkedCommits > 0 ? (
          onSelectAnomalyType ? (
            <button
              type="button"
              onClick={() => onSelectAnomalyType(activeAnomalyType === "MISSING_COMMIT" ? "ALL" : "MISSING_COMMIT")}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-bold transition-all cursor-pointer ${activeAnomalyType === "MISSING_COMMIT"
                ? "border-destructive bg-destructive/20 text-destructive shadow-xs ring-2 ring-destructive/30"
                : "border-destructive/30 bg-destructive/10 text-destructive hover:border-destructive/60 hover:bg-destructive/15"
                }`}
            >
              <AlertTriangleIcon className="size-3.5" />
              <span>{stats.doneWithoutLinkedCommits} Task hoàn thành chưa có Commit</span>
            </button>
          ) : (
            <Badge className="gap-1.5 border border-destructive/30 bg-destructive/10 text-xs font-bold text-destructive">
              <AlertTriangleIcon className="size-3.5" />
              {stats.doneWithoutLinkedCommits} Task hoàn thành chưa có Commit liên kết
            </Badge>
          )
        ) : (
          <Badge className="border border-emerald-500/30 bg-emerald-500/10 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            Không có Task hoàn thành thiếu Commit
          </Badge>
        )}

        {stats.missingDocumentTasks > 0 && (
          onSelectAnomalyType ? (
            <button
              type="button"
              onClick={() => onSelectAnomalyType(activeAnomalyType === "MISSING_DOCUMENT" ? "ALL" : "MISSING_DOCUMENT")}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-bold transition-all cursor-pointer ${activeAnomalyType === "MISSING_DOCUMENT"
                ? "border-amber-500/80 bg-amber-500/20 text-amber-700 dark:text-amber-300 shadow-xs ring-2 ring-amber-500/30"
                : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:border-amber-500/60 hover:bg-amber-500/15"
                }`}
            >
              <AlertTriangleIcon className="size-3.5" />
              <span>{stats.missingDocumentTasks} Task thiếu tài liệu</span>
            </button>
          ) : (
            <Badge className="border border-amber-500/30 bg-amber-500/10 text-xs font-bold text-amber-600 dark:text-amber-400">
              <AlertTriangleIcon className="mr-1.5 size-3.5" />
              {stats.missingDocumentTasks} Task thiếu tài liệu
            </Badge>
          )
        )}
      </div>
    </div>
  );
}
