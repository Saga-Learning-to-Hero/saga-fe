"use client";

import { useEffect, useMemo, useState } from "react";
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
import { TablePagination } from "@/components/common/table-pagination";
import { SemesterTabs } from "./semester-tabs";
import { CourseCard } from "./course-card";
import { StudentMyTeamPanel } from "./student-my-team-panel";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import {
  useStudentCourses,
  useStudentCoursesPaged,
} from "../hooks/use-student-courses";
import {
  mapStudentCourseResponse,
  type StudentCourse,
  type StudentCourseResponse,
  type StudentSemester,
} from "../types/student-course";
import { getApiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";

const PAGE_SIZE_OPTIONS = [9, 18, 36];
const DEFAULT_PAGE_SIZE = 9;
const SEARCH_DEBOUNCE_MS = 350;

interface StudentCourseSelectionProps {
  onSelectCourse?: (course: StudentCourse) => void;
}

function buildSemesterTabs(courses: StudentCourseResponse[]): StudentSemester[] {
  const map = new Map<string, StudentSemester>();
  for (const course of courses) {
    const semesterId = course.semesterId?.trim();
    if (!semesterId) continue;
    const existing = map.get(semesterId);
    if (existing) {
      existing.totalCourses += 1;
    } else {
      map.set(semesterId, {
        id: semesterId,
        code: course.semesterCode,
        name: course.semesterName,
        status: "ACTIVE",
        totalCourses: 1,
      });
    }
  }
  return Array.from(map.values());
}

function countSemesters(courses: StudentCourseResponse[]): number {
  return new Set(courses.map((course) => course.semesterCode).filter(Boolean)).size;
}

export function StudentCourseSelection({ onSelectCourse }: StudentCourseSelectionProps) {
  const { user } = useAuthStore();
  const { data: allCourses = [], isLoading: isListLoading } = useStudentCourses();
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [teamCourseId, setTeamCourseId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const pagedParams = useMemo(
    () => ({
      page: Math.max(0, page - 1),
      size: pageSize,
      semesterId: selectedSemesterId || undefined,
      search: debouncedSearch || undefined,
    }),
    [page, pageSize, selectedSemesterId, debouncedSearch]
  );

  const {
    data: paged,
    isLoading,
    isError,
    error,
    refetch,
    isPlaceholderData,
  } = useStudentCoursesPaged(pagedParams);

  const items = paged?.items ?? [];
  const total = paged?.total ?? 0;

  if (paged) {
    const totalPages = Math.max(1, Math.ceil(paged.total / pageSize));
    if (page > totalPages) {
      setPage(totalPages);
    }
  }

  const semesters = useMemo(() => buildSemesterTabs(allCourses), [allCourses]);
  const currentSemester = semesters.find((semester) => semester.id === selectedSemesterId);
  const hasActiveFilters = Boolean(selectedSemesterId || debouncedSearch);
  const mappedCourses = items.map(mapStudentCourseResponse);
  const isInitialLoading = isLoading && !paged;

  const handleSelectSemester = (semesterId: string) => {
    setSelectedSemesterId(semesterId);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setSelectedSemesterId("");
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-10">
      <div className="relative overflow-hidden rounded-xl border border-border/80 bg-card p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 size-72 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl space-y-2.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary shadow-xs">
              <SparklesIcon className="size-3.5 text-primary" />
              <span>Không gian Học tập & Đồ án SAGA</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              Xin chào,{" "}
              <span className="saga-brand-gradient font-black">
                {user?.fullName || user?.name || "Sinh viên"}
              </span>
            </h1>
            <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Danh sách các môn học bạn đang theo học trong kỳ. Chọn một lớp học phần để vào không gian dự án và theo dõi tiến độ nhóm.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <div className="min-w-[120px] rounded-xl border border-border/80 bg-muted/30 p-4 text-center">
              <span className="block font-mono text-2xl font-black text-foreground">
                {isListLoading ? "…" : countSemesters(allCourses)}
              </span>
              <span className="mt-1 block text-xs font-semibold text-muted-foreground">Học kỳ</span>
            </div>
            <div className="min-w-[120px] rounded-xl border border-border/80 bg-muted/30 p-4 text-center">
              <span className="block font-mono text-2xl font-black text-foreground">
                {isListLoading ? "…" : allCourses.length}
              </span>
              <span className="mt-1 block text-xs font-semibold text-muted-foreground">Lớp đang học</span>
            </div>
          </div>
        </div>
      </div>

      {isInitialLoading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-64 animate-pulse rounded-xl bg-muted/60" />
          ))}
        </div>
      ) : isError ? (
        <Card className="rounded-xl border border-dashed border-destructive/30 p-8 text-center">
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
      ) : !hasActiveFilters && total === 0 ? (
        <Card className="flex flex-col items-center justify-center space-y-3 rounded-xl border border-dashed border-border bg-card/40 px-4 py-16 text-center">
          <BookOpenIcon className="size-8 text-muted-foreground/50" />
          <h3 className="text-base font-bold">Bạn chưa có lớp học phần nào</h3>
          <p className="max-w-sm text-xs text-muted-foreground">
            Khi hoàn tất ghi danh, các lớp học phần trong kỳ sẽ xuất hiện tại đây.
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
                activeSemesterId={selectedSemesterId}
                includeAll
                onSelectSemester={handleSelectSemester}
              />
            )}
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="text-xs font-semibold text-muted-foreground">
              Tìm thấy <strong className="text-foreground">{total}</strong> lớp học phần
            </span>
          </div>

          {mappedCourses.length > 0 ? (
            <div
              className={cn(
                "space-y-5 transition-opacity",
                isPlaceholderData && "pointer-events-none opacity-60"
              )}
            >
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
              <TablePagination
                page={page}
                pageSize={pageSize}
                totalItems={total}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                itemLabel="lớp học phần"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 rounded-xl border border-dashed border-border bg-card/40 px-4 py-16 text-center">
              <UsersIcon className="size-8 text-muted-foreground/40" />
              <div className="max-w-sm space-y-1">
                <h3 className="text-base font-bold">Không tìm thấy khóa học phù hợp</h3>
                <p className="text-xs text-muted-foreground">
                  Thử đổi từ khóa hoặc chọn học kỳ khác.
                </p>
              </div>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
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
