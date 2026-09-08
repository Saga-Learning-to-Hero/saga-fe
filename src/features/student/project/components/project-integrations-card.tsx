"use client";

import { useState } from "react";
import { Link2Icon, CrownIcon, CheckCircle2Icon, RefreshCwIcon, Loader2Icon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useProjectIntegrations } from "../hooks/useProjectIntegrations";
import { useStartJiraLink } from "@/features/integrations/hooks/useJiraIntegrations";
import { useStartGitHubLink } from "@/features/integrations/hooks/useGithubIntegrations";
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

  const startJiraLinkMutation = useStartJiraLink();
  const startGitHubLinkMutation = useStartGitHubLink();

  const handleConnectJira = async () => {
    try {
      toast.loading("Đang chuyển hướng sang Atlassian Jira OAuth...", { id: "jira-oauth" });
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "/student/project-info";
      const result = await startJiraLinkMutation.mutateAsync(currentPath);

      if (result.authorizationUrl && typeof window !== "undefined") {
        window.open(result.authorizationUrl, "_self");
      }
    } catch {
      toast.error("Lỗi khi kết nối với máy chủ Atlassian. Vui lòng thử lại sau.", { id: "jira-oauth" });
    }
  };

  const handleConnectGitHub = async () => {
    try {
      toast.loading("Đang chuyển hướng sang GitHub App OAuth...", { id: "github-oauth" });
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "/student/project-info";
      const result = await startGitHubLinkMutation.mutateAsync(currentPath);

      if (result.authorizationUrl && typeof window !== "undefined") {
        window.open(result.authorizationUrl, "_self");
      }
    } catch {
      toast.error("Lỗi khi kết nối với GitHub. Vui lòng thử lại sau.", { id: "github-oauth" });
    }
  };

  const handleSyncJira = async () => {
    setSyncingId("jira");
    await refetch();
    setSyncingId(null);
    setFeedbackMsg("Đã đồng bộ thông tin Jira Project thành công!");
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
                  Liên kết Tích hợp Đồ án (Project Integrations)
                </CardTitle>
                {isLeader ? (
                  <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-0 text-[10px] font-semibold gap-1">
                    <CrownIcon className="w-3 h-3" />
                    Quyền Trưởng nhóm
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] text-muted-foreground border-border">
                    Chế độ xem (Thành viên)
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                Kết nối trực tiếp qua link ủy quyền Atlassian Jira và GitHub Repositories (đa repos)
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

      <CardContent className="p-4 sm:p-6 space-y-6">
        {feedbackMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in-0">
            <CheckCircle2Icon className="w-4 h-4 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4 py-4 animate-pulse">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-6">
              <Loader2Icon className="w-4 h-4 animate-spin text-primary" />
              <span>Đang tải thông tin tích hợp Jira và GitHub của đồ án...</span>
            </div>
          </div>
        ) : (
          <>
            <ProjectJiraSection
              jira={integrations?.jira}
              isLeader={isLeader}
              isConnectingJira={startJiraLinkMutation.isPending}
              syncingId={syncingId}
              onConnectJira={handleConnectJira}
              onSyncJira={handleSyncJira}
            />

            <ProjectGithubSection
              github={integrations?.github}
              isLeader={isLeader}
              isConnectingRepo={startGitHubLinkMutation.isPending}
              onAddRepo={handleConnectGitHub}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
