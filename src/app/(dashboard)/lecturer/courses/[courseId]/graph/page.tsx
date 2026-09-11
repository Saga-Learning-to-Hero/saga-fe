import { Metadata } from "next";
import { LecturerGraphView } from "@/features/graph/components/lecturer-graph-view";

export const metadata: Metadata = {
  title: "Đồ thị & Mạng lưới SNA | Giảng viên SAGA",
  description:
    "Theo dõi liên kết công việc, commit, đối soát nguồn gốc và mạng lưới tương tác SNA của các dự án nhóm trong lớp học phần.",
};

export default async function LecturerGraphPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 pb-12">
      <LecturerGraphView courseId={courseId} />
    </div>
  );
}
