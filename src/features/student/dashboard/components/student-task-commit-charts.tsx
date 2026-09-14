"use client";

import { useState } from "react";
import { BarChart3Icon, GitCommitIcon, PieChartIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProgressTaskBreakdown, WeeklyCommitBucket } from "../types/student-analytics";
import { formatCompletionPercent, NO_TASK_DATA_LABEL } from "@/features/progress/lib/progress-format";

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
  const totalTasks = tasks.total || 1;
  const completionLabel = formatCompletionPercent(tasks.completionPercent);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <Card className="flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs lg:col-span-2">
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
                Gom từ nhật ký commit thật theo tuần ISO. Không có số task hoàn thành theo tuần vì máy chủ chưa trả mốc đó.
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
                        className={`w-5 cursor-pointer rounded-t-md sm:w-7 ${
                          isHovered ? "bg-primary" : "bg-primary/85 hover:bg-primary"
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

      <Card className="flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
        <CardHeader className="border-b border-border/60 p-4 pb-3 sm:p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <PieChartIcon className="size-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-foreground sm:text-base">
                Trạng thái task
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Phân bố TODO / đang làm / review / xong / chặn
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-5">
          <div className="text-center">
            <p className="font-mono text-2xl font-black text-foreground">
              {tasks.completionPercent === null ? NO_TASK_DATA_LABEL : completionLabel}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {tasks.done}/{tasks.total} task đã xong
            </p>
          </div>
          <div className="space-y-2 text-xs">
            <StatusRow label="Cần làm" value={tasks.todo} total={totalTasks} tone="bg-amber-500" />
            <StatusRow label="Đang làm" value={tasks.inProgress} total={totalTasks} tone="bg-blue-500" />
            <StatusRow label="Đang review" value={tasks.inReview} total={totalTasks} tone="bg-primary" />
            <StatusRow label="Đã xong" value={tasks.done} total={totalTasks} tone="bg-emerald-500" />
            <StatusRow label="Bị chặn" value={tasks.blocked} total={totalTasks} tone="bg-rose-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusRow({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: string;
}) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-bold text-foreground">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
