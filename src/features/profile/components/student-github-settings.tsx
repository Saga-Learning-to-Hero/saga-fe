"use client";

import {
  GitBranchIcon,
  ExternalLinkIcon,
  LoaderCircleIcon,
  ShieldCheckIcon,
  PlusIcon,
} from "lucide-react";
import type { User } from "@/types/auth";
import type { UserIdentityItem } from "@/features/integrations/types/user-integrations";
import {
  useStartGitHubLink,
  useSetPrimaryGitHubIdentity,
  useDeleteGitHubIdentity,
} from "@/features/integrations/hooks/useGithubIntegrations";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { GitHubConnectedCard } from "./github/github-connected-card";

interface StudentGitHubSettingsProps {
  user: User;
  identities?: UserIdentityItem[];
  identity?: UserIdentityItem | null;
  isLoading?: boolean;
}

export function StudentGitHubSettings({
  user,
  identities,
  identity,
  isLoading = false,
}: StudentGitHubSettingsProps) {
  const resolvedIdentities = identities ?? (identity ? [identity] : []);
  const isConnected = resolvedIdentities.length > 0;

  const startLinkMutation = useStartGitHubLink();
  const setPrimaryMutation = useSetPrimaryGitHubIdentity();
  const deleteMutation = useDeleteGitHubIdentity();

  const handleConnectGitHubOAuth = async () => {
    try {
      toast.loading("Đang chuyển hướng sang GitHub OAuth...", { id: "github-oauth" });
      const defaultPath = user?.role === "STUDENT" ? "/student/integrations" : "/profile/integrations";
      const currentPath = typeof window !== "undefined"
        ? (window.location.pathname.startsWith("/student") ? window.location.pathname : defaultPath)
        : defaultPath;
      const result = await startLinkMutation.mutateAsync(currentPath);

      if (result.authorizationUrl) {
        if (typeof window !== "undefined") {
          window.open(result.authorizationUrl, "_self");
        }
      }
    } catch {
      toast.error("Lỗi khi kết nối với máy chủ GitHub. Vui lòng thử lại sau.", { id: "github-oauth" });
    }
  };

  const handleSetPrimary = async (identityId: string) => {
    if (!identityId) return;
    const toastId = "github-primary";
    try {
      toast.loading("Đang đặt tài khoản GitHub làm định danh chính...", { id: toastId });
      await setPrimaryMutation.mutateAsync(identityId);
      toast.success("Đã đặt tài khoản GitHub làm định danh chính!", { id: toastId });
    } catch {
      toast.error("Không thể đặt làm định danh chính. Vui lòng thử lại.", { id: toastId });
    }
  };

  const handleDisconnect = async (identityId: string) => {
    if (!identityId) {
      toast.success("Đã hủy trạng thái liên kết.");
      return;
    }
    const toastId = "github-disconnect";
    try {
      toast.loading("Đang hủy liên kết tài khoản GitHub...", { id: toastId });
      await deleteMutation.mutateAsync(identityId);
      toast.success("Đã hủy liên kết tài khoản GitHub cá nhân thành công!", { id: toastId });
    } catch {
      toast.error("Lỗi khi hủy liên kết tài khoản GitHub. Vui lòng thử lại.", { id: toastId });
    }
  };

  return (
    <Card className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden">
      <CardHeader className="p-4 sm:p-5 border-b border-border/60 bg-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <GitBranchIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-foreground tracking-tight">
                  Tài khoản GitHub Cá nhân
                </CardTitle>
                {isLoading && resolvedIdentities.length === 0 ? (
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary/30 text-[11px] font-semibold gap-1 animate-pulse"
                  >
                    <LoaderCircleIcon className="w-3 h-3 animate-spin" />
                    Đang kiểm tra...
                  </Badge>
                ) : isConnected ? (
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[11px] font-bold gap-1"
                  >
                    <ShieldCheckIcon className="w-3.5 h-3.5" />
                    Đã kết nối ({resolvedIdentities.length})
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-muted text-muted-foreground border-border text-[11px] font-semibold"
                  >
                    Chưa kết nối
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Khớp tác giả commit git với sinh viên để tích lũy điểm Traceability và đóng góp code
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isLoading && resolvedIdentities.length === 0 ? (
              <div className="w-24 h-8.5 rounded-xl bg-muted/60 animate-pulse" />
            ) : isConnected ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleConnectGitHubOAuth}
                disabled={startLinkMutation.isPending}
                className="h-8.5 px-3 text-xs font-semibold rounded-xl gap-1.5 border-purple-500/30 hover:bg-purple-500/10 text-purple-600 dark:text-purple-400 cursor-pointer"
              >
                {startLinkMutation.isPending ? (
                  <LoaderCircleIcon className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <PlusIcon className="w-3.5 h-3.5" />
                )}
                <span>Thêm tài khoản GitHub</span>
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={handleConnectGitHubOAuth}
                disabled={startLinkMutation.isPending}
                className="h-8.5 px-3.5 text-xs font-bold rounded-xl gap-1.5 bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-2xs"
              >
                {startLinkMutation.isPending ? (
                  <>
                    <LoaderCircleIcon className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang kết nối...</span>
                  </>
                ) : (
                  <>
                    <ExternalLinkIcon className="w-3.5 h-3.5" />
                    <span>Kết nối GitHub</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4 bg-card">
        {isLoading && resolvedIdentities.length === 0 ? (
          <div className="p-8 flex flex-col items-center justify-center gap-2.5 rounded-2xl bg-muted/15 border border-dashed border-border/80 text-muted-foreground animate-pulse">
            <LoaderCircleIcon className="w-5 h-5 animate-spin text-primary" />
            <span className="text-xs font-medium">Đang tải trạng thái liên kết GitHub cá nhân...</span>
          </div>
        ) : isConnected ? (
          <div className="space-y-3">
            {resolvedIdentities.map((item) => (
              <GitHubConnectedCard
                key={item.id}
                identity={item}
                fallbackName={user.fullName || user.name}
                fallbackUsername={item.login || user.githubIntegration?.username}
                fallbackEmail={user.email}
                avatarUrl={user.avatar}
                isDeleting={deleteMutation.isPending}
                isSettingPrimary={setPrimaryMutation.isPending}
                onSetPrimary={() => handleSetPrimary(item.id)}
                onDisconnect={() => handleDisconnect(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="p-6 sm:p-8 text-center rounded-2xl border border-dashed border-border/80 bg-muted/10 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
              <GitBranchIcon className="w-6 h-6" />
            </div>

            <div className="max-w-md mx-auto space-y-1.5">
              <h4 className="text-sm font-bold text-foreground">Tài khoản GitHub chưa được kết nối</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Liên kết tài khoản GitHub cá nhân để hệ thống tự động ghi nhận tác giả các lượt commit mã nguồn của bạn vào đồ án nhóm.
              </p>
            </div>

            <Button
              type="button"
              onClick={handleConnectGitHubOAuth}
              disabled={startLinkMutation.isPending}
              className="text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white gap-2 cursor-pointer shadow-xs px-5 py-2.5"
            >
              {startLinkMutation.isPending ? (
                <>
                  <LoaderCircleIcon className="w-4 h-4 animate-spin" />
                  <span>Đang kết nối GitHub...</span>
                </>
              ) : (
                <>
                  <ExternalLinkIcon className="w-4 h-4" />
                  <span>Kết nối tài khoản GitHub</span>
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
