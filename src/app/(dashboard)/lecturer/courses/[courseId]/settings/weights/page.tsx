import { redirect } from "next/navigation";
import { lecturerCourseContributionPath } from "@/features/lecturer/courses/lib/course-routes";

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function LecturerLegacyWeightSettingsPage({ params }: Props) {
  const { courseId } = await params;
  redirect(lecturerCourseContributionPath(courseId));
}
