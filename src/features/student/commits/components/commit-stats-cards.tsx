"use client";

import {
  GitCommitIcon,
  GitBranchIcon,
  CheckCircle2Icon,
  RefreshCwIcon,
} from "lucide-react";
import type { CommitStats } from "../types/commits";
import { Badge } from "@/components/ui/badge";

interface CommitStatsCardsProps {
  stats: CommitStats;
  selectedRepoName: string;
  selectedBranchName: string;
}

export function CommitStatsCards({
  stats,
  selectedRepoName,
  selectedBranchName,
}: CommitStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
      <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xs shadow-2xs space-y-2 hover:border-primary/50 transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Tổng số Commits</span>
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <GitCommitIcon className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-foreground font-mono">
            {stats.totalCommits}
          </span>
          <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0.2">
            {selectedBranchName}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
          <span className="truncate max-w-[140px]">
            Repo <strong className="text-foreground font-medium">{selectedRepoName}</strong>
          </span>
          {stats.totalAdditions !== null && stats.totalDeletions !== null ? (
            <span className="font-mono text-[10px] shrink-0">
              <span className="text-emerald-600 font-bold">+{stats.totalAdditions}</span>
              {" / "}
              <span className="text-rose-600 font-bold">-{stats.totalDeletions}</span>
            </span>
          ) : (
            <span className="text-[10px] text-muted-foreground">Chưa có dữ liệu diff</span>
          )}
        </div>
      </div>

      <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xs shadow-2xs space-y-2 hover:border-primary/50 transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Nhánh đang Active</span>
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <GitBranchIcon className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-foreground font-mono">
            {stats.activeBranches}
          </span>
          <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-0 text-[10px] font-bold font-mono">
            BRANCHES
          </Badge>
        </div>
        <p className="text-[11px] text-muted-foreground truncate pt-0.5">
          Tự động lọc theo nhánh được chọn
        </p>
      </div>

      <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xs shadow-2xs space-y-2 hover:border-primary/50 transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Trạng thái Webhook</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2Icon className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Đồng bộ tự động</span>
        </div>
        <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate pt-0.5">
          <RefreshCwIcon className="w-3 h-3 text-muted-foreground shrink-0" />
          <span>Lần cuối: {stats.lastSyncedAt}</span>
        </p>
      </div>
    </div>
  );
}
