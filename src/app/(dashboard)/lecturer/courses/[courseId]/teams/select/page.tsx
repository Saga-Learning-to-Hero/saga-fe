import { redirect } from "next/navigation";
import { lecturerCourseTeamsPath } from "@/features/lecturer/courses/lib/course-routes";

export default async function LecturerTeamSelectPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  redirect(lecturerCourseTeamsPath(courseId));
}
