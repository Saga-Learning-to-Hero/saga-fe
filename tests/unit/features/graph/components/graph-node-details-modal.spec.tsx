import { describe, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { fptTest } from "@/testing/fpt-test-helper";
import {
  GraphNodeDetailsModal,
  resolveGitCommitId,
} from "@/features/graph/components/graph-node-details-modal";
import type { CytoscapeNodeData } from "@/features/graph/types/graph";

vi.mock("@/features/student/commits/components/commit-detail-modal", () => ({
  CommitDetailModal: ({
    onClose,
    gitCommitId,
    fallbackShortHash,
    fallbackMessage,
    fallbackCommit,
    projectId,
  }: {
    onClose: () => void;
    gitCommitId?: string | null;
    fallbackShortHash?: string;
    fallbackMessage?: string;
    fallbackCommit?: { commitHash?: string; commitMessage?: string };
    projectId?: string | null;
  }) => (
    <div data-testid="commit-detail-modal">
      <span data-testid="git-commit-id">{gitCommitId}</span>
      <span data-testid="fallback-hash">{fallbackShortHash}</span>
      <span data-testid="fallback-message">{fallbackMessage}</span>
      <span data-testid="fallback-commit-hash">{fallbackCommit?.commitHash}</span>
      <span data-testid="fallback-commit-message">{fallbackCommit?.commitMessage}</span>
      <span data-testid="project-id">{projectId}</span>
      <button type="button" onClick={onClose}>
        close-diff
      </button>
    </div>
  ),
}));

const commitNode: CytoscapeNodeData = {
  id: "commit:abc123def456",
  type: "COMMIT",
  label: "abc123d",
  subLabel: "fix: align graph modal fallback",
};

const taskNode: CytoscapeNodeData = {
  id: "task:saga-82",
  type: "TASK",
  label: "SAGA-82",
  subLabel: "Lam va chinh sua tai lieu Report 3",
  status: "DONE",
  storyPoint: 10,
};

const otherTaskNode: CytoscapeNodeData = {
  id: "task:saga-10",
  type: "TASK",
  label: "SAGA-10",
  subLabel: "Task khac",
};

const studentNode: CytoscapeNodeData = {
  id: "student:11111111-1111-4111-8111-111111111111",
  type: "STUDENT",
  label: "Le Hoang Hai",
  subLabel: "K18 HCM",
  role: "Leader",
};

const sprintNode: CytoscapeNodeData = {
  id: "sprint:1",
  type: "SPRINT",
  label: "Sprint 1",
  subLabel: "Trang thai: active",
};

describe("GraphNodeDetailsModal", () => {
  const onClose = vi.fn();
  const onFocusNode = vi.fn();
  const onViewContribution = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "29/09/2026",
      description: "Node COMMIT mo ngay CommitDetailModal, khong modal tom tat hay nut Xem Code Diff",
    },
    () => {
      render(
        <GraphNodeDetailsModal
          nodeData={commitNode}
          onClose={onClose}
          projectId="proj-1"
        />
      );

      expect(screen.getByTestId("commit-detail-modal")).toBeInTheDocument();
      expect(screen.getByTestId("git-commit-id")).toHaveTextContent("abc123def456");
      expect(screen.getByTestId("fallback-hash")).toHaveTextContent("abc123d");
      expect(screen.getByTestId("fallback-message")).toHaveTextContent(
        "fix: align graph modal fallback"
      );
      expect(screen.getByTestId("fallback-commit-hash")).toHaveTextContent("abc123d");
      expect(screen.getByTestId("fallback-commit-message")).toHaveTextContent(
        "fix: align graph modal fallback"
      );
      expect(screen.getByTestId("project-id")).toHaveTextContent("proj-1");
      expect(screen.queryByText("Xem Code Diff chi tiết")).not.toBeInTheDocument();
      expect(screen.queryByText("Git Commit")).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Đóng" })).not.toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "29/09/2026",
      description: "Dong modal diff goi onClose cha de xoa node dang chon",
    },
    async () => {
      const user = userEvent.setup();
      render(
        <GraphNodeDetailsModal nodeData={commitNode} onClose={onClose} projectId="proj-1" />
      );

      await user.click(screen.getByRole("button", { name: "close-diff" }));
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "B",
      executedDate: "29/09/2026",
      description: "gitCommitId khong co prefix commit: giu nguyen id; hash lay label, message lay subLabel",
    },
    () => {
      render(
        <GraphNodeDetailsModal
          nodeData={{
            id: "raw-sha-id",
            type: "COMMIT",
            label: "deadbee",
            subLabel: "docs: coverage",
          }}
          onClose={onClose}
        />
      );

      expect(resolveGitCommitId("raw-sha-id")).toBe("raw-sha-id");
      expect(screen.getByTestId("git-commit-id")).toHaveTextContent("raw-sha-id");
      expect(screen.getByTestId("fallback-hash")).toHaveTextContent("deadbee");
      expect(screen.getByTestId("fallback-message")).toHaveTextContent("docs: coverage");
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "A",
      executedDate: "29/09/2026",
      description: "COMMIT thieu subLabel fallback message ve label, khong dao hash va message",
    },
    () => {
      render(
        <GraphNodeDetailsModal
          nodeData={{
            id: "commit:sha-only",
            type: "COMMIT",
            label: "abcdef1",
          }}
          onClose={onClose}
        />
      );

      expect(screen.getByTestId("git-commit-id")).toHaveTextContent("sha-only");
      expect(screen.getByTestId("fallback-hash")).toHaveTextContent("abcdef1");
      expect(screen.getByTestId("fallback-message")).toHaveTextContent("abcdef1");
      expect(screen.getByTestId("fallback-commit-hash")).toHaveTextContent("abcdef1");
      expect(screen.getByTestId("fallback-commit-message")).toHaveTextContent("abcdef1");
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "N",
      executedDate: "29/09/2026",
      description: "TASK chua focus hien nut Tap trung, click goi onFocusNode roi onClose",
    },
    async () => {
      const user = userEvent.setup();
      render(
        <GraphNodeDetailsModal
          nodeData={taskNode}
          onClose={onClose}
          onFocusNode={onFocusNode}
        />
      );

      expect(screen.getByText("Task Jira")).toBeInTheDocument();
      expect(screen.getByText("SAGA-82")).toBeInTheDocument();
      const focusButton = screen.getByRole("button", {
        name: "Tập trung Task & Xem Commit đối chiếu",
      });
      await user.click(focusButton);
      expect(onFocusNode).toHaveBeenCalledWith(
        "task:saga-82",
        "SAGA-82 - Lam va chinh sua tai lieu Report 3"
      );
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "A",
      executedDate: "29/09/2026",
      description: "TASK da focus dung id an nut Tap trung, van dong duoc bang nut Dong",
    },
    async () => {
      const user = userEvent.setup();
      render(
        <GraphNodeDetailsModal
          nodeData={taskNode}
          onClose={onClose}
          onFocusNode={onFocusNode}
          focusedNodeId="task:saga-82"
        />
      );

      expect(
        screen.queryByRole("button", { name: "Tập trung Task & Xem Commit đối chiếu" })
      ).not.toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Đóng" }));
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onFocusNode).not.toHaveBeenCalled();
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "B",
      executedDate: "29/09/2026",
      description: "TASK dang focus Task khac van hien nut Tap trung de doi focus",
    },
    () => {
      render(
        <GraphNodeDetailsModal
          nodeData={taskNode}
          onClose={onClose}
          onFocusNode={onFocusNode}
          focusedNodeId={otherTaskNode.id}
        />
      );

      expect(
        screen.getByRole("button", { name: "Tập trung Task & Xem Commit đối chiếu" })
      ).toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "A",
      executedDate: "29/09/2026",
      description: "TASK dong bang nut X, backdrop va Escape",
    },
    () => {
      render(
        <GraphNodeDetailsModal nodeData={taskNode} onClose={onClose} onFocusNode={onFocusNode} />
      );

      const iconClose = document.body.querySelector("button.w-8");
      expect(iconClose).toBeTruthy();
      fireEvent.click(iconClose!);
      expect(onClose).toHaveBeenCalledTimes(1);

      onClose.mockClear();
      const overlay = document.body.querySelector(".fixed.inset-0");
      expect(overlay).toBeTruthy();
      fireEvent.click(overlay!);
      expect(onClose).toHaveBeenCalledTimes(1);

      onClose.mockClear();
      fireEvent.keyDown(window, { key: "Escape" });
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "N",
      executedDate: "29/09/2026",
      description: "STUDENT van hien nut xem dong gop, khong mo CommitDetailModal",
    },
    async () => {
      const user = userEvent.setup();
      render(
        <GraphNodeDetailsModal
          nodeData={studentNode}
          onClose={onClose}
          onViewContribution={onViewContribution}
          onFocusNode={onFocusNode}
        />
      );

      expect(screen.queryByTestId("commit-detail-modal")).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Tập trung Task & Xem Commit đối chiếu" })
      ).not.toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Xem chi tiết đóng góp" }));
      expect(onViewContribution).toHaveBeenCalledWith(studentNode.id);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  );

  fptTest(
    {
      id: "UTCID10",
      type: "A",
      executedDate: "29/09/2026",
      description: "Node khac TASK/COMMIT khong co nut Tap trung hay modal diff",
    },
    () => {
      render(
        <GraphNodeDetailsModal
          nodeData={sprintNode}
          onClose={onClose}
          onFocusNode={onFocusNode}
        />
      );

      expect(screen.getByText("Sprint")).toBeInTheDocument();
      expect(screen.queryByTestId("commit-detail-modal")).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Tập trung Task & Xem Commit đối chiếu" })
      ).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Đóng" })).toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID11",
      type: "A",
      executedDate: "29/09/2026",
      description: "nodeData null khong render modal",
    },
    () => {
      const { container } = render(
        <GraphNodeDetailsModal nodeData={null} onClose={onClose} />
      );
      expect(container).toBeEmptyDOMElement();
      expect(screen.queryByTestId("commit-detail-modal")).not.toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID12",
      type: "B",
      executedDate: "29/09/2026",
      description: "resolveGitCommitId cat prefix commit: va giu id khong prefix",
    },
    () => {
      expect(resolveGitCommitId("commit:abc")).toBe("abc");
      expect(resolveGitCommitId("commit:")).toBe("");
      expect(resolveGitCommitId("abc")).toBe("abc");
    }
  );
});
