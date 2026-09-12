"use client";

import { useState, useEffect } from "react";
import { Link2Icon, CrownIcon, CheckCircle2Icon, RefreshCwIcon, Loader2Icon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import {
  useProjectIntegrations, useDisconnectProjectJira, useDisconnectProjectGitHub,
  useConnectProjectGitHub, useConnectProjectJira, useProjectGitHubSetupCallback,
} from "../hooks/useProjectIntegrations";
import { useSyncProject } from "../hooks/useProjectSync";
import { ProjectJiraSection } from "./integrations/project-jira-section";
import { ProjectGithubSection } from "./integrations/project-github-section";
import { ProjectDisconnectDialog } from "./integrations/project-disconnect-dialog";
import { ProjectAvailableReposDialog } from "./integrations/project-available-repos-dialog";
import { ProjectJiraConfigDialog } from "./integrations/project-jira-config-dialog";
import { ProjectGitHubInstallationsDialog } from "./integrations/project-github-installations-dialog";
import { useProjectRealtime } from "../hooks/use-project-realtime";
import { ProjectRealtimeBadge } from "./project-realtime-badge";

interface ProjectIntegrationsCardProps {
  projectId: string;
  isLeader: boolean;
}

export function ProjectIntegrationsCard({ projectId, isLeader }: ProjectIntegrationsCardProps) {
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [disconnectModalType, setDisconnectModalType] = useState<"jira" | "github" | null>(null);
  const [isReposModalOpen, setIsReposModalOpen] = useState(false);
  const [isGitHubInstallationsModalOpen, setIsGitHubInstallationsModalOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("code") === "GITHUB_INSTALLATION_SELECTION_REQUIRED";
  });
  const [isJiraModalOpen, setIsJiraModalOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("jira_setup") === "true";
  });

  const { data: integrations, isLoading, isRefetching, refetch } = useProjectIntegrations(
    projectId,
    { enabled: Boolean(projectId) }
  );

  const disconnectJiraMutation = useDisconnectProjectJira();
  const disconnectGitHubMutation = useDisconnectProjectGitHub();
  const connectGitHubMutation = useConnectProjectGitHub();
  const connectJiraMutation = useConnectProjectJira();
  const setupCallbackMutation = useProjectGitHubSetupCallback();
  const mutateSetupCallback = setupCallbackMutation.mutate;

  useEffect(() => {
    if (typeof window === "undefined" || !projectId) return;
    const urlParams = new URLSearchParams(window.location.search);
    const state = urlParams.get("state");
    const installationId = urlParams.get("installation_id");
    const code = urlParams.get("code") || undefined;

    const jiraSetup = urlParams.get("jira_setup");
    if (jiraSetup === "true") {
      window.history.replaceState({}, "", window.location.pathname);
      toast.success("Đã ủy quyền Atlassian thành công! Vui lòng chọn Site, Project và Board.");
      void refetch();
    }

    if (code === "GITHUB_INSTALLATION_SELECTION_REQUIRED") {
      window.history.replaceState({}, "", window.location.pathname);
    }

    if (state && installationId) {
      toast.loading("Đang hoàn tất kết nối GitHub cho dự án...", { id: "github-setup-callback" });
      mutateSetupCallback(
        { projectId, state, installation_id: installationId, code },
        {
          onSuccess: () => {
            window.history.replaceState({}, "", window.location.pathname);
            toast.success("Kết nối GitHub với dự án nhóm thành công!", { id: "github-setup-callback" });
            void refetch();
            setIsReposModalOpen(true);
          },
          onError: () => toast.error("Lỗi khi kết nối GitHub với dự án. Vui lòng thử lại.", { id: "github-setup-callback" }),
        }
      );
    }
  }, [projectId, mutateSetupCallback, refetch]);

  const handleRedirectJiraConnect = async () => {
    try {
      toast.loading("Đang chuyển hướng sang Jira Atlassian...", { id: "jira-connect" });
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "/student/project-info";
      const returnPath = `${currentPath}?jira_setup=true`;
      const result = await connectJiraMutation.mutateAsync({ projectId, returnPath });
      if (result.authorizationUrl && typeof window !== "undefined") {
        window.location.href = result.authorizationUrl;
      }
    } catch {
      toast.error("Lỗi khi kết nối Jira với dự án. Vui lòng thử lại sau.", { id: "jira-connect" });
    }
  };

  const handleConnectJira = () => {
    const isConfigured = integrations?.jira?.status === "ACTIVE";
    if (isConfigured) {
      setIsJiraModalOpen(true);
    } else {
      void handleRedirectJiraConnect();
    }
  };

  const handleRedirectGitHubConnect = async () => {
    try {
      toast.loading("Đang chuyển hướng sang GitHub App...", { id: "github-connect" });
      const returnPath = typeof window !== "undefined" ? window.location.pathname : "/student/project-info";
      const result = await connectGitHubMutation.mutateAsync({ projectId, returnPath });
      if (result.authorizationUrl && typeof window !== "undefined") {
        window.location.href = result.authorizationUrl;
      }
    } catch (error: unknown) {
      const err = error as { code?: string; status?: number; data?: { code?: string } };
      if (
        err?.code === "GITHUB_INSTALLATION_SELECTION_REQUIRED" ||
        err?.data?.code === "GITHUB_INSTALLATION_SELECTION_REQUIRED" ||
        err?.status === 409
      ) {
        toast.dismiss("github-connect");
        setIsGitHubInstallationsModalOpen(true);
        return;
      }
      toast.error("Lỗi khi kết nối GitHub với dự án. Vui lòng thử lại sau.", { id: "github-connect" });
    }
  };

  const handleConnectGitHub = () => {
    const isConfigured = Boolean(
      integrations?.github?.accountLogin ||
      (integrations?.github?.repositories || []).length > 0
    );
    if (isConfigured) {
      setIsReposModalOpen(true);
    } else {
      void handleRedirectGitHubConnect();
    }
  };

  const syncMutation = useSyncProject();
  const handleSyncJira = async () => {
    setSyncingId("jira");
    try {
      const res = await syncMutation.mutateAsync(projectId);
      setFeedbackMsg(`Đã kích hoạt đồng bộ! (Jira: ${res.jira} · GitHub: ${res.github})`);
      toast.success("Đã đưa yêu cầu đồng bộ Jira & GitHub vào hàng đợi!", {
        description: `Jira: ${res.jira} · GitHub: ${res.github}`,
      });
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi khi kích hoạt đồng bộ");
    } finally {
      setSyncingId(null);
      setTimeout(() => setFeedbackMsg(""), 4500);
    }
  };

  const handleConfirmDisconnect = async () => {
    if (!disconnectModalType) return;
    try {
      if (disconnectModalType === "jira") {
        await disconnectJiraMutation.mutateAsync(projectId);
        toast.success("Đã ngắt kết nối Jira của dự án thành công!");
      } else {
        await disconnectGitHubMutation.mutateAsync(projectId);
        toast.success("Đã ngắt kết nối GitHub của dự án thành công!");
      }
      setDisconnectModalType(null);
      await refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể ngắt kết nối dịch vụ");
    }
  };

  const {
    status: realtimeStatus,
    lastEventTime,
    lastEvent,
    reconnect: reconnectRealtime,
  } = useProjectRealtime(projectId, { enabled: Boolean(projectId) });

  const isConnectingRepo = connectGitHubMutation.isPending || setupCallbackMutation.isPending;

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
                <CardTitle className="text-base font-bold text-foreground">Jira & GitHub của Dự án Nhóm</CardTitle>
                {isLeader ? (
                  <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-0 text-[10px] font-semibold gap-1">
                    <CrownIcon className="w-3 h-3" /> Trưởng nhóm
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] text-muted-foreground border-border">Thành viên</Badge>
                )}
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                Jira Project và các GitHub Repositories chung của nhóm để theo dõi tiến độ và commit
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <ProjectRealtimeBadge
              status={realtimeStatus}
              lastEventTime={lastEventTime}
              lastEvent={lastEvent}
              onReconnect={reconnectRealtime}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                reconnectRealtime();
                void refetch();
              }}
              disabled={isLoading || isRefetching}
              className="h-8 px-2.5 text-xs rounded-xl gap-1.5 cursor-pointer"
            >
              <RefreshCwIcon className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin text-primary" : ""}`} />
              <span>{isRefetching ? "Đang đồng bộ..." : "Làm mới"}</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-3.5">

        {feedbackMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in-0">
            <CheckCircle2Icon className="w-4 h-4 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {isLoading ? (
          <div className="py-8 flex items-center justify-center gap-2 text-xs text-muted-foreground animate-pulse">
            <Loader2Icon className="w-4 h-4 animate-spin text-primary" />
            <span>Đang tải Jira và GitHub của dự án...</span>
          </div>
        ) : (
          <div className="space-y-3.5">
            <ProjectJiraSection
              jira={integrations?.jira}
              isLeader={isLeader}
              isConnectingJira={connectJiraMutation.isPending}
              isDisconnectingJira={disconnectJiraMutation.isPending}
              syncingId={syncingId}
              onConnectJira={handleConnectJira}
              onSyncJira={handleSyncJira}
              onDisconnectJira={() => setDisconnectModalType("jira")}
            />
            <ProjectGithubSection
              github={integrations?.github}
              isLeader={isLeader}
              isConnectingRepo={isConnectingRepo}
              isDisconnectingGitHub={disconnectGitHubMutation.isPending}
              onAddRepo={handleConnectGitHub}
              onDisconnectGitHub={() => setDisconnectModalType("github")}
              onChangeInstallation={() => setIsGitHubInstallationsModalOpen(true)}
            />
          </div>
        )}
      </CardContent>

      <ProjectDisconnectDialog
        open={Boolean(disconnectModalType)}
        onOpenChange={(open) => !open && setDisconnectModalType(null)}
        type={disconnectModalType}
        isPending={disconnectJiraMutation.isPending || disconnectGitHubMutation.isPending}
        onConfirm={handleConfirmDisconnect}
      />

      <ProjectAvailableReposDialog
        open={isReposModalOpen}
        onOpenChange={setIsReposModalOpen}
        projectId={projectId}
        currentRepositories={integrations?.github?.repositories}
        onConfigureMore={() => {
          setIsReposModalOpen(false);
          void handleRedirectGitHubConnect();
        }}
        isConnecting={connectGitHubMutation.isPending}
      />

      <ProjectGitHubInstallationsDialog
        open={isGitHubInstallationsModalOpen}
        onOpenChange={setIsGitHubInstallationsModalOpen}
        projectId={projectId}
        onSuccessConnect={() => setIsReposModalOpen(true)}
      />

      <ProjectJiraConfigDialog
        open={isJiraModalOpen}
        onOpenChange={setIsJiraModalOpen}
        projectId={projectId}
        currentJira={integrations?.jira}
        onAuthorizeNew={() => {
          setIsJiraModalOpen(false);
          void handleRedirectJiraConnect();
        }}
        isAuthorizing={connectJiraMutation.isPending}
      />
    </Card>
  );
}
