"use client";

import type { ReactNode } from "react";
import {
  ActivityIcon,
  CalendarRangeIcon,
  FileTextIcon,
  GitCommitIcon,
  Link2Icon,
  ListChecksIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ProjectProgressResponse } from "@/features/student/project/types/student-project";
import { cn } from "@/lib/utils";
import {
  DEGRADED_INTEGRATION_LABEL,
  formatCompletionPercent,
  formatDateTime,
  formatLinkedCommitRatio,
  isIntegrationDegraded,
  NO_ACTIVE_SPRINT_LABEL,
  NO_TASK_DATA_LABEL,
} from "../lib/progress-format";

interface ProjectProgressSummaryProps {
  progress: ProjectProgressResponse;
  className?: string;
}

function SyncBadge({
  label,
  status,
}: {
  label: string;
  status: string | null;
}) {
  const degraded = isIntegrationDegraded(status);
  const active = (status || "").trim().toUpperCase() === "ACTIVE";

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-mono text-[10px]",
        active && "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        degraded && "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
        !active && !degraded && "text-muted-foreground"
      )}
    >
      {label}: {degraded ? DEGRADED_INTEGRATION_LABEL : active ? "Đang kết nối" : "Chưa kết nối"}
    </Badge>
  );
}

export function ProjectProgressSummary({ progress, className }: ProjectProgressSummaryProps) {
  const tasks = progress.taskSummary;
  const completionLabel = formatCompletionPercent(tasks.completionPercent);
  const hasTasks = tasks.total > 0 && tasks.completionPercent !== null;
  const sprint = progress.currentSprint;
  const linkedRatio = formatLinkedCommitRatio(progress.commitSummary.linked, progress.commitSummary.total);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <SyncBadge label="Jira" status={progress.sync.jiraStatus} />
        <SyncBadge label="GitHub" status={progress.sync.githubStatus} />
        <span className="text-[11px] text-muted-foreground">
          Hoạt động gần nhất: {formatDateTime(progress.lastActivityAt)}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={<ListChecksIcon className="size-4" />}
          iconClass="bg-primary/10 text-primary"
          title="Tỉ lệ hoàn thành task"
          value={hasTasks ? completionLabel : NO_TASK_DATA_LABEL}
          hint={
            hasTasks
              ? `${tasks.done}/${tasks.total} task đã xong · đây không phải điểm học phần`
              : "Project chưa có task để tính tỉ lệ"
          }
        />
        <SummaryCard
          icon={<CalendarRangeIcon className="size-4" />}
          iconClass="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          title="Sprint hiện tại"
          value={sprint?.name || NO_ACTIVE_SPRINT_LABEL}
          hint={
            sprint
              ? `${sprint.completedTasks}/${sprint.totalTasks} task · ${sprint.state}`
              : "Chưa có Sprint đang hoạt động"
          }
        />
        <SummaryCard
          icon={<GitCommitIcon className="size-4" />}
          iconClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          title="Commit đã liên kết task"
          value={`${progress.commitSummary.linked}/${progress.commitSummary.total}`}
          hint={`${linkedRatio} commit có liên kết task`}
        />
        <SummaryCard
          icon={<FileTextIcon className="size-4" />}
          iconClass="bg-amber-500/10 text-amber-700 dark:text-amber-300"
          title="Minh chứng"
          value={String(
            progress.evidenceSummary.workSessions +
              progress.evidenceSummary.files +
              progress.evidenceSummary.webLinks +
              progress.evidenceSummary.confirmations
          )}
          hint={`${progress.evidenceSummary.workSessions} phiên · ${progress.evidenceSummary.files} tệp · ${progress.evidenceSummary.webLinks} liên kết · ${progress.evidenceSummary.confirmations} xác nhận`}
        />
      </div>

      <Card className="rounded-2xl border border-border/80 shadow-xs">
        <CardContent className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-6">
          <StatusStat label="Total" value={tasks.total} />
          <StatusStat label="To Do" value={tasks.todo} />
          <StatusStat label="In Progress" value={tasks.inProgress} />
          <StatusStat label="In Review" value={tasks.inReview} />
          <StatusStat label="Done" value={tasks.done} />
          {tasks.blocked > 0 && <StatusStat label="Blocked" value={tasks.blocked} />}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  icon,
  iconClass,
  title,
  value,
  hint,
}: {
  icon: ReactNode;
  iconClass: string;
  title: string;
  value: string;
  hint: string;
}) {
  return (
    <Card className="rounded-2xl border border-border/80 shadow-xs">
      <CardContent className="space-y-2 p-4">
        <div className="flex items-center gap-2">
          <div className={cn("flex size-8 items-center justify-center rounded-xl", iconClass)}>
            {icon}
          </div>
          <p className="text-[11px] font-semibold text-muted-foreground">{title}</p>
        </div>
        <p className="font-mono text-lg font-black leading-tight text-foreground">{value}</p>
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function StatusStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-muted/40 px-3 py-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="font-mono text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}

export function ProgressFactNote({ className }: { className?: string }) {
  return (
    <p className={cn("flex items-start gap-1.5 text-[11px] text-muted-foreground", className)}>
      <ActivityIcon className="mt-0.5 size-3.5 shrink-0" />
      Đây là tỉ lệ hoàn thành task và minh chứng thật từ máy chủ, không phải điểm đóng góp hay điểm học phần.
      Bảng điểm đóng góp nằm ở mục Đánh giá.
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
