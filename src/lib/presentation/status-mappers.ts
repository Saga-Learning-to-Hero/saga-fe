export function getTaskStatusLabel(status: string | undefined | null): string {
  if (!status) return "Chưa xác định";
  switch (status.toUpperCase()) {
    case "TODO":
      return "To Do";
    case "IN_PROGRESS":
      return "In Progress";
    case "IN_REVIEW":
      return "In Review";
    case "DONE":
      return "Done";
    case "BLOCKED":
      return "Blocked";
    default:
      return status;
  }
}

export function getTaskStatusColorClass(status: string | undefined | null): string {
  if (!status) return "bg-muted text-muted-foreground border-border";
  switch (status.toUpperCase()) {
    case "TODO":
      return "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30";
    case "IN_PROGRESS":
      return "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30";
    case "IN_REVIEW":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30";
    case "DONE":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
    case "BLOCKED":
      return "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function getTaskTypeLabel(type: string | undefined | null): string {
  if (!type) return "Khác";
  switch (type.toUpperCase()) {
    case "STORY":
      return "Story";
    case "TASK":
      return "Task";
    case "BUG":
      return "Bug";
    case "EPIC":
      return "Epic";
    case "SUBTASK":
      return "Subtask";
    case "REQUEST":
      return "Request";
    default:
      return type;
  }
}
