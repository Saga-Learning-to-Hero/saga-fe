import { TeamProjectDetailPage } from "@/features/lecturer/teams/components/team-project-detail-page";

export default async function LecturerTeamProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string; teamId: string }>;
  searchParams?: Promise<{ delayCaseId?: string }>;
}) {
  const { courseId, teamId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  return (
    <TeamProjectDetailPage
      key={`${courseId}-${teamId}`}
      courseId={courseId}
      teamId={teamId}
      delayCaseId={resolvedSearchParams?.delayCaseId}
    />
  );
}
