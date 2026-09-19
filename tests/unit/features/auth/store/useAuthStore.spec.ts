import { afterEach, describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

const studentA = {
  id: "student-a",
  name: "Student A",
  email: "a@example.com",
  avatar: "",
  role: "STUDENT" as const,
};

const studentB = {
  id: "student-b",
  name: "Student B",
  email: "b@example.com",
  avatar: "",
  role: "STUDENT" as const,
};

const selectedCourse = {
  id: "course-a",
  courseId: "course-a",
  code: "SWR302",
  subjectCode: "SWR302",
  subjectName: "Software Requirement",
  semesterCode: "SU26",
  semesterName: "Summer 2026",
  adminClassCode: "SE1802",
  adminClassName: "SE1802",
  status: "ACTIVE" as const,
  studentsCount: 1,
};

afterEach(() => {
  useAuthStore.setState({
    isAuthenticated: false,
    user: null,
    selectedCourse: null,
    passwordSetupRequired: false,
  });
});

describe("useAuthStore", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "A",
      executedDate: "14/09/2026",
      description: "Doi tai khoan khong duoc giu lai hoc phan cua tai khoan truoc",
    },
    () => {
      useAuthStore.getState().setUser(studentA);
      useAuthStore.getState().setSelectedCourse(selectedCourse);
      useAuthStore.getState().setUser(studentB);

      expect(useAuthStore.getState().selectedCourse).toBeNull();
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "14/09/2026",
      description: "Cung tai khoan giu lai hoc phan da chon khi khoi phuc session",
    },
    () => {
      useAuthStore.getState().setUser(studentA);
      useAuthStore.getState().setSelectedCourse(selectedCourse);
      useAuthStore.getState().setUser({ ...studentA, fullName: "Student A Updated" });

      expect(useAuthStore.getState().selectedCourse?.courseId).toBe("course-a");
    }
  );
});
