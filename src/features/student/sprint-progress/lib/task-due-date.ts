import type { IssueStatus } from "../types/sprint-progress";

export type TaskDueDateState = "COMPLETED" | "OVERDUE" | "TODAY" | "UPCOMING";

export interface TaskDueDateInfo {
  date: string;
  formattedDate: string;
  state: TaskDueDateState;
  accessibleLabel: string;
}

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;

function normalizeDateOnly(value: string): string | null {
  const match = ISO_DATE_PATTERN.exec(value.trim());
  if (!match) return null;

  const [, year, month, day] = match;
  const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (
    parsed.getUTCFullYear() !== Number(year) ||
    parsed.getUTCMonth() !== Number(month) - 1 ||
    parsed.getUTCDate() !== Number(day)
  ) {
    return null;
  }

  return `${year}-${month}-${day}`;
}

function getVietnamDateOnly(now: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function getTaskDueDateInfo(
  dueDate: string | null | undefined,
  status: IssueStatus,
  now = new Date()
): TaskDueDateInfo | null {
  if (!dueDate) return null;

  const date = normalizeDateOnly(dueDate);
  if (!date) return null;

  const [year, month, day] = date.split("-");
  const formattedDate = `${day}/${month}/${year}`;

  if (status === "DONE") {
    return {
      date,
      formattedDate,
      state: "COMPLETED",
      accessibleLabel: `Hạn hoàn thành ${formattedDate}; task đã hoàn thành`,
    };
  }

  const today = getVietnamDateOnly(now);
  if (date < today) {
    return {
      date,
      formattedDate,
      state: "OVERDUE",
      accessibleLabel: `Task đã quá hạn từ ${formattedDate}`,
    };
  }

  if (date === today) {
    return {
      date,
      formattedDate,
      state: "TODAY",
      accessibleLabel: `Task đến hạn hôm nay, ${formattedDate}`,
    };
  }

  return {
    date,
    formattedDate,
    state: "UPCOMING",
    accessibleLabel: `Hạn hoàn thành ${formattedDate}`,
  };
}
