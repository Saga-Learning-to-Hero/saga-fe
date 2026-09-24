import { LecturerAiHubPage } from "@/features/ai/components/lecturer/lecturer-ai-hub-page";

interface LecturerAiPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function LecturerAiPage({ params }: LecturerAiPageProps) {
  const { courseId } = await params;
  return <LecturerAiHubPage courseId={courseId} />;
}
