import { UnsupportedFeatureNotice } from "@/features/lecturer/courses/components/unsupported-feature-notice";

export default async function LecturerTeamProjectDetailPage({
  params,
}: {
  params: Promise<{ courseId: string; teamId: string }>;
}) {
  const { courseId } = await params;
  return (
    <UnsupportedFeatureNotice
      courseId={courseId}
      title="Hoạt động dự án nhóm chưa được hỗ trợ"
      description="Giảng viên không tạo dự án và không gọi API GitHub/Jira từ màn hình này. teamId chỉ dùng để hiển thị khi backend có chức năng phù hợp."
    />
  );
}
