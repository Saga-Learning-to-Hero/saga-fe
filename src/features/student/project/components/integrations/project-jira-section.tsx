"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRightLeftIcon,
  CheckSquareIcon,
  EllipsisIcon,
  ExternalLinkIcon,
  LoaderCircleIcon,
  PlusIcon,
  RefreshCwIcon,
  Settings2Icon,
  ShieldAlertIcon,
  UnlinkIcon,
} from "lucide-react";
import type {
  ProjectJiraIntegration,
} from "../../types/student-project";
import type {
  JiraSourceSummary,
} from "../../types/jira-sources";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  useJiraSources,
  useJiraSourceSync,
  useJiraSourceDisconnect,
} from "../../hooks/use-jira-sources";
import { JiraSourcesService } from "../../api/jira-sources-service";
import { JiraFailoverWizardDialog } from "../failover/jira-failover-wizard-dialog";

interface ProjectJiraSectionProps {
  projectId?: string;
  jira?: ProjectJiraIntegration | null;
  jiraSources?: JiraSourceSummary[];
  isLeader: boolean;
  isConnectingJira?: boolean;
  isDisconnectingJira?: boolean;
  onConnectJira?: () => void;
  onDisconnectJira?: () => void;
  onConfigureJira?: () => void;
}

export function ProjectJiraSection({
  projectId = "",
  jira,
  jiraSources: initialSources,
  isLeader,
  isConnectingJira = false,
  onConnectJira,
  onConfigureJira,
}: ProjectJiraSectionProps) {
  const [failoverSource, setFailoverSource] = useState<JiraSourceSummary | null>(null);
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [isReconnectingId, setIsReconnectingId] = useState<string | null>(null);

  const sourcesQuery = useJiraSources(projectId);
  const syncMutation = useJiraSourceSync(projectId);
  const disconnectMutation = useJiraSourceDisconnect(projectId);

  const sources: JiraSourceSummary[] = useMemo(() => {
    if (sourcesQuery.data && sourcesQuery.data.length > 0) {
      return sourcesQuery.data;
    }
    if (initialSources && initialSources.length > 0) {
      return initialSources;
    }
    if (jira && jira.projectKey && jira.projectKey.trim()) {
      return [
        {
          integrationId: "legacy-source",
          cloudId: jira.cloudId ?? "",
          siteName: jira.siteName ?? "atlassian.net",
          jiraProjectId: "",
          projectKey: jira.projectKey,
          boardId: jira.boardId,
          connectionStatus: jira.status ?? "ACTIVE",
          lastSuccessfulSyncAt: null,
          lastSyncedAt: null,
          consecutiveFailures: 0,
        },
      ];
    }
    return [];
  }, [sourcesQuery.data, initialSources, jira]);

  const activeSourcesCount = useMemo(() => {
    return sources.filter((s) => s.connectionStatus === "ACTIVE").length;
  }, [sources]);

  const handleAddJiraSource = async () => {
    if (!projectId) {
      onConnectJira?.();
      return;
    }

    try {
      setIsAddingSource(true);
      const res = await JiraSourcesService.connectJiraSource(
        projectId,
        window.location.pathname
      );
      if (res.authorizationUrl) {
        window.location.href = res.authorizationUrl;
      }
    } catch {
      setIsAddingSource(false);
      onConnectJira?.();
    }
  };

  const handleReconnectCredentials = async (sourceId: string) => {
    if (!projectId || sourceId === "legacy-source") {
      onConnectJira?.();
      return;
    }

    try {
      setIsReconnectingId(sourceId);
      const res = await JiraSourcesService.reconnectJiraSource(
        projectId,
        sourceId,
        window.location.pathname
      );
      if (res.authorizationUrl) {
        window.location.href = res.authorizationUrl;
      }
    } catch {
      setIsReconnectingId(null);
    }
  };

  const handleSoftDisconnect = (sourceId: string) => {
    if (sourceId === "legacy-source") return;
    disconnectMutation.mutate(sourceId);
  };

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return "Chưa ghi nhận";
    try {
      let cleanStr = dateStr.trim();
      if (cleanStr.includes("T") && !cleanStr.endsWith("Z") && !/[+-]\d{2}(:\d{2})?$/.test(cleanStr)) {
        cleanStr += "Z";
      }
      const d = new Date(cleanStr);
      return Number.isNaN(d.getTime())
        ? dateStr
        : new Intl.DateTimeFormat("vi-VN", {
          timeZone: "Asia/Ho_Chi_Minh",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(d);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="rounded-2xl border border-blue-500/25 bg-blue-500/[0.02] p-4 sm:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <CheckSquareIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-foreground">
                Nguồn Jira của dự án (Jira Sources)
              </h4>
              <Badge variant="outline" className="text-[10px] font-semibold border-blue-500/30 text-blue-600 dark:text-blue-400">
                {sources.length} nguồn
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Quản lý các không gian Jira, Sprint Backlog và chuyển giao công việc dở dang
            </p>
          </div>
        </div>

        {isLeader && (
          <Button
            type="button"
            size="sm"
            onClick={handleAddJiraSource}
            disabled={isConnectingJira || isAddingSource}
            className="h-8 px-3 text-xs font-semibold rounded-xl gap-1.5 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-2xs shrink-0"
          >
            {isConnectingJira || isAddingSource ? (
              <>
                <LoaderCircleIcon className="w-3.5 h-3.5 animate-spin" />
                <span>Đang kết nối...</span>
              </>
            ) : (
              <>
                <PlusIcon className="w-3.5 h-3.5" />
                <span>Thêm nguồn Jira</span>
              </>
            )}
          </Button>
        )}
      </div>

      {sources.length === 0 ? (
        <div className="p-6 rounded-xl border border-dashed border-border flex flex-col items-center justify-center text-center space-y-2">
          <p className="text-xs text-muted-foreground">Dự án chưa kết nối với bất kỳ nguồn Jira nào.</p>
          {isLeader && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddJiraSource}
              className="text-xs rounded-xl h-8 text-blue-600 border-blue-500/30"
            >
              Kết nối nguồn Jira ngay
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sources.map((src) => {
            const isActive = src.connectionStatus === "ACTIVE";
            const isRevoked = src.connectionStatus === "REVOKED";
            const isFailoverCandidate = (isRevoked || (src.consecutiveFailures ?? 0) > 0) && activeSourcesCount >= 1;
            const siteUrl = src.siteName.startsWith("http")
              ? src.siteName
              : src.siteName.includes(".")
                ? `https://${src.siteName}`
                : `https://${src.siteName}.atlassian.net`;

            return (
              <div
                key={src.integrationId}
                className="rounded-xl border border-border/80 bg-card p-4 space-y-3 transition-shadow hover:shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-extrabold text-foreground px-2 py-0.5 rounded-md bg-muted/60 border border-border/60">
                        {src.projectKey || "JIRA"}
                      </span>
                      <a
                        href={siteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 truncate max-w-xs"
                      >
                        <span>{src.siteName}</span>
                        <ExternalLinkIcon className="w-3 h-3 shrink-0" />
                      </a>
                      {isActive && (
                        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0 text-[10px] font-semibold">
                          Đang hoạt động
                        </Badge>
                      )}
                      {isRevoked && (
                        <Badge variant="outline" className="text-rose-500 border-rose-500/30 bg-rose-500/10 text-[10px] font-semibold">
                          Đã ngắt kết nối (Lịch sử)
                        </Badge>
                      )}
                      {!isActive && !isRevoked && (
                        <Badge variant="outline" className="text-muted-foreground border-border text-[10px]">
                          {src.connectionStatus}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap pt-0.5">
                      <span>Board ID: <strong className="font-mono text-foreground">{src.boardId ?? "Mặc định"}</strong></span>
                      <span>•</span>
                      <span>Đồng bộ thành công: <strong>{formatDateTime(src.lastSuccessfulSyncAt)}</strong></span>
                      {src.consecutiveFailures !== undefined && src.consecutiveFailures !== null && src.consecutiveFailures > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-danger font-medium flex items-center gap-1">
                            <ShieldAlertIcon className="w-3 h-3 shrink-0" />
                            Lỗi đồng bộ ({src.consecutiveFailures} lần liên tiếp)
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap self-start sm:self-auto shrink-0">
                    <Link
                      href="/student/sprint-progress"
                      className="h-7.5 px-2.5 text-[11px] font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted inline-flex items-center justify-center transition-colors"
                    >
                      Xem công việc
                    </Link>

                    {isLeader && isActive && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => syncMutation.mutate(src.integrationId)}
                        disabled={syncMutation.isPending}
                        className="h-7.5 px-2.5 text-[11px] font-medium rounded-lg gap-1 border-border/80 text-foreground cursor-pointer"
                      >
                        <RefreshCwIcon className={`w-3 h-3 ${syncMutation.isPending ? "animate-spin" : ""}`} />
                        <span>Đồng bộ</span>
                      </Button>
                    )}

                    {isLeader && (
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          aria-label="Tùy chọn thao tác"
                          className="inline-flex size-7.5 cursor-pointer items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                        >
                          <EllipsisIcon className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-48">
                          {onConfigureJira && (
                            <DropdownMenuItem onClick={onConfigureJira} className="cursor-pointer gap-2">
                              <Settings2Icon className="size-3.5" />
                              <span>Site & Board</span>
                            </DropdownMenuItem>
                          )}

                          {isFailoverCandidate && (
                            <DropdownMenuItem
                              onClick={() => setFailoverSource(src)}
                              className="cursor-pointer font-medium text-amber-600 dark:text-amber-400 gap-2"
                            >
                              <ArrowRightLeftIcon className="size-3.5 text-amber-500" />
                              <span>Chuyển giao dở dang</span>
                            </DropdownMenuItem>
                          )}

                          {!isActive && (
                            <DropdownMenuItem
                              onClick={() => handleReconnectCredentials(src.integrationId)}
                              disabled={isReconnectingId === src.integrationId}
                              className="cursor-pointer text-blue-600 dark:text-blue-400 gap-2"
                            >
                              {isReconnectingId === src.integrationId ? (
                                <LoaderCircleIcon className="size-3.5 animate-spin" />
                              ) : (
                                <RefreshCwIcon className="size-3.5" />
                              )}
                              <span>Kết nối lại OAuth</span>
                            </DropdownMenuItem>
                          )}

                          {isActive && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => handleSoftDisconnect(src.integrationId)}
                                disabled={disconnectMutation.isPending}
                                className="cursor-pointer gap-2"
                              >
                                <UnlinkIcon className="size-3.5" />
                                <span>Ngắt kết nối</span>
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {failoverSource && (
        <JiraFailoverWizardDialog
          open={Boolean(failoverSource)}
          onOpenChange={(open) => !open && setFailoverSource(null)}
          projectId={projectId}
          source={failoverSource}
          availableSources={sources}
        />
      )}
    </div>
  );
}
