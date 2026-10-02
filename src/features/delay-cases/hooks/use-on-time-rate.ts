import { useQuery } from "@tanstack/react-query";
import { delayCasesApi } from "../api/delay-cases-api";
import { DELAY_CASES_QUERY_KEYS } from "./use-delay-cases";

export function useOnTimeRate(projectId: string | null | undefined) {
  return useQuery({
    queryKey: projectId ? DELAY_CASES_QUERY_KEYS.onTimeRate(projectId) : ["on-time-rate", "none"],
    queryFn: () => {
      if (!projectId) return Promise.reject("No projectId");
      return delayCasesApi.getOnTimeRate(projectId);
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5, // 5 minutes (slower changing data)
    refetchOnWindowFocus: true,
  });
}
