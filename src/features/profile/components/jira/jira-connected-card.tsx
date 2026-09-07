"use client";

import {
  UserCheckIcon,
  MailIcon,
  ClockIcon,
  UnlinkIcon,
  StarIcon,
  Loader2Icon,
} from "lucide-react";
import type { UserIdentityItem } from "@/features/integrations/types/user-integrations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatVietnamDateTime } from "@/lib/utils";

interface JiraConnectedCardProps {
  identity?: UserIdentityItem | null;
  fallbackName?: string;
  fallbackEmail?: string;
  isDeleting?: boolean;
  isSettingPrimary?: boolean;
  onSetPrimary?: () => void;
  onDisconnect?: () => void;
}

export function JiraConnectedCard({
  identity,
  fallbackName = "Sinh viên",
  fallbackEmail = "jira.user@saga.edu.vn",
  isDeleting = false,
  isSettingPrimary = false,
  onSetPrimary,
  onDisconnect,
}: JiraConnectedCardProps) {
  const displayName = identity?.displayName || fallbackName;
  const jiraEmail = identity?.login || fallbackEmail;
  const accountId = identity?.providerSubject || identity?.id || "Chưa có định danh";
  const lastSynced = formatVietnamDateTime(identity?.linkedAt);
  const isPrimary = Boolean(identity?.primary);

  return (
    <div className="p-4 sm:p-5 rounded-2xl border border-blue-500/30 bg-blue-500/5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
            <UserCheckIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-foreground">{displayName}</h4>
              {isPrimary && (
                <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px] font-bold gap-1 py-0 h-4">
                  <StarIcon className="w-2.5 h-2.5 fill-amber-500" />
                  Chính
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <MailIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="font-mono">{jiraEmail || "Chưa cập nhật email"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {identity && !isPrimary && onSetPrimary && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSetPrimary}
              disabled={isSettingPrimary}
              className="h-7 px-2.5 text-[11px] font-semibold rounded-lg gap-1 border-border hover:bg-muted cursor-pointer"
            >
              {isSettingPrimary ? (
                <Loader2Icon className="w-3 h-3 animate-spin" />
              ) : (
                <StarIcon className="w-3 h-3 text-amber-500" />
              )}
              <span>Đặt làm chính</span>
            </Button>
          )}

          <Badge
            variant="outline"
            className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 font-mono text-[11px] px-2.5 py-1"
          >
            {identity?.status || "OAuth 2.0 Verified"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border/60 text-xs">
        <div className="p-3 rounded-xl bg-background border border-border/60 space-y-1">
          <span className="text-muted-foreground text-[11px] block">Mã định danh Atlassian (Subject / ID):</span>
          <span className="font-mono font-bold text-foreground text-xs block truncate" title={accountId}>
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
          <span>Liên kết: <strong className="text-foreground">{lastSynced}</strong></span>
        </div>

        {onDisconnect && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDisconnect}
            disabled={isDeleting}
            className="h-8 px-3 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl gap-1.5 cursor-pointer self-end sm:self-auto"
          >
            {isDeleting ? (
              <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <UnlinkIcon className="w-3.5 h-3.5" />
            )}
            <span>Hủy liên kết</span>
          </Button>
        )}
      </div>
    </div>
  );
}
