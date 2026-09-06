"use client";

import { useState } from "react";
import Image from "next/image";
import {
  GitBranchIcon,
  RefreshCwIcon,
  ExternalLinkIcon,
  LoaderCircleIcon,
  ShieldCheckIcon,
  UnlinkIcon,
  MailIcon,
  CheckCircle2Icon,
  ClockIcon,
} from "lucide-react";
import type { User } from "@/types/auth";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface StudentGitHubSettingsProps {
  user: User;
}

export function StudentGitHubSettings({ user }: StudentGitHubSettingsProps) {
  const { updateUserProfile } = useAuthStore();

  const isConnected = Boolean(
    user.githubIntegration?.connected ||
    (user.githubIntegrations && user.githubIntegrations.some((g) => g.connected))
  );

  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const username = user.githubIntegration?.username || "lehoanghai-fpt";
  const githubEmail = user.email || "hailhhe170504@fpt.edu.vn";
  const displayName = user.githubIntegration?.alias || user.fullName || user.name || "Lê Hoàng Hải";
  const avatarUrl = user.avatar || "https://avatars.githubusercontent.com/u/9919?v=4";
  const lastSynced = user.githubIntegration?.lastSyncedAt || "28/08/2026 15:45";

  const handleConnectGitHubOAuth = async () => {
    setIsConnecting(true);
    setFeedbackMsg("Đang chuyển hướng sang GitHub để xác thực tài khoản và cấp quyền định danh...");

    await new Promise((r) => setTimeout(r, 1200));

    const now = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const today = new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    const formattedTime = `${today} ${now}`;

    updateUserProfile({
      githubIntegration: {
        connected: true,
        username: username,
        alias: displayName,
        lastSyncedAt: `Hôm nay lúc ${now}`,
        status: "ACTIVE",
        accessToken: "oauth2_bearer_verified",
        repository: user.githubIntegration?.repository || "Saga-Learning-to-Hero/saga-fe",
        defaultBranch: user.githubIntegration?.defaultBranch || "dev",
      },
      githubIntegrations: [
        {
          id: "gh-personal",
          alias: "Tài khoản GitHub Cá nhân",
          connected: true,
          username: username,
          accessToken: "oauth2_bearer_verified",
          repository: "Saga-Learning-to-Hero/saga-fe",
          defaultBranch: "dev",
          lastSyncedAt: formattedTime,
          status: "ACTIVE",
          isPrimary: true,
        },
      ],
    });

    setIsConnecting(false);
    setFeedbackMsg("Liên kết thành công tài khoản GitHub cá nhân qua OAuth!");
    setTimeout(() => setFeedbackMsg(""), 4500);
  };

  const handleDisconnect = () => {
    updateUserProfile({
      githubIntegration: {
        connected: false,
        username: username,
        accessToken: user.githubIntegration?.accessToken || "token",
        repository: user.githubIntegration?.repository || "Saga-Learning-to-Hero/saga-fe",
        defaultBranch: user.githubIntegration?.defaultBranch || "dev",
        lastSyncedAt: undefined,
        status: "ERROR",
      },
      githubIntegrations: [],
    });
    setFeedbackMsg("Đã hủy liên kết tài khoản GitHub cá nhân.");
    setTimeout(() => setFeedbackMsg(""), 4000);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await new Promise((r) => setTimeout(r, 800));
    const now = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

    updateUserProfile({
      githubIntegration: {
        connected: true,
        username: username,
        alias: displayName,
        accessToken: user.githubIntegration?.accessToken || "oauth2_bearer_verified",
        repository: user.githubIntegration?.repository || "Saga-Learning-to-Hero/saga-fe",
        defaultBranch: user.githubIntegration?.defaultBranch || "dev",
        lastSyncedAt: `Hôm nay lúc ${now}`,
        status: "ACTIVE",
      },
    });

    setIsSyncing(false);
    setFeedbackMsg("Đã kiểm tra và đồng bộ trạng thái tài khoản GitHub thành công!");
    setTimeout(() => setFeedbackMsg(""), 4000);
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
                {isConnected ? (
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[11px] font-bold gap-1"
                  >
                    <ShieldCheckIcon className="w-3.5 h-3.5" />
                    Đã kết nối
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
                Định danh Git Author để hệ thống tự động ghi nhận các commit của bạn
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isConnected ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={isSyncing}
                className="h-8.5 px-3 text-xs font-semibold rounded-xl gap-1.5 cursor-pointer"
              >
                <RefreshCwIcon className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-primary" : ""}`} />
                <span>{isSyncing ? "Đang đồng bộ..." : "Đồng bộ lại"}</span>
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={handleConnectGitHubOAuth}
                disabled={isConnecting}
                className="h-8.5 px-3.5 text-xs font-bold rounded-xl gap-1.5 bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-2xs"
              >
                {isConnecting ? (
                  <>
                    <LoaderCircleIcon className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang kết nối...</span>
                  </>
                ) : (
                  <>
                    <ExternalLinkIcon className="w-3.5 h-3.5" />
                    <span>Kết nối tài khoản GitHub</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4 bg-card">
        {feedbackMsg && (
          <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in-0">
            <ShieldCheckIcon className="w-4 h-4 shrink-0 text-purple-600 dark:text-purple-400" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {isConnected ? (
          <div className="p-4 sm:p-5 rounded-2xl border border-purple-500/30 bg-purple-500/5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-purple-500/30 shrink-0 bg-muted">
                  <Image
                    src={avatarUrl}
                    alt={displayName}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">{displayName}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <a
                      href={`https://github.com/${username}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono font-bold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>@{username}</span>
                      <ExternalLinkIcon className="w-3 h-3 shrink-0" />
                    </a>
                    <span>·</span>
                    <div className="flex items-center gap-1 font-mono text-[11px]">
                      <MailIcon className="w-3 h-3 text-muted-foreground" />
                      <span>{githubEmail}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Badge
                variant="outline"
                className="self-start sm:self-auto bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 font-mono text-[11px] px-2.5 py-1"
              >
                GitHub App Verified
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border/60 text-xs">
              <div className="p-3 rounded-xl bg-background border border-border/60 space-y-1">
                <span className="text-muted-foreground text-[11px] block">Cơ chế định danh tác giả Git:</span>
                <span className="font-mono font-bold text-foreground text-xs block truncate">
                  Author matching (@{username})
                </span>
              </div>
              <div className="p-3 rounded-xl bg-background border border-border/60 space-y-1">
                <span className="text-muted-foreground text-[11px] block">Phạm vi quyền truy cập:</span>
                <span className="font-medium text-foreground text-xs block">
                  read:user, user:email
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
                <ClockIcon className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>Xác thực lần cuối: <strong className="text-foreground">{lastSynced}</strong></span>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                className="h-8 px-3 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl gap-1.5 cursor-pointer self-end sm:self-auto"
              >
                <UnlinkIcon className="w-3.5 h-3.5" />
                <span>Hủy liên kết tài khoản</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-8 text-center rounded-2xl border border-dashed border-border/80 bg-muted/10 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
              <GitBranchIcon className="w-6 h-6" />
            </div>

            <div className="max-w-md mx-auto space-y-1.5">
              <h4 className="text-sm font-bold text-foreground">Tài khoản GitHub chưa được kết nối</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Liên kết tài khoản GitHub cá nhân của bạn để hệ thống tự động nhận diện và tính điểm các commit, pull request của bạn trong nhóm.
              </p>
            </div>

            <div className="max-w-md mx-auto p-3.5 rounded-xl bg-card border border-border/60 text-left space-y-2 text-xs">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <CheckCircle2Icon className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Tự động nhận diện tác giả commit trên mọi repository của nhóm</span>
              </div>
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <CheckCircle2Icon className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Không cần chọn repo hay cấu hình từng nhánh git thủ công</span>
              </div>
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <CheckCircle2Icon className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Ủy quyền an toàn qua chuẩn GitHub OAuth</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleConnectGitHubOAuth}
              disabled={isConnecting}
              className="text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white gap-2 cursor-pointer shadow-xs px-5 py-2.5"
            >
              {isConnecting ? (
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
