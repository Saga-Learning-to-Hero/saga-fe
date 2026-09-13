import type { WeeklyCommitBucket } from "@/features/progress/lib/progress-format";

export type { WeeklyCommitBucket };

export interface ProgressTaskBreakdown {
  total: number;
  todo: number;
  inProgress: number;
  inReview: number;
  done: number;
  blocked: number;
  completionPercent: number | null;
}

export interface ProgressCommitBreakdown {
  total: number;
  linked: number;
}
