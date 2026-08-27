"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { BellIcon, GitGraphIcon, MenuIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { getRoleHomePath } from "@/features/auth/lib/role-routes";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

/**
 * Paths that should render WITHOUT the sidebar.
 * The lecturer class-selector page is a focused "pick your class" screen
 * that doesn't need (and shouldn't have) the full app shell.
 */
const NO_SIDEBAR_PATHS = ["/lecturer/courses"];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    const homePath = getRoleHomePath(user.role);
    const isAdminRoute = pathname.startsWith("/admin");
    const isLecturerRoute = pathname.startsWith("/lecturer");
    const isStudentRoute = pathname.startsWith("/student");

    const wrongRoute =
      (user.role === "STUDENT" && (isAdminRoute || isLecturerRoute)) ||
      (user.role === "LECTURER" && (isAdminRoute || isStudentRoute)) ||
      (user.role === "ADMIN" && (isLecturerRoute || isStudentRoute));

    if (wrongRoute) {
      router.replace(homePath);
    }
  }, [isAuthenticated, user, router, pathname]);

  if (!isAuthenticated || !user) return null;

  const hideSidebar = NO_SIDEBAR_PATHS.includes(pathname);

  // ── No-sidebar shell (class selector, etc.) ─────────────────────────
  const displayName = user.name ?? "Giảng viên";
  const initials = displayName
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  if (hideSidebar) {
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-background">
        {/* Top bar: branding left, user info right */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-5 shadow-saga-xs">
          {/* Left: logo + app title */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary shadow-xs">
              <GitGraphIcon className="size-3.5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-foreground">SAGA</span>
              <span className="ml-2 hidden text-[10px] text-muted-foreground sm:inline">Không gian giảng dạy</span>
            </div>
          </div>

          {/* Right: bell + avatar + name */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative size-9 rounded-full" aria-label="Thông báo">
              <BellIcon className="size-4" />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-destructive" />
            </Button>
            <div className="hidden h-6 w-px bg-border sm:block" />
            <Avatar size="sm">
              <AvatarFallback className="bg-primary/10 text-[10px] font-bold text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <p className="text-xs font-bold leading-tight">{displayName}</p>
              <p className="text-[10px] text-muted-foreground">Giảng viên</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    );
  }

  // ── Full shell with sidebar ──────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar — desktop */}
      <div className="hidden md:flex">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      </div>

      {/* Sidebar — mobile (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="flex items-center md:hidden px-4 h-14 border-b border-border gap-3 bg-background shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={() => setMobileOpen(true)}
            aria-label="Mở menu"
          >
            <MenuIcon className="w-4 h-4" />
          </Button>
          <span className="font-bold text-foreground tracking-tight text-sm">SAGA</span>
        </div>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
