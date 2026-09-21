import { apiClient } from "@/lib/axios";
import type { AdminDashboardSummaryResponse } from "../types/dashboard";

export class AdminDashboardService {
  static async getSummary(params?: {
    semesterId?: string;
    forceRefresh?: boolean;
    signal?: AbortSignal;
  }): Promise<AdminDashboardSummaryResponse> {
    const query = new URLSearchParams();
    if (params?.semesterId) query.set("semesterId", params.semesterId);
    if (params?.forceRefresh) query.set("forceRefresh", "true");

    const qs = query.toString();
    const url = qs ? `/api/admin/dashboard/summary?${qs}` : "/api/admin/dashboard/summary";
    const res = params?.signal
      ? await apiClient.get<AdminDashboardSummaryResponse>(url, {
          signal: params.signal,
        })
      : await apiClient.get<AdminDashboardSummaryResponse>(url);
    return res.data;
  }
}
