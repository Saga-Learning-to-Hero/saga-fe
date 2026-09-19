import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { PipelineTaskInspector } from "@/features/graph/components/pipeline-task-inspector";
import type { PipelineTask } from "@/features/graph/types/pipeline";
import * as taskEvidenceHooks from "@/features/student/sprint-progress/hooks/use-task-evidence";
import type { TaskFileItem, TaskWebLinkItem } from "@/features/student/sprint-progress/types/task-evidence";

vi.mock("@/features/student/sprint-progress/hooks/use-task-evidence", () => ({
  useTaskFiles: vi.fn(),
  useTaskWebLinks: vi.fn(),
  useDownloadTaskFile: vi.fn(),
}));

const mockTask: PipelineTask = {
  id: "task-doc-1",
  key: "SAGA-50",
  title: "Soan thao tai lieu SRS va kien truc",
  status: "DONE",
  issueTypeName: "Document",
  assigneeStudentId: "stu-1",
  assigneeDisplayName: "Le Hoang Hai",
  assigneeExternalId: null,
  sprintId: "sp-1",
  sprintName: "Sprint 1",
  storyPoint: 5,
  priority: "High",
  linkedCommitCount: 0,
};

const mockFiles: TaskFileItem[] = [
  {
    id: "file-1",
    taskId: "task-doc-1",
    filename: "SRS_Software_Requirement_Specification.pdf",
    mimeType: "application/pdf",
    sizeBytes: 1048576,
    source: "Upload",
    createdByUserId: "user-1",
    createdAt: "2026-09-15T10:00:00Z",
  },
];

const mockLinks: TaskWebLinkItem[] = [
  {
    id: "link-1",
    taskId: "task-doc-1",
    url: "https://figma.com/design/saga-mockup",
    title: "Figma UI Architecture Design",
    source: "Figma",
    createdByUserId: "user-1",
    createdAt: "2026-09-15T11:00:00Z",
  },
];

describe("PipelineTaskInspector Component - Evidence and Documents", () => {
  const mutateAsyncMock = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(taskEvidenceHooks.useTaskFiles).mockReturnValue({
      data: mockFiles,
      isLoading: false,
    } as unknown as UseQueryResult<TaskFileItem[], Error>);
    vi.mocked(taskEvidenceHooks.useTaskWebLinks).mockReturnValue({
      data: mockLinks,
      isLoading: false,
    } as unknown as UseQueryResult<TaskWebLinkItem[], Error>);
    vi.mocked(taskEvidenceHooks.useDownloadTaskFile).mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
    } as unknown as UseMutationResult<void, Error, { fileId: string; filename: string }>);
  });

  it("UTCID01 - [N] Normal: Chuyen sang tab Tai lieu va hien thi tep dinh kem kem lien ket ngoai", () => {
    render(
      <PipelineTaskInspector
        selectedTask={mockTask}
        commits={[]}
        isLoadingCommits={false}
        errorMessage={null}
        onClearSelection={vi.fn()}
      />
    );

    const docTabBtn = screen.getByText(/Tài liệu \(2\)/i);
    expect(docTabBtn).toBeInTheDocument();

    fireEvent.click(docTabBtn);

    expect(screen.getByText("SRS_Software_Requirement_Specification.pdf")).toBeInTheDocument();
    expect(screen.getByText("Figma UI Architecture Design")).toBeInTheDocument();
  });

  it("UTCID02 - [N] Normal: Cho phep tai ve file minh chung khi nhan nut Tai ve", async () => {
    render(
      <PipelineTaskInspector
        selectedTask={mockTask}
        commits={[]}
        isLoadingCommits={false}
        errorMessage={null}
        onClearSelection={vi.fn()}
      />
    );

    const docTabBtn = screen.getByText(/Tài liệu \(2\)/i);
    fireEvent.click(docTabBtn);

    const downloadBtn = screen.getByText("Tải về");
    fireEvent.click(downloadBtn);

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith({
        fileId: "file-1",
        filename: "SRS_Software_Requirement_Specification.pdf",
      });
    });
  });

  it("UTCID03 - [B] Boundary: Task hoan thanh co file minh chung hien thong bao hop le thay vi bao loi MSR", () => {
    render(
      <PipelineTaskInspector
        selectedTask={mockTask}
        commits={[]}
        isLoadingCommits={false}
        errorMessage={null}
        onClearSelection={vi.fn()}
      />
    );

    expect(
      screen.getByText(/Task đã hoàn thành với minh chứng tài liệu đối soát/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/chưa ghi nhận Commit đối soát hoặc Tệp minh chứng/i)
    ).not.toBeInTheDocument();
  });

  it("UTCID04 - [A] Abnormal: Task hoan thanh nhung khong co ca commit lan tai lieu thi hien canh bao", () => {
    vi.mocked(taskEvidenceHooks.useTaskFiles).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as UseQueryResult<TaskFileItem[], Error>);
    vi.mocked(taskEvidenceHooks.useTaskWebLinks).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as UseQueryResult<TaskWebLinkItem[], Error>);

    render(
      <PipelineTaskInspector
        selectedTask={mockTask}
        commits={[]}
        isLoadingCommits={false}
        errorMessage={null}
        onClearSelection={vi.fn()}
      />
    );

    expect(
      screen.getByText(/Task đã hoàn thành nhưng chưa ghi nhận Commit đối soát hoặc Tệp minh chứng/i)
    ).toBeInTheDocument();
  });

  it("UTCID05 - [B] Boundary: Hien thi empty state khi task khong co tep hay link nao", () => {
    vi.mocked(taskEvidenceHooks.useTaskFiles).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as UseQueryResult<TaskFileItem[], Error>);
    vi.mocked(taskEvidenceHooks.useTaskWebLinks).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as UseQueryResult<TaskWebLinkItem[], Error>);

    render(
      <PipelineTaskInspector
        selectedTask={mockTask}
        commits={[]}
        isLoadingCommits={false}
        errorMessage={null}
        onClearSelection={vi.fn()}
      />
    );

    const docTabBtn = screen.getByText(/Tài liệu \(0\)/i);
    fireEvent.click(docTabBtn);

    expect(
      screen.getByText(/Chưa có tệp tài liệu hoặc liên kết minh chứng nào được đính kèm cho task này/i)
    ).toBeInTheDocument();
  });
});
