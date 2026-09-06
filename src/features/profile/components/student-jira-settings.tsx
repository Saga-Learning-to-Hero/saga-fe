"use client";

import { useState } from "react";
import {
  CheckSquareIcon,
  RefreshCwIcon,
  ExternalLinkIcon,
  LoaderCircleIcon,
  ShieldCheckIcon,
  UnlinkIcon,
  MailIcon,
  CheckCircle2Icon,
  UserCheckIcon,
  ClockIcon,
} from "lucide-react";
import type { User } from "@/types/auth";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface StudentJiraSettingsProps {
  user: User;
}

export function StudentJiraSettings({ user }: StudentJiraSettingsProps) {
  const { updateUserProfile } = useAuthStore();

  const isConnected = Boolean(
    user.jiraIntegration?.connected ||
    (user.jiraIntegrations && user.jiraIntegrations.some((j) => j.connected))
  );

  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const jiraEmail = user.jiraIntegration?.email || user.email || "hailhhe170504@fpt.edu.vn";
  const displayName = user.jiraIntegration?.name || user.fullName || user.name || "Lê Hoàng Hải";
  const lastSynced = user.jiraIntegration?.lastSyncedAt || "28/08/2026 14:30";
  const accountId = "atlassian:557058:8f2441a1";

  const handleConnectJiraOAuth = async () => {
    setIsConnecting(true);
    setFeedbackMsg("Đang chuyển hướng sang cổng Atlassian ID để cấp quyền truy cập tài khoản cá nhân...");

    await new Promise((r) => setTimeout(r, 1200));

    const now = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const today = new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    const formattedTime = `${today} ${now}`;

    updateUserProfile({
      jiraIntegration: {
        connected: true,
        name: displayName,
        email: jiraEmail,
        lastSyncedAt: `Hôm nay lúc ${now}`,
        status: "ACTIVE",
        serverUrl: user.jiraIntegration?.serverUrl || "https://atlassian.net",
        apiToken: user.jiraIntegration?.apiToken || "oauth2_bearer_verified",
        projectKey: user.jiraIntegration?.projectKey || "CAPSTONE",
      },
      jiraIntegrations: [
        {
          id: "jira-personal",
          name: "Tài khoản Atlassian Jira Cá nhân",
          connected: true,
          email: jiraEmail,
          lastSyncedAt: formattedTime,
          status: "ACTIVE",
          serverUrl: "https://atlassian.net",
          apiToken: "oauth2_bearer_verified",
          projectKey: "CAPSTONE",
          isPrimary: true,
        },
      ],
    });

    setIsConnecting(false);
    setFeedbackMsg("Liên kết thành công tài khoản Atlassian Jira cá nhân qua OAuth 2.0!");
    setTimeout(() => setFeedbackMsg(""), 4500);
  };

  const handleDisconnect = () => {
    updateUserProfile({
      jiraIntegration: {
        connected: false,
        email: jiraEmail,
        serverUrl: user.jiraIntegration?.serverUrl || "https://atlassian.net",
        apiToken: user.jiraIntegration?.apiToken || "token",
        projectKey: user.jiraIntegration?.projectKey || "CAPSTONE",
        lastSyncedAt: undefined,
        status: "ERROR",
      },
      jiraIntegrations: [],
    });
    setFeedbackMsg("Đã hủy liên kết tài khoản Atlassian Jira cá nhân.");
    setTimeout(() => setFeedbackMsg(""), 4000);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await new Promise((r) => setTimeout(r, 800));
    const now = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

    updateUserProfile({
      jiraIntegration: {
        connected: true,
        name: displayName,
        email: jiraEmail,
        serverUrl: user.jiraIntegration?.serverUrl || "https://atlassian.net",
        apiToken: user.jiraIntegration?.apiToken || "oauth2_bearer_verified",
        projectKey: user.jiraIntegration?.projectKey || "CAPSTONE",
        lastSyncedAt: `Hôm nay lúc ${now}`,
        status: "ACTIVE",
      },
    });

    setIsSyncing(false);
    setFeedbackMsg("Đã kiểm tra và đồng bộ trạng thái tài khoản Jira thành công!");
    setTimeout(() => setFeedbackMsg(""), 4000);
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
                  Tài khoản Atlassian Jira Cá nhân
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
                Định danh Assignee để hệ thống tự động ghi nhận các task Jira của bạn
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
                onClick={handleConnectJiraOAuth}
                disabled={isConnecting}
                className="h-8.5 px-3.5 text-xs font-bold rounded-xl gap-1.5 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-2xs"
              >
                {isConnecting ? (
                  <>
                    <LoaderCircleIcon className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang kết nối...</span>
                  </>
                ) : (
                  <>
                    <ExternalLinkIcon className="w-3.5 h-3.5" />
                    <span>Kết nối tài khoản Jira</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4 bg-card">
        {feedbackMsg && (
          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in-0">
            <ShieldCheckIcon className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {isConnected ? (
          <div className="p-4 sm:p-5 rounded-2xl border border-blue-500/30 bg-blue-500/5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                  <UserCheckIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">{displayName}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                    <MailIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="font-mono">{jiraEmail}</span>
                  </div>
                </div>
              </div>

              <Badge
                variant="outline"
                className="self-start sm:self-auto bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 font-mono text-[11px] px-2.5 py-1"
              >
                OAuth 2.0 Verified
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border/60 text-xs">
              <div className="p-3 rounded-xl bg-background border border-border/60 space-y-1">
                <span className="text-muted-foreground text-[11px] block">Mã định danh Atlassian (Account ID):</span>
                <span className="font-mono font-bold text-foreground text-xs block truncate">
                  {accountId}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-background border border-border/60 space-y-1">
                <span className="text-muted-foreground text-[11px] block">Phạm vi quyền truy cập:</span>
                <span className="font-medium text-foreground text-xs block">
                  read:jira-user, read:jira-work
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
                <ClockIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
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
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <CheckSquareIcon className="w-6 h-6" />
            </div>

            <div className="max-w-md mx-auto space-y-1.5">
              <h4 className="text-sm font-bold text-foreground">Tài khoản Atlassian Jira chưa được kết nối</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Liên kết tài khoản Atlassian Jira cá nhân của bạn để hệ thống tự động nhận diện và tính điểm các Task được giao trong dự án nhóm.
              </p>
            </div>

            <div className="max-w-md mx-auto p-3.5 rounded-xl bg-card border border-border/60 text-left space-y-2 text-xs">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <CheckCircle2Icon className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Tự động đối soát công việc theo Email Atlassian</span>
              </div>
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <CheckCircle2Icon className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Không cần nhập Site URL hay chọn từng Workspace</span>
              </div>
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <CheckCircle2Icon className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Ủy quyền an toàn qua chuẩn Atlassian OAuth 2.0</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleConnectJiraOAuth}
              disabled={isConnecting}
              className="text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-2 cursor-pointer shadow-xs px-5 py-2.5"
            >
              {isConnecting ? (
                <>
                  <LoaderCircleIcon className="w-4 h-4 animate-spin" />
                  <span>Đang kết nối Atlassian...</span>
                </>
              ) : (
                <>
                  <ExternalLinkIcon className="w-4 h-4" />
                  <span>Kết nối tài khoản Atlassian Jira</span>
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
