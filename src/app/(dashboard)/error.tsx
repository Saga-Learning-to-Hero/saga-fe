"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircleIcon, RotateCwIcon, LayoutDashboardIcon, LogInIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { getRoleHomePath } from "@/features/auth/lib/role-routes";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    console.error("Dashboard caught error:", error);
  }, [error]);

  const redirectHref = isAuthenticated && user ? getRoleHomePath(user.role) : "/login";
  const redirectLabel = isAuthenticated ? "Về trang tổng quan" : "Đăng nhập lại";
  const RedirectIcon = isAuthenticated ? LayoutDashboardIcon : LogInIcon;

  return (
    <div className="min-h-[70vh] w-full flex flex-col items-center justify-center p-6 text-foreground relative overflow-hidden">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive shadow-xl shadow-destructive/5">
            <AlertCircleIcon className="w-10 h-10" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Đã xảy ra lỗi khi tải dữ liệu
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            {error?.message && error.message.length < 150
              ? error.message
              : "Hệ thống gặp sự cố kết nối hoặc dữ liệu từ máy chủ chưa sẵn sàng. Bạn có thể thử tải lại trang hoặc quay về trang chính."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto h-10 px-5 gap-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-md shadow-primary/20"
          >
            <RotateCwIcon className="w-4 h-4" />
            Thử lại
          </Button>

          <Link
            href={redirectHref}
            className="w-full sm:w-auto h-10 px-5 inline-flex items-center justify-center gap-2 text-xs font-semibold rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-colors cursor-pointer"
          >
            <RedirectIcon className="w-4 h-4" />
            {redirectLabel}
          </Link>
        </div>

        {error?.digest && (
          <p className="text-[11px] text-muted-foreground/60 pt-2 font-mono">
            Mã định danh lỗi: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
