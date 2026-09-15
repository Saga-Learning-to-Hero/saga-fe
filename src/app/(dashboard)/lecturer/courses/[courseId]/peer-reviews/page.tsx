import { Suspense } from "react";
import { Metadata } from "next";
import { LecturerPeerReviewPage } from "@/features/lecturer/peer-review/components/lecturer-peer-review-page";

export const metadata: Metadata = {
  title: "Đánh giá chéo theo Sprint - SAGA",
};

export default async function LecturerPeerReviewsRoute({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-[1600px] space-y-4 pb-12">
          <div className="h-8 w-64 animate-pulse rounded-xl bg-muted" />
          <div className="h-48 animate-pulse rounded-2xl bg-muted/60" />
        </div>
      }
    >
      <LecturerPeerReviewPage key={courseId} courseId={courseId} />
    </Suspense>
  );
}
