"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { ClockIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskWorkSessionTimeline } from "./task-work-session-timeline";

const emptySubscribe = () => () => { };

interface TaskWorkSessionTimelineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  taskId: string;
  taskTitle?: string | null;
  taskKey?: string | null;
}

export function TaskWorkSessionTimelineDialog({
  open,
  onOpenChange,
  projectId,
  taskId,
  taskTitle,
  taskKey,
}: TaskWorkSessionTimelineDialogProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  if (!open || !projectId || !taskId || !mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-0 duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onOpenChange(false);
      }}
    >
      <div
        className="bg-card border border-border/80 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-border/60 flex items-center justify-between shrink-0 bg-muted/20">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="size-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <ClockIcon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 min-w-0">
                {taskKey && (
                  <span className="font-mono text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 shrink-0 whitespace-nowrap">
                    {taskKey}
                  </span>
                )}
                <h3 className="text-sm font-extrabold text-foreground truncate min-w-0 flex-1">
                  Dòng thời gian: {taskTitle || taskKey || "Chi tiết công việc"}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                Lịch sử các phiên làm việc và commit mã nguồn đã liên kết
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-xl p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors shrink-0"
            aria-label="Đóng dialog"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
          <TaskWorkSessionTimeline projectId={projectId} taskId={taskId} />
        </div>

        <div className="p-4 border-t border-border/60 flex items-center justify-end gap-2.5 shrink-0 bg-muted/20">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="rounded-xl h-8 px-4 text-xs cursor-pointer"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
