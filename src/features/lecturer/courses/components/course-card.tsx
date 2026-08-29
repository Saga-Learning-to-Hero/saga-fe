"use client";

import Link from "next/link";
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  MapPinIcon,
  GitGraphIcon,
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

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-3xl p-5 sm:p-6 transition-all duration-300",
        "bg-card/90 backdrop-blur-sm border border-border/80 shadow-xs hover:shadow-lg hover:-translate-y-1",
        "hover:border-primary/40 hover:bg-card"
      )}
    >
      {/* ── Top Header: Mã Học kỳ, Mã lớp & Trạng thái ── */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20 font-mono text-xs px-2.5 py-0.5 font-bold"
            >
              Kỳ: {course.semesterId}
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
              "text-xs px-2.5 py-0.5 font-semibold border-0",
              isCompleted
                ? "bg-muted text-muted-foreground"
                : isUpcoming
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold"
            )}
          >
            {isCompleted ? "Đã kết thúc" : isUpcoming ? "Sắp diễn ra" : "Đang giảng dạy"}
          </Badge>
        </div>

        {/* Course Title */}
        <div>
          <h3 className="text-lg font-extrabold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {course.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
            <span>Mã lớp hệ thống: <strong className="font-mono text-foreground">{course.id.toUpperCase()}</strong></span>
          </p>
        </div>

        {/* Schedule & Room info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground pt-1 border-t border-border/50">
          <div className="flex items-center gap-2">
            <CalendarDaysIcon className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">{course.schedule}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPinIcon className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="font-mono font-medium text-foreground">{course.room}</span>
          </div>
        </div>

        {/* Class Metrics Strip */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-muted/40 border border-border/50 text-center">
          <div>
            <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Sinh viên</span>
            <span className="text-base font-black text-foreground font-mono">{course.studentCount} SV</span>
          </div>
          <div className="border-x border-border/50">
            <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Nhóm đồ án</span>
            <span className="text-base font-black text-primary font-mono">{course.groupCount} Nhóm</span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Buổi kế tiếp</span>
            <span className="text-xs font-bold text-foreground truncate block mt-0.5">{course.nextSession}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
            <span>Tiến độ giảng dạy học kỳ</span>
            <span className="font-mono font-bold text-foreground">{course.progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                course.progress === 100 ? "bg-muted-foreground" : "bg-primary"
              )}
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Footer Actions ── */}
      <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between gap-2">
        <Link href="/lecturer/graph">
          <Button
            variant="outline"
            size="sm"
            className="h-8.5 text-xs font-medium rounded-xl gap-1.5 hover:bg-primary/10 hover:text-primary hover:border-primary/30 cursor-pointer"
          >
            <GitGraphIcon className="w-3.5 h-3.5 text-primary" />
            Đồ thị SAGA
          </Button>
        </Link>

        <Link href={`/lecturer/courses/${course.id}/dashboard`}>
          <Button
            size="sm"
            className="h-8.5 text-xs font-bold rounded-xl gap-1.5 shadow-xs cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Vào không gian lớp
            <ArrowRightIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
