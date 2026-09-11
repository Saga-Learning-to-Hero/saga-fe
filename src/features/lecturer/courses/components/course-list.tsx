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
      {Array.from({ length: 3 }).map((_, index) => (
        <Card
          key={index}
          className="animate-pulse rounded-2xl border border-border bg-card p-5 shadow-xs"
        >
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="h-5 w-28 rounded bg-muted" />
              <div className="h-5 w-16 rounded bg-muted" />
            </div>
            <div className="h-6 w-3/4 rounded bg-muted" />
            <div className="h-16 rounded-2xl bg-muted/60" />
            <div className="h-9 w-full rounded-xl bg-muted" />
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
  const classLabel = course.classCode || course.className || "Chưa gắn lớp sinh viên";
  const semesterLabel = course.semesterName
    ? `${course.semesterName} (${course.semesterCode || ""})`
    : course.semesterCode || "Học kỳ hiện tại";

  return (
    <Card
      onMouseEnter={() => {
        onPrefetch(course.id);
      }}
      className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-card/90 p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg sm:p-6"
    >
      <CardContent className="space-y-4 p-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <BookOpenIcon className="size-5" />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <Badge
              variant="outline"
              className="border-primary/25 bg-primary/5 px-2.5 py-0.5 font-mono text-xs font-bold text-primary"
            >
              {course.courseCode}
            </Badge>
            <Badge
              variant="secondary"
              className="bg-muted px-2.5 py-0.5 font-mono text-xs font-semibold text-foreground"
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

        <div className="space-y-2 rounded-xl border border-border/60 bg-muted/30 p-3 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarIcon className="size-3.5 shrink-0 text-primary/70" />
            <span className="truncate font-medium">{semesterLabel}</span>
          </div>
          {course.syllabusVersionLabel && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileTextIcon className="size-3.5 shrink-0 text-primary/70" />
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

  const displayName = user?.fullName || user?.name || "Thầy/Cô";

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 pb-12">
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary to-primary/70 px-7 py-8 text-white shadow-lg sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl space-y-2">
            <Badge className="border-0 bg-white/20 px-3 py-1 text-xs font-semibold text-white">
              <SparklesIcon className="mr-1 h-3.5 w-3.5" />
              Không gian giảng dạy SAGA
            </Badge>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Xin chào, {displayName}
            </h1>
            <p className="text-xs leading-relaxed text-white/80 sm:text-sm">
              Chọn một lớp học phần được phân công để theo dõi tổng quan sĩ số, quản lý phân nhóm đồ án và giám sát tiến độ thực hiện.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <div className="min-w-[110px] rounded-2xl border border-white/20 bg-white/15 p-4 text-center text-white backdrop-blur-md">
              <span className="block text-2xl font-black leading-none">
                {isLoading ? "…" : courses.length}
              </span>
              <span className="mt-1 block text-[11px] font-semibold text-white/75">
                Lớp phụ trách
              </span>
            </div>
            {semesters.length > 0 && (
              <div className="min-w-[110px] rounded-2xl border border-white/20 bg-white/15 p-4 text-center text-white backdrop-blur-md">
                <span className="block text-2xl font-black leading-none">
                  {isLoading ? "…" : semesters.length}
                </span>
                <span className="mt-1 block text-[11px] font-semibold text-white/75">
                  Học kỳ
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {semesters.length > 1 ? (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedSemester("ALL")}
              className={cn(
                "rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer shrink-0",
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
                  "rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer shrink-0",
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
          <SearchIcon className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Tìm mã lớp học phần, môn, lớp..."
            className="h-9 rounded-xl pl-9 text-xs"
          />
        </div>
      </div>

      {isLoading ? (
        <CourseListSkeleton />
      ) : isError ? (
        <Card className="rounded-2xl border border-dashed border-destructive/30 p-8 text-center">
          <p className="text-sm font-semibold text-foreground">Không tải được danh sách lớp</p>
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
        <Card className="grid min-h-52 place-items-center rounded-2xl border border-dashed border-border bg-card p-8">
          <div className="text-center">
            <GraduationCapIcon className="mx-auto mb-3 size-8 text-muted-foreground/40" />
            <p className="text-sm font-semibold">Bạn chưa được phân công lớp học phần nào.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Khi quản trị viên gán lớp, danh sách sẽ xuất hiện tại đây.
            </p>
          </div>
        </Card>
      ) : filteredCourses.length === 0 ? (
        <Card className="grid min-h-52 place-items-center rounded-2xl border border-dashed border-border bg-card p-8">
          <div className="text-center">
            <SearchIcon className="mx-auto mb-3 size-8 text-muted-foreground/40" />
            <p className="text-sm font-semibold">Không tìm thấy lớp học phần phù hợp</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="mt-3 cursor-pointer text-xs"
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
