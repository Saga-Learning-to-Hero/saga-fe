"use client";

import {
  GraduationCapIcon,
  UsersIcon,
  MapPinIcon,
  ClockIcon,
  ArrowRightIcon,
  GitGraphIcon,
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

        {/* ── Chi tiết bổ sung: Phòng học & Nhóm đồ án ────────────── */}
        <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-1">
          {course.room && (
            <div className="flex items-center gap-1.5">
              <MapPinIcon className="w-3.5 h-3.5 text-primary/70 shrink-0" />
              <span className="truncate">Phòng: <strong className="text-foreground">{course.room}</strong></span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <UsersIcon className="w-3.5 h-3.5 text-primary/70 shrink-0" />
            <span>Sĩ số: <strong className="text-foreground">{course.studentsCount} SV</strong></span>
          </div>

          {course.schedule && (
            <div className="flex items-center gap-1.5 col-span-2 text-[11px]">
              <ClockIcon className="w-3.5 h-3.5 text-primary/70 shrink-0" />
              <span className="truncate">{course.schedule}</span>
            </div>
          )}
        </div>

        {/* Badge Nhóm đồ án của sinh viên (nếu có) */}
        {course.myGroup && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2 min-w-0">
              <SparklesIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  Nhóm học tập
                </span>
                <span className="text-xs font-bold truncate">
                  {course.myGroup.name}
                </span>
              </div>
            </div>
            <Badge className="bg-amber-500/20 text-amber-800 dark:text-amber-300 border-0 text-[10px] shrink-0 font-semibold">
              {course.myGroup.role === "LEADER" ? "Trưởng nhóm" : "Thành viên"}
            </Badge>
          </div>
        )}
      </div>

      {/* ── Footer Actions ────────────────────────────────────────────── */}
      <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between gap-2">
        <Link href="/student/graph">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-medium rounded-lg gap-1.5 hover:bg-primary/10 hover:text-primary hover:border-primary/30 cursor-pointer"
          >
            <GitGraphIcon className="w-3.5 h-3.5 text-primary" />
            Xem đồ thị SAGA
          </Button>
        </Link>

        {onSelectCourse ? (
          <Button
            size="sm"
            onClick={handleSelect}
            className="h-8 text-xs font-semibold rounded-lg gap-1 shadow-xs cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Vào khóa học
            <ArrowRightIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Button>
        ) : (
          <Link href="/student/dashboard">
            <Button
              size="sm"
              className="h-8 text-xs font-semibold rounded-lg gap-1 shadow-xs cursor-pointer"
            >
              Vào khóa học
              <ArrowRightIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
