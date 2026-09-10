"use client";

import { useRouter } from "next/navigation";
import {
  BookOpenIcon,
  ChevronDownIcon,
  CheckIcon,
  GraduationCapIcon,
  LayersIcon,
  ArrowLeftRightIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { lecturerCourseDashboardPath } from "@/features/lecturer/courses/lib/course-routes";
import { useLecturerCourses } from "@/features/lecturer/courses/hooks/use-lecturer-courses";
import { useStudentCourses } from "@/features/student/courses/hooks/use-student-courses";
import { mapStudentCourseResponse } from "@/features/student/courses/types/student-course";

interface CourseContextSwitcherProps {
  courseId: string | null;
  pathname: string;
}

export function CourseContextSwitcher({
  courseId,
  pathname,
}: CourseContextSwitcherProps) {
  const router = useRouter();
  const { user, selectedCourse, setSelectedCourse } = useAuthStore();
  const lecturerCoursesQuery = useLecturerCourses({
    enabled: user?.role === "LECTURER",
  });
  const studentCoursesQuery = useStudentCourses({
    enabled: user?.role === "STUDENT",
  });

  if (!user) return null;

  if (user.role === "ADMIN") {
    return (
      <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-danger/20 bg-danger-muted px-3 py-1 text-xs font-semibold text-danger">
        <LayersIcon className="size-3.5" />
        Quản trị hệ thống
      </span>
    );
  }

  if (pathname.startsWith("/profile")) {
    return null;
  }

  if (user.role === "LECTURER") {
    const isRootCoursePage = pathname === "/lecturer/courses";
    const lecturerCourses = lecturerCoursesQuery.data ?? [];
    const currentCourse = lecturerCourses.find((course) => course.id === courseId);

    if (isRootCoursePage || !courseId) {
      return (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <BookOpenIcon className="size-3.5 text-primary" />
            Không gian giảng dạy
          </span>
        </div>
      );
    }

    const courseCode = currentCourse?.courseCode ?? "Lớp học phần";
    const courseName = currentCourse?.subjectName || currentCourse?.name || "Chi tiết học phần";

    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="group flex max-w-[9.5rem] cursor-pointer items-center gap-2 rounded-xl border border-border/80 bg-muted/50 px-2 py-1.5 text-foreground outline-none transition-all hover:border-primary/40 hover:bg-muted sm:max-w-[280px] sm:px-3 md:max-w-[360px]">
          <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BookOpenIcon className="size-3.5" />
          </div>
          <div className="flex min-w-0 flex-col items-start text-left">
            <div className="flex w-full items-center gap-1.5">
              <span className="truncate font-mono text-xs font-bold text-foreground transition-colors group-hover:text-primary">
                {courseCode}
              </span>
              {currentCourse?.classCode && (
                <span className="hidden rounded bg-primary/15 px-1.5 font-mono text-[10px] font-semibold text-primary sm:inline">
                  {currentCourse.classCode}
                </span>
              )}
            </div>
            <span className="hidden w-full truncate text-[11px] text-muted-foreground sm:block">{courseName}</span>
          </div>
          <ChevronDownIcon className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:text-foreground group-data-[state=open]:rotate-180" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" sideOffset={8} className="w-80 rounded-2xl border-border p-1.5 shadow-xl">
          <DropdownMenuLabel className="flex items-center justify-between px-3 py-2 text-xs font-bold text-muted-foreground">
            <span>Danh sách lớp được phân công</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup className="max-h-64 space-y-0.5 overflow-y-auto p-1">
            {lecturerCourses.map((course) => {
              const isSelected = course.id === courseId;
              return (
                <DropdownMenuItem
                  key={course.id}
                  onClick={() => router.push(lecturerCourseDashboardPath(course.id))}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-xl p-2.5 text-xs",
                    isSelected ? "bg-primary/10 font-bold text-primary" : "text-foreground hover:bg-muted"
                  )}
                >
                  <div className="flex min-w-0 flex-col pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold">{course.courseCode}</span>
                      {course.classCode && (
                        <span className="rounded bg-muted px-1.5 text-[10px] text-muted-foreground">
                          {course.classCode}
                        </span>
                      )}
                    </div>
                    <span className="truncate text-[11px] text-muted-foreground">
                      {course.subjectName || course.name}
                    </span>
                  </div>
                  {isSelected && <CheckIcon className="size-4 shrink-0 text-primary" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => router.push("/lecturer/courses")}
            className="flex cursor-pointer items-center gap-2 rounded-xl p-2.5 text-xs font-semibold text-primary hover:bg-primary/10"
          >
            <ArrowLeftRightIcon className="size-3.5" />
            <span>Xem tất cả lớp học phần của tôi</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const isRootCoursePage = pathname === "/student/courses";
  if (isRootCoursePage) {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          <GraduationCapIcon className="size-3.5 text-primary" />
          Không gian học tập
        </span>
      </div>
    );
  }

  const studentCourses = (studentCoursesQuery.data ?? []).map(mapStudentCourseResponse);
  const activeStudentCourse =
    selectedCourse ?? studentCourses.find((course) => course.id === courseId) ?? studentCourses[0];

  if (!activeStudentCourse) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
        <GraduationCapIcon className="size-3.5 text-primary" />
        Chưa có lớp ACTIVE
      </span>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group flex max-w-[9.5rem] cursor-pointer items-center gap-2 rounded-xl border border-border/80 bg-muted/50 px-2 py-1.5 text-foreground outline-none transition-all hover:border-primary/40 hover:bg-muted sm:max-w-[280px] sm:px-3 md:max-w-[360px]">
        <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <GraduationCapIcon className="size-3.5" />
        </div>
        <div className="flex min-w-0 flex-col items-start text-left">
          <div className="flex w-full items-center gap-1.5">
            <span className="truncate font-mono text-xs font-bold text-foreground transition-colors group-hover:text-primary">
              {activeStudentCourse.subjectCode}
            </span>
            <span className="hidden rounded bg-primary/15 px-1.5 font-semibold text-[10px] text-primary sm:inline">
              {activeStudentCourse.adminClassCode}
            </span>
          </div>
          <span className="hidden w-full truncate text-[11px] text-muted-foreground sm:block">
            {activeStudentCourse.teamName || "Chưa có nhóm"} · {activeStudentCourse.subjectName}
          </span>
        </div>
        <ChevronDownIcon className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:text-foreground group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" sideOffset={8} className="w-80 rounded-2xl border-border p-1.5 shadow-xl">
        <DropdownMenuLabel className="flex items-center justify-between px-3 py-2 text-xs font-bold text-muted-foreground">
          <span>Khóa học đang tham gia</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-64 space-y-0.5 overflow-y-auto p-1">
          {studentCourses.map((course) => {
            const isSelected = (selectedCourse?.id ?? activeStudentCourse.id) === course.id;
            return (
              <DropdownMenuItem
                key={course.id}
                onClick={() => {
                  setSelectedCourse(course);
                  router.push("/student/dashboard");
                }}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-xl p-2.5 text-xs",
                  isSelected ? "bg-primary/10 font-bold text-primary" : "text-foreground hover:bg-muted"
                )}
              >
                <div className="flex min-w-0 flex-col pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold">{course.subjectCode}</span>
                    <span className="rounded bg-muted px-1.5 text-[10px] text-muted-foreground">
                      {course.adminClassCode}
                    </span>
                  </div>
                  <span className="truncate text-[11px] text-muted-foreground">{course.subjectName}</span>
                </div>
                {isSelected && <CheckIcon className="size-4 shrink-0 text-primary" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push("/student/courses")}
          className="flex cursor-pointer items-center gap-2 rounded-xl p-2.5 text-xs font-semibold text-primary hover:bg-primary/10"
        >
          <ArrowLeftRightIcon className="size-3.5" />
          <span>Đổi môn học / Chọn môn khác</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
