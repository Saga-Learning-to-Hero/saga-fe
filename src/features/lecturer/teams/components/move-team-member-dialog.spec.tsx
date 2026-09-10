import { describe, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { fptTest } from "@/testing/fpt-test-helper";
import { MoveTeamMemberDialog } from "./move-team-member-dialog";
import type { LecturerTeamItem, LecturerTeamMember } from "../types/lecturer-team";

const member: LecturerTeamMember = {
  teamMemberId: "member-1",
  courseEnrollmentId: "enroll-1",
  studentProfileId: "profile-1",
  studentCode: "SE123",
  fullName: "Nguyen Van A",
  email: "a@fpt.edu.vn",
  role: "MEMBER",
};

const currentTeam: LecturerTeamItem = {
  teamId: "team-1",
  teamNo: 1,
  teamName: "Nhom Alpha",
  projectId: null,
  members: [member],
};

const teams: LecturerTeamItem[] = [
  currentTeam,
  {
    teamId: "team-2",
    teamNo: 2,
    teamName: "Nhom Beta",
    projectId: null,
    members: [],
  },
];

describe("MoveTeamMemberDialog", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "10/09/2026",
      description: "Dialog hien thanh vien nguon va cho chon nhom dich",
    },
    () => {
      render(
        <MoveTeamMemberDialog
          open
          member={member}
          currentTeam={currentTeam}
          teams={teams}
          onOpenChange={() => undefined}
          onConfirm={() => undefined}
        />
      );

      expect(screen.getByText("Nguyen Van A")).toBeInTheDocument();
      expect(screen.getByText("Nhom Alpha")).toBeInTheDocument();
      expect(screen.getByText("Chọn nhóm khác trong lớp")).toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "A",
      executedDate: "10/09/2026",
      description: "Khong cho dong dialog khi mutation dang chay",
    },
    async () => {
      const onOpenChange = vi.fn();
      const user = userEvent.setup();
      render(
        <MoveTeamMemberDialog
          open
          member={member}
          currentTeam={currentTeam}
          teams={teams}
          isSaving
          onOpenChange={onOpenChange}
          onConfirm={() => undefined}
        />
      );

      await user.click(screen.getByRole("button", { name: "Hủy" }));
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(screen.getByRole("button", { name: "Đang chuyển..." })).toBeDisabled();
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "B",
      executedDate: "10/09/2026",
      description: "Huy khi khong pending se dong va reset lua chon nhom dich",
    },
    async () => {
      const onOpenChange = vi.fn();
      const user = userEvent.setup();
      render(
        <MoveTeamMemberDialog
          open
          member={member}
          currentTeam={currentTeam}
          teams={teams}
          onOpenChange={onOpenChange}
          onConfirm={() => undefined}
        />
      );

      await user.click(screen.getByRole("button", { name: "Nhóm đích" }));
      await user.click(screen.getByText("Nhom Beta"));
      await user.click(screen.getByRole("button", { name: "Hủy" }));
      expect(onOpenChange).toHaveBeenCalledWith(false);
    }
  );
});
