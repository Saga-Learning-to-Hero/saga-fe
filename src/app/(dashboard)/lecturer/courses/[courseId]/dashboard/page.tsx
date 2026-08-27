import { notFound } from "next/navigation";
import { MOCK_PRN212_DASHBOARD } from "@/features/lecturer/class-dashboard/data/mock-course-dashboard";
import { LecturerCourseDashboardPage } from "@/features/lecturer/class-dashboard/components/lecturer-course-dashboard-page";

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function CourseDashboardRoute({ params }: Props) {
  const { courseId } = await params;
  // MOCK: only allow prn212-01 for now
  if (courseId !== "prn212-01") notFound();

  return <LecturerCourseDashboardPage initialData={MOCK_PRN212_DASHBOARD} />;
}
