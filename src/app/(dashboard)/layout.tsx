"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { MenuIcon, LoaderCircleIcon } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { SagaLogo } from "@/components/common/saga-logo";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useSession } from "@/features/auth/hooks/useAuth";
import { getRoleHomePath, isPathAllowedForRole } from "@/features/auth/lib/role-routes";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

import { TopNavHeader } from "@/components/layout/header/top-nav-header";
import { ProfileModal } from "@/features/profile/components/profile-modal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, passwordSetupRequired, hasHydrated } = useAuthStore();
  useSession(); // Tự động đồng bộ và làm mới phiên từ cookie backend
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Chờ Zustand đọc xong localStorage trước khi quyết định
    if (!hasHydrated) return;

    if (!isAuthenticated || !user) {
      // Giữ lại URL hiện tại để quay lại sau khi đăng nhập
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    // Nếu tài khoản Google yêu cầu đặt mật khẩu lần đầu, bắt buộc sang trang thiết lập mật khẩu
    if (passwordSetupRequired) {
      router.replace("/auth/setup-password");
      return;
    }

    // Role guard — chặn truy cập route sai role (isPathAllowedForRole đã tự động bao gồm các tuyến dùng chung)
    if (!isPathAllowedForRole(pathname, user.role)) {
      router.replace(getRoleHomePath(user.role));
    }
  }, [hasHydrated, isAuthenticated, user, passwordSetupRequired, router, pathname]);


  // Hiển thị loading shell trong lúc hydrate
  if (!hasHydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <SagaLogo size="md" showText={true} showSubtitle={false} />
          <LoaderCircleIcon className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  // ── 1. GIAO DIỆN GIẢNG VIÊN & SINH VIÊN: TOP HEADER NAVIGATION (NO SIDEBAR) ──
  if (user.role === "LECTURER" || user.role === "STUDENT") {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        {/* Header điều hướng 2 tầng chuẩn Academic Tech */}
        <TopNavHeader />

        {/* Khung nội dung chiếm trọn 100% chiều ngang màn hình */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        <ProfileModal />
      </div>
    );
  }

  // ── 2. GIAO DIỆN QUẢN TRỊ VIÊN (ADMIN): SIDEBAR DỌC CỔ ĐIỂN ──────────────
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

      <ProfileModal />
    </div>
  );
}


