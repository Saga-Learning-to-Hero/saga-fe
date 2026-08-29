import { notFound } from "next/navigation";
import { LecturerFinalGradesPage } from "@/features/lecturer/final-grades/components/lecturer-final-grades-page";
import { getLecturerCourseById } from "@/features/lecturer/courses/lib/course-repository";
import { createMockGradebook } from "@/features/lecturer/final-grades/data/mock-final-grades";

export default async function GradebookRoute({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;

  const course = getLecturerCourseById(courseId);
  if (!course) notFound();

  const gradebook = createMockGradebook(course);

  return <LecturerFinalGradesPage course={course} gradebook={gradebook} />;
}
