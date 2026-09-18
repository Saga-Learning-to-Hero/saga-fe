"use client";

import { CalendarRangeIcon, UserRoundCheckIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatScoreOutOfMax } from "../lib/lecturer-peer-review";
import type {
  LecturerPeerReviewCriterion,
  LecturerPeerReviewItem,
  RevieweeReviewGroup,
  RevieweeSummary,
} from "../types/lecturer-peer-review";
import { PeerReviewReviewCard } from "./peer-review-review-card";

interface PeerReviewDetailPanelProps {
  reviews: LecturerPeerReviewItem[];
  visibleReviews: LecturerPeerReviewItem[];
  groups: RevieweeReviewGroup[];
  criteria: LecturerPeerReviewCriterion[];
  maxScore: number;
  selectedRevieweeId: string;
  selectedReviewee?: RevieweeSummary;
  fallbackSprintName: string;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "SV";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function PeerReviewDetailPanel({
  reviews,
  visibleReviews,
  groups,
  criteria,
  maxScore,
  selectedRevieweeId,
  selectedReviewee,
  fallbackSprintName,
}: PeerReviewDetailPanelProps) {
  const selectedRevieweeName = selectedReviewee?.name || "sinh viên này";
  const sprintName = fallbackSprintName || "Sprint đang chọn";

  return (
    <section className="min-w-0 rounded-2xl border border-border/80 bg-card shadow-xs">
      {selectedReviewee ? (
        <header className="grid gap-3 border-b border-border/60 bg-gradient-to-r from-primary/8 via-primary/3 to-transparent p-4 sm:grid-cols-[minmax(240px,1fr)_auto] sm:items-center">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="size-11 border border-primary/20 shadow-xs">
              <AvatarFallback className="bg-primary/15 text-sm font-black text-primary">
                {getInitials(selectedReviewee.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                <UserRoundCheckIcon className="size-3.5" aria-hidden />
                Người được đánh giá
              </p>
              <h2 className="break-words text-base leading-5 font-extrabold text-foreground">
                {selectedReviewee.name}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                {selectedReviewee.studentCode ? (
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono font-bold text-primary">
                    {selectedReviewee.studentCode}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1">
                  <CalendarRangeIcon className="size-3.5" aria-hidden />
                  {sprintName}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:min-w-48">
            <div className="rounded-xl border border-primary/15 bg-card/80 px-3 py-2 text-center">
              <p className="font-mono text-base font-black text-primary">
                {selectedReviewee.receivedCount}
              </p>
              <p className="text-[10px] font-semibold text-muted-foreground">
                Lượt nhận
              </p>
            </div>
            <div className="rounded-xl border border-primary/15 bg-card/80 px-3 py-2 text-center">
              <p className="font-mono text-base font-black text-primary">
                {formatScoreOutOfMax(selectedReviewee.averageScore, maxScore)}
              </p>
              <p className="text-[10px] font-semibold text-muted-foreground">
                Điểm trung bình
              </p>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground sm:col-span-2">
            Hiển thị {visibleReviews.length}/{reviews.length} lượt trong {sprintName}.
          </p>
        </header>
      ) : (
        <header className="flex flex-col gap-1 border-b border-border/60 bg-muted/15 p-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-extrabold text-foreground">
              Các lượt đánh giá
            </h2>
            <p className="text-xs text-muted-foreground">
              Theo dõi nhận xét giữa các thành viên trong {sprintName}.
            </p>
          </div>
          <p className="font-mono text-xs font-bold text-primary">
            {reviews.length} lượt đánh giá
          </p>
        </header>
      )}

      <div className="p-4">
        {selectedRevieweeId && visibleReviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 px-4 py-8 text-center">
            <p className="text-sm font-semibold text-foreground">
              Chưa có thành viên nào đánh giá {selectedRevieweeName} trong Sprint này.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Kết quả sẽ xuất hiện khi thành viên hoàn tất đánh giá chéo.
            </p>
          </div>
        ) : !selectedRevieweeId && reviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 px-4 py-8 text-center">
            <p className="text-sm font-semibold text-foreground">
              Chưa có đánh giá chéo trong Sprint này.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Kết quả sẽ xuất hiện khi thành viên hoàn tất đánh giá chéo.
            </p>
          </div>
        ) : selectedRevieweeId ? (
          <div className="grid gap-3">
            {visibleReviews.map((review) => (
              <PeerReviewReviewCard
                key={review.id}
                review={review}
                criteria={criteria}
                maxScore={maxScore}
                fallbackSprintName={fallbackSprintName}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            {groups.map((group) => (
              <section key={group.reviewee.id} className="space-y-2.5">
                <div className="flex flex-col gap-1 rounded-xl border border-border/70 bg-muted/20 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      Tổng hợp lượt nhận
                    </p>
                    <h3 className="break-words text-sm font-extrabold text-foreground">
                      Người được đánh giá: {group.reviewee.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    {group.reviewee.studentCode ? (
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono font-bold text-primary">
                        {group.reviewee.studentCode}
                      </span>
                    ) : null}
                    <span>{group.reviews.length} lượt nhận</span>
                  </div>
                </div>
                <div className="grid gap-3">
                  {group.reviews.map((review) => (
                    <PeerReviewReviewCard
                      key={review.id}
                      review={review}
                      criteria={criteria}
                      maxScore={maxScore}
                      fallbackSprintName={fallbackSprintName}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
