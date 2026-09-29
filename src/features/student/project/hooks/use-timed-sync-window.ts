"use client";

import { useEffect, useState } from "react";
import { SYNC_POLL_TIMEOUT_MS } from "../lib/sync-job-status";

/** Spinner đồng bộ tự tắt sau 90s. Reset khi job ngừng active, không gọi Date.now lúc render. */
export function useTimedSyncWindow(isActive: boolean): boolean {
  const [timedOut, setTimedOut] = useState(false);
  const [wasActive, setWasActive] = useState(isActive);

  if (isActive !== wasActive) {
    setWasActive(isActive);
    setTimedOut(false);
  }

  useEffect(() => {
    if (!isActive) return;
    const timer = window.setTimeout(() => setTimedOut(true), SYNC_POLL_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [isActive]);

  return isActive && timedOut;
}
