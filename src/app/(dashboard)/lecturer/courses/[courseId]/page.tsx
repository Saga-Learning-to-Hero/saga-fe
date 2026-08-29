import { notFound, redirect } from "next/navigation";
import { getLecturerCourseById } from "@/features/lecturer/courses/lib/course-repository";
import { lecturerCourseDashboardPath } from "@/features/lecturer/courses/lib/course-routes";

interface Props {
  params: Promise<{ courseId: string }>;
}

/**
 * /lecturer/courses/[courseId] redirects to /lecturer/courses/[courseId]/dashboard.
 * This keeps the URL clean while landing users in the right place.
 */
export default async function CourseRootRoute({ params }: Props) {
  const { courseId } = await params;
  const course = getLecturerCourseById(courseId);

  if (!course) notFound();

  redirect(lecturerCourseDashboardPath(courseId));
}
