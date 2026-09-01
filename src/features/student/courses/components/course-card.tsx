"use client";

import {
  GraduationCapIcon,
  UsersIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  SparklesIcon,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { StudentCourse } from "../types/student-course";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface CourseCardProps {
  course: StudentCourse;
  onSelectCourse?: (course: StudentCourse) => void;
}

export function CourseCard({ course, onSelectCourse }: CourseCardProps) {
  const isCompleted = course.status === "COMPLETED";

  const handleSelect = () => {
    if (onSelectCourse) {
      onSelectCourse(course);
    }
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-2xl p-5 transition-all duration-300",
        "bg-card/90 backdrop-blur-sm border border-border/80 shadow-xs hover:shadow-lg hover:-translate-y-1",
        "hover:border-primary/40 hover:bg-card"
      )}
    >
      {/* ── Top Header: Mã học kỳ & Trạng thái ────────────────────────── */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          {/* Mã học kỳ (Semester Code) */}
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20 font-mono text-xs px-2.5 py-0.5 font-bold"
            >
              Kỳ: {course.semesterCode}
            </Badge>

            {/* Thông tin Lớp hành chính (Class Info) */}
            <Badge
              variant="secondary"
              className="bg-secondary/70 text-secondary-foreground font-mono text-xs px-2 py-0.5 font-medium"
            >
              Lớp {course.adminClassCode}
            </Badge>
          </div>

          {/* Badge Trạng thái khóa học */}
          <Badge
            className={cn(
              "text-[11px] font-semibold px-2.5 py-0.5 border-0",
              isCompleted
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
            )}
          >
            {isCompleted ? (
              <span className="flex items-center gap-1">
                <CheckCircle2Icon className="w-3 h-3" />
                Đã kết thúc
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Đang học
              </span>
            )}
          </Badge>
        </div>

        {/* ── Môn học (Subject Name & Subject Code) ────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10">
              {course.subjectCode}
            </span>
            <span className="text-[11px] text-muted-foreground font-medium truncate">
              {course.code}
            </span>
          </div>

          <h3 className="text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {course.subjectName}
          </h3>
        </div>

        {/* ── Tên giảng viên (Lecturer Info) ───────────────────────── */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 border border-border/50">
          <Avatar className="h-9 w-9 border border-background shadow-xs shrink-0">
            <AvatarImage src={course.lecturer.avatar} alt={course.lecturer.fullName} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
              {course.lecturer.fullName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              Giảng viên hướng dẫn
            </span>
            <span className="text-xs font-bold text-foreground truncate">
              {course.lecturer.fullName}
            </span>
          </div>
          <GraduationCapIcon className="w-4 h-4 text-muted-foreground/60 shrink-0" />
        </div>

        {/* ── Sĩ số lớp học ────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-0.5">
          <UsersIcon className="w-3.5 h-3.5 text-primary/70 shrink-0" />
          <span>Sĩ số lớp: <strong className="font-mono text-foreground">{course.studentsCount} sinh viên</strong></span>
        </div>

        {/* Badge Nhóm đồ án của sinh viên (nếu có) */}
        {course.myGroup && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-primary/5 border border-primary/15 text-foreground">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <SparklesIcon className="size-3.5 text-primary" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Nhóm học tập
                </span>
                <span className="text-xs font-bold text-foreground truncate">
                  {course.myGroup.name}
                </span>
              </div>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] shrink-0 font-semibold px-2 py-0.5 rounded-md",
                course.myGroup.role === "LEADER"
                  ? "bg-primary/10 text-primary border-primary/25"
                  : "bg-muted text-muted-foreground border-border"
              )}
            >
              {course.myGroup.role === "LEADER" ? "Trưởng nhóm" : "Thành viên"}
            </Badge>
          </div>
        )}
      </div>

      {/* ── Footer Action ────────────────────────────────────────────── */}
      <div className="pt-4 mt-4 border-t border-border/60">
        {onSelectCourse ? (
          <Button
            onClick={handleSelect}
            className="w-full h-9.5 text-xs font-bold rounded-xl gap-2 shadow-xs cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
          >
            {isCompleted ? "Xem lại khóa học" : "Vào khóa học"}
            <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        ) : (
          <Link href="/student/dashboard" className="block">
            <Button
              className="w-full h-9.5 text-xs font-bold rounded-xl gap-2 shadow-xs cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
            >
              {isCompleted ? "Xem lại khóa học" : "Vào khóa học"}
              <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
