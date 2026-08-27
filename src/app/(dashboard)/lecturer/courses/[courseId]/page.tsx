import { redirect } from "next/navigation";
import { MOCK_LECTURER_COURSES } from "@/features/lecturer/courses/data/mock-courses";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ courseId: string }>;
}

/**
 * /lecturer/courses/[courseId] redirects to /lecturer/courses/[courseId]/dashboard.
 * This keeps the URL clean while landing users in the right place.
 */
export default async function CourseRootRoute({ params }: Props) {
  const { courseId } = await params;
  const course = MOCK_LECTURER_COURSES.find((c) => c.id === courseId);

  if (!course) notFound();

  redirect(`/lecturer/courses/${courseId}/dashboard`);
}
