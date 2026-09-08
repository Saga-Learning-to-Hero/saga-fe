import { redirect } from "next/navigation";
import { lecturerCourseTeamsPath } from "@/features/lecturer/team-project-activity/lib/team-project-routes";

export default async function LecturerTeamSelectPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  redirect(lecturerCourseTeamsPath(courseId));
}
