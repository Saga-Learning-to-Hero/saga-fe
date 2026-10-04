import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, vi } from "vitest";
import { CommitReviewBadge } from "@/features/ai/components/commit-review/commit-review-badge";
import { teamKeyStatusView } from "@/features/ai/components/commit-review/team-ai-key-card";
import {
  commitReviewTone,
  commitReviewTooltip,
  hasNoTaskWarning,
  isReviewSkippedMerge,
} from "@/features/ai/lib/commit-review-style";
import { mapProjectCommitToCommitItem } from "@/features/student/commits/lib/commit-mapper";
import { fptTest } from "@/testing/fpt-test-helper";

describe("Commit AI review badge", () => {
  fptTest(
    { id: "UTCID01", type: "N", executedDate: "04/10/2026", description: "Badge WARNING hien nhan, so ly do va tooltip chi tiet" },
    async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <CommitReviewBadge
          review={{
            status: "WARNING",
            label: "Cảnh báo",
            reasons: [
              { code: "MESSAGE", label: "Tên commit chưa rõ" },
              { code: "CODE", label: "Code có vấn đề" },
            ],
            taskLinked: true,
          }}
          onClick={onClick}
        />
      );
      const badge = screen.getByTestId("commit-review-badge");
      expect(badge).toHaveAttribute("data-status", "WARNING");
      expect(badge).toHaveTextContent("AI · Cảnh báo");
      expect(badge).toHaveTextContent("· 2");
      expect(badge).toHaveAttribute("title", "Cảnh báo: Tên commit chưa rõ, Code có vấn đề");
      await user.click(badge);
      expect(onClick).toHaveBeenCalledTimes(1);
    }
  );

  fptTest(
    { id: "UTCID02", type: "N", executedDate: "04/10/2026", description: "Commit chua danh gia nhung chua gan task van hien canh bao Chua gan task" },
    () => {
      render(
        <CommitReviewBadge
          review={{ status: "NO_KEY", label: "Chưa có key AI", reasons: [{ code: "NO_TASK", label: "Chưa gắn task" }], taskLinked: false }}
        />
      );
      expect(screen.getByText("AI · Chưa có key AI")).toBeInTheDocument();
      expect(screen.getByText("Chưa gắn task")).toBeInTheDocument();
    }
  );

  fptTest(
    { id: "UTCID03", type: "B", executedDate: "04/10/2026", description: "Khong co du lieu review thi khong ve gi" },
    () => {
      const { container } = render(<CommitReviewBadge review={null} />);
      expect(container).toBeEmptyDOMElement();
    }
  );

  fptTest(
    { id: "UTCID04", type: "N", executedDate: "04/10/2026", description: "Map trang thai sang tone va nhan dien merge/khong gan task" },
    () => {
      expect(commitReviewTone("PASS")).toBe("pass");
      expect(commitReviewTone("WARNING")).toBe("warning");
      expect(commitReviewTone("PENDING")).toBe("pending");
      expect(commitReviewTone("FAILED")).toBe("error");
      expect(commitReviewTone("SKIPPED_MERGE")).toBe("muted");
      expect(commitReviewTone(undefined)).toBe("muted");
      expect(isReviewSkippedMerge({ status: "SKIPPED_MERGE" })).toBe(true);
      expect(isReviewSkippedMerge(null)).toBe(false);
      expect(hasNoTaskWarning({ status: "PASS", label: "Đạt", reasons: [], taskLinked: true })).toBe(false);
      expect(commitReviewTooltip({ status: "PASS", label: "Đạt", reasons: [], taskLinked: true })).toBe("Đạt");
      expect(commitReviewTooltip(null)).toBe("Chưa có thông tin đánh giá AI");
    }
  );

  fptTest(
    { id: "UTCID05", type: "N", executedDate: "04/10/2026", description: "Mapper giu nguyen aiReview tu backend" },
    () => {
      const item = mapProjectCommitToCommitItem({
        id: "c1",
        repoId: "r1",
        repositoryFullName: "org/saga",
        sha: "abcdef1234567",
        message: "SAGA-1 feat",
        committedAt: "2026-10-04T10:00:00",
        createdAt: "2026-10-04T10:00:00",
        aiReview: { status: "PASS", label: "Đạt", reasons: [], taskLinked: true },
      });
      expect(item.aiReview?.status).toBe("PASS");
      const withoutReview = mapProjectCommitToCommitItem({
        id: "c2",
        repoId: "r1",
        repositoryFullName: "org/saga",
        sha: "abcdef1234568",
        message: "x",
        committedAt: "2026-10-04T10:00:00",
        createdAt: "2026-10-04T10:00:00",
      });
      expect(withoutReview.aiReview).toBeNull();
    }
  );

  fptTest(
    { id: "UTCID06", type: "N", executedDate: "04/10/2026", description: "Nhan trang thai key AI cua nhom bang tieng Viet" },
    () => {
      expect(teamKeyStatusView("ACTIVE").label).toBe("Đang hoạt động");
      expect(teamKeyStatusView("INVALID").label).toBe("Key bị từ chối");
      expect(teamKeyStatusView("DEGRADED").label).toBe("Tạm hết hạn mức");
      expect(teamKeyStatusView(null).label).toBe("Chưa có key");
    }
  );
});
