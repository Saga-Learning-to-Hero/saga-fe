import {
  CalendarCheck2Icon,
  CalendarClockIcon,
  Clock3Icon,
  TriangleAlertIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { IssueStatus } from "../types/sprint-progress";
import { getTaskDueDateInfo } from "../lib/task-due-date";

interface TaskDueDateProps {
  dueDate?: string | null;
  status: IssueStatus;
  className?: string;
}

const STATE_STYLES = {
  COMPLETED: "text-muted-foreground",
  OVERDUE: "text-red-600 dark:text-red-400",
  TODAY: "text-amber-600 dark:text-amber-400",
  UPCOMING: "text-muted-foreground",
} as const;

const STATE_ICONS = {
  COMPLETED: CalendarCheck2Icon,
  OVERDUE: TriangleAlertIcon,
  TODAY: Clock3Icon,
  UPCOMING: CalendarClockIcon,
} as const;

export function TaskDueDate({ dueDate, status, className }: TaskDueDateProps) {
  const info = getTaskDueDateInfo(dueDate, status);
  if (!info) return null;

  const Icon = STATE_ICONS[info.state];

  return (
    <span
      title={info.accessibleLabel}
      aria-label={info.accessibleLabel}
      data-due-state={info.state.toLowerCase()}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 font-mono text-[10px] font-medium",
        STATE_STYLES[info.state],
        className
      )}
    >
      <Icon className="size-3 shrink-0" aria-hidden="true" />
      <span>{info.formattedDate}</span>
    </span>
  );
}
