"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  BookOpenIcon,
  GraduationCapIcon,
  SearchIcon,
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
  const classLabel = course.classCode || course.className || "Chưa có lớp sinh viên niên khóa";
  const semesterLabel = course.semesterName
    ? `${course.semesterName} (${course.semesterCode || ""})`
    : course.semesterCode || "Chưa có học kỳ";

  return (
    <Card
      onMouseEnter={() => {
        onPrefetch(course.id);
      }}
      className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-card/90 p-5 shadow-xs transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg sm:p-6"
    >
      <CardContent className="space-y-3.5 p-0">
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="outline"
            className="border-primary/20 bg-primary/10 px-2.5 py-0.5 font-mono text-xs font-bold text-primary"
          >
            {course.courseCode}
          </Badge>
          <Badge
            variant="secondary"
            className="bg-secondary/70 px-2.5 py-0.5 font-mono text-xs font-semibold"
          >
            {classLabel}
          </Badge>
        </div>

        <div>
          {course.subjectCode && (
            <p className="mb-1 font-mono text-xs font-bold text-primary">{course.subjectCode}</p>
          )}
          <h3 className="line-clamp-2 text-lg font-extrabold leading-snug text-foreground transition-colors group-hover:text-primary">
            {subjectLabel}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">{semesterLabel}</p>
        </div>
      </CardContent>

      <div className="mt-4 border-t border-border/60 pt-4">
        <Link href={href} prefetch={true} className="block">
          <Button className="h-9.5 w-full cursor-pointer gap-2 rounded-xl text-xs font-bold">
            Mở tổng quan lớp
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
  const [searchQuery, setSearchQuery] = useState("");
  const deferredQuery = useDeferredValue(searchQuery);

  const filteredCourses = useMemo(() => {
    const query = deferredQuery.toLowerCase().trim();
    if (!query) return courses;
    return courses.filter((course) =>
      `${course.courseCode} ${course.name} ${course.subjectCode ?? ""} ${course.subjectName ?? ""} ${course.classCode ?? ""} ${course.semesterCode ?? ""} ${course.semesterName ?? ""}`
        .toLowerCase()
        .includes(query)
    );
  }, [courses, deferredQuery]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 pb-12">
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary to-primary/70 px-7 py-8 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/60">
              Không gian giảng dạy
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Xin chào, {user?.name ?? "Thầy/Cô"}
            </h1>
            <p className="max-w-lg text-sm text-white/75">
              Chọn một lớp được phân công để xem tổng quan, danh sách sinh viên đang học và phân nhóm.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <span className="grid size-8 place-items-center rounded-lg bg-white/20">
              <BookOpenIcon className="size-4" />
            </span>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-white/60">
                Lớp được phân công
              </span>
              <span className="text-xl font-black tabular-nums">
                {isLoading ? "…" : courses.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative w-full sm:max-w-xs">
        <SearchIcon className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Tìm mã lớp học phần, môn, lớp sinh viên niên khóa..."
          className="h-9 rounded-xl pl-9 text-xs"
        />
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
