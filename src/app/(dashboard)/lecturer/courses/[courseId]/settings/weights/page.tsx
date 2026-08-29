import { Metadata } from "next";
import { CourseWeightConfigPage } from "@/features/lecturer/course-weight-config/components/course-weight-config-page";
import { getLecturerCourseById } from "@/features/lecturer/courses/lib/course-repository";
import { getMockTeamsByCourseId } from "@/features/lecturer/course-weight-config/data/mock-course-weight-config";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Cấu hình trọng số - SAGA",
};

interface PageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function LecturerCourseWeightConfigRoute({ params }: PageProps) {
  const resolvedParams = await params;
  const course = getLecturerCourseById(resolvedParams.courseId);
  
  if (!course) {
    notFound();
  }
  
  const teams = getMockTeamsByCourseId(course.id);
  
  return <CourseWeightConfigPage course={course} teams={teams} />;
}
