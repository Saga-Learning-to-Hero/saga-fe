"use client";

import type { ReactNode } from "react";
import { CourseQueryError } from "./course-query-error";
import { useLecturerCourse, useLecturerCourseAccess } from "../hooks/use-lecturer-courses";

interface LecturerCourseBoundaryProps {
  courseId: string;
  children: ReactNode;
}

export function LecturerCourseBoundary({ courseId, children }: LecturerCourseBoundaryProps) {
  const trimmedId = courseId.trim();
  const courseQuery = useLecturerCourse(trimmedId);
  const { isAccessDenied } = useLecturerCourseAccess(courseQuery.isError, courseQuery.error);

  if (!trimmedId) {
    return (
      <CourseQueryError
        title="Không tìm thấy lớp học phần"
        error={new Error("Đường dẫn lớp học phần không hợp lệ.")}
      />
    );
  }

  if (isAccessDenied) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Đang chuyển về danh sách lớp...
      </div>
    );
  }

  if (courseQuery.isError) {
    return (
      <CourseQueryError
        title="Không tải được thông tin lớp học phần"
        error={courseQuery.error}
        onRetry={() => void courseQuery.refetch()}
      />
    );
  }

  // Render children ngay khi đang tải để các query song song không bị waterfall.
  return children;
}
