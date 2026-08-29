"use client";

import { UsersIcon, CheckCircle2Icon, AlertCircleIcon, TriangleAlertIcon } from "lucide-react";
import type { FinalGradebook } from "../types/final-grades";

export function GradeSummaryCards({ gradebook }: { gradebook: FinalGradebook }) {
  const { summary } = gradebook;
  const passRate = summary.totalStudents > 0 ? (summary.passCount / summary.totalStudents) * 100 : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Average */}
      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-xs">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <UsersIcon className="size-4" />
          <span>Điểm trung bình</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-3xl font-extrabold text-foreground">
            {summary.averageScore.toFixed(2)}
          </span>
          <span className="text-sm font-medium text-muted-foreground">/ 10</span>
        </div>
      </div>

      {/* Pass Rate */}
      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-xs">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <CheckCircle2Icon className="size-4 text-emerald-500" />
          <span>Qua môn</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-3xl font-extrabold text-foreground">
            {passRate.toFixed(1)}%
          </span>
        </div>
        <div className="text-sm font-medium text-muted-foreground">
          {summary.passCount} / {summary.totalStudents} sinh viên
        </div>
      </div>

      {/* Missing Grades */}
      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-xs">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <TriangleAlertIcon className="size-4 text-amber-500" />
          <span>Thiếu điểm</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-3xl font-extrabold text-foreground">
            {summary.missingGradesCount}
          </span>
        </div>
        <div className="text-sm font-medium text-muted-foreground">
          Sinh viên chưa đủ thành phần
        </div>
      </div>

      {/* Warning/Failed */}
      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-xs">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <AlertCircleIcon className="size-4 text-rose-500" />
          <span>Dưới chuẩn</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-3xl font-extrabold text-foreground">
            {summary.failCount}
          </span>
        </div>
        <div className="text-sm font-medium text-muted-foreground">
          Sinh viên dưới 5.0
        </div>
      </div>
    </div>
  );
}
