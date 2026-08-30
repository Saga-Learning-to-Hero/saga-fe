import { UsersIcon, FolderKanbanIcon, TargetIcon, AlertCircleIcon } from "lucide-react";
import type { DashboardSummary } from "../types/course-dashboard";

export function CourseKpiGrid({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Sinh viên */}
      <div className="flex flex-col justify-center rounded-2xl border border-border bg-card p-5 shadow-saga-xs transition-shadow hover:shadow-saga-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
            <UsersIcon className="size-4" />
          </div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Sinh viên</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-foreground">{summary.studentCount}</span>
        </div>
        <span className="mt-1 text-xs text-muted-foreground">{summary.activeStudentCount} đang hoạt động</span>
      </div>

      {/* Nhóm dự án */}
      <div className="flex flex-col justify-center rounded-2xl border border-border bg-card p-5 shadow-saga-xs transition-shadow hover:shadow-saga-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
            <FolderKanbanIcon className="size-4" />
          </div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nhóm dự án</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-foreground">{summary.groupCount}</span>
        </div>
        <span className="mt-1 text-xs text-muted-foreground">{summary.healthyGroupCount} ổn định · {summary.groupCount - summary.healthyGroupCount} cần chú ý</span>
      </div>

      {/* Tiến độ học kỳ */}
      <div className="flex flex-col justify-center rounded-2xl border border-border bg-card p-5 shadow-saga-xs transition-shadow hover:shadow-saga-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
            <TargetIcon className="size-4" />
          </div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tiến độ kỳ</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-foreground">{summary.semesterProgress}%</span>
        </div>
        <span className="mt-1 text-xs text-muted-foreground">{summary.currentWeek}</span>
      </div>

      {/* Cảnh báo */}
      <div className="flex flex-col justify-center rounded-2xl border border-border bg-card p-5 shadow-saga-xs transition-shadow hover:shadow-saga-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <AlertCircleIcon className="size-4" />
          </div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cần chú ý</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-foreground">{summary.alertCount}</span>
        </div>
        <span className="mt-1 text-xs text-muted-foreground">Nhóm & sinh viên</span>
      </div>
    </div>
  );
}
