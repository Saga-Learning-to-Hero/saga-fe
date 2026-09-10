import { LecturerCourseBoundary } from "@/features/lecturer/courses/components/lecturer-course-boundary";

interface LecturerCourseLayoutProps {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}

export default async function LecturerCourseLayout({
  children,
  params,
}: LecturerCourseLayoutProps) {
  const { courseId } = await params;
  return <LecturerCourseBoundary courseId={courseId}>{children}</LecturerCourseBoundary>;
}
