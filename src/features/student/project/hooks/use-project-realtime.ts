"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useQueryClient, type InvalidateQueryFilters } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/axios";
import { JIRA_SPRINT_QUERY_KEYS } from "@/features/student/sprint-progress/hooks/use-sprint-data";
import { TASK_EVIDENCE_QUERY_KEYS } from "@/features/student/sprint-progress/hooks/use-task-evidence";
import { PROJECT_PROJECTION_QUERY_KEYS } from "@/features/student/project/hooks/useProjectSync";
import { PROJECT_INTEGRATIONS_QUERY_KEYS } from "@/features/student/project/hooks/useProjectIntegrations";
import { PROJECT_GRAPH_QUERY_KEY } from "@/features/graph/hooks/use-project-graph";
import { CONTRIBUTION_QUERY_KEYS } from "@/features/lecturer/contribution/hooks/use-lecturer-contribution";
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
  "COMMIT_REVIEWS_CHANGED",
];

const READY_DEBOUNCE_MS = 1000;
const READY_CATCH_UP_MIN_INTERVAL_MS = 60_000;
/**
 * One sync round sends several events back to back (status, tasks, sprints, links for each Jira
 * source): every list they touch is reloaded once per window, and a reload already in flight is
 * not cancelled and restarted.
 */
export const REALTIME_INVALIDATE_BATCH_MS = 500;

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
  const readyDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingGraphTypesRef = useRef<Set<GraphType | "ALL">>(new Set());
  /** SSE reconnects resend READY: catch up on what was missed, but at most once a minute so a flaky
   * connection does not reload every list again and again. */
  const lastReadyCatchUpRef = useRef(0);
  const pendingInvalidationsRef = useRef<Map<string, InvalidateQueryFilters>>(new Map());
  const invalidateTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const isEnabled = (options?.enabled ?? true) && Boolean(projectId && projectId.trim());
  const cleanProjectId = projectId?.trim() || "";

  const flushInvalidations = useCallback(() => {
    if (invalidateTimerRef.current) {
      clearTimeout(invalidateTimerRef.current);
      invalidateTimerRef.current = null;
    }
    const pending = [...pendingInvalidationsRef.current.values()];
    pendingInvalidationsRef.current.clear();
    pending.forEach((filters) => {
      void queryClient.invalidateQueries(filters, { cancelRefetch: false });
    });
  }, [queryClient]);

  const queueInvalidation = useCallback(
    (filters: InvalidateQueryFilters) => {
      pendingInvalidationsRef.current.set(JSON.stringify(filters), filters);
      if (!invalidateTimerRef.current) {
        invalidateTimerRef.current = setTimeout(flushInvalidations, REALTIME_INVALIDATE_BATCH_MS);
      }
    },
    [flushInvalidations]
  );

  const scheduleGraphInvalidation = useCallback(
    (pid: string, types: (GraphType | "ALL")[]) => {
      if (optionsRef.current?.includeGraph !== true) return;

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
      const includeProgress = optionsRef.current?.includeProgress === true;
      const includeIntegrations = optionsRef.current?.includeIntegrations === true;
      const invalidateTasks = () => {
        queueInvalidation({ queryKey: JIRA_SPRINT_QUERY_KEYS.tasks(pid) });
        queueInvalidation({ queryKey: PROJECT_PROJECTION_QUERY_KEYS.tasks(pid) });
      };
      const invalidateSprints = () => {
        queueInvalidation({ queryKey: JIRA_SPRINT_QUERY_KEYS.sprints(pid) });
      };
      const invalidateCommits = () => {
        queueInvalidation({ queryKey: PROJECT_PROJECTION_QUERY_KEYS.commits(pid) });
      };
      const invalidateParentOptions = () => {
        queueInvalidation({
          queryKey: [...JIRA_SPRINT_QUERY_KEYS.all, "parent-task-options", pid],
        });
      };
      const invalidateTaskDetails = () => {
        queueInvalidation({ queryKey: [...JIRA_SPRINT_QUERY_KEYS.all, "task", pid] });
      };
      const invalidateTaskCommitLinks = () => {
        queueInvalidation({
          queryKey: [...PROJECT_PROJECTION_QUERY_KEYS.all, "task-commits", pid],
        });
        queueInvalidation({
          queryKey: [...PROJECT_PROJECTION_QUERY_KEYS.all, "task-commit-links", pid],
        });
      };
      const invalidateSyncStatus = () => {
        queueInvalidation({ queryKey: PROJECT_PROJECTION_QUERY_KEYS.syncStatus(pid) });
      };
      const invalidateProgress = () => {
        if (!includeProgress) return;
        queueInvalidation({ queryKey: PROJECT_PROJECTION_QUERY_KEYS.progress(pid) });
      };
      const invalidateMemberProgress = () => {
        if (!includeProgress) return;
        queueInvalidation({
          queryKey: [...PROJECT_PROJECTION_QUERY_KEYS.all, "member-progress", pid],
        });
      };
      const invalidateIntegrations = () => {
        if (!includeIntegrations) return;
        queueInvalidation({
          queryKey: PROJECT_INTEGRATIONS_QUERY_KEYS.projectIntegrations(pid),
          exact: true,
        });
      };
      const invalidateContributionEvaluation = () => {
        queueInvalidation({
          queryKey: CONTRIBUTION_QUERY_KEYS.evaluations,
        });
      };

      const scheduleReadyInvalidation = () => {
        if (readyDebounceTimerRef.current) {
          clearTimeout(readyDebounceTimerRef.current);
        }
        readyDebounceTimerRef.current = setTimeout(() => {
          readyDebounceTimerRef.current = null;
          invalidateTasks();
          invalidateSprints();
          invalidateCommits();
          invalidateSyncStatus();
          invalidateIntegrations();
          invalidateProgress();
          invalidateMemberProgress();
          flushInvalidations();
        }, READY_DEBOUNCE_MS);
      };

      switch (type) {
        case "READY":
          if (Date.now() - lastReadyCatchUpRef.current < READY_CATCH_UP_MIN_INTERVAL_MS) break;
          lastReadyCatchUpRef.current = Date.now();
          scheduleReadyInvalidation();
          break;
        case "GRAPH_CHANGED":
          scheduleGraphInvalidation(pid, ["ALL"]);
          break;
        case "TASKS_CHANGED":
          invalidateTasks();
          invalidateTaskDetails();
          invalidateParentOptions();
          invalidateProgress();
          invalidateMemberProgress();
          invalidateContributionEvaluation();
          break;
        case "SPRINTS_CHANGED":
          invalidateSprints();
          invalidateTasks();
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
          invalidateContributionEvaluation();
          break;
        case "TASK_EVIDENCE_CHANGED":
          invalidateTasks();
          invalidateTaskDetails();
          invalidateProgress();
          invalidateMemberProgress();
          invalidateContributionEvaluation();
          if (entityId) {
            queueInvalidation({ queryKey: TASK_EVIDENCE_QUERY_KEYS.workSessions(entityId) });
            queueInvalidation({ queryKey: TASK_EVIDENCE_QUERY_KEYS.webLinks(entityId) });
            queueInvalidation({ queryKey: TASK_EVIDENCE_QUERY_KEYS.files(entityId) });
          } else {
            queueInvalidation({ queryKey: ["tasks"] });
          }
          break;
        case "COMMIT_REVIEWS_CHANGED":
          // an AI review was queued or finished: commit badges and open review panels only
          invalidateCommits();
          queueInvalidation({ queryKey: ["projects", pid, "commits"] });
          // the reconciliation matrix lists each task's commits with their badges
          queueInvalidation({ queryKey: [...PROJECT_PROJECTION_QUERY_KEYS.all, "task-commits", pid] });
          break;
        case "SYNC_STATUS_CHANGED":
          invalidateSyncStatus();
          invalidateProgress();
          invalidateTasks();
          invalidateTaskDetails();
          invalidateParentOptions();
          break;
      }
    },
    [queueInvalidation, flushInvalidations, scheduleGraphInvalidation]
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (readyDebounceTimerRef.current) {
        clearTimeout(readyDebounceTimerRef.current);
      }
      if (invalidateTimerRef.current) {
        clearTimeout(invalidateTimerRef.current);
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
    lastReadyCatchUpRef.current = 0;

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
