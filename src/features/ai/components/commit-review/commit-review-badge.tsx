"use client";

import {
  CheckCircle2Icon,
  AlertTriangleIcon,
  Loader2Icon,
  XCircleIcon,
  MinusCircleIcon,
  Link2OffIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CommitAiReviewSummary } from "../../types";
import {
  COMMIT_REVIEW_TONE_CLASS,
  commitReviewTone,
  commitReviewTooltip,
  hasNoTaskWarning,
} from "../../lib/commit-review-style";

interface CommitReviewBadgeProps {
  review?: CommitAiReviewSummary | null;
  onClick?: () => void;
  className?: string;
}

/** Status badge shown next to a commit; clicking it opens the detailed review. */
export function CommitReviewBadge({ review, onClick, className }: CommitReviewBadgeProps) {
  if (!review) return null;
  const tone = commitReviewTone(review.status);
  const Icon =
    tone === "pass"
      ? CheckCircle2Icon
      : tone === "warning"
        ? AlertTriangleIcon
        : tone === "pending"
          ? Loader2Icon
          : tone === "error"
            ? XCircleIcon
            : MinusCircleIcon;
  const showNoTask = hasNoTaskWarning(review) && review.status !== "WARNING";

  return (
    <span className={cn("inline-flex items-center gap-1 shrink-0", className)}>
      <button
        type="button"
        onClick={onClick}
        title={commitReviewTooltip(review)}
        aria-label={`Đánh giá AI: ${commitReviewTooltip(review)}`}
        data-testid="commit-review-badge"
        data-status={review.status}
        className={cn(
          "inline-flex items-center gap-1 h-5 px-2 rounded-full border text-[11px] font-bold transition-opacity",
          COMMIT_REVIEW_TONE_CLASS[tone],
          onClick ? "cursor-pointer hover:opacity-80" : "cursor-default"
        )}
      >
        <Icon className={cn("size-3", tone === "pending" && "animate-spin")} />
        <span>AI · {review.label}</span>
        {review.status === "WARNING" && review.reasons.length > 0 && (
          <span className="font-mono opacity-80">· {review.reasons.length}</span>
        )}
      </button>
      {showNoTask && (
        <span
          title="Commit chưa gắn task nào"
          className="inline-flex items-center gap-1 h-5 px-1.5 rounded-full border text-[11px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
        >
          <Link2OffIcon className="size-3" />
          <span>Chưa gắn task</span>
        </span>
      )}
    </span>
  );
}
