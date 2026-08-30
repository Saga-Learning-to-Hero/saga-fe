"use client";

import { useMemo, useState } from "react";
import { BookOpenIcon, FolderKanbanIcon, SearchIcon, UsersIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CourseCard } from "./course-card";
import { SemesterTabs } from "./semester-tabs";
import { MOCK_LECTURER_COURSES, MOCK_LECTURER_SEMESTERS } from "../data/mock-courses";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

export function LecturerCoursesPage() {
  const { user } = useAuthStore();
  const [selectedSemesterCode, setSelectedSemesterCode] = useState("FA26");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ALL");

  const filteredCourses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return MOCK_LECTURER_COURSES.filter((c) => {
      if (c.semesterId !== selectedSemesterCode) return false;
      if (q && !`${c.code} ${c.name}`.toLowerCase().includes(q)) return false;
      if (statusFilter === "ACTIVE" && c.status !== "ACTIVE" && c.status !== "IN_PROGRESS") return false;
      if (statusFilter === "COMPLETED" && c.status !== "COMPLETED") return false;
      return true;
    });
  }, [selectedSemesterCode, searchQuery, statusFilter]);

  const totalInSemester = useMemo(
    () => MOCK_LECTURER_COURSES.filter((c) => c.semesterId === selectedSemesterCode).length,
    [selectedSemesterCode]
  );
  const totalStudents = filteredCourses.reduce((s, c) => s + (c.studentsCount || c.studentCount || 0), 0);
  const totalGroups = filteredCourses.reduce((s, c) => s + (c.groupsCount || c.groupCount || 0), 0);

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 pb-12">

      {/* ── Hero ───────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary to-primary/70 px-7 py-8 text-white shadow-lg">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 size-48 rounded-full bg-white/10 blur-2xl" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* left */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/60">
              Không gian giảng dạy
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Xin chào, {user?.name ?? "Thầy/Cô"} 👋
            </h1>
            <p className="max-w-lg text-sm text-white/75">
              Chọn một lớp để vào không gian giảng dạy và theo dõi tiến độ đồ án của sinh viên.
            </p>
          </div>

          {/* right: KPI chips */}
          <div className="flex shrink-0 flex-wrap gap-3">
            {[
              { icon: <BookOpenIcon className="size-4" />, label: "Lớp học", value: filteredCourses.length },
              { icon: <UsersIcon className="size-4" />, label: "Sinh viên", value: totalStudents },
              { icon: <FolderKanbanIcon className="size-4" />, label: "Nhóm dự án", value: totalGroups },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/20">{icon}</span>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-white/60">{label}</span>
                  <span className="text-xl font-black tabular-nums">{value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Semester tabs ──────────────────────────────────────── */}
      <div className="space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Học kỳ
        </p>
        <SemesterTabs
          semesters={MOCK_LECTURER_SEMESTERS}
          selectedSemesterCode={selectedSemesterCode}
          onSelectSemester={setSelectedSemesterCode}
        />
      </div>

      {/* ── Toolbar ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* search */}
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm mã môn, tên lớp học phần..."
            className="h-9 rounded-xl pl-9 text-xs"
          />
        </div>

        {/* status pills */}
        <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/50 p-1 text-xs">
          {(["ALL", "ACTIVE", "COMPLETED"] as const).map((s) => {
            const labels: Record<typeof s, string> = { ALL: `Tất cả (${totalInSemester})`, ACTIVE: "Đang dạy", COMPLETED: "Đã kết thúc" };
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={[
                  "rounded-lg px-3 py-1.5 font-semibold transition-all",
                  statusFilter === s
                    ? "bg-card shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {labels[s]}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Grid ───────────────────────────────────────────────── */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="grid min-h-52 place-items-center rounded-2xl border border-dashed border-border bg-card">
          <div className="text-center">
            <SearchIcon className="mx-auto mb-3 size-8 text-muted-foreground/40" />
            <p className="text-sm font-semibold">Không tìm thấy lớp học</p>
            <p className="mt-1 text-xs text-muted-foreground">Thử đổi từ khóa hoặc bộ lọc.</p>
            <button
              onClick={() => { setSearchQuery(""); setStatusFilter("ALL"); }}
              className="mt-3 rounded-lg px-4 py-1.5 text-xs font-semibold border border-border hover:bg-muted transition-colors"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
