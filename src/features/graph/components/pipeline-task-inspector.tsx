"use client";

import { useState } from "react";
import {
  AlertTriangleIcon,
  CalendarIcon,
  CheckSquareIcon,
  GitBranchIcon,
  GitCommitIcon,
  MousePointerClickIcon,
  UserIcon,
  XIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isDoneWithoutLinkedCommit } from "../lib/pipeline-mapper";
import type { PipelineCommit, PipelineTask } from "../types/pipeline";

interface PipelineTaskInspectorProps {
  selectedTask: PipelineTask | null;
  commits: PipelineCommit[];
  isLoadingCommits: boolean;
  errorMessage: string | null;
  onRetry?: () => void;
  onClearSelection: () => void;
  className?: string;
}

function statusClass(status: string): string {
  const value = status.toUpperCase();
  if (value.includes("DONE") || value.includes("RESOLVED") || value.includes("CLOSED")) {
    return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  }
  if (value.includes("PROGRESS") || value.includes("REVIEW")) {
    return "bg-primary/15 text-primary";
  }
  if (value.includes("BLOCK")) {
    return "bg-destructive/15 text-destructive";
  }
  return "bg-muted text-muted-foreground";
}

function formatCommitDate(isoString?: string | null): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(d);
  } catch {
    return isoString;
  }
}

const INITIAL_COMMITS_LIMIT = 8;

export function PipelineTaskInspector({
  selectedTask,
  commits,
  isLoadingCommits,
  errorMessage,
  onRetry,
  onClearSelection,
  className,
}: PipelineTaskInspectorProps) {
  const [showAllForTaskId, setShowAllForTaskId] = useState<string | null>(null);
  const showAllCommits = Boolean(selectedTask && showAllForTaskId === selectedTask.id);

  if (!selectedTask) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/60 p-8 text-center text-xs text-muted-foreground lg:min-h-[260px]",
          className
        )}
      >
        <div className="flex size-11 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground/80">
          <MousePointerClickIcon className="size-5" />
        </div>
        <p className="mt-3 font-bold text-foreground">Chưa chọn Task</p>
        <p className="mt-1 max-w-[280px] leading-relaxed">
          Chọn một Task Jira trong danh sách hoặc bảng đối soát để xem các commit đã liên kết.
        </p>
      </div>
    );
  }

  const warning = isDoneWithoutLinkedCommit(selectedTask);
  const displayedCommits = showAllCommits ? commits : commits.slice(0, INITIAL_COMMITS_LIMIT);
  const hasMoreCommits = commits.length > INITIAL_COMMITS_LIMIT;

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xs lg:max-h-[calc(100dvh-8.5rem)]",
        className
      )}
    >
      <div className="shrink-0 space-y-3 border-b border-border/60 p-5 pb-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <CheckSquareIcon className="size-4 text-emerald-500" />
            <span className="font-mono text-xs font-black text-primary">{selectedTask.key}</span>
            <Badge variant="outline" className="px-1.5 py-0 text-[10px] uppercase">
              {selectedTask.issueTypeName}
            </Badge>
            <Badge className={`text-[10px] font-bold ${statusClass(selectedTask.status)}`}>
              {selectedTask.status}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Bỏ chọn Task"
            onClick={onClearSelection}
            className="size-7 shrink-0 cursor-pointer rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <XIcon className="size-3.5" />
          </Button>
        </div>

        <h4 className="text-sm font-bold leading-snug text-foreground">{selectedTask.title}</h4>

        {selectedTask.parent && (selectedTask.parent.externalKey || selectedTask.parent.externalId) && (
          <div className="flex items-center gap-2 rounded-xl bg-muted/20 px-2.5 py-1 text-[11px] text-muted-foreground">
            <span className="font-medium">Thuộc Task cha:</span>
            <Badge variant="outline" className="font-mono text-[10px] font-bold text-primary">
              {selectedTask.parent.externalKey || selectedTask.parent.externalId}
            </Badge>
          </div>
        )}

        <div className="grid grid-cols-1 gap-1.5 rounded-2xl bg-muted/30 p-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 truncate">
            <CalendarIcon className="size-3.5 shrink-0 text-muted-foreground/70" />
            <span className="truncate">{selectedTask.sprintName || "Chưa vào Sprint"}</span>
          </div>
          <div className="flex items-center gap-2 truncate">
            <UserIcon className="size-3.5 shrink-0 text-muted-foreground/70" />
            <span className="truncate">{selectedTask.assigneeDisplayName || "Chưa phân công"}</span>
          </div>
          <div className="flex items-center gap-2">
            <GitCommitIcon className="size-3.5 shrink-0 text-primary" />
            <span className="font-mono font-bold text-foreground">
              {selectedTask.linkedCommitCount} commit đã liên kết
            </span>
          </div>
        </div>

        {warning && (
          <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-2.5 text-xs font-semibold text-destructive">
            <AlertTriangleIcon className="mt-0.5 size-3.5 shrink-0" />
            <span>Task đã hoàn thành nhưng chưa ghi nhận Commit đối soát từ repository.</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 min-h-0 flex-col overflow-hidden p-5 pt-3">
        <div className="mb-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs font-extrabold text-foreground">
            <GitCommitIcon className="size-3.5 text-primary" />
            <span>Commit liên kết ({commits.length})</span>
          </div>
        </div>

        {isLoadingCommits ? (
          <div className="space-y-2 shrink-0" aria-label="Đang tải Commit liên kết">
            <div className="h-16 animate-pulse rounded-xl bg-muted/60" />
            <div className="h-16 animate-pulse rounded-xl bg-muted/60" />
          </div>
        ) : errorMessage ? (
          <div className="rounded-2xl border border-dashed border-destructive/30 p-4 text-center text-xs text-muted-foreground shrink-0">
            <p className="font-medium text-destructive">{errorMessage}</p>
            {onRetry && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="mt-2 h-7 cursor-pointer text-xs"
              >
                Thử lại
              </Button>
            )}
          </div>
        ) : commits.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 p-5 text-center text-xs text-muted-foreground shrink-0">
            <p>Chưa có commit được liên kết với task này.</p>
          </div>
        ) : (
          <div className="flex-1 min-h-0 space-y-2 overflow-y-auto pr-1">
            {displayedCommits.map((commit) => (
              <div
                key={commit.id}
                className="rounded-2xl border border-border/70 bg-card/90 p-3 shadow-2xs transition-colors hover:border-border"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[11px] font-bold text-primary">
                      {commit.shortHash}
                    </span>
                    {commit.headRef && (
                      <Badge variant="outline" className="flex items-center gap-1 px-1.5 py-0 text-[10px] font-mono text-muted-foreground">
                        <GitBranchIcon className="size-2.5" />
                        <span className="max-w-[120px] truncate">{commit.headRef}</span>
                      </Badge>
                    )}
                  </div>
                  <span className="truncate text-[10px] text-muted-foreground">
                    {commit.repositoryFullName}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs font-semibold text-foreground">
                  {commit.message}
                </p>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{commit.authorLabel}</span>
                  {commit.committedAt && (
                    <span className="text-[10px]">{formatCommitDate(commit.committedAt)}</span>
                  )}
                </div>
              </div>
            ))}

            {hasMoreCommits && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setShowAllForTaskId((curr) =>
                    curr === selectedTask.id ? null : selectedTask.id
                  )
                }
                className="w-full mt-2 text-xs font-semibold text-primary hover:bg-primary/10 cursor-pointer"
              >
                {showAllCommits
                  ? "Thu gọn danh sách"
                  : `Xem thêm (còn ${commits.length - INITIAL_COMMITS_LIMIT} commit) / Hiển thị tất cả ${commits.length} commits`}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

