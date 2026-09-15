"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { JIRA_SPRINT_QUERY_KEYS } from "@/features/student/sprint-progress/hooks/use-sprint-data";
import { TASK_EVIDENCE_QUERY_KEYS } from "@/features/student/sprint-progress/hooks/use-task-evidence";
import { PROJECT_PROJECTION_QUERY_KEYS } from "@/features/student/project/hooks/useProjectSync";
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

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const isEnabled = (options?.enabled ?? true) && Boolean(projectId && projectId.trim());
  const cleanProjectId = projectId?.trim() || "";

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
          // READY is also emitted after an EventSource reconnect. The stream contains no canonical data.
          void queryClient.invalidateQueries({ queryKey: ["projects", pid] });
          invalidateTasks();
          invalidateSprints();
          invalidateCommits();
          invalidateTaskCommitLinks();
          invalidateSyncStatus();
          invalidateProgress();
          invalidateMemberProgress();
          break;
        case "TASKS_CHANGED":
          invalidateTasks();
          invalidateProgress();
          invalidateMemberProgress();
          break;
        case "SPRINTS_CHANGED":
          invalidateSprints();
          invalidateProgress();
          break;
        case "COMMITS_CHANGED":
          invalidateCommits();
          invalidateProgress();
          invalidateMemberProgress();
          break;
        case "TASK_LINKS_CHANGED":
          invalidateTasks();
          invalidateTaskDetails();
          invalidateTaskCommitLinks();
          invalidateCommits();
          invalidateProgress();
          invalidateMemberProgress();
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
          break;
        case "SYNC_STATUS_CHANGED":
          invalidateSyncStatus();
          invalidateProgress();
          break;
      }
    },
    [queryClient]
  );

  useEffect(() => {
    if (!isEnabled || !cleanProjectId || typeof window === "undefined" || typeof EventSource === "undefined") {
      return;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const apiBase =
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://saga-be-production.up.railway.app";
    const streamUrl = `${apiBase}/api/projects/${encodeURIComponent(cleanProjectId)}/events`;

    try {
      const es = new EventSource(streamUrl, { withCredentials: true });
      eventSourceRef.current = es;

      es.onopen = () => {
        setConnectionStatus("OPEN");
      };

      es.onerror = () => {
        setConnectionStatus("ERROR");
        // Keep the source open: native EventSource reconnects and BE will emit READY again.
      };

      REALTIME_EVENT_NAMES.forEach((eventName) => {
        es.addEventListener(eventName, (e: MessageEvent) => {
          let payload: { entityId?: string; occurredAt?: string } = {};
          try {
            payload = typeof e.data === "string" ? JSON.parse(e.data) : e.data || {};
          } catch {
            // Event names are authoritative invalidation signals; a malformed payload is ignored.
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
