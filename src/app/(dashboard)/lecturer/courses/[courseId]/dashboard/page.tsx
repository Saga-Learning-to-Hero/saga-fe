import { UnsupportedFeatureNotice } from "@/features/lecturer/courses/components/unsupported-feature-notice";

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function CourseDashboardRoute({ params }: Props) {
  const { courseId } = await params;
  return (
    <UnsupportedFeatureNotice
      courseId={courseId}
      title="Tổng quan lớp học chưa được hỗ trợ"
      description="API dashboard lớp chưa thuộc phạm vi quản trị lớp và phân nhóm. Hãy dùng không gian lớp để xem roster ACTIVE và phân nhóm Excel."
    />
  );
}
