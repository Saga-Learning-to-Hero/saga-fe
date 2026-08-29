export type MemberStatusTag = "EXCEEDED" | "BALANCED" | "BEHIND" | "GHOSTING_RISK";

export interface ContributionMetrics {
  codeCommits: number;
  linesAdded: number;
  linesDeleted: number;
  tasksDone: number;
  storyPoints: number;
  peerScore: number; // 1..5
  traceabilityRate: number; // %
}

export interface MemberContribution {
  id: string;
  studentCode: string;
  name: string;
  avatar: string;
  role: "LEADER" | "MEMBER";
  contributionPercentage: number; // e.g. 28.5%
  weightedScore: number; // e.g. 9.2 / 10
  statusTag: MemberStatusTag;
  metrics: ContributionMetrics;
}

export interface WeightConfig {
  codeWeight: number; // e.g. 40 (%)
  tasksWeight: number; // e.g. 30 (%)
  peerWeight: number; // e.g. 20 (%)
  traceabilityWeight: number; // e.g. 10 (%)
}
