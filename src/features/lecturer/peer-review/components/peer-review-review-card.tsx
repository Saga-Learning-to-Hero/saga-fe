"use client";

import {
  CalendarRangeIcon,
  MessageSquareQuoteIcon,
  StarIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  CRITERION_STAR_MAX,
  formatPeerReviewDateTime,
  formatScoreOutOfMax,
} from "../lib/lecturer-peer-review";
import type {
  LecturerPeerReviewCriterion,
  LecturerPeerReviewItem,
} from "../types/lecturer-peer-review";

interface PeerReviewReviewCardProps {
  review: LecturerPeerReviewItem;
  criteria: LecturerPeerReviewCriterion[];
  maxScore: number;
  fallbackSprintName?: string;
  emphasizeReviewee?: boolean;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "SV";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function CriterionStars({
  label,
  value,
}: {
  label: string;
  value: number | null | undefined;
}) {
  const hasScore = typeof value === "number" && Number.isFinite(value);
  const filledCount = hasScore
    ? Math.min(Math.max(Math.round(value), 0), CRITERION_STAR_MAX)
    : 0;

  return (
    <div className="flex shrink-0 items-center gap-2">
      <span className="font-mono text-xs font-extrabold text-foreground">
        {hasScore ? `${filledCount}/${CRITERION_STAR_MAX}` : "—"}
      </span>
      <span
        className="flex items-center gap-0.5"
        aria-label={
          hasScore
            ? `${label}: ${filledCount} trên ${CRITERION_STAR_MAX} sao`
            : `${label}: chưa có điểm`
        }
      >
        {Array.from({ length: CRITERION_STAR_MAX }, (_, index) => {
          const filled = index < filledCount;
          return (
            <StarIcon
              key={index}
              className={cn(
                "size-3.5",
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/25"
              )}
              aria-hidden
            />
          );
        })}
      </span>
    </div>
  );
}

export function PeerReviewReviewCard({
  review,
  criteria,
  maxScore,
  fallbackSprintName = "",
  emphasizeReviewee = false,
}: PeerReviewReviewCardProps) {
  const sprintName =
    review.sprintName?.trim() ||
    fallbackSprintName.trim() ||
    "Chưa xác định Sprint";

  return (
    <article
      data-testid="peer-review-card"
      data-reviewee-id={review.revieweeId}
      className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs transition-shadow hover:shadow-sm"
    >
      <header className="grid gap-3 border-b border-border/60 bg-muted/20 px-4 py-3 sm:grid-cols-[minmax(240px,1fr)_auto] sm:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="size-10 border border-primary/15">
            <AvatarFallback className="bg-primary/10 text-xs font-extrabold text-primary">
              {getInitials(review.reviewerName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Người đánh giá
            </p>
            <p className="break-words text-sm leading-5 font-extrabold text-foreground">
              {review.reviewerName}
            </p>
            {emphasizeReviewee ? (
              <p className="break-words text-[11px] text-muted-foreground">
                Đánh giá cho{" "}
                <span className="font-bold text-primary">
                  {review.revieweeName}
                </span>
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-background px-2.5 py-1 text-[11px] font-semibold text-foreground">
            <CalendarRangeIcon className="size-3.5 text-primary" aria-hidden />
            <span data-testid="peer-review-card-sprint" title={sprintName}>
              {sprintName}
            </span>
          </span>
          <span className="text-[11px] text-muted-foreground">
            {formatPeerReviewDateTime(review.updatedAt || review.createdAt)}
          </span>
          <span className="rounded-lg bg-primary/10 px-2.5 py-1 font-mono text-sm font-black text-primary">
            {formatScoreOutOfMax(review.starRating, maxScore)}
          </span>
        </div>
      </header>

      <div className="grid gap-3 p-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
        <section aria-label="Điểm theo tiêu chí">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            Điểm theo tiêu chí
          </p>
          {criteria.length > 0 ? (
            <dl className="grid gap-2 sm:grid-cols-2">
              {criteria.map((criterion) => {
                const rating = review.criteriaRatings.find(
                  (item) => item.rubricId === criterion.rubricId
                );
                return (
                  <div
                    key={criterion.rubricId}
                    data-testid="peer-review-criterion-row"
                    className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-border/70 bg-background px-3 py-2.5"
                  >
                    <dt
                      className="min-w-0 text-xs font-semibold leading-5 text-foreground"
                      title={criterion.criteriaName}
                    >
                      {criterion.criteriaName}
                    </dt>
                    <dd>
                      <CriterionStars
                        label={criterion.criteriaName}
                        value={rating?.starRating}
                      />
                    </dd>
                  </div>
                );
              })}
            </dl>
          ) : (
            <div className="rounded-xl border border-dashed border-border/70 px-3 py-5 text-center text-xs text-muted-foreground">
              Chưa có chi tiết điểm theo tiêu chí.
            </div>
          )}
        </section>

        <section
          data-testid={review.comment ? "peer-review-comment" : undefined}
          className={cn(
            "rounded-xl border p-3",
            review.comment
              ? "border-primary/20 bg-primary/5"
              : "border-dashed border-border/70 bg-muted/10"
          )}
        >
          <div className="flex items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MessageSquareQuoteIcon className="size-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-primary">
                Nhận xét từ {review.reviewerName}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                Dành cho {review.revieweeName}
              </p>
            </div>
          </div>
          <p
            className={cn(
              "mt-3 text-sm leading-6",
              review.comment
                ? "font-medium text-foreground"
                : "italic text-muted-foreground"
            )}
          >
            {review.comment || "Không có nhận xét."}
          </p>
        </section>
      </div>
    </article>
  );
}
