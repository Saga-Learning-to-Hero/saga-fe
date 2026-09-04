import { Metadata } from "next";
import { LecturerGraphView } from "@/features/graph/components/lecturer-graph-view";

export const metadata: Metadata = {
  title: "Giám sát Đồ thị Nhóm & SNA | Giảng viên SAGA",
  description: "Trung tâm giám sát toàn bộ các nhóm đồ án, theo dõi Traceability và phân tích mạng lưới SNA cho Giảng viên.",
};

export default function LecturerGraphPage() {
  return <LecturerGraphView />;
}
