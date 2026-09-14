"use client";

import {
  ActivityIcon,
  CalendarRangeIcon,
  FileTextIcon,
  GitCommitIcon,
  InfoIcon,
  Link2Icon,
  ListChecksIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ProjectProgressResponse } from "@/features/student/project/types/student-project";
import { cn } from "@/lib/utils";
import {
  formatCompletionPercent,
  formatLinkedCommitRatio,
  formatSprintDue,
  getLatestSyncInfo,
  NO_ACTIVE_SPRINT_LABEL,
  NO_TASK_DATA_LABEL,
} from "../lib/progress-format";

interface ProjectProgressSummaryProps {
  progress: ProjectProgressResponse;
  className?: string;
}

export function ProjectProgressSummary({ progress, className }: ProjectProgressSummaryProps) {
  const tasks = progress.taskSummary;
  const completionLabel = formatCompletionPercent(tasks.completionPercent);
  const hasTasks = tasks.total > 0 && tasks.completionPercent !== null;
  const sprint = progress.currentSprint;
  const sprintDue = formatSprintDue(sprint?.endDate);
  const syncInfo = getLatestSyncInfo(progress.sync);

  const unlinkedCommits = Math.max(0, progress.commitSummary.total - progress.commitSummary.linked);
  const totalEvidence =
    progress.evidenceSummary.workSessions +
    progress.evidenceSummary.files +
    progress.evidenceSummary.webLinks +
    progress.evidenceSummary.confirmations;

  const sprintStateLabel = sprint?.state
    ? sprint.state.charAt(0).toUpperCase() + sprint.state.slice(1).toLowerCase()
    : "Active";

  const sprintRemainingTasks = sprint ? Math.max(0, sprint.totalTasks - sprint.completedTasks) : 0;

  const allStatuses = [
    {
      key: "todo",
      label: "To Do",
      count: tasks.todo,
      barClass: "bg-slate-400 dark:bg-slate-500",
      dotClass: "bg-slate-400 dark:bg-slate-500",
      isBlocked: false,
    },
    {
      key: "inProgress",
      label: "In Progress",
      count: tasks.inProgress,
      barClass: "bg-blue-500",
      dotClass: "bg-blue-500",
      isBlocked: false,
    },
    {
      key: "inReview",
      label: "In Review",
      count: tasks.inReview,
      barClass: "bg-purple-500",
      dotClass: "bg-purple-500",
      isBlocked: false,
    },
    {
      key: "done",
      label: "Done",
      count: tasks.done,
      barClass: "bg-emerald-500",
      dotClass: "bg-emerald-500",
      isBlocked: false,
    },
    {
      key: "blocked",
      label: "Blocked",
      count: tasks.blocked,
      barClass: "bg-red-500",
      dotClass: "bg-red-500",
      isBlocked: true,
    },
  ];

  const visibleStatuses = allStatuses.filter((s) => s.count > 0);

  return (
    <TooltipProvider delay={150}>
      <div className={cn("space-y-4", className)}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-foreground">Project progress</h3>
            <Tooltip>
              <TooltipTrigger
                aria-label="Thông tin số liệu tiến độ"
                className="inline-flex size-5 cursor-help items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <InfoIcon className="size-3.5" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-xs">
                Technical progress data only. This is not a contribution or course grade.
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[11px] font-semibold",
                syncInfo.isJiraActive
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  syncInfo.isJiraActive ? "bg-emerald-500" : "bg-amber-500"
                )}
              />
              {syncInfo.isJiraActive ? "Jira connected" : "Jira disconnected"}
            </span>

            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[11px] font-semibold",
                syncInfo.isGitHubActive
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  syncInfo.isGitHubActive ? "bg-emerald-500" : "bg-amber-500"
                )}
              />
              {syncInfo.isGitHubActive ? "GitHub connected" : "GitHub disconnected"}
            </span>

            <span
              className={cn(
                "font-mono text-[11px]",
                syncInfo.isStaleOrMissing
                  ? "font-medium text-amber-700 dark:text-amber-300"
                  : "text-muted-foreground"
              )}
            >
              Updated {syncInfo.relativeTime}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="rounded-2xl border border-border/80 shadow-xs">
            <CardContent className="space-y-2 p-4">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ListChecksIcon className="size-4" />
                </div>
                <p className="text-[11px] font-semibold text-muted-foreground">Task progress</p>
              </div>
              <p className="font-mono text-xl font-black leading-tight text-foreground">
                {hasTasks ? completionLabel : NO_TASK_DATA_LABEL}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {hasTasks ? `${tasks.done} / ${tasks.total} tasks completed` : "No tasks in project"}
              </p>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.max(0, tasks.completionPercent ?? 0))}%`,
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/80 shadow-xs">
            <CardContent className="space-y-2 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <CalendarRangeIcon className="size-4" />
                  </div>
                  <p className="text-[11px] font-semibold text-muted-foreground">Current sprint</p>
                </div>
                {sprint && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-mono text-[10px] font-semibold",
                      sprintDue.urgency === "overdue" &&
                      "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
                      sprintDue.urgency === "warning" &&
                      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
                      sprintDue.urgency === "normal" &&
                      "border-border/60 bg-muted/40 text-muted-foreground",
                      sprintDue.urgency === "none" &&
                      "border-border/40 text-muted-foreground/70"
                    )}
                  >
                    {sprintDue.label}
                  </Badge>
                )}
              </div>
              <p className="truncate font-mono text-lg font-black leading-tight text-foreground">
                {sprint ? `${sprint.name} · ${sprintStateLabel}` : NO_ACTIVE_SPRINT_LABEL}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {!sprint
                  ? "No active sprint"
                  : sprint.totalTasks === 0
                    ? "No tasks in this sprint"
                    : `${sprintRemainingTasks} ${sprintRemainingTasks === 1 ? "task" : "tasks"} remaining`}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/80 shadow-xs">
            <CardContent className="space-y-2 p-4">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <GitCommitIcon className="size-4" />
                </div>
                <p className="text-[11px] font-semibold text-muted-foreground">Commit traceability</p>
              </div>
              <p className="font-mono text-xl font-black leading-tight text-foreground">
                {progress.commitSummary.linked} / {progress.commitSummary.total}
              </p>
              <p
                className={cn(
                  "text-[11px]",
                  unlinkedCommits > 0
                    ? "font-medium text-amber-700 dark:text-amber-300"
                    : "text-muted-foreground"
                )}
              >
                {progress.commitSummary.total === 0
                  ? "No commits recorded"
                  : unlinkedCommits > 0
                    ? `${unlinkedCommits} commits need linking`
                    : "All commits linked to Jira tasks"}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/80 shadow-xs">
            <CardContent className="space-y-2 p-4">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300">
                  <FileTextIcon className="size-4" />
                </div>
                <p className="text-[11px] font-semibold text-muted-foreground">Work evidence</p>
              </div>
              <p className="font-mono text-xl font-black leading-tight text-foreground">
                {totalEvidence}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {progress.evidenceSummary.workSessions} work session · {progress.evidenceSummary.files} files · {progress.evidenceSummary.webLinks} links · {progress.evidenceSummary.confirmations} confirmations
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl border border-border/80 shadow-xs">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Jira status</span>
              <span className="font-mono text-[11px] font-semibold text-muted-foreground">
                {tasks.total} {tasks.total === 1 ? "task" : "tasks"} total
              </span>
            </div>

            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted/60">
              {tasks.total > 0 ? (
                allStatuses.map((seg) => {
                  if (seg.count <= 0) return null;
                  const pct = (seg.count / tasks.total) * 100;
                  return (
                    <div
                      key={seg.key}
                      style={{ width: `${pct}%` }}
                      className={cn("h-full transition-all duration-300", seg.barClass)}
                      title={`${seg.label}: ${seg.count} (${Math.round(pct)}%)`}
                    />
                  );
                })
              ) : (
                <div className="h-full w-full bg-muted" />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-xs">
              {visibleStatuses.map((seg) => (
                <div key={seg.key} className="flex items-center gap-1.5">
                  <span className={cn("size-2 rounded-full", seg.dotClass)} />
                  <span className="text-muted-foreground">{seg.label}</span>
                  <span className="font-mono font-bold text-foreground">{seg.count}</span>

                  {seg.isBlocked && (
                    <Tooltip>
                      <TooltipTrigger
                        aria-label="Blocked status note"
                        className="inline-flex size-3.5 cursor-help items-center justify-center text-red-500 hover:text-red-600"
                      >
                        <InfoIcon className="size-3" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs">
                        A custom Jira status mapped when work cannot progress.
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}

export function ProgressFactNote({ className }: { className?: string }) {
  return (
    <p className={cn("flex items-start gap-1.5 text-[11px] text-muted-foreground", className)}>
      <ActivityIcon className="mt-0.5 size-3.5 shrink-0" />
      Số liệu tiến độ và minh chứng kỹ thuật được ghi nhận trực tiếp từ máy chủ. Hệ thống không tính điểm môn học; mục Đánh giá dùng để đối soát và đánh giá tỷ lệ (%) đóng góp công sức thực tế.
    </p>
  );
}

export function LinkedCommitHint({
  linked,
  total,
  className,
}: {
  linked: number;
  total: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1 font-mono", className)}>
      <Link2Icon className="size-3" />
      {formatLinkedCommitRatio(linked, total)}
    </span>
  );
}
