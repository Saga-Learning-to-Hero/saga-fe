"use client";

import { useState } from "react";
import { BarChart3Icon, GitCommitIcon, PieChart as PieChartIcon } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCompletionPercent } from "@/features/progress/lib/progress-format";
import type { ProgressTaskBreakdown, WeeklyCommitBucket } from "../types/student-analytics";

interface StudentTaskCommitChartsProps {
  tasks: ProgressTaskBreakdown;
  weeklyData: WeeklyCommitBucket[];
}

export function StudentTaskCommitCharts({
  tasks,
  weeklyData,
}: StudentTaskCommitChartsProps) {
  const [hoveredWeek, setHoveredWeek] = useState<string | null>(null);
  const maxVal = Math.max(...weeklyData.map((item) => item.commits), 1);

  const statusSegments = [
    { key: "todo", name: "To Do", value: tasks.todo, color: "#94A3B8" },
    { key: "inProgress", name: "In Progress", value: tasks.inProgress, color: "#3B82F6" },
    { key: "inReview", name: "In Review", value: tasks.inReview, color: "#A855F7" },
    { key: "done", name: "Done", value: tasks.done, color: "#10B981" },
    ...(tasks.blocked > 0 ? [{ key: "blocked", name: "Blocked", value: tasks.blocked, color: "#F43F5E" }] : []),
  ];

  const activeSegments = statusSegments.filter((item) => item.value > 0);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <Card className="flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs lg:col-span-7">
        <CardHeader className="border-b border-border/60 p-4 pb-3 sm:p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BarChart3Icon className="size-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-foreground sm:text-base">
                Commit theo tuần
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Gom từ nhật ký commit thật theo tuần ISO.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-5">
          {weeklyData.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border/80 p-8 text-center text-xs text-muted-foreground">
              Chưa có commit để vẽ biểu đồ tuần.
            </p>
          ) : (
            <div className="relative flex h-60 w-full items-end pt-6">
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between font-mono text-[10px] text-muted-foreground/50">
                {[maxVal, Math.round(maxVal * 0.66), Math.round(maxVal * 0.33), 0].map((tick) => (
                  <div key={tick} className="flex w-full items-center gap-2">
                    <span className="w-6 text-right">{tick}</span>
                    <div className="flex-1 border-b border-dashed border-border/70" />
                  </div>
                ))}
              </div>

              <div className="relative z-10 ml-8 flex h-full w-full items-end justify-around gap-2 sm:gap-4">
                {weeklyData.map((item) => {
                  const height = Math.max(4, Math.round((item.commits / maxVal) * 190));
                  const isHovered = hoveredWeek === item.weekKey;
                  return (
                    <div
                      key={item.weekKey}
                      className="group relative flex h-full flex-1 flex-col items-center justify-end"
                      onMouseEnter={() => setHoveredWeek(item.weekKey)}
                      onMouseLeave={() => setHoveredWeek(null)}
                    >
                      {isHovered ? (
                        <div className="absolute -top-16 left-1/2 z-40 -translate-x-1/2 whitespace-nowrap rounded-xl border border-primary/40 bg-popover/95 p-2.5 text-xs shadow-xl">
                          <p className="font-bold">{item.weekLabel}</p>
                          <p className="mt-1 flex items-center gap-1 font-mono text-primary">
                            <GitCommitIcon className="size-3.5" />
                            {item.commits} commit
                          </p>
                        </div>
                      ) : null}
                      <div
                        style={{ height: `${height}px` }}
                        className={`w-5 cursor-pointer rounded-t-md sm:w-7 ${isHovered ? "bg-primary" : "bg-primary/85 hover:bg-primary"
                          }`}
                      />
                      <span className="mt-2 font-mono text-[10px] font-semibold text-muted-foreground">
                        {item.weekLabel.replace(" · ", "\n")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs lg:col-span-5">
        <CardHeader className="border-b border-border/60 p-4 pb-3 sm:p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <PieChartIcon className="size-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-foreground sm:text-base">
                Trạng thái task Jira
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Phân bố công việc theo quy trình chuẩn Jira workflow.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col justify-between space-y-4 p-5">
          {tasks.total === 0 || activeSegments.length === 0 ? (
            <p className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border/80 p-8 text-center text-xs text-muted-foreground">
              Chưa có task trong dự án.
            </p>
          ) : (
            <>
              <div className="relative flex h-48 w-full items-center justify-center sm:h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activeSegments}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={84}
                      paddingAngle={activeSegments.length > 1 ? 3 : 0}
                      dataKey="value"
                    >
                      {activeSegments.map((entry) => (
                        <Cell key={entry.key} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name) => {
                        const num = Number(val) || 0;
                        const pct = tasks.total > 0 ? Math.round((num / tasks.total) * 100) : 0;
                        return [`${num} task (${pct}%)`, String(name)];
                      }}
                      contentStyle={{
                        borderRadius: "12px",
                        backgroundColor: "var(--color-card)",
                        borderColor: "var(--color-border)",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-mono text-2xl font-black tracking-tight text-foreground">
                    {formatCompletionPercent(tasks.completionPercent)}
                  </span>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {tasks.done}/{tasks.total} task
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-border/60 pt-3">
                {statusSegments.map((seg) => {
                  const pct = tasks.total > 0 ? Math.round((seg.value / tasks.total) * 100) : 0;
                  return (
                    <div
                      key={seg.key}
                      className="flex items-center justify-between rounded-lg bg-muted/30 px-2.5 py-1.5 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="size-2 shrink-0 rounded-full"
                          style={{ backgroundColor: seg.color }}
                        />
                        <span className="truncate text-muted-foreground">{seg.name}</span>
                      </div>
                      <div className="flex shrink-0 items-center gap-1 font-mono text-[11px]">
                        <span className="font-bold text-foreground">{seg.value}</span>
                        <span className="text-[10px] text-muted-foreground/70">({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
