import { Metadata } from "next";
import { redirect } from "next/navigation";
import { lecturerCourseContributionPath } from "@/features/lecturer/courses/lib/course-routes";

export const metadata: Metadata = {
  title: "Cấu hình trọng số - SAGA",
};

export default async function LecturerCourseWeightConfigRoute({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  redirect(lecturerCourseContributionPath(courseId));
}
