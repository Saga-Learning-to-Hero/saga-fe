"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/axios";
import { JIRA_SPRINT_QUERY_KEYS } from "@/features/student/sprint-progress/hooks/use-sprint-data";
import { TASK_EVIDENCE_QUERY_KEYS } from "@/features/student/sprint-progress/hooks/use-task-evidence";
import { PROJECT_PROJECTION_QUERY_KEYS } from "@/features/student/project/hooks/useProjectSync";
import { PROJECT_GRAPH_QUERY_KEY } from "@/features/graph/hooks/use-project-graph";
import type { GraphType } from "@/features/graph/types/graph";
import type {
  ProjectRealtimeEvent,
  ProjectRealtimeEventType,
  SSEConnectionStatus,
  UseProjectRealtimeOptions,
  UseProjectRealtimeReturn,
} from "../types/project-realtime-types";

const REALTIME_EVENT_NAMES: ProjectRealtimeEventType[] = [
  "READY",
  "TASKS_CHANGED",
  "SPRINTS_CHANGED",
  "COMMITS_CHANGED",
  "TASK_LINKS_CHANGED",
  "TASK_EVIDENCE_CHANGED",
  "SYNC_STATUS_CHANGED",
  "GRAPH_CHANGED",
];

export function useProjectRealtime(
  projectId?: string | null,
  options?: UseProjectRealtimeOptions
): UseProjectRealtimeReturn {
  const queryClient = useQueryClient();
  const [connectionStatus, setConnectionStatus] = useState<"CONNECTING" | "OPEN" | "ERROR">("CONNECTING");
  const [lastEvent, setLastEvent] = useState<ProjectRealtimeEvent | null>(null);
  const [lastEventTime, setLastEventTime] = useState<Date | null>(null);
  const [reconnectKey, setReconnectKey] = useState(0);

  const eventSourceRef = useRef<EventSource | null>(null);
  const optionsRef = useRef(options);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingGraphTypesRef = useRef<Set<GraphType | "ALL">>(new Set());

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const isEnabled = (options?.enabled ?? true) && Boolean(projectId && projectId.trim());
  const cleanProjectId = projectId?.trim() || "";

  const scheduleGraphInvalidation = useCallback(
    (pid: string, types: (GraphType | "ALL")[]) => {
      types.forEach((t) => pendingGraphTypesRef.current.add(t));

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        const set = new Set(pendingGraphTypesRef.current);
        pendingGraphTypesRef.current.clear();
        debounceTimerRef.current = null;

        if (set.has("ALL")) {
          void queryClient.invalidateQueries({
            queryKey: [PROJECT_GRAPH_QUERY_KEY, pid],
          });
          return;
        }

        set.forEach((gType) => {
          void queryClient.invalidateQueries({
            queryKey: [PROJECT_GRAPH_QUERY_KEY, pid, gType],
          });
        });
      }, 350);
    },
    [queryClient]
  );

  const invalidateForEvent = useCallback(
    (type: ProjectRealtimeEventType, pid: string, entityId?: string) => {
      const invalidateTasks = () => {
        void queryClient.invalidateQueries({ queryKey: JIRA_SPRINT_QUERY_KEYS.tasks(pid) });
        void queryClient.invalidateQueries({ queryKey: PROJECT_PROJECTION_QUERY_KEYS.tasks(pid) });
      };
      const invalidateSprints = () => {
        void queryClient.invalidateQueries({ queryKey: JIRA_SPRINT_QUERY_KEYS.sprints(pid) });
      };
      const invalidateCommits = () => {
        void queryClient.invalidateQueries({ queryKey: ["projects", pid, "commits"] });
        void queryClient.invalidateQueries({ queryKey: PROJECT_PROJECTION_QUERY_KEYS.commits(pid) });
      };
      const invalidateTaskDetails = () => {
        void queryClient.invalidateQueries({ queryKey: [...JIRA_SPRINT_QUERY_KEYS.all, "task", pid] });
      };
      const invalidateTaskCommitLinks = () => {
        void queryClient.invalidateQueries({
          queryKey: [...PROJECT_PROJECTION_QUERY_KEYS.all, "task-commits", pid],
        });
        void queryClient.invalidateQueries({
          queryKey: [...PROJECT_PROJECTION_QUERY_KEYS.all, "task-commit-links", pid],
        });
      };
      const invalidateSyncStatus = () => {
        void queryClient.invalidateQueries({ queryKey: ["projects", pid, "sync-status"] });
        void queryClient.invalidateQueries({ queryKey: PROJECT_PROJECTION_QUERY_KEYS.syncStatus(pid) });
      };
      const invalidateProgress = () => {
        void queryClient.invalidateQueries({ queryKey: PROJECT_PROJECTION_QUERY_KEYS.progress(pid) });
      };
      const invalidateMemberProgress = () => {
        void queryClient.invalidateQueries({
          queryKey: [...PROJECT_PROJECTION_QUERY_KEYS.all, "member-progress", pid],
        });
      };

      switch (type) {
        case "READY":
          void queryClient.invalidateQueries({ queryKey: ["projects", pid] });
          invalidateTasks();
          invalidateSprints();
          invalidateCommits();
          invalidateTaskCommitLinks();
          invalidateSyncStatus();
          invalidateProgress();
          invalidateMemberProgress();
          scheduleGraphInvalidation(pid, ["ALL"]);
          break;
        case "GRAPH_CHANGED":
          scheduleGraphInvalidation(pid, ["ALL"]);
          break;
        case "TASKS_CHANGED":
          invalidateTasks();
          invalidateProgress();
          invalidateMemberProgress();
          scheduleGraphInvalidation(pid, ["OVERVIEW", "CONTRIBUTION", "ACTIVITY"]);
          break;
        case "SPRINTS_CHANGED":
          invalidateSprints();
          invalidateProgress();
          scheduleGraphInvalidation(pid, ["OVERVIEW", "ACTIVITY"]);
          break;
        case "COMMITS_CHANGED":
          invalidateCommits();
          invalidateProgress();
          invalidateMemberProgress();
          scheduleGraphInvalidation(pid, ["OVERVIEW", "CONTRIBUTION", "ACTIVITY", "ATTRIBUTION"]);
          break;
        case "TASK_LINKS_CHANGED":
          invalidateTasks();
          invalidateTaskDetails();
          invalidateTaskCommitLinks();
          invalidateCommits();
          invalidateProgress();
          invalidateMemberProgress();
          scheduleGraphInvalidation(pid, ["OVERVIEW", "CONTRIBUTION", "ACTIVITY", "ATTRIBUTION"]);
          break;
        case "TASK_EVIDENCE_CHANGED":
          invalidateTaskDetails();
          invalidateProgress();
          invalidateMemberProgress();
          if (entityId) {
            void queryClient.invalidateQueries({ queryKey: TASK_EVIDENCE_QUERY_KEYS.workSessions(entityId) });
            void queryClient.invalidateQueries({ queryKey: TASK_EVIDENCE_QUERY_KEYS.webLinks(entityId) });
            void queryClient.invalidateQueries({ queryKey: TASK_EVIDENCE_QUERY_KEYS.files(entityId) });
          } else {
            void queryClient.invalidateQueries({ queryKey: ["tasks"] });
          }
          scheduleGraphInvalidation(pid, ["OVERVIEW", "CONTRIBUTION", "ACTIVITY"]);
          break;
        case "SYNC_STATUS_CHANGED":
          invalidateSyncStatus();
          invalidateProgress();
          break;
      }
    },
    [queryClient, scheduleGraphInvalidation]
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isEnabled || !cleanProjectId || typeof window === "undefined" || typeof EventSource === "undefined") {
      return;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const streamUrl = `${API_BASE_URL}/api/projects/${encodeURIComponent(cleanProjectId)}/events`;

    try {
      const es = new EventSource(streamUrl, { withCredentials: true });
      eventSourceRef.current = es;

      es.onopen = () => {
        setConnectionStatus("OPEN");
      };

      es.onerror = () => {
        setConnectionStatus("ERROR");
      };

      REALTIME_EVENT_NAMES.forEach((eventName) => {
        es.addEventListener(eventName, (e: MessageEvent) => {
          let payload: { entityId?: string; occurredAt?: string } = {};
          try {
            payload = typeof e.data === "string" ? JSON.parse(e.data) : e.data || {};
          } catch {
          }

          const realtimeEvent: ProjectRealtimeEvent = {
            type: eventName,
            projectId: cleanProjectId,
            entityId: typeof payload.entityId === "string" ? payload.entityId : undefined,
            occurredAt: typeof payload.occurredAt === "string" ? payload.occurredAt : new Date().toISOString(),
          };

          setLastEvent(realtimeEvent);
          setLastEventTime(new Date());
          invalidateForEvent(eventName, cleanProjectId, realtimeEvent.entityId);
          optionsRef.current?.onEvent?.(realtimeEvent);
        });
      });
    } catch {
      queueMicrotask(() => {
        setConnectionStatus("ERROR");
      });
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [cleanProjectId, isEnabled, reconnectKey, invalidateForEvent]);

  const reconnect = useCallback(() => {
    setConnectionStatus("CONNECTING");
    setReconnectKey((prev) => prev + 1);
  }, []);

  const status: SSEConnectionStatus = !isEnabled ? "CLOSED" : connectionStatus;

  return {
    status,
    lastEvent,
    lastEventTime,
    reconnect,
  };
}
