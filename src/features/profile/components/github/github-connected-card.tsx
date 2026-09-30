"use client";

import {
  ClockIcon,
  UnlinkIcon,
  StarIcon,
  Loader2Icon,
} from "lucide-react";
import type { UserIdentityItem } from "@/features/integrations/types/user-integrations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatVietnamDateTime } from "@/lib/utils";

interface GitHubConnectedCardProps {
  identity?: UserIdentityItem | null;
  fallbackName?: string;
  fallbackUsername?: string;
  isDeleting?: boolean;
  isSettingPrimary?: boolean;
  onSetPrimary?: () => void;
  onDisconnect?: () => void;
}

export function GitHubConnectedCard({
  identity,
  fallbackName = "Thành viên GitHub",
  fallbackUsername = "",
  isDeleting = false,
  isSettingPrimary = false,
  onSetPrimary,
  onDisconnect,
}: GitHubConnectedCardProps) {
  const username = identity?.login || fallbackUsername;
  const displayName = identity?.displayName || fallbackName;
  const firstLinked = formatVietnamDateTime(identity?.linkedAt);
  const lastVerified = formatVietnamDateTime(identity?.lastVerifiedAt || identity?.linkedAt);
  const isPrimary = Boolean(identity?.primary);

  return (
    <div className="p-4 sm:p-5 rounded-xl border border-purple-500/30 bg-purple-500/5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-foreground">{displayName}</h4>
              {isPrimary && (
                <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-xs font-bold gap-1 py-0 h-4">
                  <StarIcon className="w-2.5 h-2.5 fill-amber-500" />
                  Chính
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <span className="font-mono font-semibold text-purple-600 dark:text-purple-400">
                @{username || "github-user"}
              </span>
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
              className="h-7 px-2.5 text-xs font-semibold rounded-lg gap-1 border-border hover:bg-muted cursor-pointer"
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
            className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 font-mono text-xs px-2.5 py-1"
          >
            {identity?.status || "OAuth 2.0 Verified"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border/60 text-xs">
        <div className="p-3 rounded-xl bg-background border border-border/60 space-y-1">
          <span className="text-muted-foreground text-xs block">Tài khoản GitHub:</span>
          <span className="font-mono font-bold text-foreground text-xs block truncate" title={username || displayName}>
            {username ? `@${username}` : displayName}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-background border border-border/60 space-y-1">
          <span className="text-muted-foreground text-xs block">Mã định danh (Subject ID):</span>
          <span className="font-mono font-medium text-foreground text-xs block truncate" title={identity?.providerSubject || ""}>
            {identity?.providerSubject || "N/A"}
          </span>
        </div>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground font-mono">
          <div className="flex items-center gap-1.5">
            <ClockIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>Kết nối lúc: <strong className="text-foreground">{firstLinked}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <ClockIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Cập nhật lúc: <strong className="text-foreground">{lastVerified}</strong></span>
          </div>
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
