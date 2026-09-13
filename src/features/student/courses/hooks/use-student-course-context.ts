"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { mapStudentCourseResponse, type StudentCourse } from "../types/student-course";
import { useStudentCourses } from "./use-student-courses";

function courseIdOf(course: StudentCourse | null | undefined): string {
  return course?.courseId || course?.id || "";
}

export function studentCoursePath(pathname: string, courseId: string): string {
  const params = new URLSearchParams();
  params.set("courseId", courseId);
  return `${pathname}?${params.toString()}`;
}

/**
 * Đồng bộ ngữ cảnh lớp học giữa URL và store. URL luôn quyết định khi có `courseId`;
 * không tự chọn phần tử đầu tiên của danh sách course.
 */
export function useStudentCourseContext() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, selectedCourse, setSelectedCourse } = useAuthStore();
  const requestedCourseId = searchParams.get("courseId")?.trim() || "";
  const coursesQuery = useStudentCourses({ enabled: user?.role === "STUDENT" });
  const courses = useMemo(
    () => (coursesQuery.data || []).map(mapStudentCourseResponse),
    [coursesQuery.data]
  );

  const course = useMemo(() => {
    if (requestedCourseId) {
      return courses.find((item) => courseIdOf(item) === requestedCourseId) || null;
    }

    const selectedCourseId = courseIdOf(selectedCourse);
    return selectedCourseId && courses.some((item) => courseIdOf(item) === selectedCourseId)
      ? selectedCourse
      : null;
  }, [courses, requestedCourseId, selectedCourse]);

  useEffect(() => {
    if (requestedCourseId && course && courseIdOf(selectedCourse) !== requestedCourseId) {
      setSelectedCourse(course);
      return;
    }

    const selectedCourseId = courseIdOf(selectedCourse);
    if (!requestedCourseId && selectedCourseId) {
      router.replace(studentCoursePath(pathname, selectedCourseId));
    }
  }, [course, pathname, requestedCourseId, router, selectedCourse, setSelectedCourse]);

  const selectCourse = (nextCourse: StudentCourse, targetPath = pathname) => {
    setSelectedCourse(nextCourse);
    router.push(studentCoursePath(targetPath, courseIdOf(nextCourse)));
  };

  return {
    course,
    // Khi URL chÆ°a Ä‘Æ°á»£c canonical hoÃ¡ sau hydrate, dÃ¹ng course Ä‘Ã£ chá»n táº¡m thá»i
    // Ä‘á»ƒ trÃ¡nh gá»i API vá»›i id rá»—ng. URL váº«n lÃ  nguá»“n Æ°u tiÃªn khi cÃ³ courseId.
    courseId: requestedCourseId || courseIdOf(course),
    courses,
    isLoading: coursesQuery.isLoading,
    isError: coursesQuery.isError,
    error: coursesQuery.error,
    refetch: coursesQuery.refetch,
    hasRequestedCourse: Boolean(requestedCourseId),
    isInvalidCourse: Boolean(requestedCourseId && !coursesQuery.isLoading && !course),
    selectCourse,
  };
}
