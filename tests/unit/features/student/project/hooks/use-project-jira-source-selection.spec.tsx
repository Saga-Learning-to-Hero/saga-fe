import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, vi } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";

const integrationsMock = vi.fn();
const tasksMock = vi.fn();
const jiraSourcesMock = vi.fn();

vi.mock("@/features/student/project/hooks/useProjectIntegrations", () => ({
  useProjectIntegrations: (...args: unknown[]) => integrationsMock(...args),
}));

vi.mock("@/features/student/project/hooks/use-jira-sources", () => ({
  useJiraSources: (...args: unknown[]) => jiraSourcesMock(...args),
}));

vi.mock("@/features/student/sprint-progress/hooks/use-project-tasks", () => ({
  useProjectTasksData: (...args: unknown[]) => tasksMock(...args),
}));

import { useProjectJiraSourceSelection } from "@/features/student/project/hooks/use-project-jira-source-selection";

describe("useProjectJiraSourceSelection", () => {
  beforeEach(() => {
    integrationsMock.mockReset();
    jiraSourcesMock.mockReset();
    jiraSourcesMock.mockReturnValue({
      data: [
        {
          integrationId: "source-a",
          siteName: "site-a.atlassian.net",
          projectKey: "A",
          connectionStatus: "ACTIVE",
        },
        {
          integrationId: "source-b",
          siteName: "site-b.atlassian.net",
          projectKey: "B",
          connectionStatus: "ACTIVE",
        },
        {
          integrationId: "source-old",
          siteName: "old.atlassian.net",
          projectKey: "OLD",
          connectionStatus: "REVOKED",
        },
      ],
      isLoading: false,
      isError: false,
    });
    integrationsMock.mockReturnValue({
      data: {
        jiraSources: [
          {
            integrationId: "source-a",
            siteName: "site-a.atlassian.net",
            projectKey: "A",
            connectionStatus: "ACTIVE",
          },
          {
            integrationId: "source-b",
            siteName: "site-b.atlassian.net",
            projectKey: "B",
            connectionStatus: "ACTIVE",
          },
          {
            integrationId: "source-old",
            siteName: "old.atlassian.net",
            projectKey: "OLD",
            connectionStatus: "REVOKED",
          },
        ],
      },
      isLoading: false,
      isError: false,
    });
    tasksMock.mockReturnValue({ data: [], isLoading: false, isError: false });
  });

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "21/09/2026",
      description: "Mac dinh nguon active dau tien va cho phep doi sang Jira Site khac",
    },
    () => {
      const { result } = renderHook(() => useProjectJiraSourceSelection("project-1"));

      expect(result.current.activeSources).toHaveLength(2);
      expect(result.current.effectiveSourceId).toBe("source-a");

      act(() => result.current.selectSource("source-b"));

      expect(result.current.effectiveSourceId).toBe("source-b");
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "B",
      executedDate: "21/09/2026",
      description: "Doi project khong tai su dung Jira source cua project truoc",
    },
    () => {
      const { result, rerender } = renderHook(
        ({ projectId }) => useProjectJiraSourceSelection(projectId),
        { initialProps: { projectId: "project-1" } }
      );

      act(() => result.current.selectSource("source-b"));
      expect(result.current.effectiveSourceId).toBe("source-b");

      rerender({ projectId: "project-2" });
      expect(result.current.effectiveSourceId).toBe("source-a");
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "21/09/2026",
      description: "Lecturer doc danh sach Jira source tu provenance cua task khi canonical rong",
    },
    () => {
      jiraSourcesMock.mockReturnValue({ data: [], isLoading: false, isError: false });
      integrationsMock.mockReturnValue({ data: undefined, isLoading: false, isError: false });
      tasksMock.mockReturnValue({
        data: [
          {
            id: "task-a",
            externalKey: "SITEA-1",
            jiraIntegrationId: "source-a",
            source: {
              integrationId: "source-a",
              siteName: "site-a.atlassian.net",
              projectKey: "SITEA",
              connectionStatus: "ACTIVE",
            },
          },
          {
            id: "task-b",
            externalKey: "SITEB-1",
            jiraIntegrationId: "source-b",
            source: {
              integrationId: "source-b",
              siteName: "site-b.atlassian.net",
              projectKey: "SITEB",
              connectionStatus: "ACTIVE",
            },
          },
        ],
        isLoading: false,
        isError: false,
      });

      const { result } = renderHook(() =>
        useProjectJiraSourceSelection("project-1", { readerMode: true })
      );

      expect(integrationsMock).toHaveBeenCalledWith("project-1", { enabled: false });
      expect(result.current.activeSources.map((source) => source.integrationId)).toEqual([
        "source-a",
        "source-b",
      ]);
      expect(result.current.hasMultipleSources).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "24/09/2026",
      description: "Lecturer doc danh sach Jira source canonical ke ca khi chua co task",
    },
    () => {
      tasksMock.mockReturnValue({ data: [], isLoading: false, isError: false });
      jiraSourcesMock.mockReturnValue({
        data: [
          {
            integrationId: "source-empty-1",
            siteName: "empty.atlassian.net",
            projectKey: "EMPTY",
            connectionStatus: "ACTIVE",
          },
        ],
        isLoading: false,
        isError: false,
      });

      const { result } = renderHook(() =>
        useProjectJiraSourceSelection("project-1", { readerMode: true })
      );

      expect(result.current.activeSources).toHaveLength(1);
      expect(result.current.effectiveSourceId).toBe("source-empty-1");
    }
  );
});
