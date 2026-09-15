"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { canSubmitPeerReview, previewTotalStars } from "../lib/peer-review-payload";
import { mapPeerReviewSubmitError, useSubmitPeerReview } from "../hooks/use-peer-review";
import type { PeerReviewCandidate, PeerReviewRubric } from "../types/peer-review";
import { PEER_REVIEW_COMMENT_MAX } from "../types/peer-review";
import { StarRatingInput } from "./star-rating-input";

interface PeerReviewModalProps {
  open: boolean;
  teamId: string;
  sprintId: string;
  candidate: PeerReviewCandidate | null;
  rubric: PeerReviewRubric | null;
  reviewerId?: string | null;
  allowedRevieweeIds: string[];
  sprintWindowOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PeerReviewModal({
  open,
  teamId,
  sprintId,
  candidate,
  rubric,
  reviewerId,
  allowedRevieweeIds,
  sprintWindowOpen,
  onOpenChange,
}: PeerReviewModalProps) {
  const submitMutation = useSubmitPeerReview();
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");
  const [submitError, setSubmitError] = useState<{ code?: string; message: string } | null>(null);

  const rubricIds = useMemo(() => (rubric?.criteria || []).map((item) => item.rubricId), [rubric]);
  const totalPreview = previewTotalStars(ratings, rubricIds);
  const canSubmit =
    sprintWindowOpen &&
    !candidate?.alreadyReviewed &&
    Boolean(candidate && rubric && teamId && sprintId) &&
    canSubmitPeerReview({
      revieweeId: candidate?.studentId || "",
      hasExistingReview: Boolean(candidate?.alreadyReviewed),
      comment,
      ratings,
      rubricIds,
      allowedRevieweeIds,
      reviewerId,
    });

  const resetForm = () => {
    setRatings({});
    setComment("");
    setSubmitError(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (submitMutation.isPending) return;
    if (!next) resetForm();
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    if (!candidate || candidate.alreadyReviewed || !rubric || !canSubmit) return;
    setSubmitError(null);
    try {
      await submitMutation.mutateAsync({
        teamId,
        sprintId,
        input: {
          revieweeId: candidate.studentId,
          hasExistingReview: candidate.alreadyReviewed,
          comment,
          ratings,
          rubricIds,
          allowedRevieweeIds,
          reviewerId,
        },
      });
      resetForm();
      onOpenChange(false);
    } catch (error) {
      setSubmitError(mapPeerReviewSubmitError(error));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[92vh] max-w-xl flex-col overflow-hidden p-0">
        <div className="flex max-h-[92vh] flex-col">
          <DialogHeader className="shrink-0 border-b border-border/60 p-5">
            <DialogTitle className="text-base font-bold">
              {candidate ? `Đánh giá chéo · ${candidate.fullName}` : "Đánh giá chéo theo Sprint"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Chọn sao nguyên từ 1 đến 5 cho từng tiêu chí. Tổng sao chỉ để xem trước, không phải tỷ lệ đóng góp.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
            {!sprintWindowOpen ? (
              <p className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-800 dark:text-amber-200">
                Sprint chưa đến hạn đánh giá. Form bị khóa đến khi Sprint đóng hoặc vào cửa sổ 48 giờ trước ngày kết thúc.
              </p>
            ) : null}

            {candidate?.alreadyReviewed ? (
              <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs text-emerald-800 dark:text-emerald-200">
                Bạn đã đánh giá thành viên này trong Sprint. Mỗi thành viên chỉ được đánh giá một lần.
              </p>
            ) : null}

            {(rubric?.criteria || []).map((criterion) => (
              <div key={criterion.rubricId} className="space-y-2 rounded-2xl border border-border/70 p-3">
                <Label htmlFor={`criterion-${criterion.rubricId}`} className="text-sm font-semibold">
                  {criterion.criteriaName}
                </Label>
                {criterion.description ? (
                  <p className="text-xs text-muted-foreground">{criterion.description}</p>
                ) : null}
                <StarRatingInput
                  id={`criterion-${criterion.rubricId}`}
                  value={ratings[criterion.rubricId] ?? null}
                  disabled={submitMutation.isPending || candidate?.alreadyReviewed}
                  onChange={(star) => setRatings((prev) => ({ ...prev, [criterion.rubricId]: star }))}
                />
              </div>
            ))}

            <div className="space-y-1.5">
              <Label htmlFor="peer-review-comment" className="text-xs font-semibold">
                Bình luận (không bắt buộc)
              </Label>
              <Textarea
                id="peer-review-comment"
                value={comment}
                maxLength={PEER_REVIEW_COMMENT_MAX}
                disabled={submitMutation.isPending || candidate?.alreadyReviewed}
                onChange={(event) => setComment(event.target.value.slice(0, PEER_REVIEW_COMMENT_MAX))}
                className="min-h-24 text-sm"
                placeholder="Nhận xét thêm về đóng góp trong Sprint..."
              />
              <p className="text-right font-mono text-[11px] text-muted-foreground">
                {comment.length}/{PEER_REVIEW_COMMENT_MAX}
              </p>
            </div>

            <p className="text-xs font-semibold text-foreground">
              Tổng sao xem trước: <span className="font-mono">{totalPreview}</span>
            </p>

            {submitError ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                <p>{submitError.message}</p>
                {submitError.code === "PEER_REVIEW_FORBIDDEN" ? (
                  <p className="mt-1 text-muted-foreground">Không thử gửi thay thành viên khác.</p>
                ) : null}
                {submitError.code === "TEAM_NOT_FOUND" ? (
                  <Link
                    href="/student/courses"
                    prefetch={true}
                    className={cn(buttonVariants({ size: "sm", variant: "outline" }), "mt-2 inline-flex rounded-xl text-xs font-semibold")}
                  >
                    Về danh sách lớp
                  </Link>
                ) : null}
                {submitError.code === "PROJECT_NOT_FOUND" ? (
                  <p className="mt-1 text-muted-foreground">Cần có dự án nhóm trước khi gửi đánh giá chéo.</p>
                ) : null}
                {submitError.code === "PEER_REVIEW_INVALID" || submitError.code === "REQUEST_INVALID" ? (
                  <p className="mt-1 text-muted-foreground">Form vẫn được giữ. Chỉnh số sao hoặc bình luận rồi gửi lại.</p>
                ) : null}
              </div>
            ) : null}
          </div>

          <DialogFooter className="mx-0 mb-0 shrink-0 p-5">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer text-xs"
              disabled={submitMutation.isPending}
              onClick={() => handleOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              className="cursor-pointer text-xs"
              disabled={!canSubmit || submitMutation.isPending}
              onClick={() => void handleSubmit()}
            >
              {submitMutation.isPending ? "Đang gửi..." : "Gửi đánh giá"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
