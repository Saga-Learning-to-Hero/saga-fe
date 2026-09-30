"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldAlertIcon,
  CheckCircle2Icon,
  XCircleIcon,
  CheckSquareIcon,
  GitBranchIcon,
  Loader2Icon,
  ArrowLeftIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStartJiraLink } from "../hooks/useJiraIntegrations";
import { useStartGitHubLink } from "../hooks/useGithubIntegrations";
import { useUserIdentities } from "../hooks/useUserIntegrations";
import { studentCoursePath } from "@/features/student/courses/hooks/use-student-course-context";
import { showInfoToast, showErrorToast } from "@/lib/api-error";

interface PersonalIntegrationRequiredModalProps {
  isOpen: boolean;
  isJiraConnected?: boolean;
  isGitHubConnected?: boolean;
  jiraDisplayName?: string | null;
  githubDisplayName?: string | null;
  courseId?: string;
  moduleName?: "task" | "commit";
}

export function PersonalIntegrationRequiredModal({
  isOpen,
  isJiraConnected: propIsJiraConnected,
  isGitHubConnected: propIsGitHubConnected,
  jiraDisplayName: propJiraDisplayName,
  githubDisplayName: propGithubDisplayName,
  courseId,
  moduleName = "task",
}: PersonalIntegrationRequiredModalProps) {
  const router = useRouter();
  const {
    isJiraConnected: hookIsJiraConnected,
    isGitHubConnected: hookIsGitHubConnected,
    jiraIdentity,
    githubIdentity,
  } = useUserIdentities();

  const startJiraLinkMutation = useStartJiraLink();
  const startGitHubLinkMutation = useStartGitHubLink();

  const isJiraConnected = propIsJiraConnected ?? hookIsJiraConnected;
  const isGitHubConnected = propIsGitHubConnected ?? hookIsGitHubConnected;

  const jiraName = propJiraDisplayName || jiraIdentity?.displayName || jiraIdentity?.login || null;
  const githubName = propGithubDisplayName || githubIdentity?.displayName || githubIdentity?.login || null;

  useEffect(() => {
    if (!isOpen) return;

    // Khóa cuộn trang khi modal chặn đang mở
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnectJira = async () => {
    try {
      showInfoToast("Đang chuyển hướng sang Atlassian Jira OAuth...", { id: "jira-oauth" });
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "/student/sprint-progress";
      const result = await startJiraLinkMutation.mutateAsync(currentPath);
      if (result.authorizationUrl && typeof window !== "undefined") {
        window.open(result.authorizationUrl, "_self");
      }
    } catch {
      showErrorToast("Lỗi khi kết nối với máy chủ Atlassian. Vui lòng thử lại sau.", { id: "jira-oauth" });
    }
  };

  const handleConnectGitHub = async () => {
    try {
      showInfoToast("Đang chuyển hướng sang GitHub OAuth...", { id: "github-oauth" });
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "/student/commits";
      const result = await startGitHubLinkMutation.mutateAsync(currentPath);
      if (result.authorizationUrl && typeof window !== "undefined") {
        window.open(result.authorizationUrl, "_self");
      }
    } catch {
      showErrorToast("Lỗi khi kết nối với máy chủ GitHub. Vui lòng thử lại sau.", { id: "github-oauth" });
    }
  };

  const handleGoBack = () => {
    if (courseId) {
      router.push(studentCoursePath("/student/dashboard", courseId));
    } else {
      router.push("/student/courses");
    }
  };

  const moduleDescription =
    moduleName === "commit"
      ? "Nhật ký Commit mã nguồn GitHub"
      : "Quản lý Tiến độ Sprint & Bảng Kanban Task";

  return (
    <div
      className="fixed inset-x-0 bottom-0 top-14 md:top-[97px] z-30 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto overscroll-none animate-in fade-in-0 duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="integration-required-title"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div
        className="bg-card border border-border/80 rounded-3xl w-full max-w-lg max-h-[calc(100vh-120px)] md:max-h-[calc(100vh-140px)] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border/60 bg-muted/20 shrink-0 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-amber-500/20 via-primary/20 to-rose-500/20 text-primary border border-border/80 flex items-center justify-center mx-auto shadow-xs">
            <ShieldAlertIcon className="w-7 h-7 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2
              id="integration-required-title"
              className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight"
            >
              Yêu cầu liên kết tài khoản cá nhân
            </h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto leading-relaxed">
              Để truy cập <span className="font-semibold text-foreground">{moduleDescription}</span>, bạn bắt buộc phải liên kết cả tài khoản Atlassian Jira và GitHub cá nhân.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Card Jira */}
          <div
            className={`rounded-2xl border p-4 space-y-3 shadow-2xs transition-all ${
              isJiraConnected
                ? "border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/10"
                : "border-border/80 bg-background/60"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                    isJiraConnected
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                  }`}
                >
                  <CheckSquareIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">
                    Tài khoản Atlassian Jira
                  </p>
                  {isJiraConnected && jiraName ? (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 truncate font-medium">
                      Đã kết nối: <span className="font-mono font-bold text-foreground">{jiraName}</span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground truncate">
                      {isJiraConnected ? "Đã xác thực và liên kết thành công" : "Xác thực quyền tạo và thực thi task"}
                    </p>
                  )}
                </div>
              </div>

              {isJiraConnected ? (
                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-bold shrink-0 gap-1 px-2.5 py-0.5">
                  <CheckCircle2Icon className="w-3.5 h-3.5" />
                  Đã kết nối
                </Badge>
              ) : (
                <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-[11px] font-bold shrink-0 gap-1 px-2.5 py-0.5">
                  <XCircleIcon className="w-3.5 h-3.5" />
                  Chưa kết nối
                </Badge>
              )}
            </div>

            {!isJiraConnected && (
              <div className="pt-1">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleConnectJira}
                  disabled={startJiraLinkMutation.isPending}
                  className="w-full h-8.5 text-xs font-bold rounded-xl gap-2 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs"
                >
                  {startJiraLinkMutation.isPending ? (
                    <>
                      <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang chuyển hướng...</span>
                    </>
                  ) : (
                    <>
                      <CheckSquareIcon className="w-3.5 h-3.5" />
                      <span>Liên kết tài khoản Jira ngay</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Card GitHub */}
          <div
            className={`rounded-2xl border p-4 space-y-3 shadow-2xs transition-all ${
              isGitHubConnected
                ? "border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/10"
                : "border-border/80 bg-background/60"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                    isGitHubConnected
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                  }`}
                >
                  <GitBranchIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">
                    Tài khoản GitHub
                  </p>
                  {isGitHubConnected && githubName ? (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 truncate font-medium">
                      Đã kết nối: <span className="font-mono font-bold text-foreground">@{githubName}</span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground truncate">
                      {isGitHubConnected ? "Đã xác thực và liên kết thành công" : "Đối soát tác giả commit và dòng code"}
                    </p>
                  )}
                </div>
              </div>

              {isGitHubConnected ? (
                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-bold shrink-0 gap-1 px-2.5 py-0.5">
                  <CheckCircle2Icon className="w-3.5 h-3.5" />
                  Đã kết nối
                </Badge>
              ) : (
                <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-[11px] font-bold shrink-0 gap-1 px-2.5 py-0.5">
                  <XCircleIcon className="w-3.5 h-3.5" />
                  Chưa kết nối
                </Badge>
              )}
            </div>

            {!isGitHubConnected && (
              <div className="pt-1">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleConnectGitHub}
                  disabled={startGitHubLinkMutation.isPending}
                  className="w-full h-8.5 text-xs font-bold rounded-xl gap-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-950 cursor-pointer shadow-xs transition-colors"
                >
                  {startGitHubLinkMutation.isPending ? (
                    <>
                      <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang chuyển hướng...</span>
                    </>
                  ) : (
                    <>
                      <GitBranchIcon className="w-3.5 h-3.5" />
                      <span>Liên kết tài khoản GitHub ngay</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Privacy Note */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/30 border border-border/60 text-[11px] text-muted-foreground">
            <ShieldCheckIcon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              SAGA chỉ yêu cầu quyền đọc định danh công khai để đối soát minh chứng kỹ thuật và ghi nhận đóng góp công sức. Không can thiệp mã nguồn hay thông tin riêng tư.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/60 flex items-center justify-between bg-muted/20 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="h-8.5 text-xs font-semibold rounded-xl gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            <span>Về Dashboard</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/profile/integrations")}
            className="h-8.5 text-xs font-semibold rounded-xl cursor-pointer"
          >
            <span>Quản lý liên kết cá nhân</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
