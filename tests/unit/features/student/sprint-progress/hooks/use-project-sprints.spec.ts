import { describe, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fptTest } from "@/testing/fpt-test-helper";

const getSprints = vi.fn();
const jiraSourcesMock = vi.fn();
const integrationsMock = vi.fn();

vi.mock("@/features/student/sprint-progress/api/project-sprint-service", () => ({
  ProjectSprintService: {
    getSprints: (...args: unknown[]) => getSprints(...args),
  },
}));

vi.mock("@/features/student/project/hooks/use-jira-sources", () => ({
  useJiraSources: (...args: unknown[]) => jiraSourcesMock(...args),
}));

vi.mock("@/features/student/project/hooks/useProjectIntegrations", () => ({
  useProjectIntegrations: (...args: unknown[]) => integrationsMock(...args),
}));

import { useProjectSprints } from "@/features/student/sprint-progress/hooks/use-project-sprints";

function idleSources() {
  return {
    data: undefined,
    isFetched: false,
    isSuccess: false,
    isError: false,
    isLoading: true,
  };
}

function settledSources(data: unknown[]) {
  return {
    data,
    isFetched: true,
    isSuccess: true,
    isError: false,
    isLoading: false,
  };
}

describe("useProjectSprints", () => {
  let wrapper: React.FC<{ children: React.ReactNode }>;

  beforeEach(() => {
    vi.clearAllMocks();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    wrapper = ({ children }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);
    getSprints.mockResolvedValue([]);
    jiraSourcesMock.mockReturnValue(idleSources());
    integrationsMock.mockReturnValue(idleSources());
  });

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "29/09/2026",
      description: "Explicit jiraIntegrationId goi GET /sprints voi query param do",
    },
    async () => {
      renderHook(() => useProjectSprints("proj-1", "jira-explicit"), { wrapper });
      await waitFor(() => expect(getSprints).toHaveBeenCalledWith("proj-1", "jira-explicit"));
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "29/09/2026",
      description: "Mot source ACTIVE sau settle goi /sprints voi integrationId do",
    },
    async () => {
      jiraSourcesMock.mockReturnValue(
        settledSources([
          { integrationId: "only-source", connectionStatus: "ACTIVE" },
        ])
      );
      renderHook(() => useProjectSprints("proj-1"), { wrapper });
      await waitFor(() => expect(getSprints).toHaveBeenCalledWith("proj-1", "only-source"));
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "A",
      executedDate: "29/09/2026",
      description: "Sources dang loading thi khong goi /sprints",
    },
    async () => {
      renderHook(() => useProjectSprints("proj-1"), { wrapper });
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
      });
      expect(getSprints).not.toHaveBeenCalled();
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "A",
      executedDate: "29/09/2026",
      description: "0 source ACTIVE sau settle thi khong goi /sprints",
    },
    async () => {
      jiraSourcesMock.mockReturnValue(settledSources([]));
      integrationsMock.mockReturnValue({
        data: { jiraSources: [] },
        isFetched: true,
        isSuccess: true,
        isError: false,
        isLoading: false,
      });
      renderHook(() => useProjectSprints("proj-1"), { wrapper });
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
      });
      expect(getSprints).not.toHaveBeenCalled();
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "A",
      executedDate: "29/09/2026",
      description: "Nhieu source chua chon thi khong auto source dau va khong goi API",
    },
    async () => {
      jiraSourcesMock.mockReturnValue(
        settledSources([
          { integrationId: "first", connectionStatus: "ACTIVE" },
          { integrationId: "second", connectionStatus: "ACTIVE" },
        ])
      );
      renderHook(() => useProjectSprints("proj-1"), { wrapper });
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
      });
      expect(getSprints).not.toHaveBeenCalled();
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "B",
      executedDate: "29/09/2026",
      description: "projectId rong thi khong goi /sprints",
    },
    async () => {
      renderHook(() => useProjectSprints("  ", { enabled: true }), { wrapper });
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
      });
      expect(getSprints).not.toHaveBeenCalled();
    }
  );
});
