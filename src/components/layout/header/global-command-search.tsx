"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  SearchIcon,
  LayoutDashboardIcon,
  GitGraphIcon,
  FolderKanbanIcon,
  PieChartIcon,
  BookOpenIcon,
  KanbanSquareIcon,
  GitCommitIcon,
  UserCheckIcon,
  UserIcon,
  LogOutIcon,
  SunIcon,
  LayersIcon,
  Link2Icon,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useLogout } from "@/features/auth/hooks/useAuth";
import { lecturerCourseDashboardPath } from "@/features/lecturer/courses/lib/course-routes";
import { useLecturerCourses } from "@/features/lecturer/courses/hooks/use-lecturer-courses";
import { useStudentCourses } from "@/features/student/courses/hooks/use-student-courses";
import { mapStudentCourseResponse } from "@/features/student/courses/types/student-course";

export function GlobalCommandSearch() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { user, setSelectedCourse } = useAuthStore();
  const { mutate: logout } = useLogout();
  const lecturerCoursesQuery = useLecturerCourses({
    enabled: user?.role === "LECTURER",
  });
  const studentCoursesQuery = useStudentCourses({
    enabled: user?.role === "STUDENT",
  });

  const lecturerCourses = lecturerCoursesQuery.data ?? [];
  const studentCourses = (studentCoursesQuery.data ?? []).map(mapStudentCourseResponse);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains("dark");
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("saga-theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("saga-theme", "dark");
    }
  };

  if (!user) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center justify-between gap-3 px-3 py-1.5 rounded-xl bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/70 hover:border-border transition-all cursor-pointer text-xs w-56 lg:w-72 shadow-2xs group"
        aria-label="Tìm kiếm nhanh hoặc mở menu lệnh (Ctrl+K)"
      >
        <span className="flex items-center gap-2 truncate">
          <SearchIcon className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="truncate">Tìm kiếm, chuyển trang...</span>
        </span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-card border border-border/80 rounded-md text-muted-foreground shadow-2xs">
          <span className="text-[11px]">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Nhập từ khóa tìm kiếm phân hệ, task, môn học..." />
        <CommandList className="max-h-80">
          <CommandEmpty>Không tìm thấy kết quả phù hợp.</CommandEmpty>

          {user.role === "STUDENT" && (
            <CommandGroup heading="Điều hướng học phần">
              <CommandItem
                onSelect={() => runCommand(() => router.push("/student/dashboard"))}
                className="flex items-center gap-2.5 cursor-pointer py-2 px-3 text-xs"
              >
                <LayoutDashboardIcon className="size-4 text-primary" />
                <span>Dashboard tổng quan</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push("/student/project-info"))}
                className="flex items-center gap-2.5 cursor-pointer py-2 px-3 text-xs"
              >
                <FolderKanbanIcon className="size-4 text-blue-500" />
                <span>Thông tin dự án nhóm</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push("/student/graph"))}
                className="flex items-center gap-2.5 cursor-pointer py-2 px-3 text-xs"
              >
                <GitGraphIcon className="size-4 text-accent" />
                <span>Đồ thị Traceability</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push("/student/sprint-progress"))}
                className="flex items-center gap-2.5 cursor-pointer py-2 px-3 text-xs"
              >
                <KanbanSquareIcon className="size-4 text-purple-500" />
                <span>Tiến độ công việc Agile Kanban</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push("/student/commits"))}
                className="flex items-center gap-2.5 cursor-pointer py-2 px-3 text-xs"
              >
                <GitCommitIcon className="size-4 text-emerald-500" />
                <span>Lịch sử Commit Git</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push("/student/assessment"))}
                className="flex items-center gap-2.5 cursor-pointer py-2 px-3 text-xs"
              >
                <UserCheckIcon className="size-4 text-amber-500" />
                <span>Đánh giá chéo theo Sprint</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push("/student/contribution"))}
                className="flex items-center gap-2.5 cursor-pointer py-2 px-3 text-xs"
              >
                <PieChartIcon className="size-4 text-indigo-500" />
                <span>Tỷ lệ đóng góp Slicing Pie</span>
              </CommandItem>
            </CommandGroup>
          )}

          {user.role === "LECTURER" && (
            <CommandGroup heading="Lớp giảng dạy">
              <CommandItem
                onSelect={() => runCommand(() => router.push("/lecturer/courses"))}
                className="flex items-center gap-2.5 cursor-pointer py-2 px-3 text-xs"
              >
                <BookOpenIcon className="size-4 text-primary" />
                <span>Danh sách tất cả lớp giảng dạy</span>
              </CommandItem>
              {lecturerCourses.slice(0, 5).map((c) => (
                <CommandItem
                  key={c.id}
                  onSelect={() => runCommand(() => router.push(lecturerCourseDashboardPath(c.id)))}
                  className="flex items-center gap-2.5 cursor-pointer py-2 px-3 text-xs"
                >
                  <LayersIcon className="size-4 text-muted-foreground" />
                  <span>
                    {c.courseCode} · {c.name} {c.classCode ? `(${c.classCode})` : ""}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {user.role === "STUDENT" && studentCourses.length > 0 && (
            <CommandGroup heading="Môn học đang theo học">
              {studentCourses.map((c) => (
                <CommandItem
                  key={c.id}
                  onSelect={() =>
                    runCommand(() => {
                      setSelectedCourse(c);
                      router.push("/student/dashboard");
                    })
                  }
                  className="flex items-center gap-2.5 cursor-pointer py-2 px-3 text-xs"
                >
                  <BookOpenIcon className="size-4 text-muted-foreground" />
                  <span>
                    {c.subjectCode} · {c.subjectName} {c.adminClassCode ? `(${c.adminClassCode})` : ""}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandSeparator />

          <CommandGroup heading="Tác vụ nhanh">
            <CommandItem
              onSelect={() => runCommand(() => router.push("/profile"))}
              className="flex items-center gap-2.5 cursor-pointer py-2 px-3 text-xs"
            >
              <UserIcon className="size-4 text-primary" />
              <span>Hồ sơ cá nhân</span>
            </CommandItem>
            {user.role === "STUDENT" && (
              <CommandItem
                onSelect={() => runCommand(() => router.push("/profile/integrations"))}
                className="flex items-center gap-2.5 cursor-pointer py-2 px-3 text-xs"
              >
                <Link2Icon className="size-4 text-accent" />
                <span>Cài đặt tích hợp Jira và GitHub</span>
              </CommandItem>
            )}
            <CommandItem
              onSelect={() => runCommand(toggleTheme)}
              className="flex items-center gap-2.5 cursor-pointer py-2 px-3 text-xs"
            >
              <SunIcon className="size-4 text-amber-500" />
              <span>Chuyển đổi giao diện sáng tối</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => {
                  logout();
                })
              }
              className="flex items-center gap-2.5 cursor-pointer py-2 px-3 text-xs text-destructive focus:text-destructive"
            >
              <LogOutIcon className="size-4" />
              <span>Đăng xuất tài khoản</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
