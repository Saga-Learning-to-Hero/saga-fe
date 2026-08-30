import { TeamProjectPage } from "@/features/lecturer/team-project-activity/components/team-project-page";

const PROJECT_TABS = ["overview", "github", "kanban", "analytics"] as const;

export default async function LecturerTeamProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string; teamId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const requestedTab = resolvedSearchParams.tab;
  const activeTab = PROJECT_TABS.includes(requestedTab as (typeof PROJECT_TABS)[number])
    ? requestedTab!
    : "overview";
  
  return (
    <div className="p-6 h-full flex flex-col">
      <TeamProjectPage 
        courseId={resolvedParams.courseId} 
        teamId={resolvedParams.teamId} 
        activeTab={activeTab}
      />
    </div>
  );
}
