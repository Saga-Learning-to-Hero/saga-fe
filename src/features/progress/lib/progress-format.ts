import type {
  ProjectProgressMemberSummary,
  ProjectProgressResponse,
  TaskLinkedCommitItem,
} from "@/features/student/project/types/student-project";

export const NO_TASK_DATA_LABEL = "Chưa có dữ liệu task";
export const NO_ACTIVE_SPRINT_LABEL = "Chưa có Sprint đang hoạt động";
export const DEGRADED_INTEGRATION_LABEL = "Mất kết nối · dữ liệu ghi nhận lần cuối";

export interface WeeklyCommitBucket {
  weekKey: string;
  weekLabel: string;
  commits: number;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Hiển thị tỉ lệ hoàn thành task; null nghĩa là project chưa có task. */
export function formatCompletionPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return NO_TASK_DATA_LABEL;
  }
  return `${Math.round(value)}%`;
}

/** Status không ACTIVE (kể cả REVOKED) là dữ liệu last-known, không phải live. */
export function isIntegrationDegraded(status?: string | null): boolean {
  if (status === null || status === undefined) return false;
  const normalized = status.trim().toUpperCase();
  if (!normalized) return false;
  return normalized !== "ACTIVE";
}

export function formatLinkedCommitRatio(linked: number, total: number): string {
  if (!total || total <= 0) return "0%";
  return `${Math.round((Math.max(0, linked) / total) * 100)}%`;
}

export function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getUtcMonday(date: Date): Date {
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utc.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  utc.setUTCDate(utc.getUTCDate() + diff);
  return utc;
}

function getIsoWeek(monday: Date): { year: number; week: number } {
  const thursday = new Date(monday);
  thursday.setUTCDate(monday.getUTCDate() + 3);
  const year = thursday.getUTCFullYear();
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Monday = getUtcMonday(jan4);
  const week = 1 + Math.round((monday.getTime() - jan4Monday.getTime()) / (7 * MS_PER_DAY));
  return { year, week };
}

function weekKeyOf(date: Date): { weekKey: string; weekLabel: string } {
  const monday = getUtcMonday(date);
  const { year, week } = getIsoWeek(monday);
  const padded = String(week).padStart(2, "0");
  return {
    weekKey: `${year}-W${padded}`,
    weekLabel: `Tuần ${padded} · ${year}`,
  };
}

/** Gom commit theo tuần ISO (UTC) để biểu đồ tuần không phụ thuộc timezone trình duyệt. */
export function buildWeeklyCommitBuckets(
  commits: Array<Pick<TaskLinkedCommitItem, "committedAt" | "authorStudentId">>,
  options?: { studentId?: string | null }
): WeeklyCommitBucket[] {
  const studentId = options?.studentId?.trim() || "";
  const counts = new Map<string, WeeklyCommitBucket>();

  for (const commit of commits) {
    if (studentId && (commit.authorStudentId || "").trim() !== studentId) {
      continue;
    }
    const date = new Date(commit.committedAt);
    if (Number.isNaN(date.getTime())) continue;

    const { weekKey, weekLabel } = weekKeyOf(date);
    const existing = counts.get(weekKey);
    if (existing) {
      existing.commits += 1;
    } else {
      counts.set(weekKey, { weekKey, weekLabel, commits: 1 });
    }
  }

  return Array.from(counts.values()).sort((a, b) => a.weekKey.localeCompare(b.weekKey));
}

export function teamRoleLabel(role?: string | null): string {
  if ((role || "").toUpperCase() === "LEADER") return "Trưởng nhóm";
  return "Thành viên";
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && !Number.isNaN(value) ? value : fallback;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

/** Backend có thể dùng tasks/commits hoặc taskSummary/commitSummary cho cùng một member. */
export function normalizeMemberSummary(raw: unknown): ProjectProgressMemberSummary {
  const item = asRecord(raw);
  const tasks = asRecord(item.tasks ?? item.taskSummary);
  const commits = asRecord(item.commits ?? item.commitSummary);
  const evidence = asRecord(item.evidenceSummary);
  const assigned = asNumber(tasks.assigned ?? tasks.assignedTotal);
  const completed = asNumber(tasks.completed);
  const incomplete = asNumber(tasks.incomplete, Math.max(0, assigned - completed));

  return {
    studentId: asString(item.studentId),
    userId: asString(item.userId),
    fullName: asString(item.fullName),
    studentCode: asString(item.studentCode),
    teamRole: asString(item.teamRole || item.role, "MEMBER"),
    tasks: {
      assigned,
      assignedTotal: assigned,
      completed,
      incomplete,
      inProgress: asNumber(tasks.inProgress),
      blocked: asNumber(tasks.blocked),
    },
    commits: {
      total: asNumber(commits.total),
      linkedToTasks: asNumber(commits.linkedToTasks ?? commits.linked),
      tasksWithLinkedCommits: asNumber(commits.tasksWithLinkedCommits),
      lastCommitAt: asNullableString(commits.lastCommitAt ?? commits.lastCommittedAt),
      lastCommittedAt: asNullableString(commits.lastCommittedAt ?? commits.lastCommitAt),
    },
    evidenceConfirmations: asNumber(item.evidenceConfirmations ?? evidence.confirmations),
  };
}

export function normalizeProjectProgress(raw: unknown): ProjectProgressResponse | null {
  if (!raw || typeof raw !== "object") return null;
  const item = asRecord(raw);
  const taskSummary = asRecord(item.taskSummary);
  const commitSummary = asRecord(item.commitSummary);
  const evidenceSummary = asRecord(item.evidenceSummary);
  const sync = asRecord(item.sync);
  const members = Array.isArray(item.memberProgress)
    ? item.memberProgress
    : Array.isArray(item.members)
      ? item.members
      : [];

  return {
    projectId: asString(item.projectId),
    teamId: asString(item.teamId),
    teamNo: asNumber(item.teamNo),
    teamName: asString(item.teamName),
    taskSummary: {
      total: asNumber(taskSummary.total),
      todo: asNumber(taskSummary.todo),
      inProgress: asNumber(taskSummary.inProgress),
      inReview: asNumber(taskSummary.inReview),
      done: asNumber(taskSummary.done),
      blocked: asNumber(taskSummary.blocked),
      completionPercent:
        typeof taskSummary.completionPercent === "number" ? taskSummary.completionPercent : null,
    },
    currentSprint: item.currentSprint && typeof item.currentSprint === "object"
      ? (item.currentSprint as ProjectProgressResponse["currentSprint"])
      : null,
    commitSummary: {
      total: asNumber(commitSummary.total),
      linked: asNumber(commitSummary.linked ?? commitSummary.linkedToTasks),
      lastCommitAt: asNullableString(commitSummary.lastCommitAt ?? commitSummary.lastCommittedAt),
    },
    evidenceSummary: {
      workSessions: asNumber(evidenceSummary.workSessions),
      files: asNumber(evidenceSummary.files),
      webLinks: asNumber(evidenceSummary.webLinks),
      confirmations: asNumber(evidenceSummary.confirmations),
    },
    memberProgress: members.map(normalizeMemberSummary),
    sync: {
      jiraStatus: asNullableString(sync.jiraStatus),
      jiraLastSyncedAt: asNullableString(sync.jiraLastSyncedAt),
      githubStatus: asNullableString(sync.githubStatus),
      githubLastSyncedAt: asNullableString(sync.githubLastSyncedAt),
    },
    lastActivityAt: asNullableString(item.lastActivityAt),
  };
}
