import type { ProjectSprintResponse } from "@/features/student/sprint-progress/types/jira-task-types";
import type {
  LecturerPeerReviewCriterion,
  LecturerPeerReviewCriterionRating,
  LecturerPeerReviewItem,
  LecturerPeerReviewListResponse,
  LecturerPeerReviewRubric,
  PeerReviewKpis,
  PeerReviewViewState,
  ReviewMatrixCell,
  ReviewMatrixMember,
  ScorePercentBucket,
  ScorePercentBucketId,
} from "../types/lecturer-peer-review";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function asNullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asTime(value?: string | null): number {
  if (!value || !value.trim()) return 0;
  const time = Date.parse(value);
  return Number.isNaN(time) ? 0 : time;
}

export function parseLecturerPeerReviewCriterion(raw: unknown): LecturerPeerReviewCriterion | null {
  const item = asRecord(raw);
  const rubricId = asString(item.rubricId).trim();
  const criteriaName = asString(item.criteriaName).trim();
  if (!rubricId || !criteriaName) return null;
  return {
    rubricId,
    criteriaName,
    description: asNullableString(item.description),
  };
}

export function parseLecturerPeerReviewRubric(raw: unknown): LecturerPeerReviewRubric {
  const item = asRecord(raw);
  const rows = Array.isArray(item.criteria) ? item.criteria : [];
  return {
    teamId: asNullableString(item.teamId),
    subjectId: asNullableString(item.subjectId),
    criteria: rows
      .map(parseLecturerPeerReviewCriterion)
      .filter((row): row is LecturerPeerReviewCriterion => Boolean(row)),
  };
}

function parseCriterionRating(raw: unknown): LecturerPeerReviewCriterionRating | null {
  const item = asRecord(raw);
  const rubricId = asString(item.rubricId).trim();
  const starRating = asNullableNumber(item.starRating);
  if (!rubricId || starRating === null) return null;
  return {
    rubricId,
    starRating,
    criteriaName: asNullableString(item.criteriaName),
  };
}

export function parseLecturerPeerReviewItem(raw: unknown): LecturerPeerReviewItem | null {
  const item = asRecord(raw);
  const id = asString(item.id).trim();
  const reviewerId = asString(item.reviewerId).trim();
  const revieweeId = asString(item.revieweeId).trim();
  if (!id || !reviewerId || !revieweeId) return null;
  const ratingsRaw = Array.isArray(item.criteriaRatings) ? item.criteriaRatings : [];
  return {
    id,
    sprintId: asNullableString(item.sprintId),
    sprintName: asNullableString(item.sprintName),
    reviewerId,
    reviewerName: asString(item.reviewerName, reviewerId),
    revieweeId,
    revieweeName: asString(item.revieweeName, revieweeId),
    starRating: asNullableNumber(item.starRating),
    criteriaRatings: ratingsRaw
      .map(parseCriterionRating)
      .filter((row): row is LecturerPeerReviewCriterionRating => Boolean(row)),
    comment: asNullableString(item.comment),
    createdAt: asNullableString(item.createdAt),
    updatedAt: asNullableString(item.updatedAt),
  };
}

export function parseLecturerPeerReviewList(raw: unknown): LecturerPeerReviewListResponse {
  const item = asRecord(raw);
  const rows = Array.isArray(item.reviews) ? item.reviews : [];
  return {
    teamId: asNullableString(item.teamId),
    sprintId: asNullableString(item.sprintId),
    sprintName: asNullableString(item.sprintName),
    reviews: rows.map(parseLecturerPeerReviewItem).filter((row): row is LecturerPeerReviewItem => Boolean(row)),
  };
}

export function joinReviewCriteria(
  reviews: LecturerPeerReviewItem[],
  rubric?: LecturerPeerReviewRubric | null
): LecturerPeerReviewItem[] {
  const names = new Map((rubric?.criteria || []).map((criterion) => [criterion.rubricId, criterion.criteriaName]));
  return reviews.map((review) => ({
    ...review,
    criteriaRatings: review.criteriaRatings.map((rating) => ({
      ...rating,
      criteriaName: rating.criteriaName?.trim() || names.get(rating.rubricId) || null,
    })),
  }));
}

export const CRITERION_STAR_MAX = 5;
export const LONG_COMMENT_CHARS = 80;

export const SCORE_PERCENT_BUCKETS: Array<
  Omit<ScorePercentBucket, "count"> & { min: number; maxExclusive: number }
> = [
  { id: "lt50", label: "<50%", tone: "Thấp", fill: "var(--destructive)", min: 0, maxExclusive: 50 },
  { id: "mid", label: "50–69%", tone: "Cần chú ý", fill: "var(--chart-4)", min: 50, maxExclusive: 70 },
  { id: "good", label: "70–84%", tone: "Tốt", fill: "var(--chart-2)", min: 70, maxExclusive: 85 },
  { id: "excellent", label: "85–100%", tone: "Rất tốt", fill: "var(--chart-3)", min: 85, maxExclusive: 101 },
];

export function resolveCriteriaColumns(
  rubric: LecturerPeerReviewRubric | null | undefined,
  reviews: LecturerPeerReviewItem[]
): LecturerPeerReviewCriterion[] {
  if (rubric?.criteria?.length) return rubric.criteria;
  const seen = new Map<string, LecturerPeerReviewCriterion>();
  for (const review of reviews) {
    for (const rating of review.criteriaRatings) {
      if (seen.has(rating.rubricId)) continue;
      seen.set(rating.rubricId, {
        rubricId: rating.rubricId,
        criteriaName: rating.criteriaName?.trim() || "Tiêu chí",
        description: null,
      });
    }
  }
  return [...seen.values()];
}

export function getPeerReviewMaxScore(criteriaCount: number): number {
  if (!Number.isFinite(criteriaCount) || criteriaCount <= 0) return 0;
  return criteriaCount * CRITERION_STAR_MAX;
}

export function formatScoreOutOfMax(score: number | null, maxScore: number): string {
  if (score === null || !Number.isFinite(score) || maxScore <= 0) return "—";
  const text = score.toLocaleString("vi-VN", { maximumFractionDigits: 1, minimumFractionDigits: 0 });
  return `${text}/${maxScore}`;
}

export function formatSprintState(state?: string | null): string {
  const key = (state || "").trim().toLowerCase();
  if (key === "closed") return "Đã kết thúc";
  if (key === "active") return "Đang diễn ra";
  if (key === "future") return "Sắp diễn ra";
  return state?.trim() ? state.trim() : "Không rõ";
}

export function formatTeamOptionLabel(teamNo: number, teamName?: string | null): string {
  const name = teamName?.trim();
  return name ? `Nhóm ${teamNo} — ${name}` : `Nhóm ${teamNo}`;
}

export function resolvePeerReviewViewState(input: {
  canLoad: boolean;
  hasReviewsData: boolean;
  reviewsError: boolean;
  reviewsEmpty: boolean;
  rubricError: boolean;
}): PeerReviewViewState {
  if (!input.canLoad) return "idle";
  if (!input.hasReviewsData && input.reviewsError) return "reviewsError";
  if (!input.hasReviewsData) return "loading";
  if (input.reviewsEmpty) return "empty";
  if (input.rubricError) return "partial";
  return "success";
}

export function scorePercent(score: number | null, maxScore: number): number | null {
  if (score === null || !Number.isFinite(score) || maxScore <= 0) return null;
  return (score / maxScore) * 100;
}

export function buildScorePercentDistribution(
  reviews: LecturerPeerReviewItem[],
  maxScore: number
): ScorePercentBucket[] {
  const counts: Record<ScorePercentBucketId, number> = {
    lt50: 0,
    mid: 0,
    good: 0,
    excellent: 0,
  };
  for (const review of reviews) {
    const percent = scorePercent(review.starRating, maxScore);
    if (percent === null) continue;
    const bucket = SCORE_PERCENT_BUCKETS.find((item) => percent >= item.min && percent < item.maxExclusive);
    if (bucket) counts[bucket.id] += 1;
  }
  return SCORE_PERCENT_BUCKETS.map((bucket) => ({
    id: bucket.id,
    label: bucket.label,
    tone: bucket.tone,
    fill: bucket.fill,
    count: counts[bucket.id],
  }));
}

export function resolveMatrixMembers(
  teamMembers: Array<{ studentProfileId: string; fullName: string }>,
  reviews: LecturerPeerReviewItem[]
): ReviewMatrixMember[] {
  const byId = new Map<string, ReviewMatrixMember>();
  for (const member of teamMembers) {
    const id = member.studentProfileId.trim();
    if (!id) continue;
    byId.set(id, { id, name: member.fullName.trim() || id });
  }
  for (const review of reviews) {
    if (!byId.has(review.reviewerId)) {
      byId.set(review.reviewerId, { id: review.reviewerId, name: review.reviewerName });
    }
    if (!byId.has(review.revieweeId)) {
      byId.set(review.revieweeId, { id: review.revieweeId, name: review.revieweeName });
    }
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, "vi"));
}

export function buildReviewMatrix(
  members: ReviewMatrixMember[],
  reviews: LecturerPeerReviewItem[]
): ReviewMatrixCell[] {
  const latest = new Map<string, LecturerPeerReviewItem>();
  for (const review of reviews) {
    latest.set(`${review.reviewerId}:${review.revieweeId}`, review);
  }
  const cells: ReviewMatrixCell[] = [];
  for (const reviewer of members) {
    for (const reviewee of members) {
      const isSelf = reviewer.id === reviewee.id;
      cells.push({
        reviewerId: reviewer.id,
        revieweeId: reviewee.id,
        isSelf,
        review: isSelf ? null : latest.get(`${reviewer.id}:${reviewee.id}`) || null,
      });
    }
  }
  return cells;
}

export function buildPeerReviewKpis(
  members: ReviewMatrixMember[],
  reviews: LecturerPeerReviewItem[],
  maxScore: number
): PeerReviewKpis {
  const size = members.length;
  const expectedCount = size > 1 ? size * (size - 1) : 0;
  const submittedCount = reviews.length;
  const reviewerIds = new Set(reviews.map((item) => item.reviewerId));
  const membersWithoutReviewCount = members.filter((member) => !reviewerIds.has(member.id)).length;
  const scored = reviews.filter((item) => item.starRating !== null);
  const averageScore =
    scored.length > 0
      ? scored.reduce((sum, item) => sum + (item.starRating || 0), 0) / scored.length
      : null;
  return {
    submittedCount,
    expectedCount,
    completionRate: expectedCount > 0 ? (submittedCount / expectedCount) * 100 : null,
    averageScore,
    maxScore,
    membersWithoutReviewCount,
    commentedCount: reviewsWithComments(reviews).length,
  };
}

export function isLongComment(comment?: string | null): boolean {
  const text = comment?.trim() || "";
  if (!text) return false;
  return text.length > LONG_COMMENT_CHARS || text.includes("\n");
}

export function pickDefaultLecturerPeerReviewSprintId(sprints: ProjectSprintResponse[]): string | null {
  if (sprints.length === 0) return null;
  const closed = sprints.filter((sprint) => (sprint.state || "").trim().toLowerCase() === "closed");
  if (closed.length > 0) {
    return [...closed].sort((a, b) => {
      return (asTime(b.completeDate) || asTime(b.endDate)) - (asTime(a.completeDate) || asTime(a.endDate));
    })[0]?.id || null;
  }
  const active = sprints.filter((sprint) => (sprint.state || "").trim().toLowerCase() === "active");
  if (active.length > 0) return active[0]?.id || null;
  return sprints[0]?.id || null;
}

export function reviewsWithComments(reviews: LecturerPeerReviewItem[]): LecturerPeerReviewItem[] {
  return reviews.filter((review) => Boolean(review.comment?.trim()));
}

export function formatPeerReviewDateTime(value?: string | null): string {
  if (!value) return "—";
  const time = Date.parse(value);
  if (Number.isNaN(time)) return value;
  return new Date(time).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
