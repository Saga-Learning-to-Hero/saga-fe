"use client";

import { useMemo, useState } from "react";
import { BellIcon, BookOpenIcon, PlusIcon, SearchIcon, SparklesIcon, UsersIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/common/custom-select";
import { CourseCard } from "./course-card";
import { MOCK_LECTURER_COURSES, SEMESTERS } from "../data/mock-courses";

export function LecturerCoursesPage() {
  const [semester, setSemester] = useState("FA26");
  const [search, setSearch] = useState("");

  const courses = useMemo(() => MOCK_LECTURER_COURSES.filter((course) =>
    course.semesterId === semester && `${course.code} ${course.name}`.toLocaleLowerCase("vi").includes(search.trim().toLocaleLowerCase("vi"))
  ), [semester, search]);
  const students = courses.reduce((total, course) => total + course.studentCount, 0);
  const groups = courses.reduce((total, course) => total + course.groupCount, 0);

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <header className="-mx-6 -mt-6 flex min-h-16 items-center justify-between border-b border-border bg-card px-6 shadow-saga-xs">
        <div><p className="text-xs font-bold tracking-tight">Không gian giảng dạy</p><p className="text-[10px] text-muted-foreground">Quản lý lớp học và hoạt động sinh viên</p></div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative size-9 rounded-full" aria-label="Thông báo"><BellIcon className="size-4" /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-destructive" /></Button>
          <div className="hidden h-7 w-px bg-border sm:block" />
          <Avatar size="sm"><AvatarFallback className="bg-primary/10 text-[10px] font-bold text-primary">LH</AvatarFallback></Avatar>
          <div className="hidden sm:block"><p className="text-[11px] font-bold">Lê Hoàng Hải</p><p className="text-[9px] text-muted-foreground">Giảng viên</p></div>
        </div>
      </header>

      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div><div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-primary"><SparklesIcon className="size-3" />Học kỳ {semester}</div><h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Lớp học của tôi</h1><p className="mt-1.5 max-w-xl text-xs leading-5 text-muted-foreground">Theo dõi tiến độ, nhóm dự án và mức độ đóng góp của sinh viên trong từng lớp học.</p></div>
        <Button className="h-10 gap-2 rounded-xl text-xs font-semibold shadow-saga-sm"><PlusIcon className="size-4" />Tạo lớp học</Button>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-saga-xs"><span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><BookOpenIcon className="size-4" /></span><div><strong className="text-lg">{courses.length}</strong><p className="text-[10px] text-muted-foreground">Lớp đang giảng dạy</p></div></div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-saga-xs"><span className="grid size-10 place-items-center rounded-xl bg-success-muted text-success"><UsersIcon className="size-4" /></span><div><strong className="text-lg">{students}</strong><p className="text-[10px] text-muted-foreground">Sinh viên</p></div></div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-saga-xs"><span className="grid size-10 place-items-center rounded-xl bg-info-muted text-info"><UsersIcon className="size-4" /></span><div><strong className="text-lg">{groups}</strong><p className="text-[10px] text-muted-foreground">Nhóm dự án</p></div></div>
      </section>

      <section>
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div><h2 className="text-base font-bold">Danh sách lớp</h2><p className="mt-0.5 text-[10px] text-muted-foreground">{courses.length} lớp trong học kỳ đã chọn</p></div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative sm:w-56"><SearchIcon className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm mã hoặc tên lớp..." className="h-9 rounded-xl pl-9 text-xs" /></div>
            <div className="sm:w-52"><CustomSelect value={semester} onChange={setSemester} options={SEMESTERS} /></div>
          </div>
        </div>

        {courses.length ? <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">{courses.map((course) => <CourseCard key={course.id} course={course} />)}</div> : <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-border bg-card"><div className="text-center"><span className="mx-auto mb-3 grid size-11 place-items-center rounded-full bg-muted text-muted-foreground"><SearchIcon className="size-5" /></span><h3 className="text-sm font-bold">Không tìm thấy lớp học</h3><p className="mt-1 text-xs text-muted-foreground">Thử đổi từ khóa hoặc chọn một học kỳ khác.</p></div></div>}
      </section>
    </div>
  );
}
