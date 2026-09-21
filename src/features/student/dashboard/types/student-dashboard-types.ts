export interface StudentDashboardStudent {
  studentId: string;
  userId: string;
  studentCode: string;
  fullName: string;
  avatarUrl?: string | null;
  teamRole: "LEADER" | "MEMBER" | string;
}

export interface StudentDashboardCourse {
  courseId: string;
  courseCode: string;
  subjectCode: string;
  subjectName: string;
  semesterCode: string;
}

export interface StudentDashboardTeam {
  teamId: string;
  teamNo: number;
  teamName: string;
  projectId: string | null;
  projectName?: string | null;
  membersCount: number;
}

export interface StudentDashboardJiraIntegration {
  connected: boolean;
  projectKey?: string | null;
  status?: string | null;
  lastSyncedAt?: string | null;
}

export interface StudentDashboardGithubIntegration {
  connected: boolean;
  repositoryCount?: number;
  status?: string | null;
  lastSyncedAt?: string | null;
}

export interface StudentDashboardIntegrations {
  jira?: StudentDashboardJiraIntegration | null;
  github?: StudentDashboardGithubIntegration | null;
}

export interface StudentDashboardCurrentSprint {
  id: string;
  externalSprintId?: string | null;
  name: string;
  state: "ACTIVE" | "FUTURE" | "CLOSED" | string;
  startDate?: string | null;
  endDate?: string | null;
  totalTasks: number;
  completedTasks: number;
  completionPercent?: number | null;
}

export interface StudentDashboardTaskMetrics {
  totalAssigned: number;
  todo: number;
  inProgress: number;
  inReview: number;
  done: number;
  blocked: number;
  completionPercent?: number | null;
  totalStoryPoints?: number;
  completedStoryPoints?: number;
}

export interface StudentDashboardCommitMetrics {
  totalCommits: number;
  linkedCommits: number;
  unlinkedCommits: number;
  traceabilityPercent?: number | null;
  lastCommittedAt?: string | null;
}

export interface StudentDashboardMetrics {
  tasks: StudentDashboardTaskMetrics;
  commits: StudentDashboardCommitMetrics;
}

export interface StudentDashboardActiveTask {
  id: string;
  externalKey: string;
  title: string;
  status: string;
  priority?: string | null;
  storyPoints?: number | null;
  dueDate?: string | null;
  linkedCommitCount: number;
  evidenceCommitCount?: number;
  hasAnomaly?: boolean;
}

export interface StudentDashboardRecentCommit {
  sha: string;
  shortSha: string;
  message: string;
  repositoryName: string;
  committedAt: string;
  linkedTaskKeys?: string[];
}

export interface StudentDashboardWeeklyCommit {
  startDate: string;
  endDate: string;
  commits: number;
}

export interface StudentDashboardAlertTargetIds {
  courseId?: string | null;
  teamId?: string | null;
  projectId?: string | null;
  taskId?: string | null;
  sprintId?: string | null;
}

export interface StudentDashboardActionableAlert {
  id: string;
  type: "MSR_ANOMALY" | "PEER_REVIEW_PENDING" | "GHOSTING_WARNING" | string;
  severity: "CRITICAL" | "WARNING" | "INFO" | string;
  title: string;
  message: string;
  actionType?: string | null;
  targetIds?: StudentDashboardAlertTargetIds | null;
  remainingPeers?: number | null;
}

export interface StudentDashboardResponse {
  student: StudentDashboardStudent;
  course: StudentDashboardCourse;
  team: StudentDashboardTeam | null;
  integrations?: StudentDashboardIntegrations | null;
  currentSprint?: StudentDashboardCurrentSprint | null;
  myMetrics: StudentDashboardMetrics;
  myActiveTasks: StudentDashboardActiveTask[];
  recentCommits: StudentDashboardRecentCommit[];
  weeklyCommits: StudentDashboardWeeklyCommit[];
  actionableAlerts: StudentDashboardActionableAlert[];
}
