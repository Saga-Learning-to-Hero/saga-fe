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
});
