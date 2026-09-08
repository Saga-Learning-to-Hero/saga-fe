"use client";

import {
  CheckSquareIcon,
  ExternalLinkIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  LoaderCircleIcon,
  UnlinkIcon,
} from "lucide-react";
import type { ProjectJiraIntegration } from "../../types/student-project";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProjectJiraSectionProps {
  jira?: ProjectJiraIntegration | null;
  isLeader: boolean;
  isConnectingJira?: boolean;
  syncingId?: string | null;
  onConnectJira?: () => void;
  onSyncJira?: () => void;
  onDisconnectJira?: () => void;
}

export function ProjectJiraSection({
  jira,
  isLeader,
  isConnectingJira = false,
  syncingId,
  onConnectJira,
  onSyncJira,
  onDisconnectJira,
}: ProjectJiraSectionProps) {
  const isConnected = Boolean(jira && jira.projectKey && jira.projectKey.trim() !== "");

  const siteUrl = jira?.siteName
    ? jira.siteName.startsWith("http")
      ? jira.siteName
      : jira.siteName.includes(".")
      ? `https://${jira.siteName}`
      : `https://${jira.siteName}.atlassian.net`
    : "";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
            <CheckSquareIcon className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Jira Software Project (Duy nhất 1 Site & Key)
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Tất cả thành viên trong nhóm sẽ đối soát thẻ công việc theo Jira Site và Key này
            </p>
          </div>
        </div>

        {isLeader && onConnectJira && (
          <Button
            type="button"
            size="sm"
            onClick={onConnectJira}
            disabled={isConnectingJira}
            className="h-8 px-3 text-xs font-bold rounded-xl gap-1.5 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-2xs"
          >
            {isConnectingJira ? (
              <>
                <LoaderCircleIcon className="w-3.5 h-3.5 animate-spin" />
                <span>Đang chuyển hướng...</span>
              </>
            ) : (
              <>
                <ExternalLinkIcon className="w-3.5 h-3.5" />
                <span>{isConnected ? "Đổi Jira Workspace" : "+ Kết nối Jira Workspace"}</span>
              </>
            )}
          </Button>
        )}
      </div>

      {!isConnected ? (
        <div className="p-6 rounded-2xl border border-dashed border-border/80 bg-muted/20 text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <CheckSquareIcon className="w-5 h-5" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h5 className="text-xs font-bold text-foreground">Chưa có Jira Workspace nào cho đồ án</h5>
            <p className="text-[11px] text-muted-foreground">
              Trưởng nhóm kết nối Atlassian Jira để đồng bộ tiến độ Sprint, Backlog và thẻ công việc tự động.
            </p>
          </div>
          {isLeader && onConnectJira && (
            <Button
              type="button"
              size="sm"
              onClick={onConnectJira}
              disabled={isConnectingJira}
              className="h-8 px-3 text-xs font-bold rounded-xl gap-1.5 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-2xs"
            >
              <ExternalLinkIcon className="w-3.5 h-3.5" />
              <span>Chuyển sang Atlassian để kết nối Jira</span>
            </Button>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/25 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-foreground font-mono">
                {jira?.siteName || "Jira Site"}
              </span>
              {jira?.projectKey && (
                <Badge variant="outline" className="font-mono font-bold text-xs bg-background">
                  Key: {jira.projectKey}
                </Badge>
              )}
              {jira?.boardId && (
                <Badge variant="secondary" className="font-mono text-xs">
                  Board: #{jira.boardId}
                </Badge>
              )}
              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0 text-[10px] font-semibold">
                <ShieldCheckIcon className="w-3 h-3 mr-1" />
                {jira?.status || "ACTIVE"}
              </Badge>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono truncate">
              {siteUrl && (
                <a
                  href={siteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 truncate"
                >
                  <span className="truncate">{siteUrl}</span>
                  <ExternalLinkIcon className="w-3 h-3 shrink-0" />
                </a>
              )}
              {jira?.cloudId && (
                <>
                  <span>•</span>
                  <span className="truncate">Cloud: {jira.cloudId}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onSyncJira && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onSyncJira}
                disabled={syncingId === "jira"}
                className="h-8 px-3 text-xs font-semibold rounded-xl gap-1.5 cursor-pointer"
              >
                <RefreshCwIcon className={`w-3.5 h-3.5 ${syncingId === "jira" ? "animate-spin text-primary" : ""}`} />
                <span>Đồng bộ ngay</span>
              </Button>
            )}

            {isLeader && onDisconnectJira && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onDisconnectJira}
                className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer"
                title="Ngắt kết nối Jira"
              >
                <UnlinkIcon className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
