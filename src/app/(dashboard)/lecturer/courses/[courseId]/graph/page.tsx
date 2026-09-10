import { Metadata } from "next";
import { LecturerMonitoringPreview } from "@/features/lecturer/courses/components/lecturer-monitoring-preview";

export const metadata: Metadata = {
  title: "Liên kết công việc và commit | Giảng viên SAGA",
  description:
    "Theo dõi liên kết công việc và commit của các dự án nhóm trong lớp học phần.",
};

export default async function LecturerGraphPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <LecturerMonitoringPreview key={courseId} courseId={courseId} kind="graph" />;
}
