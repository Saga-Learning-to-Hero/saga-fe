"use client";

import Image from "next/image";
import {
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

interface GitHubConnectedCardProps {
  identity?: UserIdentityItem | null;
  fallbackName?: string;
  fallbackUsername?: string;
  fallbackEmail?: string;
  avatarUrl?: string;
  isDeleting?: boolean;
  isSettingPrimary?: boolean;
  onSetPrimary?: () => void;
  onDisconnect?: () => void;
}

export function GitHubConnectedCard({
  identity,
  fallbackName = "Thành viên GitHub",
  fallbackUsername = "",
  fallbackEmail = "",
  avatarUrl,
  isDeleting = false,
  isSettingPrimary = false,
  onSetPrimary,
  onDisconnect,
}: GitHubConnectedCardProps) {
  const username = identity?.login || fallbackUsername;
  const displayName = identity?.displayName || fallbackName;
  const githubId = identity?.providerSubject || identity?.id || "Chưa có định danh";
  const lastSynced = formatVietnamDateTime(identity?.linkedAt);
  const isPrimary = Boolean(identity?.primary);
  const resolvedAvatar =
    avatarUrl ||
    (username
      ? `https://github.com/${username}.png`
      : "https://avatars.githubusercontent.com/u/9919?v=4");

  return (
    <div className="p-4 sm:p-5 rounded-2xl border border-purple-500/30 bg-purple-500/5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-purple-600/20 border border-purple-500/30 shrink-0">
            <Image
              src={resolvedAvatar}
              alt={username || "GitHub Avatar"}
              fill
              sizes="48px"
              className="object-cover"
              unoptimized
            />
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
              <span className="font-mono font-semibold text-purple-600 dark:text-purple-400">
                @{username || "github-user"}
              </span>
              {fallbackEmail && (
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  • <MailIcon className="w-3 h-3" /> {fallbackEmail}
                </span>
              )}
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
            className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 font-mono text-[11px] px-2.5 py-1"
          >
            {identity?.status || "OAuth 2.0 Verified"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border/60 text-xs">
        <div className="p-3 rounded-xl bg-background border border-border/60 space-y-1">
          <span className="text-muted-foreground text-[11px] block">Mã người dùng GitHub (Subject / ID):</span>
          <span className="font-mono font-bold text-foreground text-xs block truncate" title={githubId}>
            {githubId}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-background border border-border/60 space-y-1">
          <span className="text-muted-foreground text-[11px] block">Phạm vi quyền truy cập:</span>
          <span className="font-medium text-foreground text-xs block">
            read:user, user:email
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
