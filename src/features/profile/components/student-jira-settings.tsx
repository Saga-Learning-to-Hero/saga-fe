"use client";

import { useState } from "react";
import {
  CheckSquareIcon,
  RefreshCwIcon,
  ExternalLinkIcon,
  LoaderCircleIcon,
  ShieldCheckIcon,
} from "lucide-react";
import type { User, JiraIntegration } from "@/types/auth";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_JIRA_INTEGRATIONS } from "../data/mock-integrations";
import { JiraIntegrationCard } from "./jira-integration-card";

interface StudentJiraSettingsProps {
  user: User;
}

const NEXT_JIRA_CANDIDATES: JiraIntegration[] = [
  {
    id: "jira-03",
    name: "Jira Hệ thống Thương mại Điện tử B2C",
    connected: true,
    serverUrl: "https://fpt-swp391.atlassian.net",
    email: "hailhhe170504@fpt.edu.vn",
    apiToken: "oauth2_bearer_verified",
    projectKey: "SWP391_ECOMMERCE",
    isPrimary: false,
    lastSyncedAt: "Vừa xong",
    syncedTasksCount: 16,
    status: "ACTIVE",
  },
  {
    id: "jira-04",
    name: "Jira Doanh nghiệp Đối tác Viettel",
    connected: true,
    serverUrl: "https://viettel-solutions.atlassian.net",
    email: "hailhhe170504@fpt.edu.vn",
    apiToken: "oauth2_bearer_verified",
    projectKey: "VTS_CORE",
    isPrimary: false,
    lastSyncedAt: "Vừa xong",
    syncedTasksCount: 22,
    status: "ACTIVE",
  },
];

export function StudentJiraSettings({ user }: StudentJiraSettingsProps) {
  const { updateUserProfile } = useAuthStore();

  const initialList = user.jiraIntegrations && user.jiraIntegrations.length > 0
    ? user.jiraIntegrations
    : user.jiraIntegration && user.jiraIntegration.connected
      ? [
        {
          id: "jira-legacy",
          name: "Jira SAGA Capstone Project",
          connected: true,
          serverUrl: user.jiraIntegration.serverUrl || "https://saga-capstone.atlassian.net",
          email: user.jiraIntegration.email || user.email,
          apiToken: user.jiraIntegration.apiToken || "oauth2_bearer_verified",
          projectKey: user.jiraIntegration.projectKey || "SWP490_SAGA",
          isPrimary: true,
          lastSyncedAt: user.jiraIntegration.lastSyncedAt || "28/08/2026 14:30",
          syncedTasksCount: 28,
          status: "ACTIVE" as const,
        },
      ]
      : MOCK_JIRA_INTEGRATIONS;

  const [integrations, setIntegrations] = useState<JiraIntegration[]>(initialList);
  const [isConnecting, setIsConnecting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  const saveToStore = (newList: JiraIntegration[]) => {
    setIntegrations(newList);
    const primary = newList.find((i) => i.isPrimary) || newList[0] || null;
    updateUserProfile({
      jiraIntegrations: newList,
      jiraIntegration: primary ? {
        connected: primary.connected,
        serverUrl: primary.serverUrl,
        email: primary.email,
        apiToken: primary.apiToken,
        projectKey: primary.projectKey,
        lastSyncedAt: primary.lastSyncedAt,
      } : undefined,
    });
  };

  const handleConnectJiraOAuth = async () => {
    setIsConnecting(true);
    setFeedbackMsg("Đang chuyển hướng sang Atlassian để xác thực tài khoản Jira...");

    await new Promise((r) => setTimeout(r, 1200));

    const nextItem = NEXT_JIRA_CANDIDATES.find(
      (candidate) => !integrations.some((i) => i.projectKey === candidate.projectKey)
    ) || {
      id: `jira-${Date.now()}`,
      name: `Jira Workspace Dự án (${integrations.length + 1})`,
      connected: true,
      serverUrl: "https://saga-enterprise.atlassian.net",
      email: user.email || "hailhhe170504@fpt.edu.vn",
      apiToken: "oauth2_bearer_verified",
      projectKey: `PRJ_${integrations.length + 1}`,
      isPrimary: false,
      lastSyncedAt: "Vừa xong",
      syncedTasksCount: 18,
      status: "ACTIVE" as const,
    };

    const updated = [...integrations, nextItem];
    if (!updated.some((i) => i.isPrimary)) {
      updated[0].isPrimary = true;
    }

    saveToStore(updated);
    setIsConnecting(false);
    setFeedbackMsg(`Đã kết nối thành công tài khoản Jira (${nextItem.projectKey}) qua Atlassian OAuth!`);
    setTimeout(() => setFeedbackMsg(""), 4500);
  };

  const handleDelete = (id: string) => {
    const remaining = integrations.filter((i) => i.id !== id);
    if (remaining.length > 0 && !remaining.some((i) => i.isPrimary)) {
      remaining[0].isPrimary = true;
    }
    saveToStore(remaining);
    setFeedbackMsg("Đã ngắt kết nối Workspace Jira.");
    setTimeout(() => setFeedbackMsg(""), 4000);
  };

  const handleSetPrimary = (id: string) => {
    const updated = integrations.map((i) => ({
      ...i,
      isPrimary: i.id === id,
    }));
    saveToStore(updated);
    setFeedbackMsg("Đã đặt Workspace làm dự án chính mặc định.");
    setTimeout(() => setFeedbackMsg(""), 4000);
  };

  const handleSyncItem = async (id: string) => {
    await new Promise((r) => setTimeout(r, 650));
    const now = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const updated = integrations.map((i) =>
      i.id === id
        ? {
          ...i,
          lastSyncedAt: `Hôm nay lúc ${now}`,
          syncedTasksCount: (i.syncedTasksCount || 0) + Math.floor(Math.random() * 2),
        }
        : i
    );
    saveToStore(updated);
    setFeedbackMsg("Đồng bộ dữ liệu Jira Cloud thành công!");
    setTimeout(() => setFeedbackMsg(""), 4000);
  };

  const handleSyncAll = async () => {
    setIsSyncingAll(true);
    await new Promise((r) => setTimeout(r, 900));
    const now = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const updated = integrations.map((i) => ({
      ...i,
      lastSyncedAt: `Hôm nay lúc ${now}`,
      syncedTasksCount: (i.syncedTasksCount || 0) + 1,
    }));
    saveToStore(updated);
    setIsSyncingAll(false);
    setFeedbackMsg("Đã đồng bộ toàn bộ các Workspace Jira!");
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
                  Jira Software Workspaces
                </CardTitle>
                <Badge variant="outline" className="font-mono text-[11px] px-2 py-0 border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10 font-bold">
                  {integrations.length} kết nối
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Chuyển tiếp ủy quyền trực tiếp qua cổng Atlassian OAuth
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {integrations.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSyncAll}
                disabled={isSyncingAll}
                className="h-8.5 px-3 text-xs font-semibold rounded-xl gap-1.5 cursor-pointer"
              >
                <RefreshCwIcon className={`w-3.5 h-3.5 ${isSyncingAll ? "animate-spin text-primary" : ""}`} />
                <span>Đồng bộ tất cả</span>
              </Button>
            )}

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
                  <span>+ Kết nối qua Jira Link</span>
                </>
              )}
            </Button>
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

        {integrations.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-border/80 bg-muted/20 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <CheckSquareIcon className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h4 className="text-sm font-bold text-foreground">Chưa có kết nối Jira Software nào</h4>
              <p className="text-xs text-muted-foreground">
                Bấm nút kết nối để chuyển hướng qua trang đăng nhập của Atlassian Jira và cấp quyền truy cập một chạm.
              </p>
            </div>
            <Button
              type="button"
              onClick={handleConnectJiraOAuth}
              disabled={isConnecting}
              className="text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-1.5 cursor-pointer shadow-xs"
            >
              <ExternalLinkIcon className="w-3.5 h-3.5" />
              <span>Chuyển sang Atlassian Jira để kết nối</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {integrations.map((item) => (
              <JiraIntegrationCard
                key={item.id}
                item={item}
                onEdit={handleConnectJiraOAuth}
                onDelete={handleDelete}
                onSetPrimary={handleSetPrimary}
                onSync={handleSyncItem}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
