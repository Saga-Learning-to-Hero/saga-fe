"use client";

import { ClockIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskWorkSessionTimeline } from "./task-work-session-timeline";

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
  if (!open || !projectId || !taskId) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border/80 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-border/60 flex items-center justify-between shrink-0 bg-muted/20">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="size-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <ClockIcon className="size-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {taskKey && (
                  <span className="font-mono text-xs font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded-md border border-primary/20">
                    {taskKey}
                  </span>
                )}
                <h3 className="text-sm font-extrabold text-foreground truncate">
                  {taskTitle ? `Dòng thời gian: ${taskTitle}` : "Dòng thời gian công việc"}
                </h3>
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
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
    </div>
  );
}
