"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2Icon, MessageSquareIcon, StarIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  const maxPossibleStars = rubricIds.length * 5;
  const evaluatedCount = Object.keys(ratings).filter((k) => (ratings[k] ?? 0) > 0).length;

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

  const initials = candidate
    ? (candidate.fullName || "SV")
      .split(" ")
      .filter(Boolean)
      .slice(-2)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
    : "SV";

  const avatarUrl = candidate?.avatarUrl || undefined;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[92vh] max-w-xl flex-col overflow-hidden p-0 border border-border/80 shadow-2xl rounded-3xl">
        <div className="flex max-h-[92vh] flex-col">
          <DialogHeader className="shrink-0 border-b border-border/60 bg-muted/20 p-5">
            <div className="flex items-center gap-3.5">
              {candidate ? (
                <Avatar size="lg" className="size-11 ring-2 ring-primary/20 shrink-0">
                  <AvatarImage src={avatarUrl} alt={candidate.fullName} />
                  <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              ) : null}
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-base font-bold text-foreground">
                  {candidate ? `Đánh giá chéo · ${candidate.fullName}` : "Đánh giá chéo theo Sprint"}
                </DialogTitle>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {candidate?.studentCode ? (
                    <Badge variant="outline" className="font-mono text-[10px] font-semibold">
                      {candidate.studentCode}
                    </Badge>
                  ) : null}
                  <DialogDescription className="text-xs text-muted-foreground">
                    Chọn sao nguyên từ 1 đến 5 cho từng tiêu chí. Tổng sao chỉ để xem trước, không phải tỷ lệ đóng góp.
                  </DialogDescription>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-2xl border border-border/60 bg-card/80 px-3.5 py-2 text-xs backdrop-blur-xs">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Tiến độ tiêu chí:</span>
                <span className="font-mono font-bold text-foreground">
                  {evaluatedCount}/{rubricIds.length}
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <StarIcon className="size-3.5 fill-amber-400 text-amber-400" />
                <span>
                  Tổng sao xem trước: <span className="font-mono font-bold">{totalPreview}</span>
                  {maxPossibleStars > 0 ? ` / ${maxPossibleStars}` : ""}
                </span>
              </div>
            </div>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
            {!sprintWindowOpen ? (
              <p className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                Sprint chưa đến hạn đánh giá. Form bị khóa đến khi Sprint đóng hoặc vào cửa sổ 48 giờ trước ngày kết thúc.
              </p>
            ) : null}

            {candidate?.alreadyReviewed ? (
              <p className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-800 dark:text-emerald-200 leading-relaxed">
                Bạn đã đánh giá thành viên này trong Sprint. Mỗi thành viên chỉ được đánh giá một lần.
              </p>
            ) : null}

            {(rubric?.criteria || []).map((criterion, idx) => {
              const currentRating = ratings[criterion.rubricId] ?? null;
              const hasScore = currentRating !== null && currentRating > 0;

              return (
                <div
                  key={criterion.rubricId}
                  className={cn(
                    "space-y-2.5 rounded-2xl border p-4 transition-all shadow-2xs",
                    hasScore
                      ? "border-primary/30 bg-primary/3"
                      : "border-border/70 bg-card/60 hover:border-border",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <span className="flex size-5.5 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-mono text-xs font-bold text-primary">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <Label
                          htmlFor={`criterion-${criterion.rubricId}`}
                          className="text-xs font-bold text-foreground cursor-pointer"
                        >
                          {criterion.criteriaName}
                        </Label>
                        {criterion.description ? (
                          <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                            {criterion.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    {hasScore ? (
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2Icon className="size-3.5" />
                      </span>
                    ) : null}
                  </div>

                  <div className="pt-1">
                    <StarRatingInput
                      id={`criterion-${criterion.rubricId}`}
                      value={currentRating}
                      disabled={submitMutation.isPending || candidate?.alreadyReviewed}
                      onChange={(star) =>
                        setRatings((prev) => ({ ...prev, [criterion.rubricId]: star }))
                      }
                    />
                  </div>
                </div>
              );
            })}

            <div className="space-y-2 rounded-2xl border border-border/70 bg-card/60 p-4 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <MessageSquareIcon className="size-3.5 text-primary" />
                <Label htmlFor="peer-review-comment" className="cursor-pointer">
                  Bình luận (không bắt buộc)
                </Label>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Ghi nhận xét cụ thể để giúp thành viên phát huy điểm mạnh và khắc phục thiếu sót trong Sprint tiếp theo.
              </p>
              <Textarea
                id="peer-review-comment"
                value={comment}
                maxLength={PEER_REVIEW_COMMENT_MAX}
                disabled={submitMutation.isPending || candidate?.alreadyReviewed}
                onChange={(event) =>
                  setComment(event.target.value.slice(0, PEER_REVIEW_COMMENT_MAX))
                }
                className="min-h-24 resize-none rounded-xl text-xs leading-relaxed"
                placeholder="Nhận xét thêm về đóng góp trong Sprint..."
              />
              <p className="text-right font-mono text-[11px] text-muted-foreground">
                {comment.length}/{PEER_REVIEW_COMMENT_MAX}
              </p>
            </div>

            {submitError ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
                <p className="font-semibold">{submitError.message}</p>
                {submitError.code === "PEER_REVIEW_FORBIDDEN" ? (
                  <p className="mt-1 text-muted-foreground">Bạn chỉ có thể gửi đánh giá cho các thành viên trong nhóm của mình.</p>
                ) : null}
                {submitError.code === "TEAM_NOT_FOUND" ? (
                  <Link
                    href="/student/courses"
                    prefetch={true}
                    className={cn(
                      buttonVariants({ size: "sm", variant: "outline" }),
                      "mt-2 inline-flex rounded-xl text-xs font-semibold",
                    )}
                  >
                    Về danh sách lớp
                  </Link>
                ) : null}
                {submitError.code === "PROJECT_NOT_FOUND" ? (
                  <p className="mt-1 text-muted-foreground">Cần có dự án nhóm trước khi gửi đánh giá chéo.</p>
                ) : null}
                {submitError.code === "PEER_REVIEW_INVALID" || submitError.code === "REQUEST_INVALID" ? (
                  <p className="mt-1 text-muted-foreground">
                    Form vẫn được giữ. Chỉnh số sao hoặc bình luận rồi gửi lại.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <DialogFooter className="mx-0 mb-0 shrink-0 border-t border-border/60 bg-muted/20 p-4 sm:justify-between flex items-center">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Đã chọn:</span>
              <span className="font-mono font-bold text-foreground">
                {evaluatedCount}/{rubricIds.length} tiêu chí
              </span>
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer rounded-xl text-xs font-semibold"
                disabled={submitMutation.isPending}
                onClick={() => handleOpenChange(false)}
              >
                Hủy
              </Button>
              <Button
                type="button"
                className="cursor-pointer rounded-xl bg-primary text-xs font-semibold shadow-xs hover:bg-primary/90 disabled:opacity-50"
                disabled={!canSubmit || submitMutation.isPending}
                onClick={() => void handleSubmit()}
              >
                {submitMutation.isPending ? "Đang gửi..." : "Gửi đánh giá"}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

