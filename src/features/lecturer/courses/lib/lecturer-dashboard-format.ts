import type {
  LecturerDashboardActivityPoint,
  LecturerDashboardRiskLevel,
  LecturerDashboardRiskPolicy,
  LecturerDashboardRiskReason,
  LecturerDashboardSummary,
  LecturerDashboardTaskStatusTotals,
  LecturerDashboardTeam,
} from "../types/lecturer-course-dashboard";

export const ATTENTION_RISK_LEVELS: readonly LecturerDashboardRiskLevel[] = [
  "WARNING",
  "CRITICAL",
  "UNKNOWN",
];

export const RISK_REASON_LABELS: Record<string, string> = {
  NO_PROJECT: "Chưa có dự án",
  NO_ACTIVE_SPRINT: "Chưa có sprint đang chạy",
  INACTIVE: "Không hoạt động",
  DATA_UNAVAILABLE: "Thiếu dữ liệu hoạt động",
  SCHEDULE_LAG: "Trễ lịch",
  BLOCKED_TASKS: "Có công việc bị chặn",
  OVERDUE_TASKS: "Có công việc quá hạn",
  MISSING_TASK_COMMIT_LINK: "Công việc hoàn thành chưa gắn commit",
  JIRA_SYNC_FAILED: "Đồng bộ Jira thất bại",
  GITHUB_SYNC_FAILED: "Đồng bộ GitHub thất bại",
  CONTRIBUTION_CONFIG_MISSING: "Chưa cấu hình trọng số nhóm",
  PEER_REVIEW_INCOMPLETE: "Đánh giá chéo chưa đủ",
};

export const RISK_LEVEL_LABELS: Record<LecturerDashboardRiskLevel, string> = {
  HEALTHY: "Ổn định",
  WARNING: "Cần chú ý",
  CRITICAL: "Nghiêm trọng",
  UNKNOWN: "Thiếu dữ liệu",
};

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const DATE_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
});

const NUMBER_FORMATTER = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 2,
});

export function isAttentionRiskLevel(level: LecturerDashboardRiskLevel | undefined): boolean {
  return level === "WARNING" || level === "CRITICAL" || level === "UNKNOWN";
}

export function filterAttentionTeams(teams: LecturerDashboardTeam[]): LecturerDashboardTeam[] {
  return teams.filter((team) => isAttentionRiskLevel(team.risk?.level));
}

const RISK_PRIORITY: Record<LecturerDashboardRiskLevel, number> = {
  CRITICAL: 0,
  WARNING: 1,
  UNKNOWN: 2,
  HEALTHY: 3,
};

const RISK_REASON_PRIORITY: Record<string, number> = {
  JIRA_SYNC_FAILED: 0,
  GITHUB_SYNC_FAILED: 0,
  BLOCKED_TASKS: 1,
  OVERDUE_TASKS: 2,
  SCHEDULE_LAG: 3,
  INACTIVE: 4,
  MISSING_TASK_COMMIT_LINK: 5,
  PEER_REVIEW_INCOMPLETE: 6,
  CONTRIBUTION_CONFIG_MISSING: 7,
  NO_ACTIVE_SPRINT: 8,
  NO_PROJECT: 9,
  DATA_UNAVAILABLE: 10,
};

export function sortDashboardTeamsByRisk(
  teams: LecturerDashboardTeam[]
): LecturerDashboardTeam[] {
  return [...teams].sort((left, right) => {
    const riskDifference = RISK_PRIORITY[left.risk.level] - RISK_PRIORITY[right.risk.level];
    return riskDifference !== 0 ? riskDifference : left.teamNo - right.teamNo;
  });
}

export function filterDashboardTeamsByScope(
  teams: LecturerDashboardTeam[],
  teamId: string,
  sprintId: string
): LecturerDashboardTeam[] {
  return teams.filter((team) => {
    const matchesTeam = teamId === "all" || team.teamId === teamId;
    const matchesSprint = sprintId === "all" || team.currentSprint?.sprintId === sprintId;
    return matchesTeam && matchesSprint;
  });
}

export function sortDashboardRiskReasons(
  reasons: LecturerDashboardRiskReason[] | undefined
): LecturerDashboardRiskReason[] {
  if (!Array.isArray(reasons)) return [];
  return [...reasons].sort((left, right) => {
    const leftPriority = RISK_REASON_PRIORITY[left.code] ?? Number.MAX_SAFE_INTEGER;
    const rightPriority = RISK_REASON_PRIORITY[right.code] ?? Number.MAX_SAFE_INTEGER;
    return leftPriority - rightPriority;
  });
}

export function canOpenDashboardProject(projectId: string | null | undefined): boolean {
  return typeof projectId === "string" && projectId.trim().length > 0;
}

export function getAtRiskTeamCount(summary: LecturerDashboardSummary): number {
  return summary.warningTeams + summary.criticalTeams + summary.unknownTeams;
}

export function formatNullablePercent(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return `${NUMBER_FORMATTER.format(value)}%`;
}

export function formatSignedDelta(value: number | null | undefined, suffix = ""): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  const formatted = NUMBER_FORMATTER.format(Math.abs(value));
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${formatted}${suffix}`;
}

export function formatDashboardGeneratedAt(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return DATE_TIME_FORMATTER.format(date);
}

export function formatDashboardInstant(value: string | null | undefined, emptyLabel: string): string {
  if (!value) return emptyLabel;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return emptyLabel;
  return DATE_TIME_FORMATTER.format(date);
}

export function formatSeriesDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : DATE_FORMATTER.format(date);
}

export function formatRiskReasonLabel(code: string): string {
  return RISK_REASON_LABELS[code] ?? code;
}

function formatReasonUnit(unit: string): string {
  switch (unit) {
    case "DAY":
      return "ngày";
    case "PERCENTAGE_POINT":
      return "điểm %";
    case "TASK":
      return "công việc";
    case "REVIEW":
      return "đánh giá";
    case "COUNT":
      return "";
    default:
      return unit.toLowerCase();
  }
}

export function formatRiskReasonValue(value: number | null, unit: string): string | null {
  if (value === null || !Number.isFinite(value)) return null;
  const unitLabel = formatReasonUnit(unit);
  const formatted = NUMBER_FORMATTER.format(value);
  return unitLabel ? `${formatted} ${unitLabel}` : formatted;
}

export function formatRiskReason(reason: LecturerDashboardRiskReason): string {
  const label = formatRiskReasonLabel(reason.code);
  const actual = formatRiskReasonValue(reason.actualValue, reason.unit);
  const threshold = formatRiskReasonValue(reason.thresholdValue, reason.unit);
  if (actual && threshold) {
    return `${label} (${actual} / ngưỡng ${threshold})`;
  }
  if (actual) return `${label} (${actual})`;
  return label;
}

export function formatRiskPolicyLegend(policy: LecturerDashboardRiskPolicy): string[] {
  return [
    `Không hoạt động: cảnh báo ${policy.inactivityWarningDays} ngày, nghiêm trọng ${policy.inactivityCriticalDays} ngày`,
    `Trễ lịch: cảnh báo ${policy.scheduleLagWarningPercentagePoints} điểm %, nghiêm trọng ${policy.scheduleLagCriticalPercentagePoints} điểm %`,
    `Đánh giá chéo chưa đủ: cảnh báo khi đã qua ${policy.peerReviewWarningElapsedPercent}% thời gian sprint`,
  ];
}

export function formatChannelStatus(status: string | null | undefined): string {
  if (status == null) return "Chưa kết nối";
  switch (status) {
    case "ACTIVE":
      return "Đang kết nối";
    case "DEGRADED":
      return "Suy giảm";
    case "REVOKED":
      return "Đã thu hồi";
    default:
      return status;
  }
}

export function formatSyncJobStatus(status: string | null | undefined): string | null {
  if (status == null) return null;
  switch (status) {
    case "RUNNING":
      return "Đang đồng bộ";
    case "SUCCEEDED":
      return "Đồng bộ thành công";
    case "FAILED":
      return "Đồng bộ thất bại";
    default:
      return status;
  }
}

export function formatContributionMode(mode: string, configured: boolean): string {
  if (mode === "PROJECT_GROUP") {
    return configured ? "Trọng số theo nhóm (đã cấu hình)" : "Trọng số theo nhóm (chưa cấu hình)";
  }
  return "Trọng số theo lớp";
}

export interface DashboardNamedCount {
  key: string;
  name: string;
  value: number;
}

export function buildTaskStatusChartData(
  totals: LecturerDashboardTaskStatusTotals
): DashboardNamedCount[] {
  return [
    { key: "todo", name: "Cần làm", value: totals.todo },
    { key: "inProgress", name: "Đang làm", value: totals.inProgress },
    { key: "inReview", name: "Đang duyệt", value: totals.inReview },
    { key: "done", name: "Hoàn thành", value: totals.done },
    { key: "blocked", name: "Bị chặn", value: totals.blocked },
  ];
}

export function buildTaskStatusTotalsFromTeams(
  teams: LecturerDashboardTeam[]
): LecturerDashboardTaskStatusTotals {
  const totals = teams.reduce(
    (result, team) => {
      if (!team.progress) return result;
      result.total += team.progress.totalTasks;
      result.todo += team.progress.todo;
      result.inProgress += team.progress.inProgress;
      result.inReview += team.progress.inReview;
      result.done += team.progress.done;
      result.blocked += team.progress.blocked;
      result.overdue += team.progress.overdue;
      return result;
    },
    {
      total: 0,
      todo: 0,
      inProgress: 0,
      inReview: 0,
      done: 0,
      blocked: 0,
      overdue: 0,
      completionPercent: null as number | null,
    }
  );

  totals.completionPercent = totals.total > 0
    ? Number(((totals.done / totals.total) * 100).toFixed(2))
    : null;
  return totals;
}

export function buildRiskDistributionChartData(summary: LecturerDashboardSummary): DashboardNamedCount[] {
  return [
    { key: "HEALTHY", name: RISK_LEVEL_LABELS.HEALTHY, value: summary.healthyTeams },
    { key: "WARNING", name: RISK_LEVEL_LABELS.WARNING, value: summary.warningTeams },
    { key: "CRITICAL", name: RISK_LEVEL_LABELS.CRITICAL, value: summary.criticalTeams },
    { key: "UNKNOWN", name: RISK_LEVEL_LABELS.UNKNOWN, value: summary.unknownTeams },
  ];
}

export interface DashboardPeerReviewBar {
  teamId: string;
  name: string;
  projectName: string | null;
  sprintName: string | null;
  completionRate: number;
  submittedReviews: number;
  expectedReviews: number;
  pendingStudentCount: number;
}

export function buildPeerReviewChartData(teams: LecturerDashboardTeam[]): DashboardPeerReviewBar[] {
  return teams.flatMap((team) => {
    const peer = team.peerReview;
    if (!peer || peer.completionRate === null || !Number.isFinite(peer.completionRate)) {
      return [];
    }
    return [
      {
        teamId: team.teamId,
        name: team.teamName || `Nhóm ${team.teamNo}`,
        projectName: team.projectName,
        sprintName: team.currentSprint?.sprintName ?? null,
        completionRate: peer.completionRate,
        submittedReviews: peer.submittedReviews,
        expectedReviews: peer.expectedReviews,
        pendingStudentCount: peer.pendingStudentCount,
      },
    ];
  });
}

export function getActivitySeriesTotals(series: LecturerDashboardActivityPoint[] | undefined): number[] {
  if (!Array.isArray(series)) return [];
  return series.map((point) => point.totalActivities);
}

export function hasCurrentSprintActivitySeries(team: LecturerDashboardTeam): boolean {
  return Boolean(team.currentSprint && team.activity && team.activity.series.length > 0);
}

export interface DashboardActivityHeatmapRow {
  teamId: string;
  teamName: string;
  projectName: string | null;
  sprintName: string | null;
  pointsByDate: Map<string, LecturerDashboardActivityPoint>;
}

export interface DashboardActivityHeatmapData {
  dates: string[];
  rows: DashboardActivityHeatmapRow[];
  maxActivity: number;
}

export function buildActivityHeatmapData(
  teams: LecturerDashboardTeam[]
): DashboardActivityHeatmapData {
  const dates = new Set<string>();
  let maxActivity = 0;

  const rows = teams.flatMap((team) => {
    if (!hasCurrentSprintActivitySeries(team) || !team.activity) return [];

    const pointsByDate = new Map<string, LecturerDashboardActivityPoint>();
    team.activity.series.forEach((point) => {
      dates.add(point.date);
      pointsByDate.set(point.date, point);
      maxActivity = Math.max(maxActivity, point.totalActivities);
    });

    return [{
      teamId: team.teamId,
      teamName: team.teamName || `Nhóm ${team.teamNo}`,
      projectName: team.projectName,
      sprintName: team.currentSprint?.sprintName ?? null,
      pointsByDate,
    }];
  });

  return {
    dates: [...dates].sort((left, right) => left.localeCompare(right)),
    rows,
    maxActivity,
  };
}

export function getActivityIntensityLevel(
  value: number,
  maxValue: number
): 0 | 1 | 2 | 3 | 4 {
  if (value <= 0 || maxValue <= 0) return 0;
  const ratio = value / maxValue;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}
