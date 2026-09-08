import { Metadata } from "next";
import { UnsupportedFeatureNotice } from "@/features/lecturer/courses/components/unsupported-feature-notice";

export const metadata: Metadata = {
  title: "Giám sát Đồ thị Nhóm & SNA | Giảng viên SAGA",
  description: "Trung tâm giám sát toàn bộ các nhóm đồ án, theo dõi Traceability và phân tích mạng lưới SNA cho Giảng viên.",
};

export default async function LecturerGraphPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return (
    <UnsupportedFeatureNotice
      courseId={courseId}
      title="Đồ thị SNA chưa được hỗ trợ"
      description="API đồ thị và phân tích mạng lưới không thuộc phạm vi quản trị lớp và phân nhóm."
    />
  );
}
