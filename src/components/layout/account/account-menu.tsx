"use client";

import { LogOutIcon, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { getInitials, ROLE_LABELS } from "../sidebar/nav-config";
import type { Role } from "@/types/auth";
import { cn } from "@/lib/utils";

interface AccountMenuProps {
  variant?: "sidebar" | "header" | "compact";
  collapsed?: boolean;
  dropdownSide?: "top" | "right" | "bottom" | "left";
  dropdownAlign?: "start" | "center" | "end";
}

export function AccountMenu({
  variant = "header",
  collapsed = false,
  dropdownSide = "bottom",
  dropdownAlign = "end",
}: AccountMenuProps) {
  const router = useRouter();
  const { user, logout, switchRole } = useAuthStore();

  if (!user) return null;

  const displayName = user.name;
  const initials = getInitials(displayName);
  const roleLabel =
    user.role === "LECTURER"
      ? "Giảng viên"
      : user.role === "STUDENT"
        ? "Sinh viên"
        : "Quản trị viên";

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const roleSwitchGroup = (
    <div className="p-1">
      <p className="flex items-center gap-1.5 px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
        <UserIcon className="w-3.5 h-3.5" />
        Vai trò thử nghiệm
      </p>
      {(["STUDENT", "LECTURER", "ADMIN"] as Role[]).map((r) => (
        <DropdownMenuItem
          key={r}
          onClick={() => switchRole(r)}
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
    </div>
  );

  if (variant === "sidebar") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "flex w-full items-center justify-start gap-3 rounded-xl p-2 h-auto hover:bg-muted outline-none focus-visible:ring-2 focus-visible:ring-primary",
            collapsed ? "justify-center" : "px-3"
          )}
        >
          <Avatar size="sm" className="shrink-0 border border-border shadow-xs">
            <AvatarImage src={user.avatar} alt={displayName} />
            <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex flex-1 flex-col items-start overflow-hidden text-left">
              <span className="truncate text-sm font-bold leading-tight w-full">
                {displayName}
              </span>
              <span className="truncate text-[10px] font-medium text-muted-foreground uppercase tracking-wider w-full">
                {roleLabel}
              </span>
            </div>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side={dropdownSide}
          align={dropdownAlign}
          className="w-56 rounded-xl border-border/60 shadow-saga-md"
        >
          <div className="flex flex-col space-y-1 p-2">
            <p className="text-sm font-bold leading-none">{displayName}</p>
            <p className="text-xs text-muted-foreground font-medium">{user.email}</p>
          </div>
          <DropdownMenuSeparator className="bg-border/60" />
          <DropdownMenuItem
            className="gap-2 cursor-pointer rounded-lg text-sm font-medium focus:bg-muted"
            onClick={() => router.push("/profile")}
          >
            <UserIcon className="size-4 text-muted-foreground" />
            Hồ sơ cá nhân
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border/60" />
          {roleSwitchGroup}
          <DropdownMenuSeparator className="bg-border/60" />
          <DropdownMenuItem
            onClick={handleLogout}
            className="gap-2 text-destructive cursor-pointer rounded-lg text-sm font-bold focus:bg-destructive/10 focus:text-destructive"
          >
            <LogOutIcon className="size-4" />
            Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Header variant (or compact)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Mở menu tài khoản"
        className={cn(
          "flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary",
          variant === "compact" ? "p-1" : ""
        )}
      >
        <Avatar size="sm" className="shrink-0">
          <AvatarImage src={user.avatar} alt={displayName} />
          <AvatarFallback className="bg-primary/10 text-[10px] font-bold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        {variant !== "compact" && (
          <div className="hidden text-left sm:block">
            <p className="text-xs font-bold leading-tight">{displayName}</p>
            <p className="text-[10px] text-muted-foreground">{roleLabel}</p>
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={dropdownSide}
        align={dropdownAlign}
        className="w-56 rounded-xl border-border/60 shadow-saga-md"
      >
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-sm font-bold leading-none">{displayName}</p>
          <p className="text-xs text-muted-foreground font-medium">{user.email}</p>
        </div>
        <DropdownMenuSeparator className="bg-border/60" />
        <DropdownMenuItem
          className="gap-2 cursor-pointer rounded-lg text-sm font-medium focus:bg-muted"
          onClick={() => router.push("/profile")}
        >
          <UserIcon className="size-4 text-muted-foreground" />
          Hồ sơ cá nhân
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border/60" />
        {roleSwitchGroup}
        <DropdownMenuSeparator className="bg-border/60" />
        <DropdownMenuItem
          onClick={handleLogout}
          className="gap-2 text-destructive cursor-pointer rounded-lg text-sm font-bold focus:bg-destructive/10 focus:text-destructive"
        >
          <LogOutIcon className="size-4" />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
