import { apiClient } from "@/lib/axios";
import type {
  AdminUserItemResponse,
  AdminUsersListResponse,
  GetAdminUsersParams,
  UpdateUserStatusRequest,
} from "../types/user-management";

export class AdminUserService {
  /**
   * Lấy danh sách tài khoản người dùng (STUDENT & LECTURER) kèm bộ lọc và phân trang.
   */
  static async getUsers(
    params?: GetAdminUsersParams
  ): Promise<AdminUsersListResponse> {
    const cleanParams: Record<string, string | number> = {};

    if (params) {
      if (params.q !== undefined && params.q.trim() !== "") {
        cleanParams.q = params.q.trim();
      }
      if (
        params.role !== undefined &&
        params.role.trim() !== "" &&
        params.role !== "ALL"
      ) {
        cleanParams.role = params.role.trim().toUpperCase();
      }
      if (
        params.status !== undefined &&
        params.status.trim() !== "" &&
        params.status !== "ALL"
      ) {
        cleanParams.status = params.status.trim().toUpperCase();
      }
      if (params.page !== undefined && params.page >= 0) {
        cleanParams.page = params.page;
      }
      if (params.size !== undefined && params.size > 0) {
        cleanParams.size = params.size;
      }
    }

    const response = await apiClient.get<AdminUsersListResponse>(
      "/api/admin/users",
      {
        params: cleanParams,
      }
    );
    return response.data;
  }

  /**
   * Lấy chi tiết một tài khoản người dùng theo userId.
   */
  static async getUserById(userId: string): Promise<AdminUserItemResponse> {
    if (!userId || !userId.trim()) {
      throw new Error("Throw ValidationException: User ID is required");
    }

    const response = await apiClient.get<AdminUserItemResponse>(
      `/api/admin/users/${userId.trim()}`
    );
    return response.data;
  }

  /**
   * Cập nhật trạng thái kích hoạt / tạm ngưng của tài khoản (ACTIVE | INACTIVE).
   */
  static async updateUserStatus(
    userId: string,
    data: UpdateUserStatusRequest
  ): Promise<AdminUserItemResponse> {
    if (!userId || !userId.trim()) {
      throw new Error("Throw ValidationException: User ID is required");
    }

    if (!data || (data.status !== "ACTIVE" && data.status !== "INACTIVE")) {
      throw new Error(
        "Throw ValidationException: Status must be either ACTIVE or INACTIVE"
      );
    }

    const response = await apiClient.patch<AdminUserItemResponse>(
      `/api/admin/users/${userId.trim()}/status`,
      {
        status: data.status,
      }
    );
    return response.data;
  }
}
