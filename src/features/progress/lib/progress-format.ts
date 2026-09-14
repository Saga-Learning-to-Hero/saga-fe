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

export interface SprintDueInfo {
  label: string;
  diffDays: number | null;
  urgency: "none" | "normal" | "warning" | "overdue";
}

export interface LatestSyncInfo {
  latestSyncAt: string | null;
  relativeTime: string;
  isStaleOrMissing: boolean;
  jiraStatus: string | null;
  githubStatus: string | null;
  isJiraActive: boolean;
  isGitHubActive: boolean;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function formatCompletionPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return NO_TASK_DATA_LABEL;
  }
  return `${Math.round(value)}%`;
}

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

export function formatRelativeTime(
  isoDate?: string | null,
  referenceDate?: Date
): string {
  if (!isoDate) return "—";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "—";

  const base = referenceDate ?? new Date();
  const diffMs = base.getTime() - date.getTime();

  if (diffMs < 0) {
    return "vừa xong";
  }

  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  if (diffMinutes < 1) return "vừa xong";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} ngày trước`;

  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

export function formatSprintDue(
  endDateStr?: string | null,
  referenceDate?: Date
): SprintDueInfo {
  if (!endDateStr) {
    return { label: "Chưa có hạn", diffDays: null, urgency: "none" };
  }

  const targetDate = new Date(endDateStr);
  if (Number.isNaN(targetDate.getTime())) {
    return { label: "Chưa có hạn", diffDays: null, urgency: "none" };
  }

  const base = referenceDate ?? new Date();
  const targetMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const baseMidnight = new Date(base.getFullYear(), base.getMonth(), base.getDate());

  const diffDays = Math.round((targetMidnight.getTime() - baseMidnight.getTime()) / MS_PER_DAY);

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      label: `Quá hạn ${overdueDays} ngày`,
      diffDays,
      urgency: "overdue",
    };
  }

  if (diffDays === 0) {
    return {
      label: "Hết hạn hôm nay",
      diffDays: 0,
      urgency: "warning",
    };
  }

  if (diffDays <= 2) {
    return {
      label: `Còn ${diffDays} ngày`,
      diffDays,
      urgency: "warning",
    };
  }

  return {
    label: `Còn ${diffDays} ngày`,
    diffDays,
    urgency: "normal",
  };
}

export function getLatestSyncInfo(
  sync?: ProjectProgressResponse["sync"] | null,
  options?: { referenceDate?: Date; staleThresholdHours?: number }
): LatestSyncInfo {
  const reference = options?.referenceDate ?? new Date();
  const staleHours = options?.staleThresholdHours ?? 24;

  const jiraStatus = sync?.jiraStatus ?? null;
  const githubStatus = sync?.githubStatus ?? null;

  const isJiraActive = (jiraStatus || "").trim().toUpperCase() === "ACTIVE";
  const isGitHubActive = (githubStatus || "").trim().toUpperCase() === "ACTIVE";

  const syncRecord = sync as Record<string, unknown> | undefined;
  const jiraDateStr = (sync?.jiraLastSyncedAt ?? syncRecord?.jiraLastSyncAt) as string | null | undefined;
  const githubDateStr = (sync?.githubLastSyncedAt ?? syncRecord?.githubLastSyncAt) as string | null | undefined;

  const jiraTime = jiraDateStr ? new Date(jiraDateStr).getTime() : Number.NaN;
  const githubTime = githubDateStr ? new Date(githubDateStr).getTime() : Number.NaN;

  let latestSyncAt: string | null = null;
  let latestTime = 0;

  if (!Number.isNaN(jiraTime) && !Number.isNaN(githubTime)) {
    if (jiraTime >= githubTime) {
      latestSyncAt = jiraDateStr ?? null;
      latestTime = jiraTime;
    } else {
      latestSyncAt = githubDateStr ?? null;
      latestTime = githubTime;
    }
  } else if (!Number.isNaN(jiraTime)) {
    latestSyncAt = jiraDateStr ?? null;
    latestTime = jiraTime;
  } else if (!Number.isNaN(githubTime)) {
    latestSyncAt = githubDateStr ?? null;
    latestTime = githubTime;
  }

  const relativeTime = latestSyncAt ? formatRelativeTime(latestSyncAt, reference) : "Chưa có dữ liệu";
  const isOld = latestTime > 0 ? (reference.getTime() - latestTime) > staleHours * 60 * 60 * 1000 : true;
  const isStaleOrMissing = !isJiraActive || !isGitHubActive || isOld;

  return {
    latestSyncAt,
    relativeTime,
    isStaleOrMissing,
    jiraStatus,
    githubStatus,
    isJiraActive,
    isGitHubActive,
  };
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
      jiraLastSyncedAt: asNullableString(sync.jiraLastSyncedAt ?? sync.jiraLastSyncAt),
      githubStatus: asNullableString(sync.githubStatus),
      githubLastSyncedAt: asNullableString(sync.githubLastSyncedAt ?? sync.githubLastSyncAt),
    },
    lastActivityAt: asNullableString(item.lastActivityAt),
  };
}
