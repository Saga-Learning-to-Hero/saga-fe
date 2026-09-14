import { describe, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fptTest } from "@/testing/fpt-test-helper";
import { PipelineFlowView } from "./pipeline-flow-view";
import { PipelineMatrixTable } from "./pipeline-matrix-table";
import { PipelineTaskInspector } from "./pipeline-task-inspector";
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
      description: "Chua chon Task thi Inspector hien empty state ro rang kem huong dan",
    },
    () => {
      render(
        <PipelineTaskInspector
          selectedTask={null}
          commits={[]}
          isLoadingCommits={false}
          errorMessage={null}
          onClearSelection={vi.fn()}
        />
      );
      expect(screen.getByText(/Chưa chọn Task/i)).toBeTruthy();
      expect(screen.getByText(/Chọn một Task Jira trong danh sách hoặc bảng đối soát/i)).toBeTruthy();
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "14/09/2026",
      description: "Chon Task trong Flow cap nhat Inspector, hien skeleton roi render commit",
    },
    async () => {
      const onSelectTask = vi.fn();
      const user = userEvent.setup();
      const { rerender } = render(
        <div className="flex gap-4">
          <PipelineFlowView
            lanes={lanes}
            selectedTaskId={null}
            onSelectTask={onSelectTask}
          />
          <PipelineTaskInspector
            selectedTask={null}
            commits={[]}
            isLoadingCommits={false}
            errorMessage={null}
            onClearSelection={vi.fn()}
          />
        </div>
      );
      await user.click(screen.getByText("SAGA-1"));
      expect(onSelectTask).toHaveBeenCalledTimes(1);
      expect(onSelectTask).toHaveBeenCalledWith("task-1");

      rerender(
        <div className="flex gap-4">
          <PipelineFlowView
            lanes={lanes}
            selectedTaskId="task-1"
            onSelectTask={onSelectTask}
          />
          <PipelineTaskInspector
            selectedTask={task}
            commits={[]}
            isLoadingCommits={true}
            errorMessage={null}
            onClearSelection={vi.fn()}
          />
        </div>
      );
      expect(screen.getByLabelText("Đang tải Commit liên kết")).toBeTruthy();
      expect(screen.getAllByText("Xay dung pipeline").length).toBeGreaterThan(0);

      rerender(
        <div className="flex gap-4">
          <PipelineFlowView
            lanes={lanes}
            selectedTaskId="task-1"
            onSelectTask={onSelectTask}
          />
          <PipelineTaskInspector
            selectedTask={task}
            commits={[
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
            isLoadingCommits={false}
            errorMessage={null}
            onClearSelection={vi.fn()}
          />
        </div>
      );
      expect(screen.getByText("feat pipeline")).toBeTruthy();
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "A",
      executedDate: "14/09/2026",
      description: "Bang doi soat click row se chon Task dung chung selectedTaskId",
    },
    async () => {
      const onSelectTask = vi.fn();
      const user = userEvent.setup();
      render(
        <PipelineMatrixTable
          tasks={[task]}
          selectedTaskId={null}
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
      description: "Pipeline va Inspector khong con import MOCK_GRAPH",
    },
    () => {
      const files = [
        resolve(__dirname, "pipeline-flow-view.tsx"),
        resolve(__dirname, "pipeline-matrix-table.tsx"),
        resolve(__dirname, "pipeline-task-inspector.tsx"),
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

  fptTest(
    {
      id: "UTCID06",
      type: "N",
      executedDate: "14/09/2026",
      description: "Flow mode chi render lanes, khong render bang doi soat phia duoi",
    },
    () => {
      render(
        <PipelineFlowView
          lanes={lanes}
          selectedTaskId={null}
          onSelectTask={vi.fn()}
        />
      );
      expect(screen.queryByText("Bảng đối soát Task–Commit")).toBeNull();
      expect(screen.getAllByText("Le Hoang Hai").length).toBeGreaterThan(0);
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "N",
      executedDate: "14/09/2026",
      description: "Audit matrix render thay the Flow mode, khong render member lane button",
    },
    () => {
      render(
        <PipelineMatrixTable
          tasks={[task]}
          selectedTaskId={null}
          onSelectTask={vi.fn()}
        />
      );
      expect(screen.getByText("Bảng đối soát Task–Commit")).toBeTruthy();
      expect(screen.getByText("Mã Task")).toBeTruthy();
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "N",
      executedDate: "14/09/2026",
      description: "Inspector co nut bo chon Task va goi callback onClearSelection",
    },
    async () => {
      const onClear = vi.fn();
      const user = userEvent.setup();
      render(
        <PipelineTaskInspector
          selectedTask={task}
          commits={[]}
          isLoadingCommits={false}
          errorMessage={null}
          onClearSelection={onClear}
        />
      );
      await user.click(screen.getByRole("button", { name: "Bỏ chọn Task" }));
      expect(onClear).toHaveBeenCalledTimes(1);
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "A",
      executedDate: "14/09/2026",
      description: "Inspector hien thi canh bao MSR khi task DONE co 0 commit lien ket",
    },
    () => {
      render(
        <PipelineTaskInspector
          selectedTask={task}
          commits={[]}
          isLoadingCommits={false}
          errorMessage={null}
          onClearSelection={vi.fn()}
        />
      );
      expect(screen.getByText(/Task đã hoàn thành nhưng chưa ghi nhận Commit đối soát/i)).toBeTruthy();
    }
  );
});
