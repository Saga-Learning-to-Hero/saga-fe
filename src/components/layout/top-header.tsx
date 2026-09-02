"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BellIcon,
  ChevronDownIcon,
  LogOutIcon,
  MoonIcon,
  SunIcon,
  UserIcon,
  LayersIcon,
} from "lucide-react";
import { SagaLogo } from "@/components/common/saga-logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useLogout } from "@/features/auth/hooks/useAuth";
import { useProfileModalStore } from "@/features/profile/store/useProfileModalStore";
import { getRoleHomePath } from "@/features/auth/lib/role-routes";
import { ROLE_COLORS, ROLE_LABELS, getInitials } from "@/components/layout/sidebar/nav-config";
import { cn } from "@/lib/utils";

export function TopHeader() {
  const { user } = useAuthStore();
  const { mutate: logout } = useLogout();
  const { openProfileModal } = useProfileModalStore();
  const [isDark, setIsDark] = useState(false);

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

  const displayName = user.fullName || user.name || (user.role === "STUDENT" ? "Sinh viên" : "Giảng viên");

  const roleSubtitle =
    user.role === "LECTURER"
      ? "Không gian giảng dạy"
      : user.role === "STUDENT"
        ? "Không gian học tập"
        : "Quản trị hệ thống";

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="flex h-15 shrink-0 items-center justify-between border-b border-border bg-card/95 backdrop-blur-md px-5 sm:px-6 shadow-saga-xs z-20">
      {/* ── Left: Logo + App Context Badge ── */}
      <div className="flex items-center gap-3">
        <Link href={homePath} className="flex items-center hover:opacity-90 transition-opacity">
          <SagaLogo size="sm" showText={true} showSubtitle={false} />
        </Link>

        <div className="hidden h-5 w-px bg-border sm:block" />

        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          <LayersIcon className="size-3" />
          {roleSubtitle}
        </span>
      </div>

      {/* ── Right: Theme Toggle + Notification Bell + User Dropdown Profile ── */}
      <div className="flex items-center gap-2">
        {/* Nút chuyển theme Sáng / Tối */}
        <Tooltip>
          <TooltipTrigger
            onClick={toggleTheme}
            className="flex items-center justify-center size-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer border border-transparent hover:border-border"
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
            className="relative flex items-center justify-center size-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer border border-transparent hover:border-border"
            aria-label="Thông báo"
          >
            <BellIcon className="size-4" />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive ring-2 ring-background" />
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8}>
            Thông báo hệ thống (3 mới)
          </TooltipContent>
        </Tooltip>

        <div className="h-6 w-px bg-border mx-1" />

        {/* User Profile Dropdown Menu với Nút Đăng Xuất */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-xl p-1.5 hover:bg-muted/80 transition-all border border-transparent hover:border-border cursor-pointer outline-none group">
            <Avatar className="size-8.5 rounded-lg border border-border shadow-xs">
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

            {/* Profile & Cài đặt */}
            <div className="p-1 space-y-0.5">
              <DropdownMenuItem
                onClick={openProfileModal}
                className="text-xs cursor-pointer py-2 px-2.5 rounded-lg flex items-center gap-2 hover:bg-primary/10 hover:text-primary font-medium"
              >
                <UserIcon className="size-3.5 text-primary" />
                <span>Hồ sơ & Cài đặt tích hợp</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

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
    </header>
  );
}
