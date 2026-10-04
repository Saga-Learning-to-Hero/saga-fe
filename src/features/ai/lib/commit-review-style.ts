import type { CommitAiReviewSummary } from "../types";

export type CommitReviewTone = "pass" | "warning" | "pending" | "error" | "muted";

/** Visual tone of a commit review status (the status itself always comes from the backend). */
export function commitReviewTone(status?: string | null): CommitReviewTone {
  switch (status) {
    case "PASS":
      return "pass";
    case "WARNING":
      return "warning";
    case "PENDING":
      return "pending";
    case "FAILED":
      return "error";
    default:
      return "muted";
  }
}

export const COMMIT_REVIEW_TONE_CLASS: Record<CommitReviewTone, string> = {
  pass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  warning: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  pending: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
  error: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
  muted: "bg-muted text-muted-foreground border-border",
};

/** Tooltip text: the badge label plus each reason, e.g. "Cảnh báo: Tên commit chưa rõ, Chưa gắn task". */
export function commitReviewTooltip(review?: CommitAiReviewSummary | null): string {
  if (!review) return "Chưa có thông tin đánh giá AI";
  if (!review.reasons?.length) return review.label;
  return `${review.label}: ${review.reasons.map((reason) => reason.label).join(", ")}`;
}

/** The "no task" warning is shown even when the commit was never reviewed by AI. */
export function hasNoTaskWarning(review?: CommitAiReviewSummary | null): boolean {
  return Boolean(review?.reasons?.some((reason) => reason.code === "NO_TASK"));
}

/** Merge commits are never reviewed: the backend says so with SKIPPED_MERGE. */
export function isReviewSkippedMerge(review?: { status?: string | null } | null): boolean {
  return review?.status === "SKIPPED_MERGE";
}
