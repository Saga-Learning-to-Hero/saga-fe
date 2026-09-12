"use client";

import { RadioIcon, AlertCircleIcon, CheckCircle2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { SSEConnectionStatus, ProjectRealtimeEvent } from "../types/project-realtime-types";

interface ProjectRealtimeBadgeProps {
  status: SSEConnectionStatus;
  lastEventTime?: Date | null;
  lastEvent?: ProjectRealtimeEvent | null;
  onReconnect?: () => void;
  className?: string;
}

export function ProjectRealtimeBadge({
  status,
  lastEventTime,
  lastEvent,
  onReconnect,
  className = "",
}: ProjectRealtimeBadgeProps) {
  const formatTime = (d: Date) => {
    return d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (status === "OPEN") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="cursor-default">
            <div className={`inline-flex items-center gap-1.5 ${className}`}>
              <Badge
                variant="outline"
                className="h-6 px-2 text-[10px] font-semibold gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 cursor-default"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <RadioIcon className="w-2.5 h-2.5" />
                <span>Realtime</span>
              </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            className="flex-col items-start w-72 p-3 bg-popover text-popover-foreground border border-border/80 shadow-xl rounded-xl space-y-0"
          >
            <div className="w-full space-y-1.5 text-left">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                <CheckCircle2Icon className="w-3.5 h-3.5 shrink-0" />
                <span>Kênh Realtime SSE hoạt động</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Tự động cập nhật dữ liệu dự án, tiến độ công việc và tích hợp Jira · GitHub theo thời gian thực.
              </p>
              {lastEventTime && (
                <div className="pt-1.5 border-t border-border/60 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                  <span>Gần nhất: {lastEvent?.type || "READY"}</span>
                  <span>{formatTime(lastEventTime)}</span>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (status === "CONNECTING") {
    return (
      <Badge
        variant="outline"
        className={`h-6 px-2 text-[10px] font-semibold gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 animate-pulse ${className}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-spin" />
        <span>Đang kết nối SSE...</span>
      </Badge>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          onClick={onReconnect}
          className={onReconnect ? "cursor-pointer" : "cursor-default"}
        >
          <div className={`inline-flex items-center gap-1.5 ${className}`}>
            <Badge
              variant="outline"
              className={`h-6 px-2 text-[10px] font-semibold gap-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 transition-colors ${
                onReconnect ? "hover:bg-rose-500/20" : ""
              }`}
            >
              <AlertCircleIcon className="w-2.5 h-2.5" />
              <span>Realtime gián đoạn</span>
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="flex-col items-start w-72 p-3 bg-popover text-popover-foreground border border-border/80 shadow-xl rounded-xl space-y-0"
        >
          <div className="w-full space-y-1.5 text-left">
            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold text-xs">
              <AlertCircleIcon className="w-3.5 h-3.5 shrink-0" />
              <span>Kết nối realtime đang tạm ngắt</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Dữ liệu vẫn được đồng bộ qua API. Bấm vào huy hiệu hoặc nút Làm mới để kích hoạt lại kết nối.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
