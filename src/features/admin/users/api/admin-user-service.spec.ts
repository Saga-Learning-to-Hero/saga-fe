import { describe, expect, vi, beforeEach } from "vitest";
import { AdminUserService } from "./admin-user-service";
import { apiClient } from "@/lib/axios";
import { fptTest } from "@/testing/fpt-test-helper";
import type {
  AdminUserItemResponse,
  AdminUsersListResponse,
} from "../types/user-management";

vi.mock("@/lib/axios");

describe("AdminUserService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUserItem: AdminUserItemResponse = {
    id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    email: "student@fpt.edu.vn",
    username: "student_fpt",
    fullName: "Nguyễn Văn Sinh Viên",
    avatarUrl: "https://example.com/avatar.png",
    role: "STUDENT",
    accountStatus: "ACTIVE",
    studentCode: "SE170123",
    lecturerProfileId: null,
    createdAt: "2026-09-16T05:08:53.777Z",
  };

  const mockListResponse: AdminUsersListResponse = {
    items: [mockUserItem],
    page: 0,
    size: 10,
    total: 1,
  };

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "16/09/2026",
      description: "Lấy danh sách người dùng thành công không có tham số lọc",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockListResponse });

      const res = await AdminUserService.getUsers();

      expect(res.items).toHaveLength(1);
      expect(res.total).toBe(1);
      expect(res.items[0].email).toBe("student@fpt.edu.vn");
      expect(apiClient.get).toHaveBeenCalledWith("/api/admin/users", {
        params: {},
      });
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "16/09/2026",
      description: "Lấy danh sách người dùng kèm bộ lọc tìm kiếm, vai trò và trạng thái",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockListResponse });

      const res = await AdminUserService.getUsers({
        q: "Nguyễn",
        role: "STUDENT",
        status: "ACTIVE",
        page: 0,
        size: 10,
      });

      expect(res.items).toHaveLength(1);
      expect(apiClient.get).toHaveBeenCalledWith("/api/admin/users", {
        params: {
          q: "Nguyễn",
          role: "STUDENT",
          status: "ACTIVE",
          page: 0,
          size: 10,
        },
      });
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "16/09/2026",
      description: "Lấy chi tiết tài khoản người dùng theo ID hợp lệ",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockUserItem });

      const res = await AdminUserService.getUserById("3fa85f64-5717-4562-b3fc-2c963f66afa6");

      expect(res.id).toBe("3fa85f64-5717-4562-b3fc-2c963f66afa6");
      expect(res.fullName).toBe("Nguyễn Văn Sinh Viên");
      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/admin/users/3fa85f64-5717-4562-b3fc-2c963f66afa6"
      );
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "16/09/2026",
      description: "Cập nhật trạng thái người dùng thành INACTIVE (Tạm ngưng)",
    },
    async () => {
      const updatedMock: AdminUserItemResponse = {
        ...mockUserItem,
        accountStatus: "INACTIVE",
      };
      vi.spyOn(apiClient, "patch").mockResolvedValueOnce({ data: updatedMock });

      const res = await AdminUserService.updateUserStatus(
        "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        { status: "INACTIVE" }
      );

      expect(res.accountStatus).toBe("INACTIVE");
      expect(apiClient.patch).toHaveBeenCalledWith(
        "/api/admin/users/3fa85f64-5717-4562-b3fc-2c963f66afa6/status",
        { status: "INACTIVE" }
      );
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "N",
      executedDate: "16/09/2026",
      description: "Cập nhật trạng thái người dùng thành ACTIVE (Kích hoạt lại)",
    },
    async () => {
      const updatedMock: AdminUserItemResponse = {
        ...mockUserItem,
        accountStatus: "ACTIVE",
      };
      vi.spyOn(apiClient, "patch").mockResolvedValueOnce({ data: updatedMock });

      const res = await AdminUserService.updateUserStatus(
        "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        { status: "ACTIVE" }
      );

      expect(res.accountStatus).toBe("ACTIVE");
      expect(apiClient.patch).toHaveBeenCalledWith(
        "/api/admin/users/3fa85f64-5717-4562-b3fc-2c963f66afa6/status",
        { status: "ACTIVE" }
      );
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "A",
      executedDate: "16/09/2026",
      description: "Throw ValidationException khi getUserById với ID rỗng",
    },
    async () => {
      await expect(AdminUserService.getUserById("")).rejects.toThrow(
        "Throw ValidationException: User ID is required"
      );
      await expect(AdminUserService.getUserById("   ")).rejects.toThrow(
        "Throw ValidationException: User ID is required"
      );
      expect(apiClient.get).not.toHaveBeenCalled();
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "A",
      executedDate: "16/09/2026",
      description: "Throw ValidationException khi updateUserStatus với ID rỗng",
    },
    async () => {
      await expect(
        AdminUserService.updateUserStatus("", { status: "ACTIVE" })
      ).rejects.toThrow("Throw ValidationException: User ID is required");
      expect(apiClient.patch).not.toHaveBeenCalled();
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "A",
      executedDate: "16/09/2026",
      description: "Throw ValidationException khi updateUserStatus với status không hợp lệ",
    },
    async () => {
      await expect(
        AdminUserService.updateUserStatus("3fa85f64-5717-4562-b3fc-2c963f66afa6", {
          status: "BANNED" as unknown as "ACTIVE",
        })
      ).rejects.toThrow(
        "Throw ValidationException: Status must be either ACTIVE or INACTIVE"
      );
      expect(apiClient.patch).not.toHaveBeenCalled();
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "A",
      executedDate: "16/09/2026",
      description: "Ném lỗi khi máy chủ trả về HTTP 401 Unauthorized",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(
        new Error("Authentication failed.")
      );

      await expect(AdminUserService.getUsers()).rejects.toThrow(
        "Authentication failed."
      );
    }
  );

  fptTest(
    {
      id: "UTCID10",
      type: "A",
      executedDate: "16/09/2026",
      description: "Ném lỗi khi máy chủ trả về HTTP 500 Internal Server Error",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(
        new Error("Internal Server Error")
      );

      await expect(
        AdminUserService.getUserById("3fa85f64-5717-4562-b3fc-2c963f66afa6")
      ).rejects.toThrow("Internal Server Error");
    }
  );

  fptTest(
    {
      id: "UTCID11",
      type: "B",
      executedDate: "16/09/2026",
      description: "Lấy danh sách người dùng rỗng (items: [], total: 0)",
    },
    async () => {
      const emptyResponse: AdminUsersListResponse = {
        items: [],
        page: 0,
        size: 10,
        total: 0,
      };
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: emptyResponse });

      const res = await AdminUserService.getUsers();

      expect(res.items).toHaveLength(0);
      expect(res.total).toBe(0);
    }
  );

  fptTest(
    {
      id: "UTCID12",
      type: "B",
      executedDate: "16/09/2026",
      description: "Xử lý tham số có khoảng trắng và bỏ qua giá trị ALL",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockListResponse });

      await AdminUserService.getUsers({
        q: "   student   ",
        role: "ALL",
        status: "ALL",
        page: 0,
        size: 10,
      });

      expect(apiClient.get).toHaveBeenCalledWith("/api/admin/users", {
        params: {
          q: "student",
          page: 0,
          size: 10,
        },
      });
    }
  );
});
