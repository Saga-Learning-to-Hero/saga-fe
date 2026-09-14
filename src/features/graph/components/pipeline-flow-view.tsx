"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangleIcon,
  CheckSquareIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  GitCommitIcon,
  UserIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { teamRoleLabel } from "@/features/progress/lib/progress-format";
import { UNASSIGNED_LANE_ID } from "../types/pipeline";
import { isDoneWithoutLinkedCommit } from "../lib/pipeline-mapper";
import type { PipelineCommit, PipelineLane, PipelineTask } from "../types/pipeline";

interface PipelineFlowViewProps {
  lanes: PipelineLane[];
  selectedTaskId: string | null;
  selectedCommits: PipelineCommit[];
  isLoadingTaskCommits: boolean;
  taskCommitsErrorMessage: string | null;
  onSelectTask: (taskId: string) => void;
  onRetryTaskCommits?: () => void;
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

function TaskCard({
  task,
  selected,
  onSelect,
}: {
  task: PipelineTask;
  selected: boolean;
  onSelect: () => void;
}) {
  const warning = isDoneWithoutLinkedCommit(task);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-2xl border p-3.5 text-left transition-colors ${
        selected
          ? "border-primary bg-primary/5"
          : warning
            ? "border-destructive/30 bg-destructive/5 hover:border-destructive/50"
            : "border-border/70 bg-muted/15 hover:bg-muted/30"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CheckSquareIcon className="size-3.5 text-emerald-500" />
          <span className="font-mono text-xs font-black text-primary">{task.key}</span>
          <Badge variant="outline" className="px-1.5 py-0 text-[10px] uppercase">
            {task.issueTypeName}
          </Badge>
        </div>
        <Badge className={`text-[10px] font-bold ${statusClass(task.status)}`}>{task.status}</Badge>
      </div>
      <p className="mt-1.5 line-clamp-2 text-sm font-semibold text-foreground">{task.title}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        <span>{task.sprintName}</span>
        <span>·</span>
        <span>{task.assigneeDisplayName || "Chưa phân công"}</span>
        <span>·</span>
        <span className="inline-flex items-center gap-1 font-mono">
          <GitCommitIcon className="size-3" />
          {task.linkedCommitCount}
        </span>
        {warning ? (
          <span className="inline-flex items-center gap-1 font-semibold text-destructive">
            <AlertTriangleIcon className="size-3" />
            Hoàn thành chưa có Commit liên kết
          </span>
        ) : null}
      </div>
    </button>
  );
}

function CommitList({
  commits,
  isLoading,
  errorMessage,
  onRetry,
}: {
  commits: PipelineCommit[];
  isLoading: boolean;
  errorMessage: string | null;
  onRetry?: () => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2" aria-label="Đang tải Commit liên kết">
        <div className="h-14 animate-pulse rounded-xl bg-muted" />
        <div className="h-14 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }
  if (errorMessage) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 p-4 text-center text-xs text-muted-foreground">
        <p>{errorMessage}</p>
        {onRetry ? (
          <button type="button" onClick={onRetry} className="mt-2 cursor-pointer text-primary underline">
            Thử lại
          </button>
        ) : null}
      </div>
    );
  }
  if (commits.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border/80 p-4 text-center text-xs text-muted-foreground">
        Task này chưa có Commit liên kết từ API.
      </p>
    );
  }
  return (
    <div className="space-y-2">
      {commits.map((commit) => (
        <div key={commit.id} className="rounded-xl border border-border/70 bg-card p-3">
          <p className="font-mono text-[11px] font-bold text-primary">{commit.shortHash}</p>
          <p className="mt-1 line-clamp-2 text-xs font-semibold text-foreground">{commit.message}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {commit.authorLabel} · {commit.repositoryFullName}
          </p>
        </div>
      ))}
    </div>
  );
}

export function PipelineFlowView({
  lanes,
  selectedTaskId,
  selectedCommits,
  isLoadingTaskCommits,
  taskCommitsErrorMessage,
  onSelectTask,
  onRetryTaskCommits,
}: PipelineFlowViewProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const selectedTask = useMemo(
    () => lanes.flatMap((lane) => lane.tasks).find((task) => task.id === selectedTaskId) || null,
    [lanes, selectedTaskId]
  );

  const toggleLane = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (lanes.every((lane) => lane.tasks.length === 0)) {
    return (
      <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center text-sm text-muted-foreground">
        Không có Task nào khớp bộ lọc hiện tại.
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <div className="space-y-4 lg:col-span-8">
        {lanes.map((lane) => {
          const isCollapsed = collapsed.has(lane.id);
          const name = lane.member?.fullName || "Chưa phân công";
          const code = lane.member?.studentCode;
          return (
            <section
              key={lane.id}
              className="overflow-hidden rounded-3xl border border-border/80 bg-card/90 shadow-xs"
            >
              <button
                type="button"
                onClick={() => toggleLane(lane.id)}
                className="flex w-full items-center justify-between gap-3 border-b border-border/60 bg-muted/20 p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UserIcon className="size-4" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-extrabold text-foreground">{name}</span>
                      {code ? (
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {code}
                        </Badge>
                      ) : null}
                      {lane.member ? (
                        <Badge className="bg-muted text-[10px] text-muted-foreground">
                          {teamRoleLabel(lane.member.teamRole)}
                        </Badge>
                      ) : (
                        <Badge className="bg-muted text-[10px] text-muted-foreground">
                          {UNASSIGNED_LANE_ID === lane.id ? "Lane chờ phân công" : "Lane"}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {lane.tasks.length} Task
                    </p>
                  </div>
                </div>
                {isCollapsed ? <ChevronDownIcon className="size-4" /> : <ChevronUpIcon className="size-4" />}
              </button>
              {!isCollapsed ? (
                <div className="space-y-3 p-4">
                  {lane.tasks.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-border/80 p-4 text-center text-xs text-muted-foreground">
                      Thành viên này chưa được phân công Task trong bộ lọc.
                    </p>
                  ) : (
                    lane.tasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        selected={task.id === selectedTaskId}
                        onSelect={() => onSelectTask(task.id)}
                      />
                    ))
                  )}
                </div>
              ) : null}
            </section>
          );
        })}
      </div>

      <aside className="lg:col-span-4">
        <div className="sticky top-4 space-y-3 rounded-3xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="flex items-center gap-2">
            <GitCommitIcon className="size-4 text-primary" />
            <h3 className="text-sm font-extrabold">Commit liên kết</h3>
          </div>
          {selectedTask ? (
            <>
              <p className="text-xs text-muted-foreground">
                {selectedTask.key} · {selectedTask.title}
              </p>
              <CommitList
                commits={selectedCommits}
                isLoading={isLoadingTaskCommits}
                errorMessage={taskCommitsErrorMessage}
                onRetry={onRetryTaskCommits}
              />
            </>
          ) : (
            <p className="rounded-xl border border-dashed border-border/80 p-4 text-xs text-muted-foreground">
              Chọn một Task để tải Commit liên kết. Hệ thống chỉ gọi API khi bạn chọn Task.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
