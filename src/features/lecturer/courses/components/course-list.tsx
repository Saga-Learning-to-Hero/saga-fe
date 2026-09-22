"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  BookOpenIcon,
  CalendarIcon,
  FileTextIcon,
  GraduationCapIcon,
  SearchIcon,
  SparklesIcon,
  UsersIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import {
  useLecturerCourses,
  usePrefetchLecturerCourse,
} from "../hooks/use-lecturer-courses";
import { lecturerCourseDashboardPath } from "../lib/course-routes";
import type { LecturerCourseResponse } from "../types/lecturer-course";
import { getApiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";

function CourseListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card
          key={index}
          className="animate-pulse rounded-2xl border border-border/70 bg-card p-6 shadow-xs"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="size-10 rounded-xl bg-muted" />
              <div className="h-5 w-24 rounded-lg bg-muted" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-20 rounded bg-muted" />
              <div className="h-6 w-3/4 rounded bg-muted" />
            </div>
            <div className="h-20 rounded-xl bg-muted/50" />
            <div className="h-10 w-full rounded-xl bg-muted" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function CourseListCard({
  course,
  onPrefetch,
}: {
  course: LecturerCourseResponse;
  onPrefetch: (courseId: string) => void;
}) {
  const href = lecturerCourseDashboardPath(course.id);
  const subjectLabel = course.subjectName || course.name;
  const classLabel = course.classCode || course.className || "Chưa gắn lớp niên khóa";
  const semesterLabel = course.semesterName
    ? `${course.semesterName} (${course.semesterCode || ""})`
    : course.semesterCode || "Học kỳ hiện tại";

  return (
    <Card
      onMouseEnter={() => {
        onPrefetch(course.id);
      }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/80 via-primary to-accent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

      <CardContent className="space-y-4 p-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-sm">
            <BookOpenIcon className="size-6" />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <Badge
              variant="outline"
              className="border-primary/30 bg-primary/5 px-2.5 py-0.5 font-mono text-xs font-bold text-primary"
            >
              {course.courseCode}
            </Badge>
            <Badge
              variant="secondary"
              className="border border-border/60 bg-muted/60 px-2.5 py-0.5 font-mono text-xs font-semibold text-foreground"
            >
              {classLabel}
            </Badge>
          </div>
        </div>

        <div>
          {course.subjectCode && (
            <p className="mb-1 font-mono text-xs font-extrabold tracking-wider text-primary">
              {course.subjectCode}
            </p>
          )}
          <h3 className="line-clamp-2 text-base font-extrabold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-lg">
            {subjectLabel}
          </h3>
        </div>

        <div className="space-y-2 rounded-xl border border-border/60 bg-muted/25 p-3.5 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarIcon className="size-3.5 shrink-0 text-primary" />
            <span className="truncate font-medium">{semesterLabel}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <UsersIcon className="size-3.5 shrink-0 text-primary" />
            <span className="truncate font-medium">Lớp sinh viên: {classLabel}</span>
          </div>
          {course.syllabusVersionLabel && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileTextIcon className="size-3.5 shrink-0 text-primary" />
              <span className="truncate font-mono font-medium">
                Đề cương: {course.syllabusVersionLabel}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <div className="mt-5 border-t border-border/60 pt-4">
        <Link href={href} prefetch={true} className="block">
          <Button className="h-10 w-full cursor-pointer gap-2 rounded-xl text-xs font-bold shadow-xs">
            Vào không gian lớp
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}

export function CourseList() {
  const { user } = useAuthStore();
  const { data: courses = [], isLoading, isError, error, refetch } = useLecturerCourses();
  const prefetchCourse = usePrefetchLecturerCourse();
  const [selectedSemester, setSelectedSemester] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const deferredQuery = useDeferredValue(searchQuery);

  const semesters = useMemo(() => {
    const map = new Map<string, { code: string; name: string; count: number }>();
    for (const c of courses) {
      const code = c.semesterCode || "OTHER";
      const name = c.semesterName || c.semesterCode || "Học kỳ khác";
      const existing = map.get(code);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(code, { code, name, count: 1 });
      }
    }
    return Array.from(map.values());
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const query = deferredQuery.toLowerCase().trim();
    return courses.filter((course) => {
      const matchSemester =
        selectedSemester === "ALL" ||
        course.semesterCode === selectedSemester ||
        (!course.semesterCode && selectedSemester === "OTHER");
      const matchQuery =
        !query ||
        `${course.courseCode} ${course.name} ${course.subjectCode ?? ""} ${course.subjectName ?? ""} ${course.classCode ?? ""} ${course.semesterCode ?? ""} ${course.semesterName ?? ""}`
          .toLowerCase()
          .includes(query);
      return matchSemester && matchQuery;
    });
  }, [courses, deferredQuery, selectedSemester]);

  const displayName = user?.fullName || user?.name || "Giảng viên";

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 pb-12">
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 size-72 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl space-y-2.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary shadow-xs">
              <SparklesIcon className="size-3.5 text-primary" />
              <span>Hệ thống Giám sát & Đánh giá Đồ án SAGA</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              Không gian Giảng dạy của{" "}
              <span className="bg-gradient-to-r from-primary via-indigo-600 to-cyan-500 bg-clip-text text-transparent dark:from-indigo-400 dark:via-primary dark:to-cyan-300">
                {displayName}
              </span>
            </h1>
            <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Chọn lớp học phần phụ trách để theo dõi sức khỏe các nhóm, kiểm tra tiến độ Sprint, đối soát nguồn gốc mã nguồn Git và đánh giá tỷ lệ đóng góp thực tế của sinh viên.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
            <div className="min-w-[130px] rounded-2xl border border-border/80 bg-muted/30 p-4 text-center">
              <span className="block font-mono text-2xl font-black text-foreground">
                {isLoading ? "…" : courses.length}
              </span>
              <span className="mt-1 block text-xs font-semibold text-muted-foreground">
                Lớp học phần
              </span>
            </div>
            <div className="min-w-[130px] rounded-2xl border border-border/80 bg-muted/30 p-4 text-center">
              <span className="block font-mono text-2xl font-black text-foreground">
                {isLoading ? "…" : (semesters.length > 0 ? semesters.length : 1)}
              </span>
              <span className="mt-1 block text-xs font-semibold text-muted-foreground">
                Học kỳ hoạt động
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {semesters.length > 1 ? (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedSemester("ALL")}
              className={cn(
                "cursor-pointer shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-all",
                selectedSemester === "ALL"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              Tất cả ({courses.length})
            </button>
            {semesters.map((s) => (
              <button
                key={s.code}
                type="button"
                onClick={() => setSelectedSemester(s.code)}
                className={cn(
                  "cursor-pointer shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-all",
                  selectedSemester === s.code
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {s.name} ({s.count})
              </button>
            ))}
          </div>
        ) : <div />}

        <div className="relative w-full sm:max-w-xs">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Tìm mã lớp học phần, môn học, lớp..."
            className="h-10 rounded-xl pl-9 text-xs"
          />
        </div>
      </div>

      {isLoading ? (
        <CourseListSkeleton />
      ) : isError ? (
        <Card className="rounded-2xl border border-dashed border-destructive/30 p-8 text-center">
          <p className="text-sm font-semibold text-foreground">Không tải được danh sách lớp học phần</p>
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
      ) : courses.length === 0 ? (
        <Card className="grid min-h-60 place-items-center rounded-2xl border border-dashed border-border bg-card p-8">
          <div className="text-center">
            <GraduationCapIcon className="mx-auto mb-3 size-10 text-muted-foreground/40" />
            <p className="text-sm font-semibold text-foreground">Bạn chưa được phân công lớp học phần nào</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Khi quản trị viên phân công lớp giảng dạy, danh sách sẽ hiển thị tại đây.
            </p>
          </div>
        </Card>
      ) : filteredCourses.length === 0 ? (
        <Card className="grid min-h-60 place-items-center rounded-2xl border border-dashed border-border bg-card p-8">
          <div className="text-center">
            <SearchIcon className="mx-auto mb-3 size-10 text-muted-foreground/40" />
            <p className="text-sm font-semibold text-foreground">Không tìm thấy lớp học phần phù hợp</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Vui lòng thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="mt-4 cursor-pointer text-xs"
            >
              Xóa bộ lọc
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseListCard key={course.id} course={course} onPrefetch={prefetchCourse} />
          ))}
        </div>
      )}
    </div>
  );
}
