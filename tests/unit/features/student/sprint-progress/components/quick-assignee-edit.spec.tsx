import { beforeEach, describe, expect, vi, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { apiClient } from "@/lib/axios";
import { QuickAssigneeEdit } from "@/features/student/sprint-progress/components/quick-assignee-edit";

vi.mock("@/lib/axios");

describe("QuickAssigneeEdit", () => {
  const projectId = "proj-123";
  const issueId = "task-456";
  const issueKey = "SAGA-74";

  const currentAssignee = {
    id: "SE183904",
    name: "Lê Hoàng Hải",
    studentCode: "SE183904",
    accountId: "jira-acc-1",
  };

  const teamMembers = [
    {
      id: "SE183904",
      name: "Lê Hoàng Hải",
      studentCode: "SE183904",
      accountId: "jira-acc-1",
    },
    {
      id: "SE171184",
      name: "Bùi Phan Nhật Minh",
      studentCode: "SE171184",
      accountId: "jira-acc-2",
    },
  ];

  const assignableUsers = [
    {
      accountId: "jira-acc-1",
      displayName: "Lê Hoàng Hải",
    },
    {
      accountId: "jira-acc-2",
      displayName: "Bùi Phan Nhật Minh",
    },
    {
      accountId: "jira-agent-1",
      displayName: "Jira Triage Agent",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderComponent(props?: Partial<React.ComponentProps<typeof QuickAssigneeEdit>>) {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    function Wrapper({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    }

    return render(
      <QuickAssigneeEdit
        issueId={issueId}
        issueKey={issueKey}
        currentAssignee={currentAssignee}
        teamMembers={teamMembers}
        assignableUsers={assignableUsers}
        projectId={projectId}
        isTeamLeader={true}
        {...props}
      />,
      { wrapper: Wrapper }
    );
  }

  it("UTCID01 - [N] Normal: Render avatar tinh khi isTeamLeader = false", () => {
    renderComponent({ isTeamLeader: false });
    const avatar = screen.getByTitle("Lê Hoàng Hải");
    expect(avatar).toBeInTheDocument();
    expect(screen.queryByTitle(/Nhấn để đổi/)).not.toBeInTheDocument();
  });

  it("UTCID02 - [N] Normal: Render button trigger khi isTeamLeader = true", () => {
    renderComponent({ isTeamLeader: true });
    const trigger = screen.getByTitle(/Người thực hiện: Lê Hoàng Hải \(Nhấn để đổi - Trưởng nhóm\)/);
    expect(trigger).toBeInTheDocument();
  });

  it("UTCID03 - [N] Normal: Mo popover va hien thi danh sach thanh vien day du, tu dong loai bo Jira Bots", async () => {
    const user = userEvent.setup();
    renderComponent({ isTeamLeader: true });
    const trigger = screen.getByTitle(/Nhấn để đổi/);
    await user.click(trigger);

    expect(screen.getByText("Phân công người thực hiện")).toBeInTheDocument();
    expect(screen.getByText("Chưa phân công")).toBeInTheDocument();
    expect(screen.getByText("Bùi Phan Nhật Minh")).toBeInTheDocument();
    expect(screen.queryByText("Jira Triage Agent")).not.toBeInTheDocument();
  });

  it("UTCID04 - [N] Normal: Goi patchTask voi assigneeAccountId khi click chon thanh vien", async () => {
    const user = userEvent.setup();
    vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
      data: { id: issueId, externalKey: issueKey, assignee: { accountId: "jira-acc-2" } },
    });

    renderComponent({ isTeamLeader: true });
    const trigger = screen.getByTitle(/Nhấn để đổi/);
    await user.click(trigger);

    const minhBtn = screen.getByText("Bùi Phan Nhật Minh");
    await user.click(minhBtn);

    await waitFor(() => {
      expect(apiClient.patch).toHaveBeenCalledWith(
        `/api/projects/${projectId}/tasks/${issueId}`,
        { assigneeAccountId: "jira-acc-2" }
      );
    });
  });

  it("UTCID05 - [B] Boundary: Goi patchTask voi clearAssignee = true khi chon Unassigned", async () => {
    const user = userEvent.setup();
    vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
      data: { id: issueId, externalKey: issueKey, assignee: null },
    });

    renderComponent({ isTeamLeader: true });
    const trigger = screen.getByTitle(/Nhấn để đổi/);
    await user.click(trigger);

    const unassignedBtn = screen.getByText("Chưa phân công");
    await user.click(unassignedBtn);

    await waitFor(() => {
      expect(apiClient.patch).toHaveBeenCalledWith(
        `/api/projects/${projectId}/tasks/${issueId}`,
        { clearAssignee: true }
      );
    });
  });

  it("UTCID06 - [A] Abnormal: Xu ly khi API patchTask tra ve loi", async () => {
    const user = userEvent.setup();
    vi.spyOn(apiClient, "patch").mockRejectedValueOnce({
      response: { data: { code: "JIRA_FIELD_INVALID", message: "Jira error" } },
    });

    renderComponent({ isTeamLeader: true });
    const trigger = screen.getByTitle(/Nhấn để đổi/);
    await user.click(trigger);

    const minhBtn = screen.getByText("Bùi Phan Nhật Minh");
    await user.click(minhBtn);

    await waitFor(() => {
      expect(apiClient.patch).toHaveBeenCalled();
    });
  });
});
