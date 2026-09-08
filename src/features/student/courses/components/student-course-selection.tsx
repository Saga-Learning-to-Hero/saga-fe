"use client";

import { useState } from "react";
import {
  SearchIcon,
  BookOpenIcon,
  SparklesIcon,
  FilterXIcon,
  UsersIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SemesterTabs } from "./semester-tabs";
import { CourseCard } from "./course-card";
import { StudentMyTeamPanel } from "./student-my-team-panel";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useStudentCourses } from "../hooks/use-student-courses";
import {
  mapStudentCourseResponse,
  type StudentCourse,
  type StudentCourseResponse,
  type StudentSemester,
} from "../types/student-course";
import { getApiErrorMessage } from "@/lib/api-error";

interface StudentCourseSelectionProps {
  onSelectCourse?: (course: StudentCourse) => void;
}

function buildSemesters(courses: StudentCourseResponse[]): StudentSemester[] {
  const map = new Map<string, StudentSemester>();
  for (const course of courses) {
    const existing = map.get(course.semesterCode);
    if (existing) {
      existing.totalCourses += 1;
    } else {
      map.set(course.semesterCode, {
        id: course.semesterCode,
        code: course.semesterCode,
        name: course.semesterName,
        status: "ACTIVE",
        totalCourses: 1,
      });
    }
  }
  return Array.from(map.values());
}

export function StudentCourseSelection({ onSelectCourse }: StudentCourseSelectionProps) {
  const { user } = useAuthStore();
  const { data: apiCourses = [], isLoading, isError, error, refetch } = useStudentCourses();
  const [selectedSemesterCode, setSelectedSemesterCode] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [teamCourseId, setTeamCourseId] = useState<string | null>(null);

  const semesters = buildSemesters(apiCourses);
  const currentSemester =
    semesters.find((semester) => semester.code === selectedSemesterCode) || semesters[0];
  const activeSemesterCode = currentSemester?.code || "";

  const filteredCourses = apiCourses.filter((course) => {
    const matchSemester = !activeSemesterCode || course.semesterCode === activeSemesterCode;
    const query = searchQuery.toLowerCase().trim();
    const matchQuery =
      !query ||
      course.subjectName.toLowerCase().includes(query) ||
      course.subjectCode.toLowerCase().includes(query) ||
      course.courseCode.toLowerCase().includes(query) ||
      course.classCode.toLowerCase().includes(query);
    return matchSemester && matchQuery;
  });

  const mappedCourses = filteredCourses.map(mapStudentCourseResponse);
  const totalCoursesInSemester = apiCourses.filter(
    (course) => course.semesterCode === activeSemesterCode
  ).length;

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-10">
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary to-primary/70 p-6 text-white shadow-md sm:p-8">
        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl space-y-2">
            <Badge className="border-0 bg-white/20 px-3 py-1 text-xs font-semibold text-white">
              <SparklesIcon className="mr-1 h-3.5 w-3.5" />
              Khóa học ACTIVE của tôi
            </Badge>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Xin chào, {user?.name || "Sinh viên"}
            </h1>
            <p className="text-xs leading-relaxed text-white/80 sm:text-sm">
              Danh sách lấy từ phiên đăng nhập. Không gửi userId hay bộ lọc vai trò. Chọn lớp để xem
              nhóm của bạn.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <div className="min-w-[110px] rounded-2xl border border-white/20 bg-white/15 p-4 text-center text-white backdrop-blur-md">
              <span className="block text-2xl font-black leading-none">
                {isLoading ? "…" : semesters.length}
              </span>
              <span className="text-[11px] font-medium text-white/80">Học kỳ</span>
            </div>
            <div className="min-w-[110px] rounded-2xl border border-white/20 bg-white/15 p-4 text-center text-white backdrop-blur-md">
              <span className="block text-2xl font-black leading-none">
                {isLoading ? "…" : apiCourses.length}
              </span>
              <span className="text-[11px] font-medium text-white/80">Lớp ACTIVE</span>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-64 animate-pulse rounded-2xl bg-muted/60" />
          ))}
        </div>
      ) : isError ? (
        <Card className="rounded-2xl border border-dashed border-destructive/30 p-8 text-center">
          <p className="text-sm font-semibold">Không tải được danh sách khóa học</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {getApiErrorMessage(error, "Vui lòng thử lại.")}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            className="mt-3 cursor-pointer text-xs"
          >
            Thử lại
          </Button>
        </Card>
      ) : apiCourses.length === 0 ? (
        <Card className="flex flex-col items-center justify-center space-y-3 rounded-3xl border border-dashed border-border bg-card/40 px-4 py-16 text-center">
          <BookOpenIcon className="size-8 text-muted-foreground/50" />
          <h3 className="text-base font-bold">Bạn chưa có lớp học phần ACTIVE</h3>
          <p className="max-w-sm text-xs text-muted-foreground">
            Khi hoàn tất ghi danh, các lớp ACTIVE sẽ xuất hiện tại đây.
          </p>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">Danh sách khóa học theo học kỳ</h2>
                {currentSemester && (
                  <Badge variant="outline" className="bg-primary/5 font-mono text-xs font-bold text-primary">
                    {currentSemester.name} ({currentSemester.code})
                  </Badge>
                )}
              </div>
              <div className="relative w-full sm:w-64">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Tìm môn học, mã lớp..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="h-9 rounded-xl border-border/80 bg-card pl-9 text-xs"
                />
              </div>
            </div>

            {semesters.length > 0 && (
              <SemesterTabs
                semesters={semesters}
                activeSemesterCode={activeSemesterCode}
                onSelectSemester={(code) => {
                  setSelectedSemesterCode(code);
                  setSearchQuery("");
                }}
              />
            )}
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="text-xs font-semibold text-muted-foreground">
              Tìm thấy <strong className="text-foreground">{filteredCourses.length}</strong> /{" "}
              {totalCoursesInSemester} khóa học
            </span>
          </div>

          {mappedCourses.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {mappedCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onSelectCourse={onSelectCourse}
                  onViewTeam={() => setTeamCourseId(course.courseId || course.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 rounded-3xl border border-dashed border-border bg-card/40 px-4 py-16 text-center">
              <UsersIcon className="size-8 text-muted-foreground/40" />
              <div className="max-w-sm space-y-1">
                <h3 className="text-base font-bold">Không tìm thấy khóa học phù hợp</h3>
                <p className="text-xs text-muted-foreground">
                  Thử đổi từ khóa hoặc chọn học kỳ khác.
                </p>
              </div>
              {searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="cursor-pointer gap-1.5 rounded-xl text-xs"
                >
                  <FilterXIcon className="h-3.5 w-3.5" />
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          )}
        </>
      )}

      <StudentMyTeamPanel
        courseId={teamCourseId}
        onClose={() => setTeamCourseId(null)}
      />
    </div>
  );
}
