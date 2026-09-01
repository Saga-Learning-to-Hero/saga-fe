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
  SlidersHorizontalIcon,
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
import { getRoleHomePath } from "@/features/auth/lib/role-routes";
import { lecturerCourseDashboardPath } from "@/features/lecturer/courses/lib/course-routes";
import { MOCK_LECTURER_COURSES } from "@/features/lecturer/courses/data/mock-courses";
import { MOCK_STUDENT_COURSES } from "@/features/student/courses/data/mock-student-courses";
import type { Role } from "@/types/auth";

export function GlobalCommandSearch() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { user, logout, switchRole, setSelectedCourse } = useAuthStore();

  // Lắng nghe phím tắt Ctrl + K hoặc Cmd + K
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
      {/* Nút Trigger trên Top Header (Linear Style) */}
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

      {/* Command Palette Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Nhập từ khóa tìm kiếm phân hệ, task, môn học..." />
        <CommandList className="max-h-80">
          <CommandEmpty>Không tìm thấy kết quả phù hợp.</CommandEmpty>

          {/* Nhóm Điều hướng cho Sinh viên */}
          {user.role === "STUDENT" && (
            <CommandGroup heading="Điều hướng học phần (Sinh viên)">
              <CommandItem
                onSelect={() => runCommand(() => router.push("/student/dashboard"))}
                className="flex items-center gap-2.5 cursor-pointer py-2 px-3 text-xs"
              >
                <LayoutDashboardIcon className="size-4 text-primary" />
                <span>Dashboard Tổng quan</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push("/student/project-info"))}
                className="flex items-center gap-2.5 cursor-pointer py-2 px-3 text-xs"
              >
                <FolderKanbanIcon className="size-4 text-blue-500" />
                <span>Thông tin dự án & Nhóm</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push("/student/graph"))}
                className="flex items-center gap-2.5 cursor-pointer py-2 px-3 text-xs"
              >
                <GitGraphIcon className="size-4 text-accent" />
                <span>Đồ thị truy xuất nguồn gốc (Traceability)</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push("/student/sprint-progress"))}
                className="flex items-center gap-2.5 cursor-pointer py-2 px-3 text-xs"
              >
                <KanbanSquareIcon className="size-4 text-purple-500" />
                <span>Tiến độ công việc & Sprint Kanban</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push("/student/commits"))}
                className="flex items-center gap-2.5 cursor-pointer py-2 px-3 text-xs"
              >
                <GitCommitIcon className="size-4 text-emerald-500" />
                <span>Lịch sử Commit Git</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push("/student/peer-assessment"))}
                className="flex items-center gap-2.5 cursor-pointer py-2 px-3 text-xs"
              >
                <UserCheckIcon className="size-4 text-amber-500" />
                <span>Đánh giá chéo đồng đẳng (Peer Review)</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push("/student/contribution"))}
                className="flex items-center gap-2.5 cursor-pointer py-2 px-3 text-xs"
              >
                <PieChartIcon className="size-4 text-indigo-500" />
                <span>Mức đóng góp cổ phần Slicing Pie</span>
              </CommandItem>
            </CommandGroup>
          )}

          {/* Nhóm Điều hướng cho Giảng viên */}
          {user.role === "LECTURER" && (
            <CommandGroup heading="Lớp giảng dạy (Giảng viên)">
              <CommandItem
                onSelect={() => runCommand(() => router.push("/lecturer/courses"))}
                className="flex items-center gap-2.5 cursor-pointer py-2 px-3 text-xs"
              >
                <BookOpenIcon className="size-4 text-primary" />
                <span>Danh sách tất cả lớp giảng dạy</span>
              </CommandItem>
              {MOCK_LECTURER_COURSES.slice(0, 4).map((c) => (
                <CommandItem
                  key={c.id}
                  onSelect={() => runCommand(() => router.push(lecturerCourseDashboardPath(c.id)))}
                  className="flex items-center gap-2.5 cursor-pointer py-2 px-3 text-xs"
                >
                  <LayersIcon className="size-4 text-muted-foreground" />
                  <span>
                    {c.code} · {c.name} ({c.room})
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Nhóm Chuyển Khóa học cho Sinh viên */}
          {user.role === "STUDENT" && (
            <CommandGroup heading="Môn học đang theo học">
              {MOCK_STUDENT_COURSES.map((c) => (
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
                    {c.subjectCode} · {c.subjectName} ({c.adminClassCode})
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandSeparator />

          {/* Tác vụ nhanh & Cài đặt */}
          <CommandGroup heading="Tác vụ nhanh">
            <CommandItem
              onSelect={() => runCommand(() => router.push("/profile"))}
              className="flex items-center gap-2.5 cursor-pointer py-2 px-3 text-xs"
            >
              <UserIcon className="size-4 text-primary" />
              <span>Hồ sơ cá nhân</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/profile/integrations"))}
              className="flex items-center gap-2.5 cursor-pointer py-2 px-3 text-xs"
            >
              <Link2Icon className="size-4 text-accent" />
              <span>Cài đặt Tích hợp Jira & GitHub</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(toggleTheme)}
              className="flex items-center gap-2.5 cursor-pointer py-2 px-3 text-xs"
            >
              <SunIcon className="size-4 text-amber-500" />
              <span>Chuyển đổi giao diện Sáng / Tối</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => {
                  const nextRole: Role =
                    user.role === "STUDENT"
                      ? "LECTURER"
                      : user.role === "LECTURER"
                        ? "ADMIN"
                        : "STUDENT";
                  switchRole(nextRole);
                  router.replace(getRoleHomePath(nextRole));
                })
              }
              className="flex items-center gap-2.5 cursor-pointer py-2 px-3 text-xs"
            >
              <SlidersHorizontalIcon className="size-4 text-accent" />
              <span>Đổi vai trò thử nghiệm</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => {
                  logout();
                  router.replace("/login");
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
