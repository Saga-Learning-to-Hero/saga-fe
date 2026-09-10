"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2Icon,
  ArrowRightIcon,
  LayoutDashboardIcon,
  CheckSquareIcon,
  GitBranchIcon,
  SparklesIcon,
  UserIcon,
  Loader2Icon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { getRoleHomePath } from "@/features/auth/lib/role-routes";
import { useRefreshUserIntegrations } from "@/features/integrations/hooks/useUserIntegrations";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refreshIntegrations = useRefreshUserIntegrations();
  const { isAuthenticated, user } = useAuthStore();
  const [isSyncing, setIsSyncing] = useState<boolean>(true);

  const rawProvider = (searchParams.get("provider") || "").toLowerCase();
  const isJira = rawProvider.includes("jira") || rawProvider.includes("atlassian");
  const isGithub = rawProvider.includes("github");

  const homeHref = isAuthenticated && user ? getRoleHomePath(user.role) : "/dashboard";

  useEffect(() => {
    let isMounted = true;

    async function syncIntegrationsAndNavigate() {
      try {
        await refreshIntegrations();
      } finally {
        if (isMounted) {
          setIsSyncing(false);
          const returnParam = searchParams.get("returnPath") || searchParams.get("returnUrl");
          const target = returnParam || (user?.role === "STUDENT" ? "/student/project-info" : "/profile/integrations");
          router.replace(target);
        }
      }
    }

    syncIntegrationsAndNavigate();

    return () => {
      isMounted = false;
    };
  }, [refreshIntegrations, router, searchParams, user?.role]);

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="text-center space-y-4">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/15">
              <CheckCircle2Icon className="w-10 h-10" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-card border border-border flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-md">
              <SparklesIcon className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            {isJira ? (
              <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 gap-1.5 px-3 py-1 font-semibold text-xs">
                <CheckSquareIcon className="w-3.5 h-3.5" />
                Jira Software
              </Badge>
            ) : isGithub ? (
              <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 gap-1.5 px-3 py-1 font-semibold text-xs">
                <GitBranchIcon className="w-3.5 h-3.5" />
                GitHub Platform
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs font-semibold gap-1 px-3 py-1">
                Tích hợp dịch vụ
              </Badge>
            )}

            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold px-2.5 py-1">
              Thành công
            </Badge>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Liên kết tài khoản thành công!
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              Tài khoản của bạn đã được xác thực an toàn và liên kết thành công vào hệ thống SAGA.
              Toàn bộ dữ liệu đóng góp sẽ được đồng bộ tự động.
            </p>
          </div>
        </div>

        <div className="mt-6 bg-muted/40 border border-border/80 rounded-2xl p-4 text-center space-y-2 text-xs">
          <div className="flex items-center justify-center gap-2 text-primary font-medium">
            {isSyncing && <Loader2Icon className="w-3.5 h-3.5 animate-spin" />}
            <span>Đang cập nhật danh tính và chuyển hướng về trang Tích hợp...</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/profile/integrations"
            className="w-full sm:w-auto h-10 px-5 inline-flex items-center justify-center gap-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/25 transition-all cursor-pointer"
          >
            <span>Đến trang Tích hợp ngay</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>

          <Link
            href={homeHref}
            className="w-full sm:w-auto h-10 px-5 inline-flex items-center justify-center gap-2 text-xs font-semibold rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-colors cursor-pointer"
          >
            <LayoutDashboardIcon className="w-3.5 h-3.5 text-muted-foreground" />
            Về trang tổng quan
          </Link>
        </div>

        <div className="mt-6 pt-5 border-t border-border/60 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <UserIcon className="w-3.5 h-3.5" />
            Xem hồ sơ cá nhân
          </Link>
        </div>
      </div>

      <p className="text-center text-[11px] text-muted-foreground/60 font-mono">
        Trạng thái: AUTH_INTEGRATION_SUCCESS · SAGA Integration Engine
      </p>
    </div>
  );
}

export default function IntegrationSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-xl mx-auto p-12 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
          Đang nạp kết quả xác thực liên kết...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
