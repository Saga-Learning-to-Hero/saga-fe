import { describe, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { fptTest } from "@/testing/fpt-test-helper";
import type { ProjectSprintResponse } from "@/features/student/sprint-progress/types/jira-task-types";
import type { PeerReviewCandidate, PeerReviewCandidatesResponse, PeerReviewRubric } from "../types/peer-review";

const mocks = vi.hoisted(() => {
  const fourCriteria = [
    { rubricId: "r-attitude", criteriaName: "Thái độ hợp tác", description: "Tinh thần làm việc nhóm" },
    { rubricId: "r-quality", criteriaName: "Chất lượng công việc", description: "Độ hoàn thiện" },
    { rubricId: "r-deadline", criteriaName: "Đúng hạn", description: "Giao đúng hạn" },
    { rubricId: "r-communication", criteriaName: "Giao tiếp", description: "Phản hồi" },
  ];
  const twoCandidates: PeerReviewCandidate[] = [
    {
      studentId: "stu-2",
      studentCode: "SE2",
      fullName: "Nguyen Van B",
      alreadyReviewed: false,
      existingReviewId: null,
      existingTotalStarRating: null,
    },
    {
      studentId: "stu-3",
      studentCode: "SE3",
      fullName: "Nguyen Van C",
      alreadyReviewed: true,
      existingReviewId: "pr-old",
      existingTotalStarRating: 16,
    },
  ];
  const idle = {
    isLoading: false,
    isFetching: false,
    isSuccess: true,
    isError: false,
    error: null,
    refetch: vi.fn(),
  };
  return {
    fourCriteria,
    twoCandidates,
    defaultRubricEnabled: { value: undefined as boolean | undefined },
    candidatesEnabled: { value: undefined as boolean | undefined },
    courseContext: {
      course: { code: "SWP391", name: "Ky thuat phan mem" },
      courseId: "course-1",
      isLoading: false,
      isInvalidCourse: false,
    },
    teamQuery: {
      ...idle,
      data: {
        teamId: "team-1",
        teamName: "Nhom Alpha",
        projectId: "proj-1" as string | null,
        myRole: "LEADER",
        members: [
          { studentCode: "SE1", fullName: "Toi", role: "LEADER" },
          { studentCode: "SE2", fullName: "Nguyen Van B", role: "MEMBER" },
          { studentCode: "SE3", fullName: "Nguyen Van C", role: "MEMBER" },
        ],
      },
      isWaitingForTeam: false,
    },
    sprintsQuery: {
      ...idle,
      data: [] as ProjectSprintResponse[],
    },
    teamRubricQuery: {
      ...idle,
      data: {
        teamId: "team-1",
        subjectId: "subject-1",
        criteria: fourCriteria,
      } as PeerReviewRubric,
    },
    defaultRubricQuery: {
      ...idle,
      data: {
        teamId: null,
        subjectId: null,
        criteria: [{ rubricId: "r-default", criteriaName: "Chất lượng", description: null }],
      } as PeerReviewRubric,
    },
    candidatesQuery: {
      ...idle,
      data: {
        teamId: "team-1",
        sprintId: "sprint-closed",
        reviewerId: "stu-1",
        candidates: twoCandidates,
      } as PeerReviewCandidatesResponse,
    },
  };
});

vi.mock("@/features/student/courses/hooks/use-student-course-context", () => ({
  useStudentCourseContext: () => mocks.courseContext,
}));

vi.mock("@/features/student/courses/hooks/use-student-courses", () => ({
  useRefreshStudentCourses: () => vi.fn(),
  useStudentMyTeam: () => mocks.teamQuery,
}));

vi.mock("@/features/student/sprint-progress/hooks/use-project-sprints", () => ({
  useProjectSprints: (_projectId?: string | null, options?: { enabled?: boolean }) => {
    if (options?.enabled === false) {
      return {
        data: [],
        isLoading: false,
        isFetching: false,
        isSuccess: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      };
    }
    return mocks.sprintsQuery;
  },
}));

vi.mock("../hooks/use-peer-review", () => ({
  useTeamPeerReviewRubric: () => mocks.teamRubricQuery,
  useDefaultPeerReviewRubric: (options?: { enabled?: boolean }) => {
    mocks.defaultRubricEnabled.value = options?.enabled;
    return mocks.defaultRubricQuery;
  },
  usePeerReviewCandidates: (_teamId: string, _sprintId: string, options?: { enabled?: boolean }) => {
    mocks.candidatesEnabled.value = options?.enabled;
    return mocks.candidatesQuery;
  },
}));

vi.mock("./peer-review-modal", () => ({
  PeerReviewModal: ({ open }: { open: boolean }) => (open ? <div>peer-review-modal</div> : null),
}));

import { PeerAssessmentView } from "./peer-assessment-view";

const HOUR = 60 * 60 * 1000;

function closedSprint(): ProjectSprintResponse {
  return {
    id: "sprint-closed",
    name: "Sprint 1",
    state: "closed",
    endDate: "2026-09-01T00:00:00.000Z",
  };
}

function futureSprint(): ProjectSprintResponse {
  return {
    id: "sprint-future",
    name: "Sprint tuong lai",
    state: "active",
    endDate: new Date(Date.now() + 10 * 24 * HOUR).toISOString(),
  };
}

describe("PeerAssessmentView", () => {
  beforeEach(() => {
    mocks.defaultRubricEnabled.value = undefined;
    mocks.candidatesEnabled.value = undefined;
    mocks.courseContext.courseId = "course-1";
    mocks.courseContext.isLoading = false;
    mocks.courseContext.isInvalidCourse = false;
    mocks.teamQuery.data = {
      teamId: "team-1",
      teamName: "Nhom Alpha",
      projectId: "proj-1",
      myRole: "LEADER",
      members: [
        { studentCode: "SE1", fullName: "Toi", role: "LEADER" },
        { studentCode: "SE2", fullName: "Nguyen Van B", role: "MEMBER" },
        { studentCode: "SE3", fullName: "Nguyen Van C", role: "MEMBER" },
      ],
    };
    mocks.teamQuery.isWaitingForTeam = false;
    mocks.teamQuery.isError = false;
    mocks.sprintsQuery.data = [closedSprint()];
    mocks.sprintsQuery.isError = false;
    mocks.teamRubricQuery.data = {
      teamId: "team-1",
      subjectId: "subject-1",
      criteria: mocks.fourCriteria,
    };
    mocks.teamRubricQuery.isSuccess = true;
    mocks.teamRubricQuery.isLoading = false;
    mocks.defaultRubricQuery.isSuccess = false;
    mocks.defaultRubricQuery.isFetching = false;
    mocks.candidatesQuery.data = {
      teamId: "team-1",
      sprintId: "sprint-closed",
      reviewerId: "stu-1",
      candidates: mocks.twoCandidates,
    };
  });

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "15/09/2026",
      description: "Bon tieu chi team hien thi, hai candidate thanh card, khong goi default",
    },
    () => {
      render(<PeerAssessmentView />);
      expect(screen.getByText("Nguyen Van B")).toBeTruthy();
      expect(screen.getByText("Nguyen Van C")).toBeTruthy();
      expect(screen.getByRole("button", { name: "Đánh giá" })).toBeTruthy();
      expect(screen.getByRole("button", { name: "Đã đánh giá" })).toBeDisabled();
      expect(screen.queryByRole("button", { name: "Đánh giá lại" })).toBeNull();
      expect(screen.getByText(/Tiêu chí: 4/)).toBeTruthy();
      expect(screen.getByText(/Tiêu chí môn học/)).toBeTruthy();
      expect(screen.getByText(/Đã gửi 1\/2/)).toBeTruthy();
      expect(screen.queryByText(/sắp mở|đang chờ API|nhóm đồ án/i)).toBeNull();
      expect(mocks.defaultRubricEnabled.value).toBe(false);
      expect(mocks.candidatesEnabled.value).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "A",
      executedDate: "15/09/2026",
      description: "Khong goi candidates khi Sprint chua du dieu kien",
    },
    () => {
      mocks.sprintsQuery.data = [futureSprint()];
      render(<PeerAssessmentView />);
      expect(screen.getByText(/Sprint chưa đến hạn đánh giá/i)).toBeTruthy();
      expect(screen.queryByText("Nguyen Van B")).toBeNull();
      expect(mocks.candidatesEnabled.value).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "A",
      executedDate: "15/09/2026",
      description: "Fallback default rubric chi khi criteria team rong",
    },
    () => {
      mocks.teamRubricQuery.data = { teamId: "team-1", subjectId: "subject-1", criteria: [] };
      mocks.defaultRubricQuery.isSuccess = true;
      render(<PeerAssessmentView />);
      expect(mocks.defaultRubricEnabled.value).toBe(true);
      expect(screen.getByText("Nguyen Van B")).toBeTruthy();
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "B",
      executedDate: "15/09/2026",
      description: "Member co cung quyen cham, loc self-review bang reviewerId, hien tong sao / max",
    },
    () => {
      mocks.teamQuery.data = {
        ...mocks.teamQuery.data,
        myRole: "MEMBER",
      };
      mocks.candidatesQuery.data = {
        teamId: "team-1",
        sprintId: "sprint-closed",
        reviewerId: "stu-self",
        candidates: [
          {
            studentId: "stu-self",
            studentCode: "SE1",
            fullName: "Chinh minh",
            alreadyReviewed: false,
            existingReviewId: null,
            existingTotalStarRating: null,
          },
          {
            studentId: "stu-2",
            studentCode: "SE2",
            fullName: "Nguyen Van B",
            alreadyReviewed: true,
            existingReviewId: "pr-1",
            existingTotalStarRating: 16,
          },
        ],
      };
      render(<PeerAssessmentView />);
      expect(screen.getAllByText("Thành viên").length).toBeGreaterThan(0);
      expect(screen.queryByText("Chinh minh")).toBeNull();
      expect(screen.getByText(/Đã gửi · 16 \/ 20/)).toBeTruthy();
      expect(screen.getByRole("button", { name: "Đã đánh giá" })).toBeDisabled();
      expect(screen.queryByRole("button", { name: "Đánh giá lại" })).toBeNull();
      expect(screen.getByText(/Không tải bảng kết quả toàn nhóm/i)).toBeTruthy();
      expect(screen.queryByRole("table")).toBeNull();
      expect(screen.queryByText(/điểm trung bình/i)).toBeNull();
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "A",
      executedDate: "15/09/2026",
      description: "Nhom chua co du an hien trang thai ro, khong goi candidates",
    },
    () => {
      mocks.teamQuery.data = {
        ...mocks.teamQuery.data,
        projectId: null,
        myRole: "LEADER",
      };
      render(<PeerAssessmentView />);
      expect(screen.getByText("Nhóm chưa có dự án")).toBeTruthy();
      expect(mocks.candidatesEnabled.value).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "B",
      executedDate: "15/09/2026",
      description: "Chuyen team rubric rong sang default hien skeleton, khong nhay empty",
    },
    () => {
      mocks.teamRubricQuery.data = { teamId: "team-1", subjectId: null, criteria: [] };
      mocks.teamRubricQuery.isSuccess = true;
      mocks.defaultRubricQuery.isSuccess = false;
      mocks.defaultRubricQuery.isFetching = true;
      mocks.defaultRubricQuery.data = { teamId: null, subjectId: null, criteria: [] };
      render(<PeerAssessmentView />);
      expect(mocks.defaultRubricEnabled.value).toBe(true);
      expect(screen.queryByText("Chưa có tiêu chí đánh giá")).toBeNull();
    }
  );
});
