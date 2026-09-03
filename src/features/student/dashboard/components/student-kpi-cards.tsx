"use client";

import {
  CheckSquareIcon,
  GitCommitIcon,
  GitGraphIcon,
  PieChartIcon,
  TrendingUpIcon,
} from "lucide-react";
import type { MemberAnalytics } from "../types/student-analytics";

interface StudentKPICardsProps {
  analytics: MemberAnalytics;
  isAllTeamSelected?: boolean;
  totalTeamCommits?: number;
}

export function StudentKPICards({
  analytics,
  isAllTeamSelected = false,
  totalTeamCommits = 350,
}: StudentKPICardsProps) {
  const tasks = analytics.tasksStatus;
  const totalTasks = tasks.done + tasks.inProgress + tasks.toDo + tasks.blocked;
  const taskCompletionRate = Math.round((tasks.done / (totalTasks || 1)) * 100);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI Card 1: Tiến độ & Tỷ lệ hoàn thành Task */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:border-primary/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {isAllTeamSelected ? "Tổng Task Nhóm" : "Tiến độ Task Cá nhân"}
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <CheckSquareIcon className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-foreground tracking-tight font-mono">
              {taskCompletionRate}%
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              ({tasks.done}/{totalTasks} Tasks)
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Đã hoàn thành <strong className="text-foreground">{tasks.completedStoryPoints}</strong>/{tasks.totalStoryPoints} Story Points
          </p>
        </div>

        <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-blue-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${taskCompletionRate}%` }}
          />
        </div>
      </div>

      {/* KPI Card 2: Cường độ Commit & Hoạt động Mã nguồn */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:border-primary/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {isAllTeamSelected ? "Tổng Commits Nhóm" : "Cường độ Commits"}
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <GitCommitIcon className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-foreground tracking-tight font-mono">
              {isAllTeamSelected ? totalTeamCommits : analytics.totalCommits}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
              <TrendingUpIcon className="w-3 h-3" />
              +15% tuần này
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            GitHub repo: <span className="font-mono text-foreground font-medium">main/branch</span>
          </p>
        </div>
      </div>

      {/* KPI Card 3: Chỉ số SAGA Traceability Score */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:border-primary/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            SAGA Traceability Score
          </span>
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <GitGraphIcon className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-primary tracking-tight font-mono">
              {analytics.traceabilityScore}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Liên kết 1-1 giữa Task Jira & GitHub Commits
          </p>
        </div>
      </div>

      {/* KPI Card 4: Mức độ đóng góp đồ án (Contribution Share) */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:border-primary/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Mức đóng góp đồ án
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <PieChartIcon className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-foreground tracking-tight font-mono">
              {analytics.contributionPercentage}%
            </span>
          </div>
        </div>

        <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-amber-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${analytics.contributionPercentage * 3}%` }}
          />
        </div>
      </div>
    </div>
  );
}
