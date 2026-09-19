import { beforeEach, describe, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { apiClient } from "@/lib/axios";
import { fptTest } from "@/testing/fpt-test-helper";
import {
  formatWorkSessionDuration,
  TaskWorkSessionControl,
} from "@/features/student/sprint-progress/components/task-work-session-control";

vi.mock("@/lib/axios");

describe("TaskWorkSessionControl", () => {
  const taskId = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
  const sessionId = "4ba85f64-5717-4562-b3fc-2c963f66afb7";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderControl() {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    function Wrapper({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    }

    return render(<TaskWorkSessionControl taskId={taskId} />, { wrapper: Wrapper });
  }

  const openSession = {
    id: sessionId,
    taskId,
    startedAt: "2026-09-14T10:20:00",
    endedAt: null,
    status: "OPEN",
    elapsedSeconds: 1530,
  };

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "15/09/2026",
      description: "Khoi phuc timer tu activeSession va elapsedSeconds canonical cua server",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: { taskId, activeSession: openSession, sessions: [openSession] },
      });

      renderControl();

      expect(await screen.findByText("00:25:30")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Dừng" })).toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "15/09/2026",
      description: "Dong drawer khong tu dong goi STOP work session",
    },
    async () => {
      const postSpy = vi.spyOn(apiClient, "post");
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: { taskId, activeSession: openSession, sessions: [openSession] },
      });

      const { unmount } = renderControl();
      expect(await screen.findByRole("button", { name: "Dừng" })).toBeInTheDocument();
      unmount();

      expect(postSpy).not.toHaveBeenCalled();
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "15/09/2026",
      description: "START cap nhat cache bang session OPEN server tra ve",
    },
    async () => {
      const user = userEvent.setup();
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: { taskId, activeSession: null, sessions: [] },
      });
      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: { ...openSession, elapsedSeconds: 0 },
      });

      renderControl();
      await user.click(await screen.findByRole("button", { name: "Bắt đầu" }));

      await waitFor(() => {
        expect(postSpy).toHaveBeenCalledWith(`/api/tasks/${taskId}/work-sessions/start`);
        expect(screen.getByRole("button", { name: "Dừng" })).toBeInTheDocument();
      });
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "15/09/2026",
      description: "Chi goi STOP khi user bam Dung va dung active session id",
    },
    async () => {
      const user = userEvent.setup();
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: { taskId, activeSession: openSession, sessions: [openSession] },
      });
      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: {
          ...openSession,
          endedAt: "2026-09-14T10:45:30",
          status: "STOPPED",
        },
      });

      renderControl();
      await user.click(await screen.findByRole("button", { name: "Dừng" }));

      await waitFor(() => {
        expect(postSpy).toHaveBeenCalledWith(
          `/api/tasks/${taskId}/work-sessions/${sessionId}/stop`
        );
        expect(screen.getByRole("button", { name: "Bắt đầu" })).toBeInTheDocument();
      });
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "B",
      executedDate: "15/09/2026",
      description: "Format elapsedSeconds thanh timer HH MM SS on dinh",
    },
    () => {
      expect(formatWorkSessionDuration(0)).toBe("00:00:00");
      expect(formatWorkSessionDuration(3661)).toBe("01:01:01");
      expect(formatWorkSessionDuration(-10)).toBe("00:00:00");
    }
  );
});
