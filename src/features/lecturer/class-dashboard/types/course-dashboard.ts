import type { LecturerCourse } from "../../courses/types/course";

export type IntegrationStatus = "CONNECTED" | "PARTIAL" | "DISCONNECTED" | "ERROR";

export interface IntegrationHealth {
  jira: {
    connectedGroups: number;
    totalGroups: number;
    percentage: number;
    status: IntegrationStatus;
    lastSync: string;
    unconnectedGroups: string[]; // e.g. ["Nhóm 05"]
  };
  github: {
    connectedGroups: number;
    totalGroups: number;
    percentage: number;
    status: IntegrationStatus;
    lastSync: string;
    unconnectedGroups: string[];
  };
}

export type GroupHealthStatus = "HEALTHY" | "WARNING" | "CRITICAL";

export interface GroupHealth {
  id: string;
  name: string;
  projectName: string;
  memberCount: number;
  currentSprint: string;
  tasksCompleted: number;
  totalTasks: number;
  commitsLast7Days: number;
  contributionBalance: number; // percentage, e.g. 92% balanced
  status: GroupHealthStatus;
  weeklyCommits: number[];
  metrics: {
    taskCompletion: number;
    codeActivity: number;
    participation: number;
    contributionBalance: number;
    onTimeDelivery: number;
  };
}

export interface WeeklyProgress {
  week: string; // e.g., "Tuần 7"
  taskCompletion: number; // actual % completion
  expectedProgress: number; // expected % completion
  commitCount: number; // actual commit count
}

export type AlertSeverity = "CRITICAL" | "WARNING" | "INFO";

export interface DashboardAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  reason: string;
  timeAgo: string;
  actionLabel: string;
  actionUrl: string;
}

export type ActivitySource = "JIRA" | "GITHUB" | "SAGA";

export interface RecentActivity {
  id: string;
  source: ActivitySource;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  url?: string;
}

export interface DashboardSummary {
  studentCount: number;
  activeStudentCount: number;
  groupCount: number;
  healthyGroupCount: number;
  semesterProgress: number; // percentage
  currentWeek: string;
  alertCount: number;
}

export interface CourseDashboardData {
  course: LecturerCourse;
  summary: DashboardSummary;
  weeklyProgress: WeeklyProgress[];
  groups: GroupHealth[];
  integrations: IntegrationHealth;
  alerts: DashboardAlert[];
  recentActivities: RecentActivity[];
}
