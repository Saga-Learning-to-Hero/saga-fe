import { UnsupportedFeatureNotice } from "@/features/lecturer/courses/components/unsupported-feature-notice";

export default async function GradebookRoute({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return (
    <UnsupportedFeatureNotice
      courseId={courseId}
      title="Bảng điểm chưa được hỗ trợ"
      description="Chấm điểm và gradebook không thuộc phạm vi phân nhóm. Dữ liệu giả không được hiển thị như API thật."
    />
  );
}
