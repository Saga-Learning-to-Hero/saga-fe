export interface HeatmapActor {
  studentId: string;
  studentCode: string | null;
  fullName: string | null;
  avatar: string | null;
}

export interface HeatmapCell {
  date: string;
  commits: number;
  peerReviews: number;
  documents: number;
  tasks: number;
  totalActivities: number;
  actors?: HeatmapActor[];
}

export interface StudentHeatmap {
  studentId: string;
  studentCode: string | null;
  fullName: string | null;
  avatar: string | null;
  commits: number;
  peerReviews: number;
  documents: number;
  tasks: number;
  totalActivities: number;
  cells: HeatmapCell[];
}

export interface HeatmapResponse {
  courseId: string;
  teamId: string;
  studentId: string | null;
  startDate: string;
  endDate: string;
  students: StudentHeatmap[];
  days: HeatmapCell[];
}

export interface GetHeatmapParams {
  startDate: string;
  endDate: string;
  studentId?: string | null;
}

export interface BurndownPoint {
  date: string;
  actualRemaining: number;
  doneCount: number;
}

export interface BurndownChartResponse {
  courseId: string;
  teamId: string;
  sprintId: string;
  sprintName: string | null;
  startDate: string;
  endDate: string;
  totalScope: number;
  points: BurndownPoint[];
}

export type HeatmapDatePreset = "sprint" | "30days" | "semester";
