"use client";

import { useMemo, useState } from "react";
import {
  BookOpenIcon,
  SearchIcon,
  SparklesIcon,
  UsersIcon,
  FolderKanbanIcon,
  FilterXIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SemesterTabs } from "./semester-tabs";
import { CourseCard } from "./course-card";
import {
  MOCK_LECTURER_COURSES,
  MOCK_LECTURER_SEMESTERS,
} from "../data/mock-courses";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

export function LecturerCoursesPage() {
  const { user } = useAuthStore();
  const [selectedSemesterCode, setSelectedSemesterCode] = useState<string>("FA26");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ALL");

  // Current Semester info
  const currentSemester = useMemo(
    () =>
      MOCK_LECTURER_SEMESTERS.find((s) => s.code === selectedSemesterCode) ||
      MOCK_LECTURER_SEMESTERS[0],
    [selectedSemesterCode]
  );

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return MOCK_LECTURER_COURSES.filter((course) => {
      // 1. Semester code match
      const matchSemester = course.semesterId === selectedSemesterCode;

      // 2. Search query match
      const query = searchQuery.toLowerCase().trim();
      const matchQuery =
        !query ||
        course.name.toLowerCase().includes(query) ||
        course.code.toLowerCase().includes(query) ||
        course.room.toLowerCase().includes(query) ||
        course.schedule.toLowerCase().includes(query);

      // 3. Status filter match
      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && course.status === "ACTIVE") ||
        (statusFilter === "COMPLETED" && course.status === "COMPLETED");

      return matchSemester && matchQuery && matchStatus;
    });
  }, [selectedSemesterCode, searchQuery, statusFilter]);

  // Overall Statistics for current semester
  const totalCoursesInSemester = useMemo(() => {
    return MOCK_LECTURER_COURSES.filter((c) => c.semesterId === selectedSemesterCode).length;
  }, [selectedSemesterCode]);

  const totalStudents = useMemo(() => {
    return filteredCourses.reduce((sum, c) => sum + c.studentCount, 0);
  }, [filteredCourses]);

  const totalGroups = useMemo(() => {
    return filteredCourses.reduce((sum, c) => sum + c.groupCount, 0);
  }, [filteredCourses]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* ── Top Hero Banner (Matching Student Style) ────────────────── */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-border/80 shadow-md text-white"
        style={{
          background:
            "linear-gradient(135deg, oklch(from var(--saga-primary) calc(l + 0.05) c h), oklch(from var(--saga-accent) calc(l - 0.05) c h))",
        }}
      >
        {/* Ambient background blur elements */}
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
                Không Gian Giảng Dạy & Điều Phối Đồ Án SAGA
              </Badge>
              <Badge className="bg-emerald-500/30 text-white border-0 text-xs font-mono">
                GV: {user?.name || "TS. Nguyễn Văn A"}
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Chào mừng Thầy/Cô trở lại SAGA Capstone
            </h1>

            <p className="text-white/85 text-xs sm:text-sm font-medium leading-relaxed">
              Quản lý các lớp học phần, theo dõi tiến độ sprint của các nhóm đồ án, kiểm tra đối soát ma trận đóng góp và chất lượng code của sinh viên trong kỳ <strong>{currentSemester.name} ({currentSemester.code})</strong>.
            </p>
          </div>

          {/* Quick Metrics Badge in Hero */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                <BookOpenIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-white/80 block">Lớp Đang Dạy</span>
                <span className="text-xl sm:text-2xl font-black text-white font-mono">{filteredCourses.length} Lớp</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                <UsersIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-white/80 block">Tổng Sinh Viên</span>
                <span className="text-xl sm:text-2xl font-black text-white font-mono">{totalStudents} SV</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                <FolderKanbanIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-white/80 block">Nhóm Đồ Án</span>
                <span className="text-xl sm:text-2xl font-black text-white font-mono">{totalGroups} Nhóm</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Semester Tabs Filter ────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Chọn Học Kỳ Giảng Dạy:
          </label>
          <span className="text-xs text-muted-foreground">
            Hiển thị <strong>{totalCoursesInSemester}</strong> lớp học phần
          </span>
        </div>
        <SemesterTabs
          semesters={MOCK_LECTURER_SEMESTERS}
          selectedSemesterCode={selectedSemesterCode}
          onSelectSemester={setSelectedSemesterCode}
        />
      </div>

      {/* ── Search Bar & Status Filter Pills ────────────────────────── */}
      <div className="p-4 rounded-3xl bg-card border border-border/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo tên môn, mã môn, phòng học, lịch dạy..."
            className="pl-10 h-10 rounded-2xl text-xs bg-muted/30 border-border/60 focus-visible:ring-primary"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Xóa
            </button>
          )}
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-2xl border border-border/60 text-xs">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${statusFilter === "ALL"
              ? "bg-card text-foreground shadow-2xs"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Tất cả ({totalCoursesInSemester})
          </button>
          <button
            onClick={() => setStatusFilter("ACTIVE")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${statusFilter === "ACTIVE"
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-2xs"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Đang giảng dạy
          </button>
          <button
            onClick={() => setStatusFilter("COMPLETED")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${statusFilter === "COMPLETED"
              ? "bg-muted text-foreground border border-border shadow-2xs"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Đã kết thúc
          </button>
        </div>
      </div>

      {/* ── Courses Grid ────────────────────────────────────────────── */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        /* ── Empty State ── */
        <div className="p-12 rounded-3xl bg-card border border-dashed border-border text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <FilterXIcon className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">Không tìm thấy lớp học phần phù hợp</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Không có kết quả nào khớp với từ khóa tìm kiếm hoặc bộ lọc trạng thái trong học kỳ này.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("ALL");
            }}
            className="rounded-xl text-xs cursor-pointer"
          >
            Đặt lại bộ lọc
          </Button>
        </div>
      )}
    </div>
  );
}
