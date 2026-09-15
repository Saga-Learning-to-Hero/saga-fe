export interface LecturerPeerReviewCriterion {
  rubricId: string;
  criteriaName: string;
  description: string | null;
}

export interface LecturerPeerReviewRubric {
  teamId: string | null;
  subjectId: string | null;
  criteria: LecturerPeerReviewCriterion[];
}

export interface LecturerPeerReviewCriterionRating {
  rubricId: string;
  starRating: number;
  criteriaName: string | null;
}

export interface LecturerPeerReviewItem {
  id: string;
  sprintId: string | null;
  sprintName: string | null;
  reviewerId: string;
  reviewerName: string;
  revieweeId: string;
  revieweeName: string;
  starRating: number | null;
  criteriaRatings: LecturerPeerReviewCriterionRating[];
  comment: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface LecturerPeerReviewListResponse {
  teamId: string | null;
  sprintId: string | null;
  sprintName: string | null;
  reviews: LecturerPeerReviewItem[];
}

export interface StarRatingBucket {
  stars: number;
  count: number;
}

export type PeerReviewViewState = "idle" | "loading" | "reviewsError" | "empty" | "partial" | "success";

export type ScorePercentBucketId = "lt50" | "mid" | "good" | "excellent";

export interface ScorePercentBucket {
  id: ScorePercentBucketId;
  label: string;
  tone: string;
  count: number;
  fill: string;
}

export interface ReviewMatrixMember {
  id: string;
  name: string;
}

export interface ReviewMatrixCell {
  reviewerId: string;
  revieweeId: string;
  isSelf: boolean;
  review: LecturerPeerReviewItem | null;
}

export interface PeerReviewKpis {
  submittedCount: number;
  expectedCount: number;
  completionRate: number | null;
  averageScore: number | null;
  maxScore: number;
  membersWithoutReviewCount: number;
  commentedCount: number;
}
