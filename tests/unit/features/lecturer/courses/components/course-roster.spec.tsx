import { describe, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { fptTest } from "@/testing/fpt-test-helper";
import { CourseRoster } from "@/features/lecturer/courses/components/course-roster";

vi.mock("next/link", () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/features/lecturer/courses/hooks/use-lecturer-courses", () => ({
  useLecturerRoster: () => ({
    data: {
      courseId: "course-1",
      classCode: "SE1705",
      enrolledCount: 2,
      entries: [
        {
          courseEnrollmentId: "enr-1",
          studentProfileId: "stu-1",
          studentCode: "SE111111",
          fullName: "Alpha Leader",
          email: "alpha@gmail.com",
          classCode: "SE1705",
          avatarUrl: "https://cdn.example.com/alpha.png",
        },
        {
          courseEnrollmentId: "enr-2",
          studentProfileId: "stu-2",
          studentCode: "SE222222",
          fullName: "Beta Member",
          email: "beta@gmail.com",
          classCode: "SE1705",
          avatarUrl: null,
        },
      ],
    },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  useRemoveLecturerEnrollment: () => ({
    isPending: false,
    mutateAsync: vi.fn(),
  }),
}));

vi.mock("@/features/lecturer/teams/hooks/use-lecturer-teams", () => ({
  useLecturerTeams: () => ({
    data: { courseId: "course-1", teams: [] },
    isLoading: false,
    isError: false,
  }),
}));

describe("CourseRoster avatars", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "30/09/2026",
      description: "Roster giang vien hien anh khi avatarUrl hop le",
    },
    () => {
      render(<CourseRoster courseId="course-1" />);
      expect(screen.getByAltText("Alpha Leader")).toHaveAttribute(
        "src",
        "https://cdn.example.com/alpha.png"
      );
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "A",
      executedDate: "30/09/2026",
      description: "Roster giang vien avatarUrl null van hien initials",
    },
    () => {
      render(<CourseRoster courseId="course-1" />);
      expect(screen.getByText("BM")).toBeInTheDocument();
      expect(screen.queryByAltText("Beta Member")).not.toBeInTheDocument();
    }
  );
});
