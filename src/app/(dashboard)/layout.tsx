"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { GitGraphIcon, MenuIcon } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { SagaLogo } from "@/components/common/saga-logo";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { getRoleHomePath } from "@/features/auth/lib/role-routes";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { TopHeader } from "@/components/layout/top-header";

const CLASS_SELECTION_PATHS = ["/lecturer/courses", "/student/courses"];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, hasHydrated } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated || !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
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
  }, [hasHydrated, isAuthenticated, user, router, pathname]);

  if (!hasHydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <GitGraphIcon className="size-8 animate-pulse text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  const isClassSelectionPage = CLASS_SELECTION_PATHS.includes(pathname);

  if (isClassSelectionPage) {
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-background">
        <TopHeader />
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
          <SagaLogo size="xs" showText={true} showSubtitle={false} />
        </div>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
