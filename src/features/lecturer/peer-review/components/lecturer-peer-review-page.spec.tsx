import { describe, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { fptTest } from "@/testing/fpt-test-helper";
import type { ProjectSprintResponse } from "@/features/student/sprint-progress/types/jira-task-types";
import type {
  LecturerPeerReviewListResponse,
  LecturerPeerReviewRubric,
} from "../types/lecturer-peer-review";

const mocks = vi.hoisted(() => {
  const idle = {
    isLoading: false,
    isFetching: false,
    isSuccess: true,
    isError: false,
    isPlaceholderData: false,
    error: null,
    refetch: vi.fn(),
  };
  return {
    navigation: {
      replace: vi.fn(),
      params: new URLSearchParams(),
    },
    sprintsEnabled: { value: undefined as boolean | undefined },
    reviewsEnabled: { value: undefined as boolean | undefined },
    reviewsArgs: { teamId: "", sprintId: "" },
    courseQuery: { ...idle, data: { courseCode: "SWP391" } },
    teamsQuery: {
      ...idle,
      data: {
        teams: [
          {
            teamId: "team-1",
            teamNo: 1,
            teamName: "Alpha",
            projectId: "proj-1" as string | null,
            members: [
              { studentProfileId: "stu-1", fullName: "An", studentCode: "SE1", teamMemberId: "m1", courseEnrollmentId: "e1", email: "a@x", role: "LEADER" },
              { studentProfileId: "stu-2", fullName: "Binh", studentCode: "SE2", teamMemberId: "m2", courseEnrollmentId: "e2", email: "b@x", role: "MEMBER" },
            ],
          },
          {
            teamId: "team-2",
            teamNo: 2,
            teamName: "Beta",
            projectId: null as string | null,
            members: [],
          },
        ],
      },
    },
    sprintsQuery: {
      ...idle,
      data: [
        { id: "sprint-1", name: "Sprint 1", state: "closed", completeDate: "2026-09-01T00:00:00.000Z" },
        { id: "sprint-2", name: "Sprint 2", state: "active" },
      ] as ProjectSprintResponse[],
    },
    rubricQuery: {
      ...idle,
      data: {
        teamId: "team-1",
        subjectId: "subject-1",
        criteria: [
          { rubricId: "r-quality", criteriaName: "Hoàn thành & Chất lượng", description: "Làm đúng task" },
          { rubricId: "r-process", criteriaName: "Tiến độ & Quy trình", description: null },
        ],
      } as LecturerPeerReviewRubric,
    },
    reviewsQuery: {
      ...idle,
      data: {
        teamId: "team-1",
        sprintId: "sprint-1",
        sprintName: "Sprint 1",
        reviews: [
          {
            id: "pr-1",
            sprintId: "sprint-1",
            sprintName: "Sprint 1",
            reviewerId: "stu-1",
            reviewerName: "An",
            revieweeId: "stu-2",
            revieweeName: "Binh",
            starRating: 9,
            criteriaRatings: [
              { rubricId: "r-quality", starRating: 5, criteriaName: null },
              { rubricId: "r-process", starRating: 4, criteriaName: null },
            ],
            comment: "Phối hợp tốt",
            createdAt: "2026-09-14T12:00:00",
            updatedAt: "2026-09-14T12:05:00",
          },
        ],
      } as LecturerPeerReviewListResponse,
    },
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: (href: string, options?: unknown) => {
      mocks.navigation.replace(href, options);
      const query = href.includes("?") ? href.slice(href.indexOf("?") + 1) : "";
      mocks.navigation.params = new URLSearchParams(query);
    },
  }),
  useSearchParams: () => mocks.navigation.params,
  usePathname: () => "/lecturer/courses/course-1/peer-reviews",
}));

vi.mock("@/features/lecturer/courses/hooks/use-lecturer-courses", () => ({
  useLecturerCourse: () => mocks.courseQuery,
  useLecturerCourseAccess: () => ({ isAccessDenied: false, errorCode: undefined }),
}));

vi.mock("@/features/lecturer/teams/hooks/use-lecturer-teams", () => ({
  useLecturerTeams: () => mocks.teamsQuery,
}));

vi.mock("@/features/student/sprint-progress/hooks/use-project-sprints", () => ({
  useProjectSprints: (_projectId?: string | null, options?: { enabled?: boolean }) => {
    mocks.sprintsEnabled.value = options?.enabled;
    if (options?.enabled === false) {
      return { ...mocks.sprintsQuery, data: [], isSuccess: false };
    }
    return mocks.sprintsQuery;
  },
}));

vi.mock("../hooks/use-lecturer-peer-review", () => ({
  useLecturerPeerReviewRubric: () => mocks.rubricQuery,
  useLecturerSprintPeerReviews: (teamId: string, sprintId: string, options?: { enabled?: boolean }) => {
    mocks.reviewsEnabled.value = options?.enabled;
    mocks.reviewsArgs.teamId = teamId;
    mocks.reviewsArgs.sprintId = sprintId;
    return mocks.reviewsQuery;
  },
}));

import { LecturerPeerReviewPage } from "./lecturer-peer-review-page";

function renderPage() {
  const view = render(<LecturerPeerReviewPage courseId="course-1" />);
  return {
    ...view,
    rerenderPage: () => view.rerender(<LecturerPeerReviewPage courseId="course-1" />),
  };
}

describe("LecturerPeerReviewPage", () => {
  beforeEach(() => {
    mocks.sprintsEnabled.value = undefined;
    mocks.reviewsEnabled.value = undefined;
    mocks.reviewsArgs.teamId = "";
    mocks.reviewsArgs.sprintId = "";
    mocks.navigation.replace.mockClear();
    mocks.navigation.params = new URLSearchParams();
    mocks.teamsQuery.isSuccess = true;
    mocks.teamsQuery.isLoading = false;
    mocks.teamsQuery.isError = false;
    mocks.teamsQuery.data = {
      teams: [
        {
          teamId: "team-1",
          teamNo: 1,
          teamName: "Alpha",
          projectId: "proj-1",
          members: [
            { studentProfileId: "stu-1", fullName: "An", studentCode: "SE1", teamMemberId: "m1", courseEnrollmentId: "e1", email: "a@x", role: "LEADER" },
            { studentProfileId: "stu-2", fullName: "Binh", studentCode: "SE2", teamMemberId: "m2", courseEnrollmentId: "e2", email: "b@x", role: "MEMBER" },
          ],
        },
        {
          teamId: "team-2",
          teamNo: 2,
          teamName: "Beta",
          projectId: null,
          members: [],
        },
      ],
    };
    mocks.reviewsQuery.isSuccess = true;
    mocks.reviewsQuery.isLoading = false;
    mocks.reviewsQuery.isFetching = false;
    mocks.reviewsQuery.isError = false;
    mocks.reviewsQuery.isPlaceholderData = false;
    mocks.reviewsQuery.data = {
      teamId: "team-1",
      sprintId: "sprint-1",
      sprintName: "Sprint 1",
      reviews: [
        {
          id: "pr-1",
          sprintId: "sprint-1",
          sprintName: "Sprint 1",
          reviewerId: "stu-1",
          reviewerName: "An",
          revieweeId: "stu-2",
          revieweeName: "Binh",
          starRating: 9,
          criteriaRatings: [
            { rubricId: "r-quality", starRating: 5, criteriaName: null },
            { rubricId: "r-process", starRating: 4, criteriaName: null },
          ],
          comment: "Phối hợp tốt",
          createdAt: "2026-09-14T12:00:00",
          updatedAt: "2026-09-14T12:05:00",
        },
      ],
    };
    mocks.rubricQuery.isSuccess = true;
    mocks.rubricQuery.isError = false;
    mocks.rubricQuery.isLoading = false;
    mocks.rubricQuery.isFetching = false;
    mocks.rubricQuery.data = {
      teamId: "team-1",
      subjectId: "subject-1",
      criteria: [
        { rubricId: "r-quality", criteriaName: "Hoàn thành & Chất lượng", description: "Làm đúng task" },
        { rubricId: "r-process", criteriaName: "Tiến độ & Quy trình", description: null },
      ],
    };
    mocks.reviewsQuery.refetch = vi.fn();
    mocks.rubricQuery.refetch = vi.fn();
  });

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "15/09/2026",
      description: "Mac dinh nhom teamNo nho nhat, render KPI va danh sach danh gia hop nhat",
    },
    () => {
      renderPage();
      const metrics = screen.getByTestId("peer-review-statistics-metrics");
      const filters = screen.getByTestId("peer-review-statistics-filters");
      expect(
        metrics.compareDocumentPosition(filters) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
      expect(screen.getByText("Số lượt đã đánh giá").parentElement?.textContent).toContain("1");
      expect(screen.getByText("Điểm trung bình").parentElement?.textContent).toContain("9/10");
      expect(screen.getByText("Các lượt đánh giá")).toBeTruthy();
      expect(screen.getByText("Người đánh giá")).toBeTruthy();
      expect(screen.getAllByText("Người được đánh giá").length).toBeGreaterThan(0);
      expect(screen.getAllByText("An").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Binh").length).toBeGreaterThan(0);
      expect(screen.getByTestId("peer-review-card-sprint").textContent).toBe("Sprint 1");
      expect(screen.getByTestId("peer-review-comment").textContent).toContain("Nhận xét từ An");
      expect(screen.getByTestId("peer-review-comment").textContent).toContain("Dành cho Binh");
      expect(screen.getByText("Phối hợp tốt")).toBeTruthy();
      const criterionRows = screen.getAllByTestId("peer-review-criterion-row");
      const qualityRow = criterionRows.find((row) =>
        row.textContent?.includes("Hoàn thành & Chất lượng")
      );
      expect(qualityRow).toBeTruthy();
      expect(
        within(qualityRow as HTMLElement).getByLabelText(
          "Hoàn thành & Chất lượng: 5 trên 5 sao"
        )
      ).toBeTruthy();
      expect(screen.queryByText("Phân bố điểm")).toBeNull();
      expect(screen.queryByText("Ma trận đánh giá")).toBeNull();
      expect(screen.queryByText("Bảng đánh giá chi tiết")).toBeNull();
      expect(screen.queryByText("Danh sách bình luận")).toBeNull();
      expect(screen.queryByText(/sắp mở|đang chờ API/i)).toBeNull();
      expect(screen.queryByTestId("peer-review-skeleton")).toBeNull();
      expect(mocks.reviewsEnabled.value).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "A",
      executedDate: "15/09/2026",
      description: "Doi nhom chua co du an reset Sprint va khong goi sprint/review",
    },
    async () => {
      mocks.navigation.params = new URLSearchParams("teamId=team-1&sprintId=sprint-1&revieweeId=stu-2");
      const view = renderPage();
      fireEvent.click(document.getElementById("peer-review-team") as HTMLButtonElement);
      fireEvent.click(screen.getByText(/Nhóm 2 — Beta/));
      const lastHref = String(mocks.navigation.replace.mock.calls.at(-1)?.[0] || "");
      expect(lastHref).toContain("teamId=team-2");
      expect(lastHref).not.toContain("sprintId");
      expect(lastHref).not.toContain("revieweeId");
      view.rerenderPage();
      expect(screen.getByText("Nhóm chưa có dự án")).toBeTruthy();
      expect(mocks.sprintsEnabled.value).toBe(false);
      expect(mocks.reviewsEnabled.value).toBe(false);
    },
    10000
  );

  fptTest(
    {
      id: "UTCID03",
      type: "B",
      executedDate: "15/09/2026",
      description: "Lop chua co nhom hien empty, khong goi reviews",
    },
    () => {
      mocks.teamsQuery.data = { teams: [] };
      renderPage();
      expect(screen.getByText("Lớp học phần chưa có nhóm nào")).toBeTruthy();
      expect(mocks.reviewsEnabled.value).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "15/09/2026",
      description: "Reload URL giu dung nhom, Sprint va nguoi duoc danh gia",
    },
    () => {
      mocks.navigation.params = new URLSearchParams("teamId=team-1&sprintId=sprint-2&revieweeId=stu-2");
      renderPage();
      expect(mocks.reviewsArgs.sprintId).toBe("sprint-2");
      expect(mocks.reviewsEnabled.value).toBe(true);
      expect(document.getElementById("peer-review-reviewee")?.textContent).toContain("Binh");
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "N",
      executedDate: "15/09/2026",
      description: "Trang thai Sprint duoc dich sang tieng Viet",
    },
    async () => {
      renderPage();
      fireEvent.click(document.getElementById("peer-review-sprint") as HTMLButtonElement);
      expect(screen.getByText("Đã kết thúc")).toBeTruthy();
      expect(screen.getByText("Đang diễn ra")).toBeTruthy();
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "A",
      executedDate: "15/09/2026",
      description: "Reviews thanh cong rubric loi hien canh bao nho, khong skeleton",
    },
    () => {
      mocks.rubricQuery.isError = true;
      mocks.rubricQuery.isSuccess = false;
      mocks.rubricQuery.data = undefined as unknown as LecturerPeerReviewRubric;
      renderPage();
      expect(screen.getByText(/Chưa tải được chi tiết tiêu chí/)).toBeTruthy();
      expect(screen.getByText("Số lượt đã đánh giá")).toBeTruthy();
      expect(screen.getByText("Các lượt đánh giá")).toBeTruthy();
      expect(screen.getAllByText("An").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Binh").length).toBeGreaterThan(0);
      expect(screen.queryByText("Không tải được tiêu chí đánh giá")).toBeNull();
      expect(screen.queryByTestId("peer-review-skeleton")).toBeNull();
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "A",
      executedDate: "15/09/2026",
      description: "Reviews loi hien Thu lai, khong render dong thoi skeleton va bang",
    },
    async () => {
      mocks.reviewsQuery.isError = true;
      mocks.reviewsQuery.isSuccess = false;
      mocks.reviewsQuery.data = undefined as unknown as LecturerPeerReviewListResponse;
      renderPage();
      expect(screen.getByText("Không tải được đánh giá chéo")).toBeTruthy();
      expect(screen.queryByTestId("peer-review-skeleton")).toBeNull();
      expect(screen.queryByText("Ma trận đánh giá")).toBeNull();
      fireEvent.click(screen.getByRole("button", { name: "Thử lại" }));
      expect(mocks.reviewsQuery.refetch).toHaveBeenCalled();
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "B",
      executedDate: "15/09/2026",
      description: "Loading chi hien skeleton, khong kem error hay content",
    },
    () => {
      mocks.reviewsQuery.isLoading = true;
      mocks.reviewsQuery.isSuccess = false;
      mocks.reviewsQuery.data = undefined as unknown as LecturerPeerReviewListResponse;
      renderPage();
      expect(screen.getByTestId("peer-review-skeleton")).toBeTruthy();
      expect(screen.queryByText("Ma trận đánh giá")).toBeNull();
      expect(screen.queryByText("Không tải được đánh giá chéo")).toBeNull();
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "B",
      executedDate: "15/09/2026",
      description: "Rubric rong van hien diem, tieu chi va binh luan trong danh sach hop nhat",
    },
    () => {
      mocks.rubricQuery.data = { teamId: "team-1", subjectId: "subject-1", criteria: [] };
      mocks.reviewsQuery.data = {
        ...mocks.reviewsQuery.data,
        reviews: [
          {
            ...mocks.reviewsQuery.data.reviews[0],
            starRating: 5,
            criteriaRatings: [
              { rubricId: "r-quality", starRating: 5, criteriaName: "Hoàn thành & Chất lượng" },
            ],
            comment: "x".repeat(120),
          },
        ],
      };
      renderPage();
      expect(screen.getByText("Điểm trung bình").parentElement?.textContent).toContain("5/5");
      expect(screen.getByText("Hoàn thành & Chất lượng")).toBeTruthy();
      expect(screen.getByText("x".repeat(120))).toBeTruthy();
      expect(screen.queryByText("Phân bố điểm")).toBeNull();
      expect(screen.queryByText("Bảng đánh giá chi tiết")).toBeNull();
      expect(screen.queryByText("Danh sách bình luận")).toBeNull();
    }
  );

  fptTest(
    {
      id: "UTCID10",
      type: "N",
      executedDate: "15/09/2026",
      description: "Loc theo nguoi duoc danh gia chi doi danh sach va giu KPI toan nhom",
    },
    () => {
      mocks.reviewsQuery.data = {
        ...mocks.reviewsQuery.data,
        reviews: [
          ...mocks.reviewsQuery.data.reviews,
          {
            ...mocks.reviewsQuery.data.reviews[0],
            id: "pr-2",
            reviewerId: "stu-2",
            reviewerName: "Binh",
            revieweeId: "stu-1",
            revieweeName: "An",
            starRating: 8,
            comment: null,
          },
        ],
      };
      const view = renderPage();
      expect(screen.getAllByTestId("peer-review-card")).toHaveLength(2);
      expect(screen.getByText("Số lượt đã đánh giá").parentElement?.textContent).toContain("2");

      const trigger = document.getElementById("peer-review-reviewee") as HTMLButtonElement;
      fireEvent.click(trigger);
      const dropdown = trigger.parentElement?.querySelector(".absolute") as HTMLElement;
      fireEvent.click(within(dropdown).getByText("SE2"));
      const filterHref = String(mocks.navigation.replace.mock.calls.at(-1)?.[0] || "");
      expect(filterHref).toContain("teamId=team-1");
      expect(filterHref).toContain("sprintId=sprint-1");
      expect(filterHref).toContain("revieweeId=stu-2");

      view.rerenderPage();
      const cards = screen.getAllByTestId("peer-review-card");
      expect(cards).toHaveLength(1);
      expect(cards[0].getAttribute("data-reviewee-id")).toBe("stu-2");
      expect(screen.getByText(/Hiển thị 1\/2 lượt/)).toBeTruthy();
      expect(screen.getByText("Số lượt đã đánh giá").parentElement?.textContent).toContain("2");
    }
  );

  fptTest(
    {
      id: "UTCID11",
      type: "N",
      executedDate: "15/09/2026",
      description: "Doi Sprint trong cung nhom giu bo loc nguoi duoc danh gia",
    },
    () => {
      mocks.navigation.params = new URLSearchParams("teamId=team-1&sprintId=sprint-1&revieweeId=stu-2");
      renderPage();
      fireEvent.click(document.getElementById("peer-review-sprint") as HTMLButtonElement);
      fireEvent.click(screen.getByText("Sprint 2"));
      const lastHref = String(mocks.navigation.replace.mock.calls.at(-1)?.[0] || "");
      expect(lastHref).toContain("sprintId=sprint-2");
      expect(lastHref).toContain("revieweeId=stu-2");
    }
  );

  fptTest(
    {
      id: "UTCID12",
      type: "B",
      executedDate: "15/09/2026",
      description: "Sinh vien chua nhan danh gia co empty rieng trong khi KPI van giu toan nhom",
    },
    () => {
      mocks.teamsQuery.data.teams[0].members.push({
        studentProfileId: "stu-3",
        fullName: "Chi",
        studentCode: "SE3",
        teamMemberId: "m3",
        courseEnrollmentId: "e3",
        email: "c@x",
        role: "MEMBER",
      });
      mocks.navigation.params = new URLSearchParams("teamId=team-1&sprintId=sprint-1&revieweeId=stu-3");
      renderPage();
      expect(screen.queryByTestId("peer-review-card")).toBeNull();
      expect(screen.getByText("Chưa có thành viên nào đánh giá Chi trong Sprint này.")).toBeTruthy();
      expect(screen.getByText("Số lượt đã đánh giá").parentElement?.textContent).toContain("1");
    }
  );

  fptTest(
    {
      id: "UTCID13",
      type: "N",
      executedDate: "18/09/2026",
      description: "Chon thanh vien o cot trai doi URL revieweeId",
    },
    () => {
      renderPage();
      const items = screen.getAllByTestId("peer-review-reviewee-item");
      const binh = items.find((item) => item.getAttribute("data-reviewee-id") === "stu-2");
      fireEvent.click(binh as HTMLElement);
      const lastHref = String(mocks.navigation.replace.mock.calls.at(-1)?.[0] || "");
      expect(lastHref).toContain("revieweeId=stu-2");
      expect(lastHref).toContain("teamId=team-1");
      expect(lastHref).toContain("sprintId=sprint-1");
    }
  );

  fptTest(
    {
      id: "UTCID14",
      type: "N",
      executedDate: "18/09/2026",
      description: "Tong quan nhom hien thi toan bo luot danh gia theo nguoi duoc danh gia",
    },
    () => {
      mocks.reviewsQuery.data = {
        ...mocks.reviewsQuery.data,
        reviews: [
          ...mocks.reviewsQuery.data.reviews,
          {
            ...mocks.reviewsQuery.data.reviews[0],
            id: "pr-2",
            reviewerId: "stu-2",
            reviewerName: "Binh",
            revieweeId: "stu-1",
            revieweeName: "An",
            starRating: 8,
            comment: null,
          },
        ],
      };
      renderPage();
      expect(screen.getAllByTestId("peer-review-card")).toHaveLength(2);
      expect(screen.getByText("Người được đánh giá: An")).toBeTruthy();
      expect(screen.getByText("Người được đánh giá: Binh")).toBeTruthy();
      fireEvent.click(screen.getAllByTestId("peer-review-reviewee-item")[0]);
      expect(String(mocks.navigation.replace.mock.calls.at(-1)?.[0] || "")).not.toContain("revieweeId=");
    }
  );
});
