"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { JIRA_SPRINT_QUERY_KEYS } from "@/features/student/sprint-progress/hooks/use-sprint-data";
import { PROJECT_INTEGRATIONS_QUERY_KEYS } from "@/features/student/project/hooks/useProjectIntegrations";
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
  const [retryCount, setRetryCount] = useState(0);
  const [reconnectKey, setReconnectKey] = useState(0);

  const eventSourceRef = useRef<EventSource | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const isEnabled = (options?.enabled ?? true) && Boolean(projectId && projectId.trim());
  const cleanProjectId = projectId?.trim() || "";

  const invalidateForEvent = useCallback(
    (type: ProjectRealtimeEventType, pid: string) => {
      switch (type) {
        case "READY":
          void queryClient.invalidateQueries({ queryKey: ["projects", pid] });
          void queryClient.invalidateQueries({ queryKey: JIRA_SPRINT_QUERY_KEYS.all });
          break;
        case "TASKS_CHANGED":
          void queryClient.invalidateQueries({ queryKey: JIRA_SPRINT_QUERY_KEYS.tasks(pid) });
          void queryClient.invalidateQueries({ queryKey: JIRA_SPRINT_QUERY_KEYS.sprints(pid) });
          break;
        case "SPRINTS_CHANGED":
          void queryClient.invalidateQueries({ queryKey: JIRA_SPRINT_QUERY_KEYS.sprints(pid) });
          void queryClient.invalidateQueries({ queryKey: JIRA_SPRINT_QUERY_KEYS.tasks(pid) });
          break;
        case "COMMITS_CHANGED":
          void queryClient.invalidateQueries({ queryKey: ["projects", pid, "commits"] });
          void queryClient.invalidateQueries({ queryKey: PROJECT_PROJECTION_QUERY_KEYS.commits(pid) });
          break;
        case "TASK_LINKS_CHANGED":
          void queryClient.invalidateQueries({ queryKey: JIRA_SPRINT_QUERY_KEYS.tasks(pid) });
          void queryClient.invalidateQueries({ queryKey: ["projects", pid, "commits"] });
          void queryClient.invalidateQueries({ queryKey: PROJECT_PROJECTION_QUERY_KEYS.commits(pid) });
          break;
        case "TASK_EVIDENCE_CHANGED":
          void queryClient.invalidateQueries({ queryKey: JIRA_SPRINT_QUERY_KEYS.tasks(pid) });
          break;
        case "SYNC_STATUS_CHANGED":
          void queryClient.invalidateQueries({
            queryKey: PROJECT_INTEGRATIONS_QUERY_KEYS.projectIntegrations(pid),
            exact: true,
          });
          void queryClient.invalidateQueries({ queryKey: ["projects", pid, "sync-status"] });
          void queryClient.invalidateQueries({
            queryKey: PROJECT_PROJECTION_QUERY_KEYS.syncStatus(pid),
          });
          break;
      }
    },
    [queryClient]
  );

  useEffect(() => {
    if (!isEnabled || !cleanProjectId || typeof window === "undefined" || typeof EventSource === "undefined") {
      return;
    }

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
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
        setRetryCount(0);
      };

      es.onerror = () => {
        setConnectionStatus("ERROR");
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }

        if (retryCount < 5) {
          const delay = Math.min(1000 * Math.pow(2, retryCount) + Math.random() * 1000, 30000);
          retryTimeoutRef.current = setTimeout(() => {
            setRetryCount((prev) => prev + 1);
            setReconnectKey((prev) => prev + 1);
          }, delay);
        }
      };

      REALTIME_EVENT_NAMES.forEach((eventName) => {
        es.addEventListener(eventName, (e: MessageEvent) => {
          try {
            const parsed = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
            const parsedEvent: ProjectRealtimeEvent = {
              type: (parsed?.type || eventName) as ProjectRealtimeEventType,
              projectId: parsed?.projectId || cleanProjectId,
              entityId: parsed?.entityId,
              occurredAt: parsed?.occurredAt || new Date().toISOString(),
            };

            setLastEvent(parsedEvent);
            setLastEventTime(new Date());

            invalidateForEvent(parsedEvent.type, parsedEvent.projectId);
            optionsRef.current?.onEvent?.(parsedEvent);
          } catch {
            invalidateForEvent(eventName, cleanProjectId);
          }
        });
      });
    } catch {
      queueMicrotask(() => {
        setConnectionStatus("ERROR");
      });
    }

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [cleanProjectId, isEnabled, reconnectKey, retryCount, invalidateForEvent]);

  const reconnect = useCallback(() => {
    setRetryCount(0);
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
