"use client";

import {
  GitCommitIcon,
  Code2Icon,
  GitBranchIcon,
  CheckCircle2Icon,
  RefreshCwIcon,
} from "lucide-react";
import type { CommitStats } from "../types/commits";
import { Card } from "@/components/ui/card";
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Commits */}
      <Card className="p-4 rounded-2xl border border-border/70 bg-card shadow-2xs space-y-2 hover:border-primary/40 transition-all">
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
          <Badge variant="secondary" className="font-mono text-[10px]">
            {selectedBranchName}
          </Badge>
        </div>
        <p className="text-[11px] text-muted-foreground truncate">
          Thuộc repo <strong className="text-foreground">{selectedRepoName}</strong>
        </p>
      </Card>

      {/* Code Changes (+ / -) */}
      <Card className="p-4 rounded-2xl border border-border/70 bg-card shadow-2xs space-y-2 hover:border-primary/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Thay đổi Dòng code</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Code2Icon className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono flex items-center">
            +{stats.totalAdditions}
          </span>
          <span className="text-sm font-semibold text-rose-500 font-mono">
            -{stats.totalDeletions}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground font-mono">
          Net delta: <strong className="text-foreground">+{stats.netLines} dòng</strong>
        </p>
      </Card>

      {/* Active Branches */}
      <Card className="p-4 rounded-2xl border border-border/70 bg-card shadow-2xs space-y-2 hover:border-primary/40 transition-all">
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
          <Badge className="bg-purple-500/15 text-purple-600 border-0 text-[10px] font-bold">
            BRANCHES
          </Badge>
        </div>
        <p className="text-[11px] text-muted-foreground truncate">
          Tự động lọc theo nhánh được chọn
        </p>
      </Card>

      {/* Webhook Sync Status */}
      <Card className="p-4 rounded-2xl border border-border/70 bg-card shadow-2xs space-y-2 hover:border-primary/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Trạng thái Webhook</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2Icon className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Đồng bộ tự động</span>
        </div>
        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
          <RefreshCwIcon className="w-3 h-3 text-muted-foreground shrink-0" />
          <span>Lần cuối: {stats.lastSyncedAt}</span>
        </p>
      </Card>
    </div>
  );
}
