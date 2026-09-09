"use client";

import {
  CheckSquareIcon,
  ExternalLinkIcon,
  LoaderCircleIcon,
  ShieldCheckIcon,
  PlusIcon,
} from "lucide-react";
import type { User } from "@/types/auth";
import type { UserIdentityItem } from "@/features/integrations/types/user-integrations";
import {
  useStartJiraLink,
  useSetPrimaryJiraIdentity,
  useDeleteJiraIdentity,
} from "@/features/integrations/hooks/useJiraIntegrations";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { JiraConnectedCard } from "./jira/jira-connected-card";

interface StudentJiraSettingsProps {
  user: User;
  identities?: UserIdentityItem[];
  identity?: UserIdentityItem | null;
  isLoading?: boolean;
}

export function StudentJiraSettings({
  user,
  identities,
  identity,
  isLoading = false,
}: StudentJiraSettingsProps) {
  const resolvedIdentities = identities ?? (identity ? [identity] : []);
  const isConnected = resolvedIdentities.length > 0;

  const startLinkMutation = useStartJiraLink();
  const setPrimaryMutation = useSetPrimaryJiraIdentity();
  const deleteMutation = useDeleteJiraIdentity();

  const handleConnectJiraOAuth = async () => {
    try {
      toast.loading("Đang chuyển hướng sang Atlassian ID OAuth...", { id: "jira-oauth" });
      const defaultPath = "/profile/integrations";
      const currentPath = typeof window !== "undefined"
        ? (window.location.pathname.startsWith("/profile") ? window.location.pathname : defaultPath)
        : defaultPath;
      const result = await startLinkMutation.mutateAsync(currentPath);

      if (result.authorizationUrl) {
        if (typeof window !== "undefined") {
          window.open(result.authorizationUrl, "_self");
        }
      }
    } catch {
      toast.error("Lỗi khi kết nối với máy chủ Atlassian. Vui lòng thử lại sau.", { id: "jira-oauth" });
    }
  };

  const handleSetPrimary = async (identityId: string) => {
    if (!identityId) return;
    const toastId = "jira-primary";
    try {
      toast.loading("Đang đặt tài khoản Jira làm định danh chính...", { id: toastId });
      await setPrimaryMutation.mutateAsync(identityId);
      toast.success("Đã đặt tài khoản Atlassian Jira làm định danh chính!", { id: toastId });
    } catch {
      toast.error("Không thể đặt làm định danh chính. Vui lòng thử lại.", { id: toastId });
    }
  };

  const handleDisconnect = async (identityId: string) => {
    if (!identityId) {
      toast.success("Đã hủy trạng thái liên kết.");
      return;
    }
    const toastId = "jira-disconnect";
    try {
      toast.loading("Đang hủy liên kết tài khoản Jira...", { id: toastId });
      await deleteMutation.mutateAsync(identityId);
      toast.success("Đã hủy liên kết tài khoản Atlassian Jira cá nhân thành công!", { id: toastId });
    } catch {
      toast.error("Lỗi khi hủy liên kết tài khoản Jira. Vui lòng thử lại.", { id: toastId });
    }
  };

  return (
    <Card className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden">
      <CardHeader className="p-4 sm:p-5 border-b border-border/60 bg-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckSquareIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-foreground tracking-tight">
                  Tài khoản Jira cá nhân
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
                Khớp tài khoản Jira để hệ thống tự động nhận diện các task được giao cho bạn
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
                onClick={handleConnectJiraOAuth}
                disabled={startLinkMutation.isPending}
                className="h-8.5 px-3 text-xs font-semibold rounded-xl gap-1.5 border-blue-500/30 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 cursor-pointer"
              >
                {startLinkMutation.isPending ? (
                  <LoaderCircleIcon className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <PlusIcon className="w-3.5 h-3.5" />
                )}
                <span>Thêm tài khoản Jira</span>
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={handleConnectJiraOAuth}
                disabled={startLinkMutation.isPending}
                className="h-8.5 px-3.5 text-xs font-bold rounded-xl gap-1.5 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-2xs"
              >
                {startLinkMutation.isPending ? (
                  <>
                    <LoaderCircleIcon className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang kết nối...</span>
                  </>
                ) : (
                  <>
                    <ExternalLinkIcon className="w-3.5 h-3.5" />
                    <span>Kết nối Jira</span>
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
            <span className="text-xs font-medium">Đang tải trạng thái liên kết Atlassian Jira cá nhân...</span>
          </div>
        ) : isConnected ? (
          <div className="space-y-3">
            {resolvedIdentities.map((item) => (
              <JiraConnectedCard
                key={item.id}
                identity={item}
                fallbackName={user.fullName || user.name}
                fallbackEmail={user.email}
                isDeleting={deleteMutation.isPending}
                isSettingPrimary={setPrimaryMutation.isPending}
                onSetPrimary={() => handleSetPrimary(item.id)}
                onDisconnect={() => handleDisconnect(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="p-6 sm:p-8 text-center rounded-2xl border border-dashed border-border/80 bg-muted/10 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <CheckSquareIcon className="w-6 h-6" />
            </div>

            <div className="max-w-md mx-auto space-y-1.5">
              <h4 className="text-sm font-bold text-foreground">Chưa kết nối tài khoản Jira</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Kết nối tài khoản Jira của bạn để hệ thống tự động nhận diện các task được giao trong dự án nhóm.
              </p>
            </div>

            <Button
              type="button"
              onClick={handleConnectJiraOAuth}
              disabled={startLinkMutation.isPending}
              className="text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-2 cursor-pointer shadow-xs px-5 py-2.5"
            >
              {startLinkMutation.isPending ? (
                <>
                  <LoaderCircleIcon className="w-4 h-4 animate-spin" />
                  <span>Đang kết nối Jira...</span>
                </>
              ) : (
                <>
                  <ExternalLinkIcon className="w-4 h-4" />
                  <span>Kết nối tài khoản Jira</span>
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
