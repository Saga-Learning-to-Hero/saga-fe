"use client";

import { useQuery } from "@tanstack/react-query";
import { DelayCaseService } from "../api/delay-case-service";

export function useDelayCase(
  projectId?: string | null,
  caseId?: string | null,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["delayCase", projectId, caseId],
    queryFn: () => DelayCaseService.getDelayCase(projectId as string, caseId as string),
    enabled: (options?.enabled ?? true) && Boolean(projectId?.trim() && caseId?.trim()),
  });
}
