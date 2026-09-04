"use client";

import { useState } from "react";
import {
  CheckSquareIcon,
  ExternalLinkIcon,
  ClockIcon,
  RefreshCwIcon,
  SparklesIcon,
  Trash2Icon,
  ShieldCheckIcon,
} from "lucide-react";
import type { JiraIntegration } from "@/types/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface JiraIntegrationCardProps {
  item: JiraIntegration;
  onDelete: (id: string) => void;
  onSetPrimary: (id: string) => void;
  onSync: (id: string) => Promise<void>;
  onEdit?: (item: JiraIntegration) => void;
}

export function JiraIntegrationCard({
  item,
  onDelete,
  onSetPrimary,
  onSync,
}: JiraIntegrationCardProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncClick = async () => {
    if (!item.id || isSyncing) return;
    setIsSyncing(true);
    await onSync(item.id);
    setIsSyncing(false);
  };

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 bg-card/70 flex flex-col justify-between gap-4 ${item.isPrimary
          ? "border-blue-500/50 shadow-xs ring-1 ring-blue-500/20 bg-blue-500/5"
          : "border-border/80 hover:border-border hover:bg-muted/20 shadow-2xs"
        }`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <CheckSquareIcon className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-sm font-bold text-foreground truncate">
                  {item.name || `Jira Project (${item.projectKey})`}
                </h4>
                {item.isPrimary && (
                  <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-0 text-[10px] font-bold px-2 py-0">
                    <SparklesIcon className="w-3 h-3 mr-1" />
                    Chính
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground font-mono truncate">
                {item.email}
              </p>
            </div>
          </div>

          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-semibold shrink-0 gap-1"
          >
            <ShieldCheckIcon className="w-3 h-3" />
            Active
          </Badge>
        </div>

        <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Project Key:</span>
            <Badge variant="outline" className="font-mono font-bold text-xs bg-background">
              {item.projectKey}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Workspace URL:</span>
            <a
              href={item.serverUrl}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 truncate max-w-[200px]"
            >
              <span className="truncate">{item.serverUrl.replace(/^https?:\/\//, "")}</span>
              <ExternalLinkIcon className="w-3 h-3 shrink-0" />
            </a>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px]">
            <span className="text-muted-foreground">Đã đồng bộ:</span>
            <span className="font-mono font-bold text-foreground">
              {item.syncedTasksCount ?? 0} tasks
            </span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
          <ClockIcon className="w-3 h-3 text-emerald-500 shrink-0" />
          <span>Lần cuối: <strong className="text-foreground">{item.lastSyncedAt || "Chưa đồng bộ"}</strong></span>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSyncClick}
            disabled={isSyncing}
            className="h-7.5 px-2.5 text-[11px] font-semibold rounded-lg gap-1 cursor-pointer"
          >
            <RefreshCwIcon className={`w-3 h-3 ${isSyncing ? "animate-spin text-primary" : ""}`} />
            <span>{isSyncing ? "Đang đồng bộ..." : "Đồng bộ"}</span>
          </Button>

          {!item.isPrimary && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => item.id && onSetPrimary(item.id)}
              className="h-7.5 px-2 text-[11px] rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Đặt chính
            </Button>
          )}

          <a
            href={item.serverUrl}
            target="_blank"
            rel="noreferrer"
            className="h-7.5 w-7.5 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
            title="Mở trên Jira"
          >
            <ExternalLinkIcon className="w-3.5 h-3.5" />
          </a>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => item.id && onDelete(item.id)}
            className="h-7.5 w-7.5 p-0 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer"
            title="Ngắt kết nối"
          >
            <Trash2Icon className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
