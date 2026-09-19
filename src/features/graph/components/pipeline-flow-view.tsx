"use client";

import { useState } from "react";
import {
  AlertTriangleIcon,
  CheckSquareIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  GitCommitIcon,
  PaperclipIcon,
  UserIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { teamRoleLabel } from "@/features/progress/lib/progress-format";
import { UNASSIGNED_LANE_ID } from "../types/pipeline";
import { isDoneWithoutLinkedCommit, isDocumentOrResearchTask } from "../lib/pipeline-mapper";
import type { PipelineCommit, PipelineLane, PipelineTask } from "../types/pipeline";

interface PipelineFlowViewProps {
  lanes: PipelineLane[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  selectedCommits?: PipelineCommit[];
  isLoadingTaskCommits?: boolean;
  taskCommitsErrorMessage?: string | null;
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
  const isDoc = isDocumentOrResearchTask(task);
  const hasEvidence = (task.evidenceCount ?? 0) > 0 || task.hasEvidence === true;
  const warning = isDoneWithoutLinkedCommit(task);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full cursor-pointer rounded-2xl border p-3.5 text-left transition-all ${selected
        ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40"
        : warning
          ? "border-destructive/30 bg-destructive/5 hover:border-destructive/50"
          : hasEvidence && task.linkedCommitCount === 0
            ? "border-purple-500/30 bg-purple-500/5 hover:border-purple-500/50"
            : "border-border/70 bg-muted/15 hover:border-border hover:bg-muted/30"
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
        {hasEvidence ? (
          <span className="inline-flex items-center gap-1 font-semibold text-purple-600 dark:text-purple-400">
            <PaperclipIcon className="size-3" />
            Đã có tệp minh chứng {task.evidenceCount ? `(${task.evidenceCount})` : ""}
          </span>
        ) : warning ? (
          <span className={`inline-flex items-center gap-1 font-semibold ${isDoc ? "text-amber-600 dark:text-amber-400" : "text-destructive"}`}>
            <AlertTriangleIcon className="size-3" />
            {isDoc ? "Cần nộp tệp / liên kết minh chứng" : "Hoàn thành chưa có Commit liên kết"}
          </span>
        ) : null}
      </div>
    </button>
  );
}

export function PipelineFlowView({
  lanes,
  selectedTaskId,
  onSelectTask,
}: PipelineFlowViewProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

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
      <div className="rounded-3xl border border-dashed border-border/80 bg-card/40 p-8 text-center text-sm text-muted-foreground">
        Không có Task nào khớp bộ lọc hiện tại.
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
              className="flex w-full cursor-pointer items-center justify-between gap-3 border-b border-border/60 bg-muted/20 p-4 text-left transition-colors hover:bg-muted/30"
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
              {isCollapsed ? <ChevronDownIcon className="size-4 text-muted-foreground" /> : <ChevronUpIcon className="size-4 text-muted-foreground" />}
            </button>
            {!isCollapsed ? (
              <div className="max-h-[400px] overflow-y-auto space-y-3 p-4 pr-2.5">
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
  );
}
