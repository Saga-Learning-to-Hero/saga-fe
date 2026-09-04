"use client";

import { useState } from "react";
import {
  GitBranchIcon,
  RefreshCwIcon,
  ExternalLinkIcon,
  LoaderCircleIcon,
  ShieldCheckIcon,
} from "lucide-react";
import type { User, GitHubIntegration } from "@/types/auth";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_GITHUB_INTEGRATIONS } from "../data/mock-integrations";
import { GitHubIntegrationCard } from "./github-integration-card";

interface StudentGitHubSettingsProps {
  user: User;
}

const NEXT_GITHUB_CANDIDATES: GitHubIntegration[] = [
  {
    id: "gh-04",
    alias: "Tài liệu Kỹ thuật & Báo cáo Đồ án",
    connected: true,
    username: "lehoanghai-fpt",
    accessToken: "oauth2_bearer_verified",
    repository: "Saga-Learning-to-Hero/saga-docs",
    defaultBranch: "main",
    isPrimary: false,
    lastSyncedAt: "Vừa xong",
    syncedCommitsCount: 15,
    syncedPRsCount: 2,
    status: "ACTIVE",
  },
  {
    id: "gh-05",
    alias: "Ứng dụng Di động Flutter",
    connected: true,
    username: "lehoanghai-fpt",
    accessToken: "oauth2_bearer_verified",
    repository: "Saga-Learning-to-Hero/saga-mobile",
    defaultBranch: "main",
    isPrimary: false,
    lastSyncedAt: "Vừa xong",
    syncedCommitsCount: 28,
    syncedPRsCount: 4,
    status: "ACTIVE",
  },
];

export function StudentGitHubSettings({ user }: StudentGitHubSettingsProps) {
  const { updateUserProfile } = useAuthStore();

  const initialList = user.githubIntegrations && user.githubIntegrations.length > 0
    ? user.githubIntegrations
    : user.githubIntegration && user.githubIntegration.connected
      ? [
        {
          id: "gh-legacy",
          alias: "Frontend Web App (Next.js 16)",
          connected: true,
          username: user.githubIntegration.username || "lehoanghai-fpt",
          accessToken: user.githubIntegration.accessToken || "oauth2_bearer_verified",
          repository: user.githubIntegration.repository || "Saga-Learning-to-Hero/saga-fe",
          defaultBranch: user.githubIntegration.defaultBranch || "dev",
          isPrimary: true,
          lastSyncedAt: user.githubIntegration.lastSyncedAt || "28/08/2026 15:45",
          syncedCommitsCount: 42,
          syncedPRsCount: 6,
          status: "ACTIVE" as const,
        },
      ]
      : MOCK_GITHUB_INTEGRATIONS;

  const [integrations, setIntegrations] = useState<GitHubIntegration[]>(initialList);
  const [isConnecting, setIsConnecting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  const saveToStore = (newList: GitHubIntegration[]) => {
    setIntegrations(newList);
    const primary = newList.find((i) => i.isPrimary) || newList[0] || null;
    updateUserProfile({
      githubIntegrations: newList,
      githubIntegration: primary ? {
        connected: primary.connected,
        username: primary.username,
        accessToken: primary.accessToken,
        repository: primary.repository,
        defaultBranch: primary.defaultBranch,
        lastSyncedAt: primary.lastSyncedAt,
      } : undefined,
    });
  };

  const handleConnectGitHubOAuth = async () => {
    setIsConnecting(true);
    setFeedbackMsg("Đang chuyển hướng sang GitHub để xác thực tài khoản và cấp quyền...");

    await new Promise((r) => setTimeout(r, 1200));

    const nextItem = NEXT_GITHUB_CANDIDATES.find(
      (candidate) => !integrations.some((i) => i.repository === candidate.repository)
    ) || {
      id: `gh-${Date.now()}`,
      alias: `Kho mã nguồn phụ (${integrations.length + 1})`,
      connected: true,
      username: "lehoanghai-fpt",
      accessToken: "oauth2_bearer_verified",
      repository: `Saga-Learning-to-Hero/saga-module-${integrations.length + 1}`,
      defaultBranch: "main",
      isPrimary: false,
      lastSyncedAt: "Vừa xong",
      syncedCommitsCount: 22,
      syncedPRsCount: 3,
      status: "ACTIVE" as const,
    };

    const updated = [...integrations, nextItem];
    if (!updated.some((i) => i.isPrimary)) {
      updated[0].isPrimary = true;
    }

    saveToStore(updated);
    setIsConnecting(false);
    setFeedbackMsg(`Đã liên kết thành công Repository (${nextItem.repository}) từ GitHub!`);
    setTimeout(() => setFeedbackMsg(""), 4500);
  };

  const handleDelete = (id: string) => {
    const remaining = integrations.filter((i) => i.id !== id);
    if (remaining.length > 0 && !remaining.some((i) => i.isPrimary)) {
      remaining[0].isPrimary = true;
    }
    saveToStore(remaining);
    setFeedbackMsg("Đã ngắt kết nối Repository GitHub.");
    setTimeout(() => setFeedbackMsg(""), 4000);
  };

  const handleSetPrimary = (id: string) => {
    const updated = integrations.map((i) => ({
      ...i,
      isPrimary: i.id === id,
    }));
    saveToStore(updated);
    setFeedbackMsg("Đã đặt Repository làm nguồn commit chính mặc định.");
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
          syncedCommitsCount: (i.syncedCommitsCount || 0) + Math.floor(Math.random() * 3),
        }
        : i
    );
    saveToStore(updated);
    setFeedbackMsg("Đồng bộ dữ liệu GitHub Repository thành công!");
    setTimeout(() => setFeedbackMsg(""), 4000);
  };

  const handleSyncAll = async () => {
    setIsSyncingAll(true);
    await new Promise((r) => setTimeout(r, 900));
    const now = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const updated = integrations.map((i) => ({
      ...i,
      lastSyncedAt: `Hôm nay lúc ${now}`,
      syncedCommitsCount: (i.syncedCommitsCount || 0) + 2,
    }));
    saveToStore(updated);
    setIsSyncingAll(false);
    setFeedbackMsg("Đã đồng bộ toàn bộ các Repositories GitHub!");
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
                  GitHub Repositories
                </CardTitle>
                <Badge variant="outline" className="font-mono text-[11px] px-2 py-0 border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/10 font-bold">
                  {integrations.length} repo
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Chuyển tiếp ủy quyền trực tiếp qua cổng GitHub OAuth App
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
                  <span>+ Kết nối qua GitHub Link</span>
                </>
              )}
            </Button>
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

        {integrations.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-border/80 bg-muted/20 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
              <GitBranchIcon className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h4 className="text-sm font-bold text-foreground">Chưa có kết nối Repository GitHub nào</h4>
              <p className="text-xs text-muted-foreground">
                Bấm nút kết nối để chuyển tiếp sang GitHub cấp quyền truy cập mã nguồn và Pull Requests.
              </p>
            </div>
            <Button
              type="button"
              onClick={handleConnectGitHubOAuth}
              disabled={isConnecting}
              className="text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white gap-1.5 cursor-pointer shadow-xs"
            >
              <ExternalLinkIcon className="w-3.5 h-3.5" />
              <span>Chuyển sang GitHub để kết nối</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {integrations.map((item) => (
              <GitHubIntegrationCard
                key={item.id}
                item={item}
                onEdit={handleConnectGitHubOAuth}
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
