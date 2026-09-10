import { redirect } from "next/navigation";
import { lecturerCourseGradesPath } from "@/features/lecturer/courses/lib/course-routes";

interface Props {
  params: Promise<{ courseId: string; teamId: string }>;
}

export default async function LecturerLegacyContributionEvaluationRoute({ params }: Props) {
  const { courseId, teamId } = await params;
  redirect(lecturerCourseGradesPath(courseId, teamId));
}
