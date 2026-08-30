import { ClassMemberTab } from "@/features/lecturer/team-project-activity/components/class-member-list/class-member-tab";

export default async function LecturerClassMembersPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const resolvedParams = await params;
  return (
    <div className="p-6 h-full flex flex-col">
      <ClassMemberTab courseId={resolvedParams.courseId} />
    </div>
  );
}
