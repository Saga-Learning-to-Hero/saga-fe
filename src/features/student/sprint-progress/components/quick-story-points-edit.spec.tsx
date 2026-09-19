import { beforeEach, describe, expect, vi, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { apiClient } from "@/lib/axios";
import { QuickStoryPointsEdit } from "./quick-story-points-edit";

vi.mock("@/lib/axios");

describe("QuickStoryPointsEdit", () => {
  const projectId = "proj-123";
  const issueId = "task-456";
  const issueKey = "SAGA-74";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderComponent(props?: Partial<React.ComponentProps<typeof QuickStoryPointsEdit>>) {
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
      <QuickStoryPointsEdit
        issueId={issueId}
        issueKey={issueKey}
        storyPoints={5}
        projectId={projectId}
        isTeamLeader={true}
        {...props}
      />,
      { wrapper: Wrapper }
    );
  }

  it("UTCID01 - [N] Normal: Render badge tinh khi isTeamLeader = false", () => {
    renderComponent({ isTeamLeader: false });
    expect(screen.getByText("5 SP")).toBeInTheDocument();
    expect(screen.queryByTitle(/Nhấn để đổi Story Points/)).not.toBeInTheDocument();
  });

  it("UTCID02 - [N] Normal: Render nut trigger tuong tac khi isTeamLeader = true", () => {
    renderComponent({ isTeamLeader: true });
    const trigger = screen.getByTitle(/Nhấn để đổi Story Points \(Trưởng nhóm\)/);
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent("5 SP");
  });

  it("UTCID03 - [N] Normal: Mo popover khi click va hien thi cac nut Fibonacci", async () => {
    const user = userEvent.setup();
    renderComponent({ isTeamLeader: true });
    const trigger = screen.getByTitle(/Nhấn để đổi Story Points/);
    await user.click(trigger);

    expect(screen.getByText("Story Points")).toBeInTheDocument();
    expect(screen.getByText("SAGA-74")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "8" })).toBeInTheDocument();
  });

  it("UTCID04 - [N] Normal: Goi patchTask khi click chon so diem Fibonacci", async () => {
    const user = userEvent.setup();
    vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
      data: { id: issueId, externalKey: issueKey, storyPoint: 8 },
    });

    renderComponent({ isTeamLeader: true });
    const trigger = screen.getByTitle(/Nhấn để đổi Story Points/);
    await user.click(trigger);

    const btn8 = screen.getByRole("button", { name: "8" });
    await user.click(btn8);

    await waitFor(() => {
      expect(apiClient.patch).toHaveBeenCalledWith(
        `/api/projects/${projectId}/tasks/${issueId}`,
        { storyPoints: 8 }
      );
    });
  });

  it("UTCID05 - [B] Boundary: Khong goi API khi nhap so diem khong hop le", async () => {
    const user = userEvent.setup();
    renderComponent({ isTeamLeader: true });
    const trigger = screen.getByTitle(/Nhấn để đổi Story Points/);
    await user.click(trigger);

    const input = screen.getByPlaceholderText("Tùy chọn...");
    await user.clear(input);
    await user.type(input, "-5");

    const submitBtn = screen.getByRole("button", { name: "" });
    await user.click(submitBtn);

    expect(apiClient.patch).not.toHaveBeenCalled();
  });

  it("UTCID06 - [A] Abnormal: Xu ly khi API patchTask tra ve loi HTTP 500", async () => {
    const user = userEvent.setup();
    vi.spyOn(apiClient, "patch").mockRejectedValueOnce({
      response: { data: { code: "SERVER_ERROR", message: "Server error" } },
    });

    renderComponent({ isTeamLeader: true });
    const trigger = screen.getByTitle(/Nhấn để đổi Story Points/);
    await user.click(trigger);

    const btn13 = screen.getByRole("button", { name: "13" });
    await user.click(btn13);

    await waitFor(() => {
      expect(apiClient.patch).toHaveBeenCalled();
    });
  });
});
