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

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* header */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
              <span className="font-bold">{course.code}</span>
              <span className="opacity-40">·</span>
              <span className="opacity-60">{course.semesterId}</span>
            </div>
            <h3 className="line-clamp-2 text-xl font-extrabold leading-snug text-foreground group-hover:text-primary transition-colors">
              {course.name}
            </h3>
          </div>
          <Badge className={cn("shrink-0 border-0 text-xs px-2.5 py-1 font-bold", statusConfig.cls)}>
            {statusConfig.label}
          </Badge>
        </div>

        {/* stats */}
        <div className="flex items-center gap-6 rounded-2xl bg-muted/50 px-5 py-4 text-base">
          <div className="flex items-center gap-2.5">
            <UsersIcon className="size-5 text-muted-foreground" />
            <span className="font-extrabold text-xl">{course.studentCount}</span>
            <span className="text-muted-foreground font-medium">sinh viên</span>
          </div>
          <div className="h-5 w-px bg-border" />
          <div className="flex items-center gap-2.5">
            <FolderKanbanIcon className="size-5 text-muted-foreground" />
            <span className="font-extrabold text-xl">{course.groupCount}</span>
            <span className="text-muted-foreground font-medium">nhóm</span>
          </div>
        </div>

        {/* progress */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium">Tiến độ học kỳ</span>
            <span className="font-mono font-bold text-base">{course.progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full transition-all duration-500", isCompleted ? "bg-muted-foreground/40" : bar)}
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-border/60 px-6 py-4">
        <Link
          href={`/lecturer/courses/${course.id}/dashboard`}
          className={cn(
            "flex w-full items-center justify-center gap-2.5 rounded-xl py-3 text-base font-bold transition-all",
            isUpcoming
              ? "bg-muted text-muted-foreground cursor-not-allowed pointer-events-none"
              : isCompleted
              ? "bg-muted text-muted-foreground hover:bg-muted/80"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {isUpcoming ? "Chưa mở" : isCompleted ? "Xem lại lớp" : "Vào lớp học"}
          <ArrowRightIcon className="size-5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
