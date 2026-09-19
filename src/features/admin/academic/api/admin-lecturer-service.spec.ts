import { describe, expect, vi, beforeEach } from "vitest";
import { AdminLecturerService } from "./admin-lecturer-service";
import { apiClient } from "@/lib/axios";
import { fptTest } from "@/testing/fpt-test-helper";

vi.mock("@/lib/axios");

describe("AdminLecturerService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockLecturer = {
    lecturerProfileId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    userId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    fullName: "TS. Nguyen Van A",
    email: "anv@fpt.edu.vn",
    active: true,
  };

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "08/09/2026",
      description: "Lay danh sach giang vien thanh cong khong kem tham so",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: [mockLecturer] });

      const res = await AdminLecturerService.getLecturers();

      expect(res).toHaveLength(1);
      expect(res[0].lecturerProfileId).toBe(mockLecturer.lecturerProfileId);
      expect(res[0].email).toBe(mockLecturer.email);
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "08/09/2026",
      description: "Lay danh sach giang vien thanh cong voi bo loc active va search",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: [mockLecturer] });

      const res = await AdminLecturerService.getLecturers({
        active: true,
        search: "Nguyen",
      });

      expect(res).toHaveLength(1);
      expect(apiClient.get).toHaveBeenCalledWith("/api/admin/lecturers", {
        params: { active: true, search: "Nguyen" },
      });
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "B",
      executedDate: "08/09/2026",
      description: "Tra ve mang rong khi khong co giang vien nao thoa man dieu kien",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: [] });

      const res = await AdminLecturerService.getLecturers({ search: "NonExistent" });

      expect(res).toEqual([]);
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "A",
      executedDate: "08/09/2026",
      description: "Nem loi khi he thong backend tra ve loi 500 Internal Server Error",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(new Error("Internal Server Error"));

      await expect(AdminLecturerService.getLecturers()).rejects.toThrow("Internal Server Error");
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "A",
      executedDate: "08/09/2026",
      description: "Nem loi khi API tra ve loi 403 Forbidden do thieu quyen Admin",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(new Error("Access Denied: Admin role required"));

      await expect(AdminLecturerService.getLecturers()).rejects.toThrow("Access Denied: Admin role required");
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "N",
      executedDate: "19/09/2026",
      description: "Lay danh sach giang vien phan trang thanh cong voi tham so mac dinh",
    },
    async () => {
      const mockPagedResponse = {
        items: [mockLecturer],
        page: 0,
        size: 50,
        total: 1,
      };
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockPagedResponse });

      const res = await AdminLecturerService.getPagedLecturers();

      expect(res.items).toHaveLength(1);
      expect(res.total).toBe(1);
      expect(apiClient.get).toHaveBeenCalledWith("/api/admin/lecturers/paged", {
        params: { page: 0, size: 50 },
      });
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "N",
      executedDate: "19/09/2026",
      description: "Lay danh sach giang vien phan trang voi bo loc search va active",
    },
    async () => {
      const mockPagedResponse = {
        items: [mockLecturer],
        page: 1,
        size: 20,
        total: 21,
      };
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockPagedResponse });

      const res = await AdminLecturerService.getPagedLecturers({
        page: 1,
        size: 20,
        search: "Nguyen",
        active: true,
      });

      expect(res.items).toHaveLength(1);
      expect(res.page).toBe(1);
      expect(apiClient.get).toHaveBeenCalledWith("/api/admin/lecturers/paged", {
        params: { page: 1, size: 20, search: "Nguyen", active: true },
      });
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "B",
      executedDate: "19/09/2026",
      description: "Tra ve items rong khi trang khong chua du lieu",
    },
    async () => {
      const mockPagedResponse = {
        items: [],
        page: 5,
        size: 50,
        total: 0,
      };
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockPagedResponse });

      const res = await AdminLecturerService.getPagedLecturers({ page: 5 });

      expect(res.items).toEqual([]);
      expect(res.total).toBe(0);
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "A",
      executedDate: "19/09/2026",
      description: "Nem loi khi API phan trang giang vien tra ve 500",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(new Error("Internal Server Error"));

      await expect(AdminLecturerService.getPagedLecturers()).rejects.toThrow("Internal Server Error");
    }
  );
});
