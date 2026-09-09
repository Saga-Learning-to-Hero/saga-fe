import { Metadata } from "next";
import { ContributionEvaluationPage } from "@/features/lecturer/contribution/components/contribution-evaluation-page";

export const metadata: Metadata = {
  title: "Đánh giá đóng góp nhóm - SAGA",
};

export default async function LecturerContributionEvaluationRoute({
  params,
}: {
  params: Promise<{ courseId: string; teamId: string }>;
}) {
  const { courseId, teamId } = await params;
  return (
    <ContributionEvaluationPage key={`${courseId}-${teamId}`} courseId={courseId} teamId={teamId} />
  );
}
