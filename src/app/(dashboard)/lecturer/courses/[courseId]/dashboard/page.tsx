import { CourseOverviewPage } from "@/features/lecturer/courses/components/course-overview-page";

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function CourseDashboardRoute({ params }: Props) {
  const { courseId } = await params;
  return <CourseOverviewPage key={courseId} courseId={courseId} />;
}
