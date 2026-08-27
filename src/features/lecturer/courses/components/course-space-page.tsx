"use client";

import Link from "next/link";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  MapPinIcon,
  UsersIcon,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LecturerCourse } from "../types/course";

const toneStyles = {
  indigo: { bar: "bg-primary", badge: "bg-primary/10 text-primary" },
  cyan: { bar: "bg-saga-accent", badge: "bg-info-muted text-info" },
  emerald: { bar: "bg-saga-success", badge: "bg-success-muted text-success" },
  amber: { bar: "bg-saga-warning", badge: "bg-warning-muted text-warning" },
};

export function CourseSpacePage({ course }: { course: LecturerCourse }) {
  const tone = toneStyles[course.tone];

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      {/* Header breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/lecturer/courses"
          aria-label="Quay lại danh sách lớp"
          className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8 rounded-lg" })}
        >
          <ArrowLeftIcon className="size-4" />
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/lecturer/courses" className="hover:text-foreground transition-colors">
            Lớp học của tôi
          </Link>
          <span>/</span>
          <span className="font-semibold text-foreground">{course.code}</span>
        </div>
      </div>

      {/* Course hero */}
      <div className={cn("relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-saga-sm")}>
        <div className={cn("absolute inset-y-0 left-0 w-1.5 rounded-l-2xl", tone.bar)} />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Badge className={cn("mb-3 border-0 font-mono text-[10px] font-bold tracking-wider", tone.badge)}>
              {course.code}
            </Badge>
            <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">{course.name}</h1>
            <p className="mt-1 text-xs text-muted-foreground">Học kỳ {course.semesterId}</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarDaysIcon className="size-3.5" />
                {course.schedule}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPinIcon className="size-3.5" />
                {course.room}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-muted/50 text-center sm:min-w-56">
            <div className="px-4 py-3">
              <strong className="block text-base">{course.studentCount}</strong>
              <span className="text-[10px] text-muted-foreground">Sinh viên</span>
            </div>
            <div className="px-4 py-3">
              <strong className="block text-base">{course.groupCount}</strong>
              <span className="text-[10px] text-muted-foreground">Nhóm</span>
            </div>
            <div className="px-4 py-3">
              <strong className="block text-base">{course.progress}%</strong>
              <span className="text-[10px] text-muted-foreground">Tiến độ</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5 border-t border-border pt-4">
          <div className="mb-2 flex justify-between text-[10px] font-medium text-muted-foreground">
            <span>Tiến độ học kỳ</span>
            <span>{course.progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full transition-all duration-500", tone.bar)}
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Placeholder sections */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { icon: UsersIcon, label: "Danh sách sinh viên", desc: "Xem và quản lý sinh viên trong lớp" },
          { icon: BookOpenIcon, label: "Nhóm dự án", desc: "Theo dõi tiến độ từng nhóm" },
          { icon: CalendarDaysIcon, label: "Buổi học", desc: "Lịch và ghi chú từng buổi" },
        ].map(({ icon: Icon, label, desc }) => (
          <div
            key={label}
            className="flex items-start gap-4 rounded-2xl border border-dashed border-border bg-card p-5"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
              <Icon className="size-5" />
            </span>
            <div>
              <p className="text-sm font-bold">{label}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
