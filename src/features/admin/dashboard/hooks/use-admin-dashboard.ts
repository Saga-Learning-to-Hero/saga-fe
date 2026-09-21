"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import { AdminDashboardService } from "../api/admin-dashboard-service";

export const ADMIN_DASHBOARD_QUERY_KEYS = {
  summary: (semesterId?: string) =>
    ["admin", "dashboard", "summary", semesterId ?? "default"] as const,
};

export const ADMIN_DASHBOARD_STALE_TIME = 1000 * 60 * 5;
export const ADMIN_DASHBOARD_GC_TIME = 1000 * 60 * 30;

export function prefetchAdminDashboardSummary(
  queryClient: QueryClient,
  semesterId?: string
) {
  return queryClient
    .prefetchQuery({
      queryKey: ADMIN_DASHBOARD_QUERY_KEYS.summary(semesterId),
      queryFn: ({ signal }) =>
        AdminDashboardService.getSummary({ semesterId, signal }),
      staleTime: ADMIN_DASHBOARD_STALE_TIME,
      gcTime: ADMIN_DASHBOARD_GC_TIME,
    })
    .catch(() => undefined);
}

export function useAdminDashboardSummary(semesterId?: string) {
  return useQuery({
    queryKey: ADMIN_DASHBOARD_QUERY_KEYS.summary(semesterId),
    queryFn: ({ signal }) =>
      AdminDashboardService.getSummary({ semesterId, signal }),
    staleTime: ADMIN_DASHBOARD_STALE_TIME,
    gcTime: ADMIN_DASHBOARD_GC_TIME,
    retry: false,
    placeholderData: (previousData) => previousData,
  });
}

export function useAdminDashboardForceRefresh() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (semesterId?: string) =>
      AdminDashboardService.getSummary({ semesterId, forceRefresh: true }),
    onSuccess: (summary, semesterId) => {
      queryClient.setQueryData(
        ADMIN_DASHBOARD_QUERY_KEYS.summary(semesterId),
        summary
      );

      if (summary.cacheMetadata.refreshPending) {
        toast.warning("Dữ liệu đang được máy chủ làm mới", {
          description:
            "Hệ thống đang trả snapshot gần nhất. Vui lòng thử lại sau ít phút.",
        });
        return;
      }

      toast.success("Đã cập nhật số liệu dashboard từ máy chủ.");
    },
    onError: (error) => {
      toast.error("Không thể làm mới dashboard", {
        description: getApiErrorMessage(
          error,
          "Máy chủ chưa thể tổng hợp lại số liệu. Vui lòng thử lại sau."
        ),
      });
    },
  });
}
