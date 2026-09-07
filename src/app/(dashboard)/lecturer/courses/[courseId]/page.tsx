import { CourseWorkspacePage } from "@/features/lecturer/courses/components/course-workspace-page";

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function CourseRootRoute({ params }: Props) {
  const { courseId } = await params;
  return <CourseWorkspacePage key={courseId} courseId={courseId} />;
}
