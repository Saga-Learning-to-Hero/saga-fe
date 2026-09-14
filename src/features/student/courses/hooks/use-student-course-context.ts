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

export function getStudentCourseContextRedirect({
  pathname,
  requestedCourseId,
  selectedCourseId,
  availableCourseIds,
  isCoursesReady,
}: {
  pathname: string;
  requestedCourseId: string;
  selectedCourseId: string;
  availableCourseIds: string[];
  isCoursesReady: boolean;
}): string | null {
  if (!isCoursesReady || pathname === "/student/courses") return null;

  if (requestedCourseId) {
    return availableCourseIds.includes(requestedCourseId) ? null : "/student/courses";
  }

  if (!selectedCourseId || !availableCourseIds.includes(selectedCourseId)) {
    return "/student/courses";
  }

  return studentCoursePath(pathname, selectedCourseId);
}

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
    const selectedCourseId = courseIdOf(selectedCourse);
    const redirectPath = getStudentCourseContextRedirect({
      pathname,
      requestedCourseId,
      selectedCourseId,
      availableCourseIds: courses.map(courseIdOf),
      isCoursesReady: coursesQuery.isSuccess,
    });

    if (redirectPath) {
      if (redirectPath === "/student/courses" && selectedCourse) {
        setSelectedCourse(null);
      }
      router.replace(redirectPath);
      return;
    }

    if (requestedCourseId && course && courseIdOf(selectedCourse) !== requestedCourseId) {
      setSelectedCourse(course);
      return;
    }

    if (!requestedCourseId && selectedCourseId) {
      router.replace(studentCoursePath(pathname, selectedCourseId));
    }
  }, [course, courses, coursesQuery.isSuccess, pathname, requestedCourseId, router, selectedCourse, setSelectedCourse]);

  const selectCourse = (nextCourse: StudentCourse, targetPath = pathname) => {
    setSelectedCourse(nextCourse);
    router.push(studentCoursePath(targetPath, courseIdOf(nextCourse)));
  };

  return {
    course,
    courseId: courseIdOf(course),
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
