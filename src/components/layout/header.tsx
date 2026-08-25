"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SunIcon, MoonIcon, LogOutIcon, ChevronDownIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import type { Role } from "@/types/auth";

const SEMESTERS = [
  { value: "spring-2026", label: "Spring 2026" },
  { value: "fall-2026", label: "Fall 2026" },
  { value: "spring-2027", label: "Spring 2027" },
];

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  LECTURER: "Lecturer",
  STUDENT: "Student",
};

const ROLE_COLORS: Record<Role, string> = {
  ADMIN: "bg-danger-muted text-danger",
  LECTURER: "bg-warning-muted text-warning",
  STUDENT: "bg-info-muted text-info",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(-2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function Header() {
  const router = useRouter();
  const { user, logout, switchRole } = useAuthStore();
  const [semester, setSemester] = useState("spring-2026");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("saga-theme");
    if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.remove("dark");
      localStorage.setItem("saga-theme", "light");
      setIsDark(false);
    } else {
      html.classList.add("dark");
      localStorage.setItem("saga-theme", "dark");
      setIsDark(true);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!user) return null;

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-sm flex items-center px-4 md:px-6 gap-4 shrink-0">
      {/* Semester Switcher */}
      <div className="flex items-center gap-2">
        <Select value={semester} onValueChange={(v) => v && setSemester(v)}>
          <SelectTrigger className="w-[148px] h-9 text-sm font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SEMESTERS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1" />

      {/* Dark / Light Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="h-9 w-9 rounded-lg"
        aria-label="Chuyển theme"
      >
        {isDark ? (
          <SunIcon className="w-4 h-4" />
        ) : (
          <MoonIcon className="w-4 h-4" />
        )}
      </Button>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-muted transition-fast outline-none cursor-pointer"
        >
          <Avatar className="w-8 h-8">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col items-start min-w-0">
            <span className="text-sm font-medium text-foreground leading-tight truncate max-w-[120px]">
              {user.name}
            </span>
            <span
              className={`text-[11px] font-semibold px-1.5 py-0 rounded-sm leading-tight ${ROLE_COLORS[user.role]}`}
            >
              {ROLE_LABELS[user.role]}
            </span>
          </div>
          <ChevronDownIcon className="w-3.5 h-3.5 text-muted-foreground hidden md:block" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              <Badge
                className={`w-fit text-[11px] px-2 py-0 mt-0.5 ${ROLE_COLORS[user.role]} border-0`}
              >
                {ROLE_LABELS[user.role]}
              </Badge>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {/* Role Switcher (Mock / Dev only) */}
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal pb-1">
              <UserIcon className="w-3 h-3 inline mr-1.5" />
              Chuyển role (Mock)
            </DropdownMenuLabel>
            {(["STUDENT", "LECTURER", "ADMIN"] as Role[]).map((r) => (
              <DropdownMenuItem
                key={r}
                onClick={() => switchRole(r)}
                className={`text-sm cursor-pointer ${user.role === r ? "font-semibold text-primary" : ""}`}
              >
                {ROLE_LABELS[r]}
                {user.role === r && <span className="ml-auto text-primary">✓</span>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleLogout}
            className="text-destructive focus:text-destructive cursor-pointer"
          >
            <LogOutIcon className="w-4 h-4 mr-2" />
            Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
