"use client";

import {
  CheckSquareIcon,
  ExternalLinkIcon,
  RefreshCwIcon,
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
  isDisconnectingJira?: boolean;
  syncingId?: string | null;
  onConnectJira?: () => void;
  onSyncJira?: () => void;
  onDisconnectJira?: () => void;
}

export function ProjectJiraSection({
  jira,
  isLeader,
  isConnectingJira = false,
  isDisconnectingJira = false,
  syncingId,
  onConnectJira,
  onSyncJira,
  onDisconnectJira,
}: ProjectJiraSectionProps) {
  const isRevoked = jira?.status === "REVOKED";
  const isActive = jira?.status === "ACTIVE";
  const hasData = Boolean(jira && jira.projectKey && jira.projectKey.trim() !== "");

  const siteUrl = jira?.siteName
    ? jira.siteName.startsWith("http")
      ? jira.siteName
      : jira.siteName.includes(".")
        ? `https://${jira.siteName}`
        : `https://${jira.siteName}.atlassian.net`
    : "";

  return (
    <div className="rounded-xl border border-blue-500/25 bg-blue-500/[0.02] p-4 flex flex-col justify-between space-y-3">
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckSquareIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-bold text-foreground">
                  Jira Project của nhóm
                </h4>
                {isActive ? (
                  <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0 text-[10px] font-semibold">
                    Đang kết nối
                  </Badge>
                ) : isRevoked ? (
                  <Badge variant="outline" className="text-[10px] text-rose-500 border-rose-500/30 bg-rose-500/10 font-semibold">
                    Đã ngắt kết nối
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] text-muted-foreground border-border">
                    Chưa kết nối
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Quản lý sprint, backlog và task chung của nhóm
              </p>
            </div>
          </div>

          {isLeader && onConnectJira && (
            <Button
              type="button"
              size="sm"
              onClick={onConnectJira}
              disabled={isConnectingJira}
              className="h-7.5 px-2.5 text-[11px] font-bold rounded-lg gap-1.5 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-2xs self-start sm:self-auto shrink-0"
            >
              {isConnectingJira ? (
                <>
                  <LoaderCircleIcon className="w-3 h-3 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <ExternalLinkIcon className="w-3 h-3" />
                  <span>{isActive ? "Đổi Jira" : isRevoked ? "Kết nối lại" : "Kết nối Jira"}</span>
                </>
              )}
            </Button>
          )}
        </div>

        {!hasData ? (
          <div className="p-4 rounded-xl border border-dashed border-border/80 bg-muted/15 text-center space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <CheckSquareIcon className="w-4 h-4" />
            </div>
            <div className="max-w-sm mx-auto space-y-0.5">
              <h5 className="text-xs font-bold text-foreground">Chưa kết nối Jira Project</h5>
              <p className="text-[11px] text-muted-foreground">
                Trưởng nhóm kết nối Jira để đồng bộ sprint và task của nhóm.
              </p>
            </div>
            {isLeader && onConnectJira && (
              <Button
                type="button"
                size="sm"
                onClick={onConnectJira}
                disabled={isConnectingJira}
                className="h-7.5 px-3 text-[11px] font-bold rounded-lg gap-1.5 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-2xs"
              >
                <ExternalLinkIcon className="w-3 h-3" />
                <span>Kết nối Jira Project</span>
              </Button>
            )}
          </div>
        ) : (
          <div className={`p-4 rounded-xl bg-card border space-y-3 shadow-2xs ${isRevoked ? "border-rose-500/30 opacity-90" : "border-border/70"}`}>
            <div className="flex items-center justify-between gap-2 flex-wrap">
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
              </div>

              {isActive && onSyncJira && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onSyncJira}
                  disabled={syncingId === "jira"}
                  className="h-7 px-2.5 text-xs font-semibold rounded-lg gap-1 cursor-pointer"
                >
                  <RefreshCwIcon className={`w-3 h-3 ${syncingId === "jira" ? "animate-spin text-primary" : ""}`} />
                  <span>Đồng bộ</span>
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono truncate pt-1 border-t border-border/60">
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
        )}
      </div>

      {isLeader && isActive && onDisconnectJira && (
        <div className="pt-2 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDisconnectJira}
            disabled={isDisconnectingJira}
            className="h-7 px-2.5 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg gap-1 cursor-pointer"
          >
            {isDisconnectingJira ? (
              <>
                <LoaderCircleIcon className="w-3 h-3 animate-spin" />
                <span>Đang ngắt kết nối...</span>
              </>
            ) : (
              <>
                <UnlinkIcon className="w-3 h-3" />
                <span>Ngắt kết nối Jira</span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
