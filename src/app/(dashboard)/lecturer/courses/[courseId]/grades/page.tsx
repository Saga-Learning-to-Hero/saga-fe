import { LecturerMonitoringPreview } from "@/features/lecturer/courses/components/lecturer-monitoring-preview";

export default async function GradebookRoute({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <LecturerMonitoringPreview key={courseId} courseId={courseId} kind="grades" />;
}
