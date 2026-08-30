import { notFound } from "next/navigation";
import { createMockCourseDashboard } from "@/features/lecturer/class-dashboard/data/mock-course-dashboard";
import { LecturerCourseDashboardPage } from "@/features/lecturer/class-dashboard/components/lecturer-course-dashboard-page";
import { getLecturerCourseById } from "@/features/lecturer/courses/lib/course-repository";

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function CourseDashboardRoute({ params }: Props) {
  const { courseId } = await params;

  const course = getLecturerCourseById(courseId);
  if (!course) notFound();

  const dashboardData = createMockCourseDashboard(course);

  return <LecturerCourseDashboardPage initialData={dashboardData} />;
}
