"use client";

import { useState } from "react";
import {
  BarChart3Icon,
  PieChartIcon,
  GitCommitIcon,
  CheckSquareIcon,
  LayersIcon,
  TrendingUpIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MemberAnalytics, WeeklyActivity } from "../types/student-analytics";

interface StudentTaskCommitChartsProps {
  analytics: MemberAnalytics;
  weeklyData: WeeklyActivity[];
}

export function StudentTaskCommitCharts({
  analytics,
  weeklyData,
}: StudentTaskCommitChartsProps) {
  const [hoveredWeek, setHoveredWeek] = useState<WeeklyActivity | null>(null);
  const [filterType, setFilterType] = useState<"ALL" | "COMMITS" | "TASKS">("ALL");

  const maxVal = Math.max(...weeklyData.map((d) => d.commits), 40);
  const tasks = analytics.tasksStatus;
  const totalTasks = tasks.done + tasks.inProgress + tasks.toDo + tasks.blocked || 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* ── Biểu đồ 1: Cường độ Commit & Tiến độ Task qua các Tuần (2 Columns) ──── */}
      <Card className="rounded-2xl border border-border/80 shadow-xs bg-card lg:col-span-2 flex flex-col justify-between overflow-hidden">
        <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <BarChart3Icon className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                  Cường độ Commits & Hoạt động Task theo Tuần
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Thống kê mã nguồn đẩy lên GitHub và số lượng Task Jira hoàn thành
                </CardDescription>
              </div>
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/60">
              <button
                onClick={() => setFilterType("ALL")}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors cursor-pointer ${filterType === "ALL" ? "bg-card text-foreground font-semibold shadow-xs" : "text-muted-foreground"
                  }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilterType("COMMITS")}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors cursor-pointer ${filterType === "COMMITS" ? "bg-card text-primary font-semibold shadow-xs" : "text-muted-foreground"
                  }`}
              >
                Chỉ Commits
              </button>
              <button
                onClick={() => setFilterType("TASKS")}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors cursor-pointer ${filterType === "TASKS" ? "bg-card text-blue-600 font-semibold shadow-xs" : "text-muted-foreground"
                  }`}
              >
                Chỉ Tasks
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          {/* Visual Bar Chart */}
          <div className="relative h-60 w-full pt-6 flex items-end">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] font-mono text-muted-foreground/50">
              <div className="flex items-center gap-2 w-full">
                <span className="w-6 text-right">{maxVal}</span>
                <div className="border-b border-dashed border-border/70 flex-1" />
              </div>
              <div className="flex items-center gap-2 w-full">
                <span className="w-6 text-right">{Math.round(maxVal * 0.66)}</span>
                <div className="border-b border-dashed border-border/70 flex-1" />
              </div>
              <div className="flex items-center gap-2 w-full">
                <span className="w-6 text-right">{Math.round(maxVal * 0.33)}</span>
                <div className="border-b border-dashed border-border/70 flex-1" />
              </div>
              <div className="flex items-center gap-2 w-full">
                <span className="w-6 text-right">0</span>
                <div className="border-b border-border flex-1" />
              </div>
            </div>

            {/* Bars */}
            <div className="ml-8 w-full h-full flex items-end justify-around gap-2 sm:gap-6 relative z-10">
              {weeklyData.map((item, idx) => {
                const commitHeight = Math.round((item.commits / maxVal) * 190);
                const taskHeight = Math.round(((item.tasksDone * 6) / maxVal) * 190);
                const isHovered = hoveredWeek?.week === item.week;

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredWeek(item)}
                    onMouseLeave={() => setHoveredWeek(null)}
                    className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                  >
                    {/* Hover Highlight */}
                    {isHovered && (
                      <div className="absolute inset-x-0 bottom-0 top-0 bg-primary/5 rounded-xl pointer-events-none -z-10 animate-in fade-in-0" />
                    )}

                    {/* Tooltip */}
                    {isHovered && (
                      <div className="absolute -top-20 left-1/2 -translate-x-1/2 bg-popover/95 backdrop-blur-md text-popover-foreground border border-border shadow-xl rounded-xl p-3 text-xs whitespace-nowrap z-40 pointer-events-none space-y-1">
                        <p className="font-bold text-foreground">{item.week}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-primary font-semibold flex items-center gap-1">
                            <GitCommitIcon className="w-3.5 h-3.5" />
                            {item.commits} Commits (+{item.linesAdded} lines)
                          </span>
                          <span className="text-blue-600 font-semibold flex items-center gap-1">
                            <CheckSquareIcon className="w-3.5 h-3.5" />
                            {item.tasksDone} Tasks Done
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          Traceability rate: <strong className="text-emerald-600 font-mono">{item.traceabilityRate}%</strong>
                        </p>
                      </div>
                    )}

                    {/* Dual Columns */}
                    <div className="w-full flex items-end justify-center gap-1.5 pb-0.5">
                      {(filterType === "ALL" || filterType === "COMMITS") && (
                        <div
                          style={{ height: `${commitHeight}px` }}
                          className={`w-4 sm:w-7 rounded-t-md transition-all duration-300 ${isHovered
                              ? "bg-primary shadow-md shadow-primary/30"
                              : "bg-primary/80 group-hover:bg-primary"
                            }`}
                        />
                      )}
                      {(filterType === "ALL" || filterType === "TASKS") && (
                        <div
                          style={{ height: `${taskHeight}px` }}
                          className={`w-4 sm:w-7 rounded-t-md transition-all duration-300 ${isHovered
                              ? "bg-blue-500 shadow-md shadow-blue-500/30"
                              : "bg-blue-500/80 group-hover:bg-blue-500"
                            }`}
                        />
                      )}
                    </div>

                    <span
                      className={`text-[11px] font-mono mt-2 font-semibold transition-colors ${isHovered ? "text-primary" : "text-muted-foreground"
                        }`}
                    >
                      {item.week}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer note */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/60">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <TrendingUpIcon className="w-3.5 h-3.5" />
              Tiến độ duy trì đều đặn 4 tuần liên tiếp
            </span>
            <Badge variant="outline" className="font-mono text-[10px]">
              Tỷ lệ Traceability TB: 90%
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* ── Biểu đồ 2: Trạng thái Tasks & Phân bố Mức độ công việc ──────────── */}
      <Card className="rounded-2xl border border-border/80 shadow-xs bg-card flex flex-col justify-between overflow-hidden">
        <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <PieChartIcon className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                Kết quả & Trạng thái Task
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Phân bố tình trạng đầu việc Jira
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-5">
          {/* Donut Chart Visual */}
          <div className="flex items-center justify-center gap-5">
            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="currentColor" strokeWidth="3.5" className="text-muted/40" />
                {/* 1. Done (Emerald) */}
                <circle
                  cx="18" cy="18" r="14" fill="transparent" stroke="currentColor" strokeWidth="4"
                  strokeDasharray={`${Math.round((tasks.done / totalTasks) * 88)} 100`}
                  strokeDashoffset="0"
                  className="text-emerald-500 transition-all duration-500"
                />
                {/* 2. In Progress (Blue) */}
                <circle
                  cx="18" cy="18" r="14" fill="transparent" stroke="currentColor" strokeWidth="4"
                  strokeDasharray={`${Math.round((tasks.inProgress / totalTasks) * 88)} 100`}
                  strokeDashoffset={`-${Math.round((tasks.done / totalTasks) * 88)}`}
                  className="text-blue-500 transition-all duration-500"
                />
                {/* 3. To Do (Amber) */}
                <circle
                  cx="18" cy="18" r="14" fill="transparent" stroke="currentColor" strokeWidth="4"
                  strokeDasharray={`${Math.round((tasks.toDo / totalTasks) * 88)} 100`}
                  strokeDashoffset={`-${Math.round(((tasks.done + tasks.inProgress) / totalTasks) * 88)}`}
                  className="text-amber-500 transition-all duration-500"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xl font-extrabold text-foreground font-mono leading-none">
                  {tasks.done}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Tasks Done</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-muted-foreground">Hoàn thành:</span>
                <strong className="text-foreground font-mono">{tasks.done}</strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                <span className="text-muted-foreground">Đang làm:</span>
                <strong className="text-foreground font-mono">{tasks.inProgress}</strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span className="text-muted-foreground">Cần làm:</span>
                <strong className="text-foreground font-mono">{tasks.toDo}</strong>
              </div>
              {tasks.blocked > 0 && (
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                  <span className="text-muted-foreground">Bị nghẽn:</span>
                  <strong className="text-rose-600 font-mono">{tasks.blocked}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Mức độ công việc theo Chuyên môn (Workload Breakdown) */}
          <div className="space-y-2.5 pt-3 border-t border-border/60">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <LayersIcon className="w-3.5 h-3.5 text-primary" />
                Phân bổ Mức độ Công việc (Story Points)
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {analytics.workloadCategories.map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground font-medium">{cat.category}</span>
                    <span className="font-mono font-bold text-foreground">{cat.storyPoints} SP ({cat.percentage}%)</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full ${cat.color} rounded-full transition-all duration-500`}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
