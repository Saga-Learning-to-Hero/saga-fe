import { Metadata } from "next";
import { LecturerMonitoringPreview } from "@/features/lecturer/courses/components/lecturer-monitoring-preview";

export const metadata: Metadata = {
  title: "Giám sát đồ thị nhóm & SNA | Giảng viên SAGA",
  description:
    "Trung tâm giám sát toàn bộ các dự án nhóm, theo dõi Traceability và phân tích mạng lưới SNA cho giảng viên.",
};

export default async function LecturerGraphPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <LecturerMonitoringPreview key={courseId} courseId={courseId} kind="graph" />;
}
