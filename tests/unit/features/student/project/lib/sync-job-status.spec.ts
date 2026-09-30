import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import {
  canRequestProjectSync,
  hasExceededSyncPollWindow,
  isActiveSyncJob,
  isActiveSyncStatus,
  isActivelySyncing,
  isTerminalSyncStatus,
  resolveSyncStatusPollInterval,
  SYNC_POLL_ACTIVE_MS,
  SYNC_POLL_TIMEOUT_MS,
} from "@/features/student/project/lib/sync-job-status";

describe("sync-job-status", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "29/09/2026",
      description: "QUEUED va RUNNING khong co completedAt duoc coi la dang sync",
    },
    () => {
      expect(isActiveSyncStatus("QUEUED")).toBe(true);
      expect(isActiveSyncStatus("RUNNING")).toBe(true);
      expect(isActiveSyncJob({ status: "ENQUEUED", completedAt: null, startedAt: new Date().toISOString() })).toBe(true);
      expect(isActivelySyncing([{ status: "SYNCING", completedAt: null, startedAt: new Date().toISOString() }])).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "29/09/2026",
      description: "SUCCEEDED va FAILED la terminal, khong poll",
    },
    () => {
      expect(isTerminalSyncStatus("SUCCEEDED")).toBe(true);
      expect(isTerminalSyncStatus("FAILED")).toBe(true);
      expect(isActiveSyncJob({ status: "SUCCEEDED", completedAt: null, startedAt: new Date().toISOString() })).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "A",
      executedDate: "29/09/2026",
      description: "Status la khong nam whitelist khong coi la dang sync",
    },
    () => {
      expect(isActiveSyncStatus("UNKNOWN_PROVIDER_STATE")).toBe(false);
      expect(isActivelySyncing([{ status: "WEIRD", completedAt: null, startedAt: new Date().toISOString() }])).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "A",
      executedDate: "29/09/2026",
      description: "Co completedAt thi khong con active du status RUNNING",
    },
    () => {
      expect(
        isActiveSyncJob({ status: "RUNNING", completedAt: "2026-09-29T00:00:00.000Z", startedAt: "2026-09-28T00:00:00.000Z" })
      ).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "B",
      executedDate: "29/09/2026",
      description: "Danh sach rong hoac thieu job khong poll",
    },
    () => {
      expect(isActivelySyncing([])).toBe(false);
      expect(isActivelySyncing(null)).toBe(false);
      expect(isActiveSyncJob(null)).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "N",
      executedDate: "29/09/2026",
      description: "SSE OPEN va idle khong poll sync-status",
    },
    () => {
      expect(
        resolveSyncStatusPollInterval({
          isActivelySyncing: false,
          sseStatus: "OPEN",
        })
      ).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "N",
      executedDate: "29/09/2026",
      description: "Job active poll 3s trong cua so 90s",
    },
    () => {
      const now = 1_000_000;
      expect(
        resolveSyncStatusPollInterval({
          isActivelySyncing: true,
          sseStatus: "OPEN",
          activeSinceMs: now,
          now,
        })
      ).toBe(SYNC_POLL_ACTIVE_MS);
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "A",
      executedDate: "29/09/2026",
      description: "Job active qua 90s thi cat poll",
    },
    () => {
      const started = 1_000_000;
      expect(
        resolveSyncStatusPollInterval({
          isActivelySyncing: true,
          sseStatus: "ERROR",
          activeSinceMs: started,
          now: started + SYNC_POLL_TIMEOUT_MS,
        })
      ).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "A",
      executedDate: "29/09/2026",
      description: "SSE ERROR idle poll 3s roi cat sau 90s",
    },
    () => {
      const started = 5_000;
      expect(
        resolveSyncStatusPollInterval({
          isActivelySyncing: false,
          sseStatus: "ERROR",
          errorSinceMs: started,
          now: started + 1000,
        })
      ).toBe(SYNC_POLL_ACTIVE_MS);
      expect(
        resolveSyncStatusPollInterval({
          isActivelySyncing: false,
          sseStatus: "ERROR",
          errorSinceMs: started,
          now: started + SYNC_POLL_TIMEOUT_MS,
        })
      ).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID10",
      type: "B",
      executedDate: "29/09/2026",
      description: "SSE CLOSED/CONNECTING idle khong poll 30s",
    },
    () => {
      expect(
        resolveSyncStatusPollInterval({
          isActivelySyncing: false,
          sseStatus: "CLOSED",
        })
      ).toBe(false);
      expect(
        resolveSyncStatusPollInterval({
          isActivelySyncing: false,
          sseStatus: "CONNECTING",
        })
      ).toBe(false);
      expect(hasExceededSyncPollWindow(null)).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID11",
      type: "N",
      executedDate: "29/09/2026",
      description: "Leader duoc phep POST /sync",
    },
    () => {
      expect(canRequestProjectSync(true)).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID12",
      type: "A",
      executedDate: "29/09/2026",
      description: "Member khong duoc phep POST /sync",
    },
    () => {
      expect(canRequestProjectSync(false)).toBe(false);
    }
  );
});
