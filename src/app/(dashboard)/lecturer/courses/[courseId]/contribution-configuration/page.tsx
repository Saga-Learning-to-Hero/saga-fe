import { Metadata } from "next";
import { ContributionConfigurationPage } from "@/features/lecturer/contribution/components/contribution-configuration-page";

export const metadata: Metadata = {
  title: "Cấu hình trọng số - SAGA",
};

export default async function LecturerContributionConfigurationRoute({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <ContributionConfigurationPage key={courseId} courseId={courseId} />;
}
