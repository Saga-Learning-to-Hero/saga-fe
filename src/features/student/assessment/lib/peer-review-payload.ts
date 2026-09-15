import {
  PEER_REVIEW_COMMENT_MAX,
  PEER_REVIEW_STAR_MAX,
  PEER_REVIEW_STAR_MIN,
  type PeerReviewCandidate,
  type PeerReviewCandidatesResponse,
  type PeerReviewCriteriaRating,
  type PeerReviewRubric,
  type PeerReviewRubricCriterion,
  type SubmitPeerReviewInput,
  type SubmitPeerReviewPayload,
  type SubmitPeerReviewResponse,
} from "../types/peer-review";

const FORBIDDEN_SUBMIT_FIELDS = [
  "reviewerId",
  "existingReviewId",
  "totalStarRating",
  "revieweeStudentId",
  "criterionId",
  "alreadyReviewed",
  "alreadySubmitted",
  "submittedAt",
] as const;

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

export function parseRubricCriterion(raw: unknown): PeerReviewRubricCriterion | null {
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

export function parsePeerReviewRubric(raw: unknown): PeerReviewRubric {
  const item = asRecord(raw);
  const criteriaRaw = Array.isArray(item.criteria) ? item.criteria : [];
  // Giữ nguyên thứ tự mảng Backend, không sort theo field không tồn tại.
  const criteria = criteriaRaw
    .map(parseRubricCriterion)
    .filter((criterion): criterion is PeerReviewRubricCriterion => Boolean(criterion));
  return {
    teamId: asNullableString(item.teamId),
    subjectId: asNullableString(item.subjectId),
    criteria,
  };
}

export function hasRubricCriteria(rubric?: PeerReviewRubric | null): boolean {
  return Boolean(rubric?.criteria?.length);
}

export function resolvePeerReviewRubric(
  teamRubric?: PeerReviewRubric | null,
  defaultRubric?: PeerReviewRubric | null
): PeerReviewRubric | null {
  if (hasRubricCriteria(teamRubric)) return teamRubric!;
  if (hasRubricCriteria(defaultRubric)) return defaultRubric!;
  return teamRubric ?? defaultRubric ?? null;
}

export function shouldFetchDefaultRubric(teamRubric?: PeerReviewRubric | null, teamRubricReady = false): boolean {
  return teamRubricReady && !hasRubricCriteria(teamRubric);
}

export function rubricSourceLabel(rubric?: PeerReviewRubric | null): string {
  return rubric?.subjectId ? "Tiêu chí môn học" : "Tiêu chí mặc định";
}

export function parsePeerReviewCandidate(raw: unknown): PeerReviewCandidate | null {
  const item = asRecord(raw);
  const studentId = asString(item.studentId).trim();
  if (!studentId) return null;
  return {
    studentId,
    studentCode: asNullableString(item.studentCode),
    fullName: asString(item.fullName, studentId),
    alreadyReviewed: Boolean(item.alreadyReviewed),
    existingReviewId: asNullableString(item.existingReviewId),
    existingTotalStarRating: asNullableNumber(item.existingTotalStarRating),
  };
}

export function parsePeerReviewCandidatesResponse(raw: unknown): PeerReviewCandidatesResponse {
  const item = asRecord(raw);
  const rows = Array.isArray(item.candidates) ? item.candidates : [];
  return {
    teamId: asNullableString(item.teamId),
    sprintId: asNullableString(item.sprintId),
    reviewerId: asNullableString(item.reviewerId),
    candidates: rows.map(parsePeerReviewCandidate).filter((row): row is PeerReviewCandidate => Boolean(row)),
  };
}

export function resolveCandidateTeamRole(
  members: Array<{ studentCode: string; role: string }>,
  studentCode?: string | null
): string | null {
  const code = studentCode?.trim();
  if (!code) return null;
  return members.find((member) => member.studentCode === code)?.role ?? null;
}

export function excludeSelfReviewCandidates(
  candidates: PeerReviewCandidate[],
  reviewerId?: string | null
): PeerReviewCandidate[] {
  const id = reviewerId?.trim() || "";
  if (!id) return candidates;
  return candidates.filter((candidate) => candidate.studentId !== id);
}

export function parseSubmitPeerReviewResponse(raw: unknown, fallback: { sprintId: string; revieweeId: string }): SubmitPeerReviewResponse {
  const item = asRecord(raw);
  const ratingsRaw = Array.isArray(item.criteriaRatings) ? item.criteriaRatings : [];
  const criteriaRatings: PeerReviewCriteriaRating[] = ratingsRaw.flatMap((entry) => {
    const rating = asRecord(entry);
    const rubricId = asString(rating.rubricId).trim();
    const starRating = asNullableNumber(rating.starRating);
    if (!rubricId || starRating === null) return [];
    return [{ rubricId, starRating }];
  });
  return {
    teamId: asNullableString(item.teamId),
    sprintId: asNullableString(item.sprintId) || fallback.sprintId,
    reviewerId: asNullableString(item.reviewerId),
    revieweeId: asString(item.revieweeId, fallback.revieweeId),
    starRating: asNullableNumber(item.starRating),
    criteriaRatings,
    createdAt: asNullableString(item.createdAt),
    updatedAt: asNullableString(item.updatedAt),
  };
}

export function isIntegerStar(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= PEER_REVIEW_STAR_MIN && value <= PEER_REVIEW_STAR_MAX;
}

export function previewTotalStars(ratings: Record<string, number>, rubricIds: string[]): number {
  return rubricIds.reduce((sum, id) => sum + (isIntegerStar(ratings[id]) ? ratings[id] : 0), 0);
}

export function canSubmitPeerReview(input: SubmitPeerReviewInput): boolean {
  try {
    buildSubmitPeerReviewPayload(input);
    return true;
  } catch {
    return false;
  }
}

export function assertNoLegacySubmitFields(payload: SubmitPeerReviewPayload): void {
  const body = payload as unknown as Record<string, unknown>;
  for (const field of FORBIDDEN_SUBMIT_FIELDS) {
    if (field in body) {
      throw new Error(`Throw ValidationException: Payload must not include ${field}`);
    }
  }
  for (const rating of payload.criteriaRatings) {
    const row = rating as unknown as Record<string, unknown>;
    if ("criterionId" in row || "revieweeStudentId" in row) {
      throw new Error("Throw ValidationException: Payload must not include criterionId or revieweeStudentId");
    }
  }
}

export function buildSubmitPeerReviewPayload(input: SubmitPeerReviewInput): SubmitPeerReviewPayload {
  const revieweeId = input.revieweeId?.trim() || "";
  if (!revieweeId) {
    throw new Error("Throw ValidationException: Reviewee ID is required");
  }
  if (input.hasExistingReview) {
    throw new Error("Throw ValidationException: Peer review has already been submitted");
  }
  const reviewerId = input.reviewerId?.trim() || "";
  if (reviewerId && reviewerId === revieweeId) {
    throw new Error("Throw ValidationException: Self-review is not allowed");
  }
  if (!input.allowedRevieweeIds.includes(revieweeId)) {
    throw new Error("Throw ValidationException: Candidate is not valid");
  }

  const expected = [...input.rubricIds].map((id) => id.trim()).filter(Boolean);
  if (expected.length === 0) {
    throw new Error("Throw ValidationException: Rubric criteria are required");
  }
  const ratingIds = Object.keys(input.ratings);
  const missing = expected.filter((id) => !ratingIds.includes(id));
  const extra = ratingIds.filter((id) => !expected.includes(id));
  if (missing.length > 0 || extra.length > 0) {
    throw new Error("Throw ValidationException: Rubric criteria mismatch");
  }

  const criteriaRatings = expected.map((rubricId) => {
    const starRating = input.ratings[rubricId];
    if (!isIntegerStar(starRating)) {
      throw new Error("Throw ValidationException: Star rating must be an integer from 1 to 5");
    }
    return { rubricId, starRating };
  });

  const comment = (input.comment || "").trim();
  if (comment.length > PEER_REVIEW_COMMENT_MAX) {
    throw new Error("Throw ValidationException: Comment exceeds 4000 characters");
  }

  const payload: SubmitPeerReviewPayload = {
    revieweeId,
    criteriaRatings,
  };
  if (comment) payload.comment = comment;
  assertNoLegacySubmitFields(payload);
  return payload;
}
