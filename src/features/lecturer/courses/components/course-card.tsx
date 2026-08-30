"use client";

import Link from "next/link";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  ClockIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LecturerCourse } from "../types/course";

interface CourseCardProps {
  course: LecturerCourse;
}

export function CourseCard({ course }: CourseCardProps) {
  const isCompleted = course.status === "COMPLETED";
  const isUpcoming = course.status === "UPCOMING";
  const studentCount = course.studentsCount || course.studentCount || 0;
  const groupCount = course.groupsCount || course.groupCount || 0;

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-2xl p-5 sm:p-6 transition-all duration-300",
        "bg-card/90 backdrop-blur-sm border border-border/80 shadow-xs hover:shadow-lg hover:-translate-y-1",
        "hover:border-primary/40 hover:bg-card"
      )}
    >
      {/* ── Top Header: Mã Học kỳ & Trạng thái ────────────────────── */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20 font-mono text-xs px-2.5 py-0.5 font-bold"
            >
              Kỳ: {course.semesterName || course.semesterCode || course.semesterId}
            </Badge>

            <Badge
              variant="secondary"
              className="bg-secondary/70 text-secondary-foreground font-mono text-xs px-2.5 py-0.5 font-semibold"
            >
              Mã môn: {course.code}
            </Badge>
          </div>

          <Badge
            className={cn(
              "text-[11px] font-semibold px-2.5 py-0.5 border-0",
              isCompleted
                ? "bg-muted text-muted-foreground"
                : isUpcoming
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold"
            )}
          >
            {isCompleted ? (
              <span className="flex items-center gap-1">
                <CheckCircle2Icon className="w-3 h-3" />
                Đã kết thúc
              </span>
            ) : isUpcoming ? (
              <span className="flex items-center gap-1">
                <ClockIcon className="w-3 h-3" />
                Sắp diễn ra
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Đang dạy
              </span>
            )}
          </Badge>
        </div>

        {/* ── Course Name & ID ─────────────────────────────────────── */}
        <div>
          <h3 className="text-lg font-extrabold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
            {course.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 font-mono">
            <span>Mã lớp hệ thống: <strong className="text-foreground font-bold">{course.id.toUpperCase()}</strong></span>
          </p>
        </div>

        {/* ── Class Metrics Strip: Sinh viên & Nhóm đồ án ─────────── */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-muted/40 border border-border/50 text-center">
          <div>
            <span className="text-[10px] text-muted-foreground font-semibold block uppercase tracking-wider">
              Tổng số sinh viên
            </span>
            <span className="text-lg font-black text-foreground font-mono mt-0.5 block">
              {studentCount} SV
            </span>
          </div>
          <div className="border-l border-border/50">
            <span className="text-[10px] text-muted-foreground font-semibold block uppercase tracking-wider">
              Nhóm đồ án
            </span>
            <span className="text-lg font-black text-primary font-mono mt-0.5 block">
              {groupCount} Nhóm
            </span>
          </div>
        </div>

        {/* ── Progress Bar ─────────────────────────────────────────── */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
            <span>Tiến độ học kỳ</span>
            <span className="font-mono font-bold text-foreground">{course.progress || 0}%</span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isCompleted ? "bg-muted-foreground/40" : "bg-primary"
              )}
              style={{ width: `${course.progress || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Footer Action ────────────────────────────────────────────── */}
      <div className="pt-4 mt-4 border-t border-border/60">
        <Link href={`/lecturer/courses/${course.id}/dashboard`} className="block">
          <Button
            className={cn(
              "w-full h-9.5 text-xs font-bold rounded-xl gap-2 shadow-xs cursor-pointer transition-all",
              isUpcoming
                ? "bg-muted text-muted-foreground cursor-not-allowed pointer-events-none"
                : isCompleted
                  ? "bg-muted text-muted-foreground hover:bg-muted/80"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {isCompleted ? "Xem lại lớp học" : isUpcoming ? "Lớp học chưa mở" : "Vào không gian lớp học"}
            <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
