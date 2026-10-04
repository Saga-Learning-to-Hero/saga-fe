"use client";

import { Loader2Icon, SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showErrorToast, showSuccessToast } from "@/lib/api-error";
import { useBackfillCommitReviews } from "../../hooks/use-commit-review";

/** Same cap as the backend: a long history is never reviewed in one go. */
export const COMMIT_REVIEW_BACKFILL_LIMIT = 15;

/** Leader-only: ask the AI to review the 15 most recent commits that were never reviewed. */
export function CommitReviewBackfillButton({ projectId }: { projectId: string }) {
  const backfill = useBackfillCommitReviews(projectId);

  const handleClick = () =>
    backfill.mutate(COMMIT_REVIEW_BACKFILL_LIMIT, {
      onSuccess: (result) =>
        showSuccessToast(
          result.queued > 0
            ? `Đã đưa ${result.queued} commit vào hàng chờ AI đánh giá. Kết quả hiện dần trong vài phút.`
            : "Không còn commit gần đây nào cần đánh giá."
        ),
      onError: (error) => showErrorToast("Không gửi được yêu cầu đánh giá hàng loạt.", error),
    });

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={!projectId || backfill.isPending}
      className="h-8.5 text-xs font-bold rounded-xl gap-1.5 cursor-pointer shadow-2xs"
      title={`AI đánh giá ${COMMIT_REVIEW_BACKFILL_LIMIT} commit gần nhất chưa được đánh giá (bỏ qua merge commit)`}
    >
      {backfill.isPending ? <Loader2Icon className="w-3.5 h-3.5 animate-spin" /> : <SparklesIcon className="w-3.5 h-3.5 text-primary" />}
      <span>AI đánh giá {COMMIT_REVIEW_BACKFILL_LIMIT} commit gần nhất</span>
    </Button>
  );
}
