"use client";

import { Suspense } from "react";
import { Loader2Icon, AlertCircleIcon } from "lucide-react";
import { useStudentCourseContext } from "@/features/student/courses/hooks/use-student-course-context";
import { useStudentMyTeam } from "@/features/student/courses/hooks/use-student-courses";
import { StudentAiHubPage } from "@/features/ai/components/student/student-ai-hub-page";

function StudentAiPageContent() {
  const { courseId, isLoading: isContextLoading } = useStudentCourseContext();
  const myTeamQuery = useStudentMyTeam(courseId, { enabled: Boolean(courseId) });

  if (isContextLoading || myTeamQuery.isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-3">
        <Loader2Icon className="w-6 h-6 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground">Đang tải thông tin dự án...</span>
      </div>
    );
  }

  const projectId = myTeamQuery.data?.projectId;

  if (!projectId) {
    return (
      <div className="p-12 rounded-3xl border border-dashed border-border bg-card text-center space-y-3 max-w-xl mx-auto mt-8">
        <AlertCircleIcon className="w-8 h-8 text-amber-500 mx-auto" />
        <h3 className="text-base font-bold text-foreground">Chưa có dự án được liên kết</h3>
        <p className="text-xs text-muted-foreground">
          Bạn cần tham gia một nhóm có dự án hoạt động trong môn học này để sử dụng các tính năng Trí tuệ Nhân tạo.
        </p>
      </div>
    );
  }

  return <StudentAiHubPage projectId={projectId} />;
}

export default function StudentAiPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 flex items-center justify-center">
          <Loader2Icon className="w-6 h-6 animate-spin text-primary" />
        </div>
      }
    >
      <StudentAiPageContent />
    </Suspense>
  );
}
