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

  return (
    <TooltipProvider delay={150}>
      <div className={cn("space-y-4", className)}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-foreground">Tiến độ dự án</h3>
            <Tooltip>
              <TooltipTrigger
                aria-label="Thông tin số liệu tiến độ"
                className="inline-flex size-5 cursor-help items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <InfoIcon className="size-3.5" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-xs">
                Số liệu tiến độ kỹ thuật từ Jira và GitHub. Hệ thống không tính điểm môn học; mục Đánh giá dùng để đối soát và đánh giá tỷ lệ (%) đóng góp công sức.
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
              {syncInfo.isJiraActive ? "Đã kết nối Jira" : "Chưa kết nối Jira"}
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
              {syncInfo.isGitHubActive ? "Đã kết nối GitHub" : "Chưa kết nối GitHub"}
            </span>

            <span
              className={cn(
                "font-mono text-[11px]",
                syncInfo.isStaleOrMissing
                  ? "font-medium text-amber-700 dark:text-amber-300"
                  : "text-muted-foreground"
              )}
            >
              Cập nhật {syncInfo.relativeTime}
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
                <p className="text-[11px] font-semibold text-muted-foreground">Tiến độ công việc</p>
              </div>
              <p className="font-mono text-xl font-black leading-tight text-foreground">
                {hasTasks ? completionLabel : NO_TASK_DATA_LABEL}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {hasTasks ? `${tasks.done} / ${tasks.total} task hoàn thành` : "Chưa có task trong dự án"}
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
                  <p className="text-[11px] font-semibold text-muted-foreground">Sprint hiện tại</p>
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
                  ? "Không có Sprint đang chạy"
                  : sprint.totalTasks === 0
                    ? "Chưa có task trong Sprint"
                    : `${sprintRemainingTasks} task còn lại`}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/80 shadow-xs">
            <CardContent className="space-y-2 p-4">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <GitCommitIcon className="size-4" />
                </div>
                <p className="text-[11px] font-semibold text-muted-foreground">Đối soát commit</p>
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
                  ? "Chưa ghi nhận commit"
                  : unlinkedCommits > 0
                    ? `${unlinkedCommits} commit cần gắn mã task`
                    : "Tất cả commit đã gắn mã task"}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/80 shadow-xs">
            <CardContent className="space-y-2 p-4">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300">
                  <FileTextIcon className="size-4" />
                </div>
                <p className="text-[11px] font-semibold text-muted-foreground">Minh chứng công việc</p>
              </div>
              <p className="font-mono text-xl font-black leading-tight text-foreground">
                {totalEvidence}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {progress.evidenceSummary.workSessions} phiên làm việc · {progress.evidenceSummary.files} tệp · {progress.evidenceSummary.webLinks} liên kết · {progress.evidenceSummary.confirmations} xác nhận
              </p>
            </CardContent>
          </Card>
        </div>
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
