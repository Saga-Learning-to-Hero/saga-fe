import type { RoleInTeam } from "@/types/auth";

export interface WeeklyActivity {
  week: string; // VD: Tuần 01, Tuần 02...
  commits: number;
  tasksDone: number;
  linesAdded: number;
  linesDeleted: number;
  traceabilityRate: number; // %
}

export interface TaskStatusBreakdown {
  done: number;
  inProgress: number;
  toDo: number;
  blocked: number;
  totalStoryPoints: number;
  completedStoryPoints: number;
}

export interface SkillWorkloadBreakdown {
  category: string; // Frontend, Backend, Database, Testing, Documentation
  storyPoints: number;
  percentage: number;
  color: string;
}

export interface MemberAnalytics {
  id: string;
  studentCode: string;
  name: string;
  fullName?: string;
  role: RoleInTeam;
  avatar?: string;
  email: string;
  tasksStatus: TaskStatusBreakdown;
  weeklyActivities: WeeklyActivity[];
  workloadCategories: SkillWorkloadBreakdown[];
  totalCommits: number;
  commitsCount?: number; // Tương thích ngược
  traceabilityScore: number; // %
  contributionPercentage: number; // %
}

export interface TeamAnalyticsSummary {
  groupId: string;
  groupName: string;
  courseCode: string;
  courseName: string;
  members: MemberAnalytics[];
  teamWeeklyActivities: WeeklyActivity[];
}
