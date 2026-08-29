"use client";

import Link from "next/link";
import { ArrowRightIcon, FolderKanbanIcon, UsersIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LecturerCourse } from "../types/course";

export function CourseCard({ course }: { course: LecturerCourse }) {
  const isCompleted = course.status === "COMPLETED";
  const isUpcoming  = course.status === "UPCOMING";

  const statusConfig = {
    ACTIVE:    { label: "Đang dạy",    cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
    COMPLETED: { label: "Đã kết thúc", cls: "bg-muted text-muted-foreground" },
    UPCOMING:  { label: "Sắp diễn ra", cls: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  }[course.status];

  const toneRing: Record<string, string> = {
    indigo:  "hover:border-indigo-500/40",
    cyan:    "hover:border-cyan-500/40",
    emerald: "hover:border-emerald-500/40",
    amber:   "hover:border-amber-500/40",
  };
  const accentBar: Record<string, string> = {
    indigo: "bg-indigo-500", cyan: "bg-cyan-500", emerald: "bg-emerald-500", amber: "bg-amber-500",
  };

  const tone = course.tone ?? "indigo";
  const ring = toneRing[tone];
  const bar  = accentBar[tone];

  return (
    <div className={cn(
      "group relative flex flex-col rounded-2xl border border-border bg-card shadow-xs",
      "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
      ring
    )}>
      {/* accent stripe */}
      <div className={cn("h-1 w-full rounded-t-2xl", bar, isCompleted && "opacity-30")} />

      <div className="flex flex-1 flex-col gap-5 p-5">
        {/* header */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
              <span className="font-bold">{course.code}</span>
              <span className="opacity-40">·</span>
              <span className="opacity-60">{course.semesterId}</span>
            </div>
            <h3 className="line-clamp-2 text-base font-extrabold leading-snug text-foreground group-hover:text-primary transition-colors">
              {course.name}
            </h3>
          </div>
          <Badge className={cn("shrink-0 border-0 text-[10px] font-bold", statusConfig.cls)}>
            {statusConfig.label}
          </Badge>
        </div>

        {/* stats */}
        <div className="flex items-center gap-5 rounded-xl bg-muted/50 px-4 py-3.5 text-sm">
          <div className="flex items-center gap-2">
            <UsersIcon className="size-4 text-muted-foreground" />
            <span className="font-extrabold text-base">{course.studentCount}</span>
            <span className="text-muted-foreground">sinh viên</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <FolderKanbanIcon className="size-4 text-muted-foreground" />
            <span className="font-extrabold text-base">{course.groupCount}</span>
            <span className="text-muted-foreground">nhóm</span>
          </div>
        </div>

        {/* progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Tiến độ học kỳ</span>
            <span className="font-mono font-bold text-sm">{course.progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full transition-all duration-500", isCompleted ? "bg-muted-foreground/40" : bar)}
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-border/60 px-5 py-3.5">
        <Link
          href={`/lecturer/courses/${course.id}/dashboard`}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all",
            isUpcoming
              ? "bg-muted text-muted-foreground cursor-not-allowed pointer-events-none"
              : isCompleted
              ? "bg-muted text-muted-foreground hover:bg-muted/80"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {isUpcoming ? "Chưa mở" : isCompleted ? "Xem lại lớp" : "Vào lớp học"}
          <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
