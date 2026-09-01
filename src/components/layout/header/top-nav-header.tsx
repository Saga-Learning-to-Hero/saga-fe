"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  BellIcon,
  ChevronDownIcon,
  LogOutIcon,
  MoonIcon,
  SunIcon,
  UserIcon,
  MenuIcon,
} from "lucide-react";
import { SagaLogo } from "@/components/common/saga-logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useProfileModalStore } from "@/features/profile/store/useProfileModalStore";
import { getRoleHomePath } from "@/features/auth/lib/role-routes";
import {
  ROLE_COLORS,
  ROLE_LABELS,
  getInitials,
  getLecturerNavItems,
  getStudentNavItems,
  isNavItemActive,
} from "@/components/layout/sidebar/nav-config";
import type { NavItem } from "@/components/layout/sidebar/nav-config";
import type { Role } from "@/types/auth";
import { cn } from "@/lib/utils";
import { CourseContextSwitcher } from "./course-context-switcher";
import { TopNavTabs } from "./top-nav-tabs";
import { GlobalCommandSearch } from "./global-command-search";

export function TopNavHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, switchRole } = useAuthStore();
  const { openProfileModal } = useProfileModalStore();
  const [isDark, setIsDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("saga-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (saved === "dark" || (!saved && prefersDark)) {
      document.documentElement.classList.add("dark");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("saga-theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("saga-theme", "dark");
    }
    setIsDark((v) => !v);
  };

  if (!user) return null;

  const homePath = getRoleHomePath(user.role);
  const displayName = user.name ?? (user.role === "STUDENT" ? "Sinh viên" : "Giảng viên");

  // Trích xuất courseId đối với Giảng viên
  const courseMatch = pathname.match(/^\/lecturer\/courses\/([^/]+)(?:\/|$)/);
  const lecturerCourseId = courseMatch ? decodeURIComponent(courseMatch[1]) : null;

  // Xác định danh sách Nav Tabs ngang
  let navItems: NavItem[] = [];
  if (user.role === "LECTURER" && lecturerCourseId) {
    navItems = getLecturerNavItems(lecturerCourseId);
  } else if (user.role === "STUDENT" && pathname !== "/student/courses") {
    navItems = getStudentNavItems();
  }

  const hasSubNav = navItems.length > 0;

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const handleSwitchRole = (r: Role) => {
    switchRole(r);
    router.replace(getRoleHomePath(r));
  };

  return (
    <header className="sticky top-0 z-30 flex flex-col w-full bg-card/95 backdrop-blur-md border-b border-border shadow-saga-xs">
      {/* ── TẦNG 1: Main Header Bar (56px) ── */}
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 gap-4">
        {/* ── Left: Mobile Menu Button + SAGA Logo + Course Switcher ── */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Nút mở Menu trên Mobile */}
          {hasSubNav && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden size-8.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted shrink-0"
              onClick={() => setMobileOpen(true)}
              aria-label="Mở danh mục điều hướng"
            >
              <MenuIcon className="size-4.5" />
            </Button>
          )}

          <Link href={homePath} className="flex items-center hover:opacity-90 transition-opacity shrink-0">
            <SagaLogo size="sm" showText={true} showSubtitle={false} />
          </Link>

          <div className="hidden h-5 w-px bg-border sm:block shrink-0" />

          {/* Bộ chọn / Hiển thị Ngữ cảnh Khóa học */}
          <CourseContextSwitcher courseId={lecturerCourseId} pathname={pathname} />
        </div>

        {/* ── Center: Global Command Search (Ctrl + K) ── */}
        <div className="hidden md:flex items-center justify-center flex-1 max-w-xs lg:max-w-sm">
          <GlobalCommandSearch />
        </div>

        {/* ── Right: Theme Toggle + Notifications + User Avatar Dropdown ── */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Nút chuyển Theme Sáng / Tối */}
          <Tooltip>
            <TooltipTrigger
              onClick={toggleTheme}
              className="flex items-center justify-center size-8.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer border border-transparent hover:border-border"
              aria-label="Đổi giao diện sáng/tối"
            >
              {isDark ? (
                <SunIcon className="size-4 text-amber-500" />
              ) : (
                <MoonIcon className="size-4" />
              )}
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8}>
              {isDark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
            </TooltipContent>
          </Tooltip>

          {/* Nút chuông thông báo */}
          <Tooltip>
            <TooltipTrigger
              className="relative flex items-center justify-center size-8.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer border border-transparent hover:border-border"
              aria-label="Thông báo"
            >
              <BellIcon className="size-4" />
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive ring-2 ring-background" />
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8}>
              Thông báo hệ thống (3 mới)
            </TooltipContent>
          </Tooltip>

          <div className="h-5 w-px bg-border mx-1" />

          {/* User Profile Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-xl p-1.5 hover:bg-muted/80 transition-all border border-transparent hover:border-border cursor-pointer outline-none group">
              <Avatar className="size-8 rounded-lg border border-border shadow-xs">
                <AvatarImage src={user.avatar} alt={displayName} />
                <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary rounded-lg">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>

              <div className="hidden text-left sm:block">
                <p className="text-xs font-bold leading-tight text-foreground group-hover:text-primary transition-colors">
                  {displayName}
                </p>
                <p className="text-[10px] text-muted-foreground font-medium">
                  {ROLE_LABELS[user.role]}
                </p>
              </div>

              <ChevronDownIcon className="size-3.5 text-muted-foreground group-hover:text-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" sideOffset={10} className="w-68 rounded-2xl p-1.5 shadow-xl border-border">
              {/* Header thông tin người dùng */}
              <div className="flex items-center gap-3 p-3 border-b border-border/80 bg-muted/30 rounded-xl mb-1">
                <Avatar className="size-10 rounded-xl border border-border">
                  <AvatarImage src={user.avatar} alt={displayName} />
                  <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary rounded-xl">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-foreground truncate">{displayName}</span>
                  <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                  <Badge className={cn("w-fit text-[10px] px-2 py-0.5 mt-1 border-0 font-semibold", ROLE_COLORS[user.role])}>
                    {ROLE_LABELS[user.role]}
                  </Badge>
                </div>
              </div>

              {/* Chuyển vai trò thử nghiệm */}
              <DropdownMenuGroup className="p-1">
                <DropdownMenuLabel className="flex items-center gap-1.5 px-2 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  <UserIcon className="size-3" />
                  Chuyển vai trò thử nghiệm
                </DropdownMenuLabel>
                {(["STUDENT", "LECTURER", "ADMIN"] as Role[]).map((r) => (
                  <DropdownMenuItem
                    key={r}
                    onClick={() => handleSwitchRole(r)}
                    className={cn(
                      "text-xs cursor-pointer py-2 px-2.5 rounded-lg flex items-center justify-between",
                      user.role === r ? "font-bold text-primary bg-primary/10" : "text-foreground hover:bg-muted"
                    )}
                  >
                    <span>{ROLE_LABELS[r]}</span>
                    {user.role === r && <span className="text-primary font-bold">✓</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              {/* Profile & Cài đặt */}
              <div className="p-1 space-y-0.5">
                <DropdownMenuItem
                  onClick={openProfileModal}
                  className="text-xs cursor-pointer py-2 px-2.5 rounded-lg flex items-center gap-2 hover:bg-primary/10 hover:text-primary font-medium"
                >
                  <UserIcon className="size-3.5 text-primary" />
                  <span>Hồ sơ & Cài đặt tích hợp</span>
                </DropdownMenuItem>

                {/* Nút Đăng xuất */}
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-xs cursor-pointer py-2 px-2.5 rounded-lg flex items-center gap-2 text-destructive focus:text-destructive hover:bg-destructive/10 font-semibold transition-colors"
                >
                  <LogOutIcon className="size-3.5" />
                  <span>Đăng xuất tài khoản</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── TẦNG 2: Subnav Tabs Bar (Chỉ hiển thị khi đang trong Ngữ cảnh Môn/Lớp học) ── */}
      {hasSubNav && (
        <div className="hidden md:block border-t border-border/60 bg-card/60">
          <TopNavTabs items={navItems} />
        </div>
      )}

      {/* ── Mobile Navigation Drawer (Sheet) ── */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0 flex flex-col">
          <SheetHeader className="p-4 border-b border-border">
            <SheetTitle className="flex items-center gap-2 text-left">
              <SagaLogo size="xs" showText={true} showSubtitle={false} />
            </SheetTitle>
          </SheetHeader>

          <div className="p-3 flex-1 overflow-y-auto space-y-1">
            <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Menu điều hướng
            </p>
            {navItems.map((item) => {
              const isActive = isNavItemActive(pathname, item);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>

          <div className="p-4 border-t border-border bg-muted/20 space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMobileOpen(false);
                openProfileModal();
              }}
              className="w-full justify-start text-xs rounded-xl"
            >
              <UserIcon className="size-3.5 mr-2 text-primary" />
              Hồ sơ & Cài đặt
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-xs rounded-xl"
            >
              <LogOutIcon className="size-3.5 mr-2" />
              Đăng xuất
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
