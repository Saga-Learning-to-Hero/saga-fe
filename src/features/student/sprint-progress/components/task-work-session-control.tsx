"use client";

import { useEffect, useState } from "react";
import { Loader2Icon, PlayIcon, SquareIcon, TimerIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  useStartWorkSession,
  useStopWorkSession,
  useTaskWorkSessions,
} from "../hooks/use-task-evidence";

interface TaskWorkSessionControlProps {
  taskId: string;
  isOwnerOrLeader?: boolean;
}

export function formatWorkSessionDuration(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  return [hours, minutes, seconds]
    .map((value) => value.toString().padStart(2, "0"))
    .join(":");
}

export function TaskWorkSessionControl({
  taskId,
  isOwnerOrLeader = true,
}: TaskWorkSessionControlProps) {
  const [clientNow, setClientNow] = useState(() => Date.now());
  const workSessionsQuery = useTaskWorkSessions(taskId);
  const startSessionMutation = useStartWorkSession(taskId);
  const stopSessionMutation = useStopWorkSession(taskId);
  const activeSession =
    workSessionsQuery.data?.activeSession?.status === "OPEN"
      ? workSessionsQuery.data.activeSession
      : null;
  const isSessionRunning = Boolean(activeSession);
  const isSessionLoading =
    workSessionsQuery.isLoading ||
    startSessionMutation.isPending ||
    stopSessionMutation.isPending;
  const secondsSinceLastServerRead = activeSession
    ? Math.max(0, Math.floor((clientNow - workSessionsQuery.dataUpdatedAt) / 1000))
    : 0;
  const elapsedSeconds = activeSession
    ? activeSession.elapsedSeconds + secondsSinceLastServerRead
    : 0;

  useEffect(() => {
    if (!activeSession) return;

    const interval = window.setInterval(() => {
      setClientNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [activeSession]);

  const handleStartSession = async () => {
    try {
      const session = await startSessionMutation.mutateAsync();
      toast.success(
        session.elapsedSeconds > 0
          ? "Đã tiếp tục phiên làm việc đang mở."
          : "Đã bắt đầu phiên làm việc."
      );
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Không thể bắt đầu phiên làm việc.");
    }
  };

  const handleStopSession = async () => {
    if (!activeSession) return;

    try {
      await stopSessionMutation.mutateAsync(activeSession.id);
      toast.success("Đã dừng và lưu thời lượng phiên làm việc.");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Không thể dừng phiên làm việc.");
    }
  };

  return (
    <div className="hidden items-center gap-1.5 sm:flex">
      <div
        className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 font-mono text-xs font-bold tabular-nums ${
          isSessionRunning
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            : "border-border/60 bg-background text-muted-foreground"
        }`}
        title={isSessionRunning ? "Phiên làm việc đang chạy trên máy chủ" : "Chưa có phiên làm việc đang chạy"}
        aria-live="polite"
      >
        {workSessionsQuery.isLoading ? (
          <Loader2Icon className="size-3.5 animate-spin" />
        ) : (
          <TimerIcon className="size-3.5" />
        )}
        {workSessionsQuery.isLoading ? "--:--:--" : formatWorkSessionDuration(elapsedSeconds)}
      </div>

      {isOwnerOrLeader &&
        (!isSessionRunning ? (
          <Button
            type="button"
            size="sm"
            disabled={isSessionLoading}
            onClick={handleStartSession}
            className="h-8 rounded-lg bg-emerald-600 px-2.5 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            {startSessionMutation.isPending ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : (
              <PlayIcon className="size-3.5" />
            )}
            Bắt đầu
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            disabled={isSessionLoading}
            onClick={handleStopSession}
            className="h-8 rounded-lg bg-rose-600 px-2.5 text-xs font-semibold text-white hover:bg-rose-700"
          >
            {stopSessionMutation.isPending ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : (
              <SquareIcon className="size-3.5" />
            )}
            Dừng
          </Button>
        ))}
    </div>
  );
}
