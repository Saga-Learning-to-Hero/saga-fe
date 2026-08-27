"use client";

import { useMemo, useState } from "react";
import { BookOpenIcon, SearchIcon, SparklesIcon, UsersIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/common/custom-select";
import { CourseCard } from "./course-card";
import { MOCK_LECTURER_COURSES, SEMESTERS } from "../data/mock-courses";

export function LecturerCoursesPage() {
  const [semester, setSemester] = useState("FA26");
  const [search, setSearch] = useState("");

  const courses = useMemo(
    () =>
      MOCK_LECTURER_COURSES.filter(
        (course) =>
          course.semesterId === semester &&
          `${course.code} ${course.name}`
            .toLocaleLowerCase("vi")
            .includes(search.trim().toLocaleLowerCase("vi"))
      ),
    [semester, search]
  );

  const students = courses.reduce((total, c) => total + c.studentCount, 0);
  const groups = courses.reduce((total, c) => total + c.groupCount, 0);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Page heading */}
      <section className="space-y-1.5">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
          <SparklesIcon className="size-3" />
          Học kỳ {semester}
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Lớp học của tôi</h1>
        <p className="max-w-xl text-sm leading-6 text-muted-foreground">
          Chọn một lớp để vào không gian giảng dạy. Theo dõi tiến độ, nhóm dự án và mức đóng góp của sinh viên.
        </p>
      </section>

      {/* KPI strip */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-saga-xs">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <BookOpenIcon className="size-4" />
          </span>
          <div>
            <strong className="text-lg">{courses.length}</strong>
            <p className="text-xs text-muted-foreground">Lớp đang giảng dạy</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-saga-xs">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-success-muted text-success">
            <UsersIcon className="size-4" />
          </span>
          <div>
            <strong className="text-lg">{students}</strong>
            <p className="text-xs text-muted-foreground">Sinh viên</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-saga-xs">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-info-muted text-info">
            <UsersIcon className="size-4" />
          </span>
          <div>
            <strong className="text-lg">{groups}</strong>
            <p className="text-xs text-muted-foreground">Nhóm dự án</p>
          </div>
        </div>
      </section>

      {/* Course list */}
      <section>
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-bold">Danh sách lớp</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {courses.length} lớp trong học kỳ đã chọn
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative sm:w-56">
              <SearchIcon className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm mã hoặc tên lớp..."
                className="h-9 rounded-xl pl-9 text-xs"
              />
            </div>
            <div className="sm:w-52">
              <CustomSelect value={semester} onChange={setSemester} options={SEMESTERS} />
            </div>
          </div>
        </div>

        {courses.length ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-border bg-card">
            <div className="text-center px-4">
              <span className="mx-auto mb-3 grid size-11 place-items-center rounded-full bg-muted text-muted-foreground">
                <SearchIcon className="size-5" />
              </span>
              <h3 className="text-sm font-bold">Không tìm thấy lớp học</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Thử đổi từ khóa hoặc chọn một học kỳ khác.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
