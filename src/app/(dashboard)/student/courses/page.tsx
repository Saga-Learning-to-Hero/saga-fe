"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { StudentCourseSelection } from "@/features/student/courses/components/student-course-selection";
import type { StudentCourse } from "@/features/student/courses/types/student-course";

export default function StudentCoursesSelectionPage() {
  const router = useRouter();
  const { setSelectedCourse } = useAuthStore();

  const handleSelectCourse = (course: StudentCourse) => {
    setSelectedCourse(course);
    router.push("/student/dashboard");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <StudentCourseSelection onSelectCourse={handleSelectCourse} />
    </div>
  );
}
