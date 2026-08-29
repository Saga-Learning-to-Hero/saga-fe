export type SprintStatus = "COMPLETED" | "ACTIVE" | "PLANNED";

export interface SprintItem {
  id: string;
  name: string; // VD: Sprint 1 - Authentication & System Setup
  status: SprintStatus;
  endDate: string;
  goal: string;
}

export interface PeerCriteria {
  id: string;
  label: string;
  description: string;
  iconName: string;
}

export interface PeerReviewMember {
  id: string;
  studentCode: string;
  name: string;
  avatar: string;
  role: "LEADER" | "MEMBER";
  sprintStats: {
    tasksDone: number;
    storyPoints: number;
    commitsCount: number;
  };
}

export interface PeerReviewRecord {
  id: string;
  sprintId: string;
  evaluatorStudentCode: string;
  targetStudentCode: string;
  isCompleted: boolean;
  scores: Record<string, number>; // criteriaId -> 1..5
  comment: string;
  updatedAt?: string;
}
