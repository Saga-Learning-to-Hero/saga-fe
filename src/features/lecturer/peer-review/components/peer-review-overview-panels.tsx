"use client";

import { useMemo } from "react";
import {
  ArrowRightIcon,
  CalendarRangeIcon,
  MessageSquareQuoteIcon,
  UserRoundIcon,
} from "lucide-react";
import { CustomSelect } from "@/components/common/custom-select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  buildPeerReviewKpis,
  formatPeerReviewDateTime,
  formatScoreOutOfMax,
  getPeerReviewMaxScore,
  resolveCriteriaColumns,
  resolveMatrixMembers,
} from "../lib/lecturer-peer-review";
import type {
  LecturerPeerReviewItem,
  LecturerPeerReviewRubric,
} from "../types/lecturer-peer-review";

interface PeerReviewOverviewPanelsProps {
  reviews: LecturerPeerReviewItem[];
  rubric: LecturerPeerReviewRubric | null;
  members?: Array<{
    studentProfileId: string;
    fullName: string;
    studentCode?: string | null;
  }>;
  selectedRevieweeId?: string;
  fallbackSprintName?: string;
  rubricError?: boolean;
  onSelectReviewee?: (revieweeId: string) => void;
  onRetryRubric?: () => void;
}

interface RevieweeOption {
  id: string;
  name: string;
  studentCode?: string | null;
}

function KpiCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
      <p className="text-[11px] font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-lg font-bold text-foreground">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </Card>
  );
}

function PersonSummary({
  label,
  name,
  emphasized = false,
}: {
  label: string;
  name: string;
  emphasized?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-3 rounded-xl border px-3 py-3",
        emphasized
          ? "border-primary/25 bg-primary/5"
          : "border-border/70 bg-background",
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full",
          emphasized
            ? "bg-primary/15 text-primary"
            : "bg-muted text-muted-foreground",
        )}
      >
        <UserRoundIcon className="size-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <p
          className={cn(
            "text-[10px] font-bold uppercase tracking-wide",
            emphasized ? "text-primary" : "text-muted-foreground",
          )}
        >
          {label}
        </p>
        <p
          className={cn(
            "truncate text-sm font-bold",
            emphasized ? "text-primary" : "text-foreground",
          )}
          title={name}
        >
          {name}
        </p>
      </div>
    </div>
  );
}

export function PeerReviewOverviewPanels({
  reviews,
  rubric,
  members = [],
  selectedRevieweeId = "",
  fallbackSprintName = "",
  rubricError = false,
  onSelectReviewee,
  onRetryRubric,
}: PeerReviewOverviewPanelsProps) {
  const criteria = useMemo(
    () => resolveCriteriaColumns(rubricError ? null : rubric, reviews),
    [reviews, rubric, rubricError],
  );
  const maxScore = getPeerReviewMaxScore(criteria.length);
  const matrixMembers = useMemo(
    () => resolveMatrixMembers(members, reviews),
    [members, reviews],
  );
  const kpis = useMemo(
    () => buildPeerReviewKpis(matrixMembers, reviews, maxScore),
    [matrixMembers, maxScore, reviews],
  );
  const revieweeOptions = useMemo(() => {
    const byId = new Map<string, RevieweeOption>();
    for (const member of members) {
      const id = member.studentProfileId.trim();
      if (!id) continue;
      byId.set(id, {
        id,
        name: member.fullName.trim() || id,
        studentCode: member.studentCode?.trim() || null,
      });
    }
    for (const review of reviews) {
      if (!byId.has(review.revieweeId)) {
        byId.set(review.revieweeId, {
          id: review.revieweeId,
          name: review.revieweeName,
        });
      }
    }
    return [...byId.values()].sort((a, b) =>
      a.name.localeCompare(b.name, "vi"),
    );
  }, [members, reviews]);
  const visibleReviews = useMemo(
    () =>
      selectedRevieweeId
        ? reviews.filter((review) => review.revieweeId === selectedRevieweeId)
        : reviews,
    [reviews, selectedRevieweeId],
  );
  const selectedRevieweeName =
    revieweeOptions.find((option) => option.id === selectedRevieweeId)?.name ||
    "sinh viên này";
  const completionText =
    kpis.completionRate === null
      ? "—"
      : `${kpis.completionRate.toLocaleString("vi-VN", { maximumFractionDigits: 0 })}%`;

  return (
    <div className="space-y-4">
      {rubricError ? (
        <Card className="flex flex-col gap-2 rounded-2xl border border-dashed border-border/80 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Chưa tải được chi tiết tiêu chí. Vẫn xem được các chỉ số tổng quan.
          </p>
          {onRetryRubric ? (
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer text-xs"
              onClick={onRetryRubric}
            >
              Thử lại
            </Button>
          ) : null}
        </Card>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          label="Số lượt đã đánh giá"
          value={String(kpis.submittedCount)}
          hint={
            kpis.expectedCount > 0
              ? `Kỳ vọng ${kpis.expectedCount} cặp`
              : undefined
          }
        />
        <KpiCard label="Tỷ lệ hoàn thành" value={completionText} />
        <KpiCard
          label="Điểm trung bình"
          value={formatScoreOutOfMax(kpis.averageScore, kpis.maxScore)}
          hint={
            kpis.maxScore > 0 ? `Thang tối đa ${kpis.maxScore} điểm` : undefined
          }
        />
        <KpiCard
          label="Thành viên chưa đánh giá"
          value={String(kpis.membersWithoutReviewCount)}
        />
        <KpiCard
          label="Đánh giá có bình luận"
          value={String(kpis.commentedCount)}
        />
      </div>

      <Card className="relative z-10 overflow-visible rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-foreground">
              Các lượt đánh giá
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Hiển thị {visibleReviews.length}/{reviews.length} lượt trong{" "}
              {fallbackSprintName || "Sprint đang chọn"}.
            </p>
          </div>

          <div className="w-full space-y-1.5 sm:w-72">
            <Label
              htmlFor="peer-review-reviewee"
              className="text-[11px] font-semibold text-muted-foreground"
            >
              Người được đánh giá
            </Label>
            <CustomSelect
              id="peer-review-reviewee"
              value={selectedRevieweeId}
              onChange={(value) => onSelectReviewee?.(value)}
              options={[
                { value: "", label: "Tất cả thành viên" },
                ...revieweeOptions.map((option) => ({
                  value: option.id,
                  label: option.name,
                  subLabel: option.studentCode || undefined,
                })),
              ]}
            />
          </div>
        </div>

        {visibleReviews.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-border/80 px-5 py-8 text-center">
            <p className="text-sm font-semibold text-foreground">
              {selectedRevieweeId
                ? `Chưa có thành viên nào đánh giá ${selectedRevieweeName} trong Sprint này.`
                : "Chưa có đánh giá chéo trong Sprint này."}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Các chỉ số tổng quan sẽ được cập nhật khi thành viên hoàn tất đánh
              giá.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            {visibleReviews.map((review) => {
              const sprintName =
                review.sprintName?.trim() ||
                fallbackSprintName.trim() ||
                "Chưa xác định Sprint";
              return (
                <article
                  key={review.id}
                  data-testid="peer-review-card"
                  data-reviewee-id={review.revieweeId}
                  className="rounded-xl border border-border/70 bg-muted/15 p-4"
                >
                  <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto] lg:items-stretch">
                    <PersonSummary
                      label="Người đánh giá"
                      name={review.reviewerName}
                    />
                    <div
                      className="flex items-center justify-center text-muted-foreground"
                      aria-hidden
                    >
                      <ArrowRightIcon className="size-4 rotate-90 lg:rotate-0" />
                    </div>
                    <PersonSummary
                      label="Người được đánh giá"
                      name={review.revieweeName}
                      emphasized
                    />
                    <div className="flex flex-wrap items-stretch gap-2 lg:w-36 lg:flex-col">
                      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border/70 bg-background px-3 py-2 lg:flex-none">
                        <CalendarRangeIcon
                          className="size-3.5 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                        <span
                          data-testid="peer-review-card-sprint"
                          className="truncate text-[11px] font-semibold text-foreground"
                          title={sprintName}
                        >
                          {sprintName}
                        </span>
                      </div>
                      <div className="flex-1 rounded-lg bg-primary/10 px-3 py-2 text-right lg:flex-none">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">
                          Tổng điểm
                        </p>
                        <p className="font-mono text-sm font-bold text-primary">
                          {formatScoreOutOfMax(review.starRating, maxScore)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Cập nhật{" "}
                    {formatPeerReviewDateTime(
                      review.updatedAt || review.createdAt,
                    )}
                  </p>

                  {criteria.length > 0 ? (
                    <dl className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                      {criteria.map((criterion) => {
                        const rating = review.criteriaRatings.find(
                          (item) => item.rubricId === criterion.rubricId,
                        );
                        return (
                          <div
                            key={criterion.rubricId}
                            className="rounded-lg border border-border/60 bg-background px-3 py-2"
                          >
                            <dt
                              className="truncate text-[11px] text-muted-foreground"
                              title={criterion.criteriaName}
                            >
                              {criterion.criteriaName}
                            </dt>
                            <dd className="mt-0.5 font-mono text-xs font-bold text-foreground">
                              {rating?.starRating ?? "—"}/5
                            </dd>
                          </div>
                        );
                      })}
                    </dl>
                  ) : null}

                  {review.comment ? (
                    <div
                      data-testid="peer-review-comment"
                      className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-xs"
                    >
                      <div className="flex items-center gap-2 text-primary">
                        <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                          <MessageSquareQuoteIcon className="size-3.5" aria-hidden />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wide">
                            Nhận xét từ {review.reviewerName}
                          </p>
                          <p className="truncate text-[11px] text-muted-foreground">
                            Dành cho {review.revieweeName}
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 border-l-2 border-primary/35 pl-3 text-sm leading-6 font-medium text-foreground">
                        {review.comment}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-4 rounded-lg border border-dashed border-border/70 px-3 py-2 text-xs italic text-muted-foreground">
                      Không có đánh giá.
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
