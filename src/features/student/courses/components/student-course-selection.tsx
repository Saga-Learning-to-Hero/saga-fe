"use client";

import { useState, useMemo } from "react";
import {
  SearchIcon,
  BookOpenIcon,
  SparklesIcon,
  FilterXIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SemesterTabs } from "./semester-tabs";
import { CourseCard } from "./course-card";
import {
  MOCK_STUDENT_SEMESTERS,
  MOCK_STUDENT_COURSES,
} from "../data/mock-student-courses";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import type { StudentCourse } from "../types/student-course";

interface StudentCourseSelectionProps {
  onSelectCourse?: (course: StudentCourse) => void;
}

export function StudentCourseSelection({ onSelectCourse }: StudentCourseSelectionProps) {
  const { user } = useAuthStore();
  const [selectedSemesterCode, setSelectedSemesterCode] = useState<string>("FA26");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "IN_PROGRESS" | "COMPLETED">("ALL");

  // Tìm đối tượng học kỳ hiện tại đang chọn
  const currentSemester = useMemo(
    () =>
      MOCK_STUDENT_SEMESTERS.find((s) => s.code === selectedSemesterCode) ||
      MOCK_STUDENT_SEMESTERS[0],
    [selectedSemesterCode]
  );

  // Filter danh sách khóa học theo Học kỳ & Từ khóa tìm kiếm & Trạng thái
  const filteredCourses = useMemo(() => {
    return MOCK_STUDENT_COURSES.filter((course) => {
      // 1. Lọc theo mã học kỳ
      const matchSemester = course.semesterCode === selectedSemesterCode;

      // 2. Lọc theo từ khóa tìm kiếm (tên môn, mã môn, tên giảng viên, mã lớp)
      const query = searchQuery.toLowerCase().trim();
      const matchQuery =
        !query ||
        course.subjectName.toLowerCase().includes(query) ||
        course.subjectCode.toLowerCase().includes(query) ||
        course.code.toLowerCase().includes(query) ||
        course.lecturer.fullName.toLowerCase().includes(query) ||
        course.adminClassCode.toLowerCase().includes(query);

      // 3. Lọc theo trạng thái
      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "IN_PROGRESS" && course.status === "IN_PROGRESS") ||
        (statusFilter === "COMPLETED" && course.status === "COMPLETED");

      return matchSemester && matchQuery && matchStatus;
    });
  }, [selectedSemesterCode, searchQuery, statusFilter]);

  // Thống kê nhanh số lượng khóa học
  const totalCoursesInSemester = useMemo(() => {
    return MOCK_STUDENT_COURSES.filter((c) => c.semesterCode === selectedSemesterCode).length;
  }, [selectedSemesterCode]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* ── Banner Chào mừng Sinh viên ───────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-border/80 shadow-md"
        style={{
          background:
            "linear-gradient(135deg, oklch(from var(--saga-primary) calc(l + 0.05) c h), oklch(from var(--saga-accent) calc(l - 0.05) c h))",
        }}
      >
        {/* Họa tiết trang trí mềm mại */}
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-15"
          style={{ background: "oklch(1 0 0 / 20%)" }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-10"
          style={{ background: "oklch(1 0 0 / 20%)" }}
        />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 hover:bg-white/25 text-white border-0 text-xs px-3 py-1 font-semibold backdrop-blur-sm">
                <SparklesIcon className="w-3.5 h-3.5 mr-1" />
                Cổng chọn học phần & Khóa học SAGA
              </Badge>
              <Badge className="bg-emerald-500/20 text-white border-0 text-xs font-mono">
                MSSV: HE170504
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Xin chào, {user?.name || "Lê Hoàng Hải"}! 👋
            </h1>
            <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
              Vui lòng chọn khóa học theo từng học kỳ để truy cập Dashboard tiến độ đồ án và quản lý học tập.
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-white text-center min-w-[110px]">
              <span className="text-2xl font-black block leading-none">{MOCK_STUDENT_SEMESTERS.length}</span>
              <span className="text-[11px] text-white/80 font-medium">Học kỳ</span>
            </div>
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-white text-center min-w-[110px]">
              <span className="text-2xl font-black block leading-none">{MOCK_STUDENT_COURSES.length}</span>
              <span className="text-[11px] text-white/80 font-medium">Tổng khóa học</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section Header: Tiêu đề & Chọn Học kỳ (Menu Tabs + Dropdown) ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                Danh sách khóa học theo Học kỳ
              </h2>
              <Badge variant="outline" className="font-mono text-xs font-bold text-primary bg-primary/5">
                {currentSemester.name} ({currentSemester.code})
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Hiển thị 5 kỳ mới nhất trên thanh Tab, các kỳ cũ hơn nằm trong Menu Dropdown.
            </p>
          </div>

          {/* Controls tìm kiếm & lọc */}
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Tìm môn học, giảng viên, lớp..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl bg-card border-border/80"
              />
            </div>
          </div>
        </div>

        {/* ── Category Menu Tabs (5 kỳ mới nhất + Dropdown các kỳ cũ) ──── */}
        <SemesterTabs
          semesters={MOCK_STUDENT_SEMESTERS}
          activeSemesterCode={selectedSemesterCode}
          onSelectSemester={(code) => {
            setSelectedSemesterCode(code);
            setSearchQuery(""); // Clear search when switching semester
          }}
        />
      </div>

      {/* ── Summary & Status Filter Bar ───────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <span className="text-xs font-semibold text-muted-foreground">
          Tìm thấy <strong className="text-foreground">{filteredCourses.length}</strong> / {totalCoursesInSemester} khóa học trong học kỳ <span className="text-primary font-mono">{selectedSemesterCode}</span>
        </span>

        {/* Status filter toggle pills */}
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl text-xs">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              statusFilter === "ALL"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setStatusFilter("IN_PROGRESS")}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              statusFilter === "IN_PROGRESS"
                ? "bg-card text-blue-600 dark:text-blue-400 shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Đang học
          </button>
          <button
            onClick={() => setStatusFilter("COMPLETED")}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              statusFilter === "COMPLETED"
                ? "bg-card text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Đã kết thúc
          </button>
        </div>
      </div>

      {/* ── Grid Danh sách Khóa học dạng Card ─────────────────────────── */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onSelectCourse={onSelectCourse}
            />
          ))}
        </div>
      ) : (
        /* Trạng thái Rỗng (Empty State) */
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-3xl border border-dashed border-border bg-card/40 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
            <BookOpenIcon className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="text-base font-bold text-foreground">
              Không tìm thấy khóa học phù hợp
            </h3>
            <p className="text-xs text-muted-foreground">
              {searchQuery
                ? `Không có khóa học nào khớp với từ khóa "${searchQuery}" trong học kỳ ${selectedSemesterCode}.`
                : `Học kỳ ${selectedSemesterCode} hiện chưa có dữ liệu khóa học.`}
            </p>
          </div>
          {(searchQuery || statusFilter !== "ALL") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
              }}
              className="text-xs gap-1.5 rounded-xl cursor-pointer"
            >
              <FilterXIcon className="w-3.5 h-3.5" />
              Xóa bộ lọc
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
