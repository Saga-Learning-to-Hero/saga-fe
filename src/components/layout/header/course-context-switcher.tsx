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
import { MOCK_LECTURER_COURSES } from "@/features/lecturer/courses/data/mock-courses";
import { getLecturerCourseById } from "@/features/lecturer/courses/lib/course-repository";
import { lecturerCourseDashboardPath } from "@/features/lecturer/courses/lib/course-routes";
import { MOCK_STUDENT_COURSES } from "@/features/student/courses/data/mock-student-courses";
import type { StudentCourse } from "@/features/student/courses/types/student-course";

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

  if (!user) return null;

  // ── 1. Quản trị viên (Admin) ──────────────────────────────────────────
  if (user.role === "ADMIN") {
    return (
      <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-danger-muted text-danger border border-danger/20">
        <LayersIcon className="size-3.5" />
        Quản trị hệ thống
      </span>
    );
  }

  // ── 2. Giảng viên (Lecturer) ──────────────────────────────────────────
  if (user.role === "LECTURER") {
    const isRootCoursePage = pathname === "/lecturer/courses";

    if (isRootCoursePage || !courseId) {
      return (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
            <BookOpenIcon className="size-3.5 text-primary" />
            Không gian giảng dạy
          </span>
          <span className="hidden md:inline-flex items-center text-[11px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border">
            Học kỳ Spring 2026
          </span>
        </div>
      );
    }

    const currentCourse = getLecturerCourseById(courseId);
    const courseCode = currentCourse?.code ?? "Lớp học";
    const courseName = currentCourse?.name ?? "Chi tiết học phần";

    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/50 hover:bg-muted text-foreground border border-border/80 hover:border-primary/40 transition-all cursor-pointer outline-none group max-w-[280px] sm:max-w-[360px]">
          <div className="size-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <BookOpenIcon className="size-3.5" />
          </div>

          <div className="flex flex-col items-start min-w-0 text-left">
            <div className="flex items-center gap-1.5 w-full">
              <span className="text-xs font-bold font-mono text-foreground group-hover:text-primary transition-colors truncate">
                {courseCode}
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-primary/15 text-primary">
                {currentCourse?.room ?? "Phòng học"}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground truncate w-full">
              {courseName}
            </span>
          </div>

          <ChevronDownIcon className="size-3.5 text-muted-foreground group-hover:text-foreground shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" sideOffset={8} className="w-80 rounded-2xl p-1.5 shadow-xl border-border">
          <DropdownMenuLabel className="flex items-center justify-between px-3 py-2 text-xs font-bold text-muted-foreground">
            <span>Danh sách lớp giảng dạy</span>
            <span className="text-[10px] font-mono font-normal">Học kỳ Spring 2026</span>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuGroup className="space-y-0.5 p-1 max-h-64 overflow-y-auto">
            {MOCK_LECTURER_COURSES.map((course) => {
              const isSelected = course.id === courseId;
              return (
                <DropdownMenuItem
                  key={course.id}
                  onClick={() => router.push(lecturerCourseDashboardPath(course.id))}
                  className={cn(
                    "flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer",
                    isSelected ? "bg-primary/10 text-primary font-bold" : "hover:bg-muted text-foreground"
                  )}
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold">{course.code}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                        {course.room} · {course.groupsCount} nhóm
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground truncate">{course.name}</span>
                  </div>

                  {isSelected && <CheckIcon className="size-4 text-primary shrink-0" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => router.push("/lecturer/courses")}
            className="flex items-center gap-2 p-2.5 rounded-xl text-xs text-primary font-semibold hover:bg-primary/10 cursor-pointer"
          >
            <ArrowLeftRightIcon className="size-3.5" />
            <span>Xem tất cả khóa học của tôi</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // ── 3. Sinh viên (Student) ────────────────────────────────────────────
  const isRootCoursePage = pathname === "/student/courses";

  if (isRootCoursePage) {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
          <GraduationCapIcon className="size-3.5 text-primary" />
          Không gian học tập
        </span>
        <span className="hidden md:inline-flex items-center text-[11px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border">
          Học kỳ Fall 2026
        </span>
      </div>
    );
  }

  // Khóa học sinh viên đang chọn (hoặc mặc định môn đầu tiên)
  const activeStudentCourse = selectedCourse ?? MOCK_STUDENT_COURSES[0];
  const subjectCode = activeStudentCourse?.subjectCode ?? "SWP490";
  const classCode = activeStudentCourse?.adminClassCode ?? "SE1701";
  const groupName = activeStudentCourse?.myGroup?.name ?? "SAGA Team";

  const handleSelectStudentCourse = (c: StudentCourse) => {
    setSelectedCourse(c);
    router.push("/student/dashboard");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/50 hover:bg-muted text-foreground border border-border/80 hover:border-primary/40 transition-all cursor-pointer outline-none group max-w-[280px] sm:max-w-[360px]">
        <div className="size-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <GraduationCapIcon className="size-3.5" />
        </div>

        <div className="flex flex-col items-start min-w-0 text-left">
          <div className="flex items-center gap-1.5 w-full">
            <span className="text-xs font-bold font-mono text-foreground group-hover:text-primary transition-colors truncate">
              {subjectCode}
            </span>
            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-primary/15 text-primary">
              {classCode}
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground truncate w-full">
            {groupName} · {activeStudentCourse?.subjectName}
          </span>
        </div>

        <ChevronDownIcon className="size-3.5 text-muted-foreground group-hover:text-foreground shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" sideOffset={8} className="w-80 rounded-2xl p-1.5 shadow-xl border-border">
        <DropdownMenuLabel className="flex items-center justify-between px-3 py-2 text-xs font-bold text-muted-foreground">
          <span>Khóa học đang tham gia</span>
          <span className="text-[10px] font-mono font-normal">Kỳ FA26</span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup className="space-y-0.5 p-1 max-h-64 overflow-y-auto">
          {MOCK_STUDENT_COURSES.map((course) => {
            const isSelected = (selectedCourse?.id ?? activeStudentCourse?.id) === course.id;
            return (
              <DropdownMenuItem
                key={course.id}
                onClick={() => handleSelectStudentCourse(course)}
                className={cn(
                  "flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer",
                  isSelected ? "bg-primary/10 text-primary font-bold" : "hover:bg-muted text-foreground"
                )}
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold">{course.subjectCode}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                      {course.adminClassCode}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground truncate">{course.subjectName}</span>
                </div>

                {isSelected && <CheckIcon className="size-4 text-primary shrink-0" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => router.push("/student/courses")}
          className="flex items-center gap-2 p-2.5 rounded-xl text-xs text-primary font-semibold hover:bg-primary/10 cursor-pointer"
        >
          <ArrowLeftRightIcon className="size-3.5" />
          <span>Đổi môn học / Chọn môn khác</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
