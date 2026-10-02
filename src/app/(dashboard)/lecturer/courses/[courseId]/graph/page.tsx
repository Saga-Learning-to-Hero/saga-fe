import { Metadata } from "next";
import { LecturerGraphView } from "@/features/graph/components/lecturer-graph-view";

export const metadata: Metadata = {
  title: "Đồ thị & Mạng lưới SNA | Giảng viên SAGA",
  description:
    "Theo dõi liên kết công việc, commit, đối soát nguồn gốc và mạng lưới tương tác SNA của các dự án nhóm trong lớp học phần.",
};

export default async function LecturerGraphPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams?: Promise<{
    teamId?: string;
    studentId?: string;
    taskId?: string;
    commitHash?: string;
    commitId?: string;
  }>;
}) {
  const { courseId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const initialTeamId = resolvedSearchParams?.teamId;
  const initialStudentId = resolvedSearchParams?.studentId;
  const initialTaskId = resolvedSearchParams?.taskId;
  const initialCommitHash = resolvedSearchParams?.commitHash;
  const initialCommitId = resolvedSearchParams?.commitId;

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 pb-12">
      <LecturerGraphView
        courseId={courseId}
        initialTeamId={initialTeamId}
        initialStudentId={initialStudentId}
        initialTaskId={initialTaskId}
        initialCommitHash={initialCommitHash}
        initialCommitId={initialCommitId}
      />
    </div>
  );
}
