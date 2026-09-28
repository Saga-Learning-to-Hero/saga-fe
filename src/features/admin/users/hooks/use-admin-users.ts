"use client";

import { showSuccessToast, showErrorToast } from "@/lib/api-error";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminUserService } from "../api/admin-user-service";
import type {
  GetAdminUsersParams,
  UpdateUserStatusRequest,
} from "../types/user-management";

export const ADMIN_USER_QUERY_KEYS = {
  all: ["admin-users"] as const,
  list: (params?: GetAdminUsersParams) =>
    ["admin-users", "list", params] as const,
  detail: (id: string) => ["admin-users", "detail", id] as const,
};

export function useAdminUsers(
  params?: GetAdminUsersParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ADMIN_USER_QUERY_KEYS.list(params),
    queryFn: () => AdminUserService.getUsers(params),
    staleTime: 1000 * 60 * 2,
    enabled: options?.enabled ?? true,
  });
}

export function useAdminUserDetail(
  userId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ADMIN_USER_QUERY_KEYS.detail(userId),
    queryFn: () => AdminUserService.getUserById(userId),
    staleTime: 1000 * 60 * 2,
    enabled: Boolean(userId && (options?.enabled ?? true)),
  });
}

export function useUpdateAdminUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      status,
    }: {
      userId: string;
      status: UpdateUserStatusRequest["status"];
    }) => AdminUserService.updateUserStatus(userId, { status }),
    onSuccess: (updatedUser, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ADMIN_USER_QUERY_KEYS.all,
      });
      const statusText =
        variables.status === "ACTIVE"
          ? "Hoạt động (ACTIVE)"
          : "Không hoạt động (INACTIVE)";
      const displayName =
        updatedUser?.fullName || updatedUser?.email || "tài khoản";
      showSuccessToast(
        `Đã cập nhật trạng thái của ${displayName} thành ${statusText}.`
      );
    },
    onError: (error) => {
      showErrorToast("Đã có lỗi xảy ra khi cập nhật trạng thái người dùng.", error);
    },
  });
}