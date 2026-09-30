import { describe, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { fptTest } from "@/testing/fpt-test-helper";
import { TeamMembersCard } from "@/features/student/project/components/team-members-card";
import type { StudentTeamResponse } from "@/features/student/courses/types/student-course";

const team: StudentTeamResponse = {
  teamId: "team-1",
  teamNo: 1,
  teamName: "SAGA Team",
  myRole: "MEMBER",
  projectId: null,
  members: [
    {
      studentCode: "SE111111",
      fullName: "Alpha Leader",
      role: "LEADER",
      avatarUrl: "https://cdn.example.com/alpha.png",
    },
    {
      studentCode: "SE222222",
      fullName: "Beta Member",
      role: "MEMBER",
      avatarUrl: null,
    },
  ],
};

describe("TeamMembersCard avatars", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "30/09/2026",
      description: "Hien AvatarImage khi member.avatarUrl hop le",
    },
    () => {
      render(<TeamMembersCard team={team} />);
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
      description: "avatarUrl null van hien initials, khong src anh",
    },
    () => {
      render(<TeamMembersCard team={team} />);
      expect(screen.getByText("BE")).toBeInTheDocument();
      expect(screen.queryByAltText("Beta Member")).not.toBeInTheDocument();
    }
  );
});
