"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Link2Icon,
  CrownIcon,
  CheckCircle2Icon,
  RefreshCwIcon,
  Loader2Icon,
  AlertCircleIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useUserIdentities } from "@/features/integrations/hooks/useUserIntegrations";
import { useProjectIntegrations } from "../hooks/useProjectIntegrations";
import { ProjectJiraSection } from "./integrations/project-jira-section";
import { ProjectGithubSection } from "./integrations/project-github-section";

interface ProjectIntegrationsCardProps {
  projectId: string;
  isLeader: boolean;
}

export function ProjectIntegrationsCard({
  projectId,
  isLeader,
}: ProjectIntegrationsCardProps) {
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const {
    data: integrations,
    isLoading,
    isRefetching,
    refetch,
  } = useProjectIntegrations(projectId, { enabled: Boolean(projectId) });

  const {
    isJiraConnected,
    isGitHubConnected,
    isLoading: isIdentitiesLoading,
  } = useUserIdentities();

  const isFullyConnected = isJiraConnected && isGitHubConnected;

  const handleConnectJira = () => {
    toast.info("Jira Project của nhóm do Trưởng nhóm cấu hình. Mỗi thành viên cần liên kết tài khoản cá nhân tại Hồ sơ để hệ thống ghi nhận task.");
  };

  const handleConnectGitHub = () => {
    toast.info("GitHub Repositories của nhóm do Trưởng nhóm cấu hình. Mỗi thành viên cần liên kết tài khoản cá nhân tại Hồ sơ để hệ thống ghi nhận commit.");
  };

  const handleSyncJira = async () => {
    setSyncingId("jira");
    await refetch();
    setSyncingId(null);
    setFeedbackMsg("Đã đồng bộ Jira Project của nhóm!");
    setTimeout(() => setFeedbackMsg(""), 3500);
  };

  return (
    <Card className="rounded-2xl border border-border/80 shadow-xs bg-card overflow-hidden">
      <CardHeader className="p-4 sm:p-5 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Link2Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-foreground">
                  Jira & GitHub của Dự án Nhóm
                </CardTitle>
                {isLeader ? (
                  <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-0 text-[10px] font-semibold gap-1">
                    <CrownIcon className="w-3 h-3" />
                    Trưởng nhóm
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] text-muted-foreground border-border">
                    Thành viên
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                Jira Project và các GitHub Repositories chung của nhóm để theo dõi tiến độ và commit
              </CardDescription>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isLoading || isRefetching}
            className="h-8 px-2.5 text-xs rounded-xl gap-1.5 cursor-pointer self-start sm:self-auto shrink-0"
            title="Làm mới dữ liệu tích hợp từ máy chủ"
          >
            <RefreshCwIcon className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin text-primary" : ""}`} />
            <span>{isRefetching ? "Đang đồng bộ..." : "Làm mới"}</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-3.5">
        {!isIdentitiesLoading && !isFullyConnected && (
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-800 dark:text-amber-300 animate-in fade-in-0">
            <AlertCircleIcon className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="leading-snug flex-1">
              {!isJiraConnected && !isGitHubConnected
                ? "Bạn chưa liên kết tài khoản Jira & GitHub cá nhân. Vui lòng "
                : !isJiraConnected
                  ? "Bạn chưa liên kết tài khoản Jira cá nhân. Vui lòng "
                  : "Bạn chưa liên kết tài khoản GitHub cá nhân. Vui lòng "}
              <Link
                href="/profile/integrations"
                className="font-bold underline underline-offset-2 hover:opacity-80 transition-opacity"
              >
                Liên kết tài khoản cá nhân
              </Link>{" "}
              để hệ thống nhận diện task và tính điểm commit cho bạn.
            </p>
          </div>
        )}

        {feedbackMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in-0">
            <CheckCircle2Icon className="w-4 h-4 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3 py-4 animate-pulse">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-6">
              <Loader2Icon className="w-4 h-4 animate-spin text-primary" />
              <span>Đang tải Jira và GitHub của dự án...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            <ProjectJiraSection
              jira={integrations?.jira}
              isLeader={isLeader}
              isConnectingJira={false}
              syncingId={syncingId}
              onConnectJira={handleConnectJira}
              onSyncJira={handleSyncJira}
            />

            <ProjectGithubSection
              github={integrations?.github}
              isLeader={isLeader}
              isConnectingRepo={false}
              onAddRepo={handleConnectGitHub}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
