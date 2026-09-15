import { describe, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { fptTest } from "@/testing/fpt-test-helper";
import { PeerReviewModal } from "./peer-review-modal";
import type { PeerReviewCandidate, PeerReviewRubric } from "../types/peer-review";

const mutateAsync = vi.fn();

vi.mock("../hooks/use-peer-review", async () => {
  const actual = await vi.importActual<typeof import("../hooks/use-peer-review")>("../hooks/use-peer-review");
  return {
    ...actual,
    useSubmitPeerReview: () => ({
      mutateAsync,
      isPending: false,
      error: null,
    }),
  };
});

const rubric: PeerReviewRubric = {
  teamId: "team-1",
  subjectId: "subject-1",
  criteria: [
    { rubricId: "r-attitude", criteriaName: "Thái độ hợp tác", description: "Tinh thần làm việc nhóm" },
    { rubricId: "r-quality", criteriaName: "Chất lượng công việc", description: null },
    { rubricId: "r-deadline", criteriaName: "Đúng hạn", description: "Giao đúng hạn" },
    { rubricId: "r-communication", criteriaName: "Giao tiếp", description: "Phản hồi" },
  ],
};

const candidate: PeerReviewCandidate = {
  studentId: "stu-2",
  studentCode: "SE2",
  fullName: "Nguyen Van B",
  alreadyReviewed: true,
  existingReviewId: "pr-old",
  existingTotalStarRating: 16,
};

describe("PeerReviewModal", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "15/09/2026",
      description: "Da danh gia thi hien trang thai hoan tat, khoa form va khong cho gui lai",
    },
    () => {
      render(
        <PeerReviewModal
          open
          teamId="team-1"
          sprintId="sprint-1"
          candidate={candidate}
          rubric={rubric}
          reviewerId="stu-1"
          allowedRevieweeIds={["stu-2"]}
          sprintWindowOpen
          onOpenChange={() => undefined}
        />
      );
      expect(screen.getByText("Thái độ hợp tác")).toBeTruthy();
      expect(screen.getByText("Chất lượng công việc")).toBeTruthy();
      expect(screen.getByText("Đúng hạn")).toBeTruthy();
      expect(screen.getByText("Giao tiếp")).toBeTruthy();
      expect(screen.getByText(/chỉ được đánh giá một lần/i)).toBeTruthy();
      expect(screen.getByRole("button", { name: "Gửi đánh giá" })).toBeDisabled();
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "A",
      executedDate: "15/09/2026",
      description: "Loi submit giu form va khong reset tieu chi da chon",
    },
    async () => {
      mutateAsync.mockRejectedValueOnce({ code: "PEER_REVIEW_INVALID" });
      const user = userEvent.setup();
      render(
        <PeerReviewModal
          open
          teamId="team-1"
          sprintId="sprint-1"
          candidate={{ ...candidate, alreadyReviewed: false }}
          rubric={rubric}
          reviewerId="stu-1"
          allowedRevieweeIds={["stu-2"]}
          sprintWindowOpen
          onOpenChange={() => undefined}
        />
      );
      const radios = screen.getAllByRole("radio");
      await user.click(radios[0]);
      await user.click(radios[5]);
      await user.click(radios[10]);
      await user.click(radios[15]);
      await user.click(screen.getByRole("button", { name: "Gửi đánh giá" }));
      expect(await screen.findByText(/Nội dung đánh giá chưa hợp lệ/i)).toBeTruthy();
      expect(screen.getByRole("button", { name: "Gửi đánh giá" })).toBeEnabled();
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "B",
      executedDate: "15/09/2026",
      description: "Khoa submit khi Sprint chua mo cua so danh gia",
    },
    async () => {
      const user = userEvent.setup();
      render(
        <PeerReviewModal
          open
          teamId="team-1"
          sprintId="sprint-1"
          candidate={{ ...candidate, alreadyReviewed: false }}
          rubric={rubric}
          reviewerId="stu-1"
          allowedRevieweeIds={["stu-2"]}
          sprintWindowOpen={false}
          onOpenChange={() => undefined}
        />
      );
      const radios = screen.getAllByRole("radio");
      await user.click(radios[0]);
      await user.click(radios[5]);
      expect(screen.getByText(/Sprint chưa đến hạn đánh giá/i)).toBeTruthy();
      expect(screen.getByRole("button", { name: "Gửi đánh giá" })).toBeDisabled();
    }
  );
});
