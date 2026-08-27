import { notFound } from "next/navigation";
import { MOCK_LECTURER_COURSES } from "@/features/lecturer/courses/data/mock-courses";
import { CourseSpacePage } from "@/features/lecturer/courses/components/course-space-page";

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function CourseDashboardRoute({ params }: Props) {
  const { courseId } = await params;
  const course = MOCK_LECTURER_COURSES.find((c) => c.id === courseId);

  if (!course) notFound();

  return <CourseSpacePage course={course} />;
}
