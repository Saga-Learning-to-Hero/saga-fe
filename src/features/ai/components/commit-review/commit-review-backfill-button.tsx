"use client";

import { Loader2Icon, SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showErrorToast, showSuccessToast } from "@/lib/api-error";
import { useBackfillCommitReviews } from "../../hooks/use-commit-review";

/** Leader-only: ask the AI to review the 20 most recent commits that were never reviewed. */
export function CommitReviewBackfillButton({ projectId }: { projectId: string }) {
  const backfill = useBackfillCommitReviews(projectId);

  const handleClick = () =>
    backfill.mutate(20, {
      onSuccess: (result) =>
        showSuccessToast(
          result.queued > 0
            ? `Đã gửi ${result.queued} commit cho AI đánh giá. Kết quả hiện dần trong vài phút.`
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
      title="AI đánh giá 20 commit gần nhất chưa được đánh giá (bỏ qua merge commit)"
    >
      {backfill.isPending ? <Loader2Icon className="w-3.5 h-3.5 animate-spin" /> : <SparklesIcon className="w-3.5 h-3.5 text-primary" />}
      <span>AI đánh giá 20 commit gần nhất</span>
    </Button>
  );
}
