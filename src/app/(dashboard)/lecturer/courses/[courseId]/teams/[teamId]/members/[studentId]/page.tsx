import { TeamMemberProgressPage } from "@/features/lecturer/teams/components/team-member-progress-page";

export default async function LecturerTeamMemberProgressRoute({
  params,
}: {
  params: Promise<{ courseId: string; teamId: string; studentId: string }>;
}) {
  const { courseId, teamId, studentId } = await params;
  return (
    <TeamMemberProgressPage
      key={`${courseId}-${teamId}-${studentId}`}
      courseId={courseId}
      teamId={teamId}
      studentId={studentId}
    />
  );
}
