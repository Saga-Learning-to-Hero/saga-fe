export type SemesterPeriodStatus = "UPCOMING" | "IN_PROGRESS" | "COMPLETED";

export interface AdminDashboardSemesterItem {
  id: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  active: boolean;
  periodStatus: SemesterPeriodStatus;
}

export interface AdminDashboardSelectedSemester {
  id: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  totalWeeks: number;
  currentWeekIndex: number | null;
  active: boolean;
}

export interface AdminDashboardKpis {
  totalStudents: number;
  studentsGrowthPercentage: number | null;
  comparedSemesterCode: string | null;
  totalCourses: number;
  totalTeams: number;
  connectedTeamsCount: number;
  connectedTeamsRate: number | null;
  totalCommitsSynced: number;
  totalJiraTasksSynced: number;
  traceabilityRate: number | null;
}

export interface AdminDashboardWeeklyPoint {
  weekIndex: number;
  weekLabel: string;
  startDate: string;
  endDate: string;
  isCurrentWeek: boolean;
  commits: number;
  tasksCompleted: number;
  traceabilityRate: number | null;
}

export type AdminDashboardMissingService =
  | "PROJECT"
  | "JIRA"
  | "GITHUB"
  | "BOTH";

export interface AdminDashboardUnconnectedTeam {
  teamId: string;
  teamNo: number;
  teamName: string;
  courseCode: string | null;
  lecturerName: string | null;
  lecturerEmail: string | null;
  missingService: AdminDashboardMissingService;
  createdAt: string;
  daysSinceCreated: number;
}

export type AdminDashboardIntegrationService = "GITHUB" | "JIRA";

export interface AdminDashboardIntegrationPulse {
  service: AdminDashboardIntegrationService;
  uniqueEventsReceived24h: number;
  uniqueEventsReceived7d: number;
  lastUniqueEventAt: string | null;
}

export interface AdminDashboardCacheMetadata {
  cachedAt: string;
  expiresAt: string;
  ttlSecondsRemaining: number | null;
  refreshPending: boolean;
}

export interface AdminDashboardSummaryResponse {
  selectedSemester: AdminDashboardSelectedSemester;
  availableSemesters: AdminDashboardSemesterItem[];
  kpis: AdminDashboardKpis;
  weeklyTimeline: AdminDashboardWeeklyPoint[];
  unconnectedTeamsAlert: AdminDashboardUnconnectedTeam[];
  integrationPulse: AdminDashboardIntegrationPulse[];
  cacheMetadata: AdminDashboardCacheMetadata;
}
