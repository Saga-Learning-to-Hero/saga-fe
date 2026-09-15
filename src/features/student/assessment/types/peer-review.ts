export const PEER_REVIEW_STAR_MIN = 1;
export const PEER_REVIEW_STAR_MAX = 5;
export const PEER_REVIEW_COMMENT_MAX = 4000;

export interface PeerReviewRubricCriterion {
  rubricId: string;
  criteriaName: string;
  description: string | null;
}

export interface PeerReviewRubric {
  teamId: string | null;
  subjectId: string | null;
  criteria: PeerReviewRubricCriterion[];
}

export interface PeerReviewCandidate {
  studentId: string;
  studentCode: string | null;
  fullName: string;
  alreadyReviewed: boolean;
  existingReviewId: string | null;
  existingTotalStarRating: number | null;
}

export interface PeerReviewCandidatesResponse {
  teamId: string | null;
  sprintId: string | null;
  reviewerId: string | null;
  candidates: PeerReviewCandidate[];
}

export interface PeerReviewCriteriaRating {
  rubricId: string;
  starRating: number;
}

export interface SubmitPeerReviewInput {
  revieweeId: string;
  /** Trạng thái chỉ dùng ở frontend để chặn gửi lần hai; không được đưa vào payload API. */
  hasExistingReview: boolean;
  comment?: string | null;
  ratings: Record<string, number>;
  rubricIds: string[];
  allowedRevieweeIds: string[];
  reviewerId?: string | null;
}

export interface SubmitPeerReviewPayload {
  revieweeId: string;
  criteriaRatings: PeerReviewCriteriaRating[];
  comment?: string;
}

export interface SubmitPeerReviewResponse {
  teamId: string | null;
  sprintId: string | null;
  reviewerId: string | null;
  revieweeId: string;
  starRating: number | null;
  criteriaRatings: PeerReviewCriteriaRating[];
  createdAt: string | null;
  updatedAt: string | null;
}
