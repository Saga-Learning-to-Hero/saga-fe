import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import { getStudentCourseContextRedirect } from "./use-student-course-context";

describe("getStudentCourseContextRedirect", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "14/09/2026",
      description: "Student khong co hoc phan da chon duoc chuyen ve trang chon hoc phan",
    },
    () => {
      expect(
        getStudentCourseContextRedirect({
          pathname: "/student/sprint-progress",
          requestedCourseId: "",
          selectedCourseId: "",
          availableCourseIds: ["course-a"],
          isCoursesReady: true,
        })
      ).toBe("/student/courses");
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "14/09/2026",
      description: "CourseId cua tai khoan khac khong duoc dung de goi trang nghiep vu",
    },
    () => {
      expect(
        getStudentCourseContextRedirect({
          pathname: "/student/commits",
          requestedCourseId: "course-of-another-student",
          selectedCourseId: "course-a",
          availableCourseIds: ["course-a"],
          isCoursesReady: true,
        })
      ).toBe("/student/courses");
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "14/09/2026",
      description: "Course hop le duoc canonical hoa vao URL truoc khi tai du lieu nghiep vu",
    },
    () => {
      expect(
        getStudentCourseContextRedirect({
          pathname: "/student/dashboard",
          requestedCourseId: "",
          selectedCourseId: "course-a",
          availableCourseIds: ["course-a"],
          isCoursesReady: true,
        })
      ).toBe("/student/dashboard?courseId=course-a");
    }
  );
});
