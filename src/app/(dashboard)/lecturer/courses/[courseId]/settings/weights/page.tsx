import { Metadata } from "next";
import { UnsupportedFeatureNotice } from "@/features/lecturer/courses/components/unsupported-feature-notice";

export const metadata: Metadata = {
  title: "Cấu hình trọng số - SAGA",
};

interface PageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function LecturerCourseWeightConfigRoute({ params }: PageProps) {
  const { courseId } = await params;
  return (
    <UnsupportedFeatureNotice
      courseId={courseId}
      title="Cấu hình trọng số chưa được hỗ trợ"
      description="API cấu hình trọng số không thuộc phạm vi quản trị lớp và phân nhóm."
    />
  );
}
