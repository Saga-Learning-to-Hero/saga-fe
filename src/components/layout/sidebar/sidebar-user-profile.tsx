"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOutIcon, ChevronRightIcon, UserIcon, SunIcon, MoonIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { getRoleHomePath } from "@/features/auth/lib/role-routes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLE_LABELS, ROLE_COLORS, getInitials } from "./nav-config";
import type { Role } from "@/types/auth";

interface Props {
  collapsed: boolean;
}

export function SidebarUserProfile({ collapsed }: Props) {
  const router = useRouter();
  const { user, logout, switchRole } = useAuthStore();
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

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const handleSwitchRole = (r: Role) => {
    switchRole(r);
    // Điều hướng tới home của role mới để tránh lạc ở route sai role
    router.replace(getRoleHomePath(r));
  };

  return (
    <div className="border-t border-sidebar-border p-3 space-y-2 shrink-0">
      {/* ── Nút chuyển Theme trực tiếp ── */}
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger
            onClick={toggleTheme}
            className="flex items-center justify-center w-full rounded-xl p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
            aria-label="Đổi giao diện sáng/tối"
          >
            {isDark ? (
              <SunIcon className="w-4 h-4 text-amber-500" />
            ) : (
              <MoonIcon className="w-4 h-4" />
            )}
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={10}>
            {isDark ? "Giao diện sáng" : "Giao diện tối"}
          </TooltipContent>
        </Tooltip>
      ) : (
        <button
          onClick={toggleTheme}
          className="flex items-center justify-between w-full rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all duration-150 cursor-pointer border border-transparent hover:border-border/40"
        >
          <span className="flex items-center gap-2.5">
            {isDark ? (
              <SunIcon className="w-4 h-4 text-amber-500" />
            ) : (
              <MoonIcon className="w-4 h-4 text-muted-foreground" />
            )}
            Giao diện
          </span>
          <span className="text-xs px-2 py-0.5 rounded-md bg-muted/90 text-foreground/80 font-medium">
            {isDark ? "Tối" : "Sáng"}
          </span>
        </button>
      )}

      {/* ── User Profile Card ── */}
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "flex items-center w-full rounded-xl p-2.5",
            "bg-muted/40 hover:bg-muted/80 transition-all duration-150",
            "outline-none cursor-pointer border border-border/40 hover:border-border shadow-2xs",
            collapsed ? "justify-center px-1" : "gap-3"
          )}
        >
          <Avatar className="w-9 h-9 shrink-0 rounded-lg">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-xs font-bold bg-primary text-primary-foreground rounded-lg">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>

          {!collapsed && (
            <>
              <div className="flex flex-col items-start min-w-0 flex-1 text-left">
                <span className="text-sm font-semibold text-sidebar-foreground leading-tight truncate w-full">
                  {user.name}
                </span>
                <span
                  className={cn(
                    "text-[11px] font-semibold px-2 py-0.5 rounded-md leading-tight mt-1",
                    ROLE_COLORS[user.role]
                  )}
                >
                  {ROLE_LABELS[user.role]}
                </span>
              </div>
              <ChevronRightIcon className="w-4 h-4 text-muted-foreground/70 shrink-0" />
            </>
          )}
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="right"
          align="end"
          sideOffset={14}
          className="w-68"
        >
          {/* User info header */}
          <div className="flex items-center gap-3 px-3.5 py-3.5 border-b border-border">
            <Avatar className="w-10 h-10 shrink-0 rounded-lg">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-xs font-bold bg-primary text-primary-foreground rounded-lg">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
              <Badge className={cn("w-fit text-[10px] px-2 py-0.5 mt-1.5 border-0", ROLE_COLORS[user.role])}>
                {ROLE_LABELS[user.role]}
              </Badge>
            </div>
          </div>

          {/* Chuyển vai trò (thử nghiệm) */}
          <DropdownMenuGroup className="p-1">
            <p className="flex items-center gap-1.5 px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              <UserIcon className="w-3.5 h-3.5" />
              Vai trò thử nghiệm
            </p>
            {(["STUDENT", "LECTURER", "ADMIN"] as Role[]).map((r) => (
              <DropdownMenuItem
                key={r}
                onClick={() => handleSwitchRole(r)}
                className={cn(
                  "text-sm cursor-pointer py-2 px-3 rounded-lg",
                  user.role === r && "font-semibold text-primary bg-primary/10"
                )}
              >
                {ROLE_LABELS[r]}
                {user.role === r && (
                  <span className="ml-auto text-primary text-xs font-bold">✓</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <div className="p-1 space-y-0.5">
            <DropdownMenuItem
              onClick={() => router.push("/profile")}
              className="text-sm cursor-pointer py-2 px-3 rounded-lg flex items-center gap-2 hover:bg-primary/10 hover:text-primary font-medium"
            >
              <UserIcon className="w-4 h-4 text-primary" />
              <span>Hồ sơ cá nhân</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive cursor-pointer py-2 px-3 rounded-lg"
            >
              <LogOutIcon className="w-4 h-4 mr-2" />
              Đăng xuất
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
