"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2Icon,
  XCircleIcon,
  ShieldCheckIcon,
  CheckSquareIcon,
  GitBranchIcon,
  Loader2Icon,
  ArrowLeftIcon,
} from "lucide-react";
import type { User } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { useUserIdentities } from "@/features/integrations/hooks/useUserIntegrations";
import { useJiraOAuthCallback } from "@/features/integrations/hooks/useJiraIntegrations";
import { useGitHubOAuthCallback } from "@/features/integrations/hooks/useGithubIntegrations";
import { StudentJiraSettings } from "./student-jira-settings";
import { StudentGitHubSettings } from "./student-github-settings";

interface IntegrationsViewProps {
  user: User;
}

export function IntegrationsView({ user }: IntegrationsViewProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 2) {
      router.back();
    } else {
      const defaultPath =
        user.role === "STUDENT"
          ? "/student/dashboard"
          : user.role === "LECTURER"
            ? "/lecturer/courses"
            : "/admin/dashboard";
      router.push(defaultPath);
    }
  };

  const {
    jiraIdentities,
    githubIdentities,
    jiraIdentity,
    githubIdentity,
    isJiraConnected,
    isGitHubConnected,
    isLoading,
    refetch,
  } = useUserIdentities();

  const jiraCallbackMutation = useJiraOAuthCallback();
  const githubCallbackMutation = useGitHubOAuthCallback();
  const { mutate: handleJiraCallback } = jiraCallbackMutation;
  const { mutate: handleGithubCallback } = githubCallbackMutation;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");
    const provider = urlParams.get("provider")?.toLowerCase();

    if (code && state) {
      const isGithub = provider === "github";
      const handler = isGithub ? handleGithubCallback : handleJiraCallback;

      handler(
        { code, state },
        {
          onSuccess: () => {
            window.history.replaceState({}, "", window.location.pathname);
            refetch();
            toast.success(
              isGithub
                ? "Liên kết tài khoản GitHub cá nhân thành công!"
                : "Liên kết tài khoản Atlassian Jira cá nhân thành công!"
            );
          },
          onError: () => {
            toast.error("Xác thực OAuth thất bại. Vui lòng thử lại.");
          },
        }
      );
    }
  }, [refetch, handleJiraCallback, handleGithubCallback]);

  const jiraConnected = isJiraConnected;
  const githubConnected = isGitHubConnected;

  const isCallbackPending = jiraCallbackMutation.isPending || githubCallbackMutation.isPending;

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-12">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="h-8 px-2 -ml-2 rounded-xl gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors border border-transparent hover:border-border"
        >
          <ArrowLeftIcon className="size-4" />
          <span>Quay lại</span>
        </Button>
      </div>

      {isCallbackPending && (
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-primary/15 border border-primary/30 text-xs text-primary font-semibold animate-pulse">
          <Loader2Icon className="w-4 h-4 animate-spin shrink-0" />
          <span>Đang xử lý hoàn tất xác thực OAuth tài khoản cá nhân...</span>
        </div>
      )}

      {isLoading && !isCallbackPending && (
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-primary font-medium animate-pulse">
          <Loader2Icon className="w-4 h-4 animate-spin shrink-0" />
          <span>Đang đồng bộ trạng thái liên kết Jira & GitHub cá nhân...</span>
        </div>
      )}

      <div
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-border/80 shadow-md"
        style={{
          background:
            "linear-gradient(135deg, oklch(from var(--saga-primary) calc(l + 0.05) c h), oklch(from var(--saga-accent) calc(l - 0.05) c h))",
        }}
      >
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-15 pointer-events-none"
          style={{ background: "oklch(1 0 0 / 20%)" }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-10 pointer-events-none"
          style={{ background: "oklch(1 0 0 / 20%)" }}
        />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Liên kết Tài khoản Cá nhân Jira & GitHub
            </h1>
            <p className="text-white/85 text-xs sm:text-sm leading-relaxed">
              Sinh viên chỉ cần liên kết tài khoản Jira và GitHub cá nhân một lần duy nhất. Hệ thống SAGA tự động
              đối soát tác giả commit và người thực hiện task trên toàn bộ các repository và bảng Jira của nhóm mà không cần chọn từng site hay repo.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-3 px-4 text-white flex items-center justify-between gap-4 min-w-[220px]">
              <div className="flex items-center gap-2">
                <CheckSquareIcon className="w-4 h-4 text-blue-300" />
                <span className="text-xs font-semibold">Tích hợp Jira</span>
              </div>
              {isLoading && !jiraIdentity ? (
                <Badge className="bg-white/20 text-white border-0 text-[10px] gap-1 px-2 animate-pulse">
                  <Loader2Icon className="w-3 h-3 animate-spin" /> Đang kiểm tra...
                </Badge>
              ) : jiraConnected ? (
                <Badge className="bg-emerald-500/80 text-white border-0 text-[10px] gap-1 px-2">
                  <CheckCircle2Icon className="w-3 h-3" /> Đã kết nối ({jiraIdentities.length})
                </Badge>
              ) : (
                <Badge className="bg-rose-500/80 text-white border-0 text-[10px] gap-1 px-2">
                  <XCircleIcon className="w-3 h-3" /> Chưa kết nối
                </Badge>
              )}
            </div>

            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-3 px-4 text-white flex items-center justify-between gap-4 min-w-[220px]">
              <div className="flex items-center gap-2">
                <GitBranchIcon className="w-4 h-4 text-purple-300" />
                <span className="text-xs font-semibold">Tích hợp GitHub</span>
              </div>
              {isLoading && !githubIdentity ? (
                <Badge className="bg-white/20 text-white border-0 text-[10px] gap-1 px-2 animate-pulse">
                  <Loader2Icon className="w-3 h-3 animate-spin" /> Đang kiểm tra...
                </Badge>
              ) : githubConnected ? (
                <Badge className="bg-emerald-500/80 text-white border-0 text-[10px] gap-1 px-2">
                  <CheckCircle2Icon className="w-3 h-3" /> Đã kết nối ({githubIdentities.length})
                </Badge>
              ) : (
                <Badge className="bg-rose-500/80 text-white border-0 text-[10px] gap-1 px-2">
                  <XCircleIcon className="w-3 h-3" /> Chưa kết nối
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-2xl bg-card border border-border/80 text-xs text-muted-foreground shadow-2xs">
        <ShieldCheckIcon className="size-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-foreground">Bảo mật & Quyền riêng tư của Sinh viên</p>
          <p>
            Hệ thống SAGA chỉ yêu cầu quyền đọc thông tin tài khoản cơ bản để khớp danh tính sinh viên với tác giả commit và người nhận việc Jira. Hệ thống không bao giờ lưu trữ mật khẩu cá nhân và không yêu cầu quyền can thiệp vào mã nguồn hay các dự án riêng tư bên ngoài đồ án.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <StudentJiraSettings
          user={user}
          identities={jiraIdentities}
          identity={jiraIdentity}
          isLoading={isLoading}
        />
        <StudentGitHubSettings
          user={user}
          identities={githubIdentities}
          identity={githubIdentity}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
