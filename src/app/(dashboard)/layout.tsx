"use client";

import { Suspense, useState, useEffect } from "react";
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
  const {
    isPending: isSessionLoading,
    isError: isSessionError,
    isFetching: isSessionFetching,
    refetch: refetchSession,
  } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!hasHydrated || isSessionLoading) return;
    // Lỗi mạng/5xx không được hiểu thành hết phiên — giữ danh tính và hiện màn thử lại.
    if (isSessionError) return;

    if (!isAuthenticated || !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (passwordSetupRequired) {
      router.replace("/auth/setup-password");
      return;
    }

    if (!isPathAllowedForRole(pathname, user.role)) {
      router.replace(getRoleHomePath(user.role));
    }
  }, [
    hasHydrated,
    isSessionLoading,
    isSessionError,
    isAuthenticated,
    user,
    passwordSetupRequired,
    router,
    pathname,
  ]);

  if (!hasHydrated || (isSessionLoading && !user)) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <SagaLogo size="md" showText={true} showSubtitle={false} />
          <LoaderCircleIcon className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (isSessionError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-md space-y-4 rounded-2xl border border-dashed border-border bg-card p-8 text-center shadow-xs">
          <SagaLogo size="sm" showText={true} showSubtitle={false} />
          <div className="space-y-1">
            <h1 className="text-base font-bold">Không thể kết nối máy chủ</h1>
            <p className="text-sm text-muted-foreground">
              Phiên làm việc chưa được xác nhận vì lỗi mạng hoặc máy chủ tạm thời. Tài khoản của bạn vẫn được giữ, hãy thử lại.
            </p>
          </div>
          <Button
            className="cursor-pointer"
            disabled={isSessionFetching}
            onClick={() => void refetchSession()}
          >
            {isSessionFetching ? (
              <>
                <LoaderCircleIcon className="size-4 animate-spin" aria-hidden />
                Đang thử lại...
              </>
            ) : (
              "Thử lại"
            )}
          </Button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  if (user.role === "LECTURER" || user.role === "STUDENT") {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <Suspense fallback={<div className="h-16 border-b border-border bg-background" />}>
          <TopNavHeader />
        </Suspense>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        <ProfileModal />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden md:flex">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
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


