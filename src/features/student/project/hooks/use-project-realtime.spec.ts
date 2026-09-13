import { describe, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fptTest } from "@/testing/fpt-test-helper";
import { useProjectRealtime } from "./use-project-realtime";
import { JIRA_SPRINT_QUERY_KEYS } from "@/features/student/sprint-progress/hooks/use-sprint-data";
import { PROJECT_INTEGRATIONS_QUERY_KEYS } from "@/features/student/project/hooks/useProjectIntegrations";

class MockEventSource {
  static instances: MockEventSource[] = [];
  url: string;
  withCredentials?: boolean;
  onopen: ((ev: Event) => void) | null = null;
  onerror: ((ev: Event) => void) | null = null;
  onmessage: ((ev: MessageEvent) => void) | null = null;
  listeners: Record<string, ((ev: { type: string; data: string }) => void)[]> = {};
  closed = false;

  constructor(url: string, init?: { withCredentials?: boolean }) {
    this.url = url;
    this.withCredentials = init?.withCredentials;
    MockEventSource.instances.push(this);
  }

  addEventListener(type: string, listener: (ev: { type: string; data: string }) => void) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(listener);
  }

  removeEventListener(type: string, listener: (ev: { type: string; data: string }) => void) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter((l) => l !== listener);
    }
  }

  close() {
    this.closed = true;
  }

  emitOpen() {
    if (this.onopen) {
      this.onopen(new Event("open"));
    }
  }

  emitError() {
    if (this.onerror) {
      this.onerror(new Event("error"));
    }
  }

  emitEvent(type: string, data: unknown) {
    const payload = {
      type,
      data: typeof data === "string" ? data : JSON.stringify(data),
    };
    if (this.listeners[type]) {
      this.listeners[type].forEach((cb) => cb(payload));
    }
  }
}

describe("useProjectRealtime Hook", () => {
  let queryClient: QueryClient;
  let originalEventSource: typeof globalThis.EventSource;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    MockEventSource.instances = [];
    originalEventSource = globalThis.EventSource;
    (globalThis as unknown as { EventSource: unknown }).EventSource = MockEventSource;
  });

  afterEach(() => {
    (globalThis as unknown as { EventSource: unknown }).EventSource = originalEventSource;
    vi.clearAllMocks();
  });

  const createWrapper = () => {
    return function Wrapper({ children }: { children: React.ReactNode }) {
      return React.createElement(QueryClientProvider, { client: queryClient }, children);
    };
  };

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "12/09/2026",
      description: "Thiet lap EventSource voi url hop le va cap nhat status OPEN",
    },
    () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useProjectRealtime("project-123"), { wrapper });

      expect(MockEventSource.instances).toHaveLength(1);
      const es = MockEventSource.instances[0];
      expect(es.url).toContain("/api/projects/project-123/events");
      expect(es.withCredentials).toBe(true);
      expect(result.current.status).toBe("CONNECTING");

      act(() => {
        es.emitOpen();
      });

      expect(result.current.status).toBe("OPEN");
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "12/09/2026",
      description: "Nhan su kien READY, invalidate toan bo queries va cap nhat lastEvent",
    },
    () => {
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
      const onEventMock = vi.fn();
      const wrapper = createWrapper();
      const { result } = renderHook(
        () => useProjectRealtime("project-456", { onEvent: onEventMock }),
        { wrapper }
      );

      const es = MockEventSource.instances[0];
      act(() => {
        es.emitOpen();
      });

      const readyPayload = {
        type: "READY",
        projectId: "project-456",
        occurredAt: "2026-09-12T03:00:00.000Z",
      };

      act(() => {
        es.emitEvent("READY", readyPayload);
      });

      expect(result.current.lastEvent?.type).toBe("READY");
      expect(result.current.lastEvent?.projectId).toBe("project-456");
      expect(result.current.lastEventTime).toBeInstanceOf(Date);
      expect(onEventMock).toHaveBeenCalledWith(
        expect.objectContaining({ type: "READY", projectId: "project-456" })
      );
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["projects", "project-456"] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: JIRA_SPRINT_QUERY_KEYS.all });
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "12/09/2026",
      description: "Nhan su kien TASKS_CHANGED va SPRINTS_CHANGED, invalidate tasks va sprints",
    },
    () => {
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
      const wrapper = createWrapper();
      const { result } = renderHook(() => useProjectRealtime("project-789"), { wrapper });

      const es = MockEventSource.instances[0];
      act(() => {
        es.emitOpen();
        es.emitEvent("TASKS_CHANGED", {
          type: "TASKS_CHANGED",
          projectId: "project-789",
          entityId: "task-01",
        });
      });

      expect(result.current.lastEvent?.type).toBe("TASKS_CHANGED");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: JIRA_SPRINT_QUERY_KEYS.tasks("project-789"),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: JIRA_SPRINT_QUERY_KEYS.sprints("project-789"),
      });

      act(() => {
        es.emitEvent("SPRINTS_CHANGED", {
          type: "SPRINTS_CHANGED",
          projectId: "project-789",
        });
      });

      expect(result.current.lastEvent?.type).toBe("SPRINTS_CHANGED");
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "12/09/2026",
      description: "Nhan COMMITS_CHANGED va SYNC_STATUS_CHANGED, invalidate dung cache",
    },
    () => {
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
      const wrapper = createWrapper();
      renderHook(() => useProjectRealtime("project-999"), { wrapper });

      const es = MockEventSource.instances[0];
      act(() => {
        es.emitOpen();
        es.emitEvent("COMMITS_CHANGED", {
          type: "COMMITS_CHANGED",
          projectId: "project-999",
        });
      });

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["projects", "project-999", "commits"],
      });

      act(() => {
        es.emitEvent("SYNC_STATUS_CHANGED", {
          type: "SYNC_STATUS_CHANGED",
          projectId: "project-999",
        });
      });

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: PROJECT_INTEGRATIONS_QUERY_KEYS.projectIntegrations("project-999"),
        exact: true,
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["projects", "project-999", "sync-status"],
      });
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "N",
      executedDate: "12/09/2026",
      description: "Nhan TASK_LINKS_CHANGED va TASK_EVIDENCE_CHANGED, cap nhat lien quan",
    },
    () => {
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
      const wrapper = createWrapper();
      renderHook(() => useProjectRealtime("project-111"), { wrapper });

      const es = MockEventSource.instances[0];
      act(() => {
        es.emitOpen();
        es.emitEvent("TASK_LINKS_CHANGED", {
          type: "TASK_LINKS_CHANGED",
          projectId: "project-111",
        });
      });

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: JIRA_SPRINT_QUERY_KEYS.tasks("project-111"),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["projects", "project-111", "commits"],
      });

      act(() => {
        es.emitEvent("TASK_EVIDENCE_CHANGED", {
          type: "TASK_EVIDENCE_CHANGED",
          projectId: "project-111",
        });
      });

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: JIRA_SPRINT_QUERY_KEYS.tasks("project-111"),
      });
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "A",
      executedDate: "12/09/2026",
      description: "Khong khoi tao EventSource khi projectId null hoac options.enabled = false",
    },
    () => {
      const wrapper = createWrapper();
      const { result: res1 } = renderHook(() => useProjectRealtime(null), { wrapper });
      expect(MockEventSource.instances).toHaveLength(0);
      expect(res1.current.status).toBe("CLOSED");

      const { result: res2 } = renderHook(() => useProjectRealtime("   "), { wrapper });
      expect(MockEventSource.instances).toHaveLength(0);
      expect(res2.current.status).toBe("CLOSED");

      const { result: res3 } = renderHook(
        () => useProjectRealtime("project-123", { enabled: false }),
        { wrapper }
      );
      expect(MockEventSource.instances).toHaveLength(0);
      expect(res3.current.status).toBe("CLOSED");
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "A",
      executedDate: "12/09/2026",
      description: "Chuyen status thanh ERROR va dong ket noi khi xay ra onerror",
    },
    () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useProjectRealtime("project-error"), { wrapper });

      const es = MockEventSource.instances[0];
      act(() => {
        es.emitError();
      });

      expect(result.current.status).toBe("ERROR");
      expect(es.closed).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "B",
      executedDate: "12/09/2026",
      description: "Xu ly an toan khi payload du lieu json khong hop le",
    },
    () => {
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
      const wrapper = createWrapper();
      renderHook(() => useProjectRealtime("project-fallback"), { wrapper });

      const es = MockEventSource.instances[0];
      act(() => {
        es.emitOpen();
        const brokenEvent = {
          type: "TASKS_CHANGED",
          data: "invalid-json{",
        };
        if (es.listeners["TASKS_CHANGED"]) {
          es.listeners["TASKS_CHANGED"].forEach((cb) => cb(brokenEvent));
        }
      });

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: JIRA_SPRINT_QUERY_KEYS.tasks("project-fallback"),
      });
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "B",
      executedDate: "12/09/2026",
      description: "Goi reconnect thu cong tao EventSource moi",
    },
    () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useProjectRealtime("project-recon"), { wrapper });

      expect(MockEventSource.instances).toHaveLength(1);
      const firstEs = MockEventSource.instances[0];

      act(() => {
        result.current.reconnect();
      });

      expect(firstEs.closed).toBe(true);
      expect(MockEventSource.instances).toHaveLength(2);
      expect(result.current.status).toBe("CONNECTING");
    }
  );

  fptTest(
    {
      id: "UTCID10",
      type: "B",
      executedDate: "12/09/2026",
      description: "Dong EventSource khi component unmount",
    },
    () => {
      const wrapper = createWrapper();
      const { unmount } = renderHook(() => useProjectRealtime("project-cleanup"), { wrapper });

      expect(MockEventSource.instances).toHaveLength(1);
      const es = MockEventSource.instances[0];
      expect(es.closed).toBe(false);

      unmount();

      expect(es.closed).toBe(true);
    }
  );
});
