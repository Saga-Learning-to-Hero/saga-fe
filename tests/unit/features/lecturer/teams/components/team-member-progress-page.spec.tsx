import { describe, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { fptTest } from "@/testing/fpt-test-helper";
import { TeamMemberProgressPage } from "@/features/lecturer/teams/components/team-member-progress-page";
import type { LecturerTeamItem } from "@/features/lecturer/teams/types/lecturer-team";

const mockMember = {
  teamMemberId: "tm-1",
  courseEnrollmentId: "ce-1",
  studentProfileId: "sp-1",
  studentCode: "SE183904",
  fullName: "Le Hoang Hai",
  email: "hai@fpt.edu.vn",
  role: "LEADER" as const,
};

const mockMember2 = {
  teamMemberId: "tm-2",
  courseEnrollmentId: "ce-2",
  studentProfileId: "sp-2",
  studentCode: "SE183905",
  fullName: "Tran Van B",
  email: "b@fpt.edu.vn",
  role: "MEMBER" as const,
};

const mockTeam: LecturerTeamItem = {
  teamId: "team-1",
  teamNo: 1,
  teamName: "SAGA Team",
  projectId: "proj-1",
  members: [mockMember, mockMember2],
};

const mockProgressData = {
  studentId: "sp-1",
  studentCode: "SE183904",
  fullName: "Le Hoang Hai",
  teamRole: "LEADER",
  taskSummary: {
    assigned: 57,
    completed: 49,
    incomplete: 8,
    inProgress: 8,
  },
  commitSummary: {
    total: 110,
    linkedToTasks: 106,
    tasksWithLinkedCommits: 58,
    lastCommitAt: "2026-09-21T19:35:00Z",
  },
  evidenceSummary: {
    workSessions: 7,
    files: 0,
    webLinks: 2,
    confirmations: 1,
  },
  assignedTasks: [
    {
      id: "task-1",
      externalKey: "SAGA-98",
      title: "Tich hop Trung tam Giam sat Do thi",
      status: "IN_REVIEW",
      storyPoints: 5,
    },
    {
      id: "task-2",
      externalKey: "SAGA-96",
      title: "Xay dung Dong thoi gian Phien lam viec",
      status: "DONE",
      storyPoints: 3,
    },
  ],
};

const mocks = {
  courseQuery: { isLoading: false, isError: false, data: { id: "course-1", code: "SWP391" } },
  teamsQuery: {
    isLoading: false,
    isError: false,
    data: { teams: [mockTeam] },
    refetch: vi.fn(),
  },
  progressQuery: {
    isLoading: false,
    isError: false,
    error: null as unknown,
    data: mockProgressData,
    refetch: vi.fn(),
  },
};

vi.mock("@/features/lecturer/courses/hooks/use-lecturer-courses", () => ({
  useLecturerCourse: () => mocks.courseQuery,
  useLecturerCourseAccess: () => ({ isAccessDenied: false, errorCode: undefined }),
}));

vi.mock("@/features/lecturer/teams/hooks/use-lecturer-teams", () => ({
  useLecturerTeams: () => mocks.teamsQuery,
}));

vi.mock("@/features/student/project/hooks/useProjectSync", () => ({
  useMemberProgress: () => mocks.progressQuery,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => "/lecturer/courses/course-1/teams/team-1/members/sp-1",
  useSearchParams: () => new URLSearchParams(),
}));

describe("TeamMemberProgressPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.teamsQuery.isLoading = false;
    mocks.teamsQuery.isError = false;
    mocks.teamsQuery.data = { teams: [mockTeam] };
    mocks.progressQuery.isLoading = false;
    mocks.progressQuery.isError = false;
    mocks.progressQuery.error = null;
    mocks.progressQuery.data = mockProgressData;
  });

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "21/09/2026",
      description: "Hien thi ho so minh chung, cac the KPI va danh sach task cua thanh vien",
    },
    () => {
      render(
        <TeamMemberProgressPage
          courseId="course-1"
          teamId="team-1"
          studentId="sp-1"
        />
      );

      expect(screen.getAllByText("Le Hoang Hai").length).toBeGreaterThan(0);
      expect(screen.getAllByText("SE183904").length).toBeGreaterThan(0);
      expect(screen.getByText("Tiến độ Đầu việc (Jira Tasks)")).toBeInTheDocument();
      expect(screen.getByText("Minh chứng Kỹ thuật (GitHub Commits)")).toBeInTheDocument();
      expect(screen.getByText("Tài liệu & Phiên làm việc (Evidence)")).toBeInTheDocument();
      expect(screen.getByText("Tich hop Trung tam Giam sat Do thi")).toBeInTheDocument();
      expect(screen.getByText("Xay dung Dong thoi gian Phien lam viec")).toBeInTheDocument();
      expect(screen.getByText("SAGA-98")).toBeInTheDocument();
      expect(screen.getByText("SAGA-96")).toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "A",
      executedDate: "21/09/2026",
      description: "Hien thi thong bao khong tim thay nhom khi teamId khong ton tai",
    },
    () => {
      render(
        <TeamMemberProgressPage
          courseId="course-1"
          teamId="non-existent-team"
          studentId="sp-1"
        />
      );

      expect(screen.getByText("Không tìm thấy nhóm")).toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "B",
      executedDate: "21/09/2026",
      description: "Loc danh sach task theo trang thai Da xong va tim kiem theo tu khoa",
    },
    async () => {
      const user = userEvent.setup();
      render(
        <TeamMemberProgressPage
          courseId="course-1"
          teamId="team-1"
          studentId="sp-1"
        />
      );

      await user.click(screen.getByRole("button", { name: /Đã xong/ }));
      expect(screen.queryByText("Tich hop Trung tam Giam sat Do thi")).not.toBeInTheDocument();
      expect(screen.getByText("Xay dung Dong thoi gian Phien lam viec")).toBeInTheDocument();

      const searchInput = screen.getByPlaceholderText(/Tìm kiếm task theo mã/);
      await user.type(searchInput, "999");
      expect(screen.getByText("Không tìm thấy task nào phù hợp với bộ lọc hiện tại.")).toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "A",
      executedDate: "21/09/2026",
      description: "Xu ly khi sinh vien khong con thuoc nhom (TEAM_NOT_FOUND)",
    },
    () => {
      mocks.progressQuery.error = { response: { data: { code: "TEAM_NOT_FOUND" } } };
      mocks.progressQuery.data = undefined as unknown as typeof mockProgressData;

      render(
        <TeamMemberProgressPage
          courseId="course-1"
          teamId="team-1"
          studentId="sp-1"
        />
      );

      expect(screen.getByText("Thành viên không còn thuộc nhóm")).toBeInTheDocument();
    }
  );
});
