"use client";

import {
  UsersIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { StudentCourse } from "../types/student-course";
import { getStudentCourseTeamStatus } from "../types/student-course";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CourseCardProps {
  course: StudentCourse;
  onSelectCourse?: (course: StudentCourse) => void;
  onViewTeam?: (course: StudentCourse) => void;
}

const TEAM_STATUS_LABEL = {
  WAITING_TEAM: "Đang chờ giảng viên phân nhóm",
  WAITING_PROJECT: "Đã có nhóm, chưa có dự án",
  PROJECT_READY: "Dự án đã được khởi tạo",
} as const;

export function CourseCard({ course, onSelectCourse, onViewTeam }: CourseCardProps) {
  const teamStatus = getStudentCourseTeamStatus({
    teamId: course.teamId ?? null,
    projectId: course.projectId ?? null,
  });

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-2xl p-5 transition-all duration-300",
        "border border-border/80 bg-card/90 shadow-xs backdrop-blur-sm hover:-translate-y-1 hover:border-primary/40 hover:bg-card hover:shadow-lg"
      )}
    >
      <div className="space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-primary/20 bg-primary/10 px-2.5 py-0.5 font-mono text-xs font-bold text-primary"
            >
              Kỳ: {course.semesterCode}
            </Badge>
            <Badge
              variant="secondary"
              className="bg-secondary/70 px-2 py-0.5 font-mono text-xs font-medium text-secondary-foreground"
            >
              Lớp {course.adminClassCode}
            </Badge>
          </div>
          <Badge className="border-0 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              ACTIVE
            </span>
          </Badge>
        </div>

        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-xs font-bold text-primary">
              {course.subjectCode}
            </span>
            <span className="truncate font-mono text-[11px] font-medium text-muted-foreground">
              {course.code}
            </span>
          </div>
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
            {course.subjectName}
          </h3>
        </div>

        {course.lecturer?.fullName && (
          <div className="rounded-xl border border-border/50 bg-muted/40 p-2.5 text-xs">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Giảng viên
            </span>
            <p className="font-bold text-foreground">{course.lecturer?.fullName}</p>
          </div>
        )}

        <div className="flex items-center justify-between rounded-xl border border-primary/15 bg-primary/5 p-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UsersIcon className="size-3.5" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Trạng thái nhóm
              </span>
              <span className="truncate text-xs font-bold text-foreground">
                {course.teamName || TEAM_STATUS_LABEL[teamStatus]}
              </span>
            </div>
          </div>
          {teamStatus === "PROJECT_READY" && (
            <CheckCircle2Icon className="size-4 shrink-0 text-emerald-500" />
          )}
        </div>
        <p className="text-[11px] text-muted-foreground">{TEAM_STATUS_LABEL[teamStatus]}</p>
      </div>

      <div className="mt-4 space-y-2 border-t border-border/60 pt-4">
        <Button
          variant="outline"
          onClick={() => onViewTeam?.(course)}
          className="h-9 w-full cursor-pointer rounded-xl text-xs font-bold"
        >
          Xem nhóm của tôi
        </Button>
        {onSelectCourse && (
          <Button
            onClick={() => onSelectCourse(course)}
            className="h-9.5 w-full cursor-pointer gap-2 rounded-xl text-xs font-bold"
          >
            Vào khóa học
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
