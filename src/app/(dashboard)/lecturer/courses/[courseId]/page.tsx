import { redirect } from "next/navigation";
import { lecturerCourseDashboardPath } from "@/features/lecturer/courses/lib/course-routes";

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function CourseRootRoute({ params }: Props) {
  const { courseId } = await params;
  redirect(lecturerCourseDashboardPath(courseId));
}
