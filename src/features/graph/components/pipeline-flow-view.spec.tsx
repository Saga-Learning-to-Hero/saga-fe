import { describe, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fptTest } from "@/testing/fpt-test-helper";
import { PipelineFlowView } from "./pipeline-flow-view";
import { PipelineMatrixTable } from "./pipeline-matrix-table";
import { PipelineEmptyState } from "./pipeline-empty-state";
import type { PipelineLane, PipelineTask } from "../types/pipeline";

const task: PipelineTask = {
  id: "task-1",
  key: "SAGA-1",
  title: "Xay dung pipeline",
  status: "DONE",
  issueTypeName: "Task",
  assigneeStudentId: "stu-1",
  assigneeDisplayName: "Le Hoang Hai",
  assigneeExternalId: null,
  sprintId: "sp-1",
  sprintName: "Sprint 3",
  storyPoint: 3,
  priority: "High",
  linkedCommitCount: 0,
};

const lanes: PipelineLane[] = [
  {
    id: "stu-1",
    member: {
      studentId: "stu-1",
      fullName: "Le Hoang Hai",
      studentCode: "HE170504",
      teamRole: "LEADER",
    },
    tasks: [task],
  },
];

describe("pipeline UI", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "14/09/2026",
      description: "Chua chon Task thi khong hien danh sach commit, chi huong dan chon",
    },
    () => {
      render(
        <PipelineFlowView
          lanes={lanes}
          selectedTaskId={null}
          selectedCommits={[]}
          isLoadingTaskCommits={false}
          taskCommitsErrorMessage={null}
          onSelectTask={vi.fn()}
        />
      );
      expect(screen.getByText(/Chọn một Task để tải Commit liên kết/i)).toBeTruthy();
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "14/09/2026",
      description: "Chon Task hien skeleton commit roi render commit da cache",
    },
    async () => {
      const onSelectTask = vi.fn();
      const user = userEvent.setup();
      const { rerender } = render(
        <PipelineFlowView
          lanes={lanes}
          selectedTaskId={null}
          selectedCommits={[]}
          isLoadingTaskCommits={false}
          taskCommitsErrorMessage={null}
          onSelectTask={onSelectTask}
        />
      );
      await user.click(screen.getByText("SAGA-1"));
      expect(onSelectTask).toHaveBeenCalledTimes(1);
      expect(onSelectTask).toHaveBeenCalledWith("task-1");

      rerender(
        <PipelineFlowView
          lanes={lanes}
          selectedTaskId="task-1"
          selectedCommits={[]}
          isLoadingTaskCommits={true}
          taskCommitsErrorMessage={null}
          onSelectTask={onSelectTask}
        />
      );
      expect(screen.getByLabelText("Đang tải Commit liên kết")).toBeTruthy();

      rerender(
        <PipelineFlowView
          lanes={lanes}
          selectedTaskId="task-1"
          selectedCommits={[
            {
              id: "c1",
              sha: "abcdef1",
              shortHash: "abcdef1",
              message: "feat pipeline",
              authorStudentId: "stu-1",
              authorExternalId: null,
              authorLabel: "Le Hoang Hai",
              committedAt: "2026-09-14T00:00:00Z",
              repositoryFullName: "org/repo",
            },
          ]}
          isLoadingTaskCommits={false}
          taskCommitsErrorMessage={null}
          onSelectTask={onSelectTask}
        />
      );
      expect(screen.getByText("feat pipeline")).toBeTruthy();
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "A",
      executedDate: "14/09/2026",
      description: "Bang doi soat mo dong se chon Task va dung chung query lazy",
    },
    async () => {
      const onSelectTask = vi.fn();
      const user = userEvent.setup();
      render(
        <PipelineMatrixTable
          tasks={[task]}
          selectedTaskId={null}
          selectedCommits={[]}
          isLoadingTaskCommits={false}
          onSelectTask={onSelectTask}
        />
      );
      await user.click(screen.getByText("SAGA-1"));
      expect(onSelectTask).toHaveBeenCalledWith("task-1");
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "A",
      executedDate: "14/09/2026",
      description: "Empty state Task rong va nut thu lai khong reload trang",
    },
    async () => {
      const onRetry = vi.fn();
      const user = userEvent.setup();
      render(
        <PipelineEmptyState
          title="Chưa có Task"
          description="Danh sach Task rong"
          onRetry={onRetry}
        />
      );
      await user.click(screen.getByRole("button", { name: "Thử lại" }));
      expect(onRetry).toHaveBeenCalledTimes(1);
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "B",
      executedDate: "14/09/2026",
      description: "Pipeline va bang doi soat khong con import MOCK_GRAPH",
    },
    () => {
      const files = [
        resolve(__dirname, "pipeline-flow-view.tsx"),
        resolve(__dirname, "pipeline-matrix-table.tsx"),
        resolve(__dirname, "pipeline-stats-bar.tsx"),
        resolve(__dirname, "graph-filter-bar.tsx"),
        resolve(__dirname, "../hooks/use-pipeline-graph-data.ts"),
        resolve(__dirname, "../lib/pipeline-mapper.ts"),
      ];
      for (const file of files) {
        expect(readFileSync(file, "utf8")).not.toMatch(/MOCK_GRAPH_/);
      }
    }
  );
});
