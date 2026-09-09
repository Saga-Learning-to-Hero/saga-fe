import { TeamProjectDetailPage } from "@/features/lecturer/teams/components/team-project-detail-page";

export default async function LecturerTeamProjectDetailPage({
  params,
}: {
  params: Promise<{ courseId: string; teamId: string }>;
}) {
  const { courseId, teamId } = await params;
  return <TeamProjectDetailPage key={`${courseId}-${teamId}`} courseId={courseId} teamId={teamId} />;
}
