export interface DashboardKPIs {
  totalStudents: number;
  studentsGrowth: number;
  totalGroups: number;
  connectedGroupsRate: number; // % nhóm đã kết nối Jira + GitHub
  traceabilityRate: number; // % commits map thành công với Jira Tasks
  totalCommitsSynced: number;
  totalJiraTasksSynced: number;
  webhookEvents24h: number;
}

export interface IntegrationServiceStatus {
  service: "GITHUB" | "JIRA";
  name: string;
  status: "OPERATIONAL" | "DEGRADED" | "DOWN";
  latencyMs: number;
  eventsProcessed24h: number;
  successRate: number;
  lastPing: string;
}

export interface UnconnectedGroupAlert {
  id: string;
  groupCode: string;
  projectName: string;
  mentorName: string;
  courseCode: string;
  missingService: "BOTH" | "JIRA" | "GITHUB";
  createdAt: string;
}

export interface AdminDashboardData {
  semesterCode: string;
  semesterName: string;
  kpis: DashboardKPIs;
  integrations: IntegrationServiceStatus[];
  unconnectedGroups: UnconnectedGroupAlert[];
}