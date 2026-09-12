import { describe, expect, vi, beforeEach } from "vitest";
import { UserProfileService } from "./user-profile-service";
import { apiClient } from "@/lib/axios";
import { fptTest } from "@/testing/fpt-test-helper";
import type { UserProfileResponse } from "../types/profile-dto";

vi.mock("@/lib/axios");

describe("UserProfileService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProfile: UserProfileResponse = {
    id: "user-uuid-01",
    email: "student@fpt.edu.vn",
    username: "student01",
    fullName: "Nguyen Van Sinh Vien",
    avatarUrl: "https://example.com/avatar.png",
    role: "STUDENT",
    accountStatus: "ACTIVE",
    studentCode: "SE170504",
  };

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "12/09/2026",
      description: "GET /api/users/me/profile tra ve thong tin ho so nguoi dung day du",
    },
    async () => {
      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: mockProfile,
      });

      const res = await UserProfileService.getProfile();

      expect(getSpy).toHaveBeenCalledWith("/api/users/me/profile");
      expect(res.id).toBe("user-uuid-01");
      expect(res.email).toBe("student@fpt.edu.vn");
      expect(res.fullName).toBe("Nguyen Van Sinh Vien");
      expect(res.role).toBe("STUDENT");
      expect(res.studentCode).toBe("SE170504");
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "12/09/2026",
      description: "PATCH /api/users/me/profile cap nhat ho ten va avatarUrl hop le",
    },
    async () => {
      const updatedProfile: UserProfileResponse = {
        ...mockProfile,
        fullName: "Le Hoang Hai",
        avatarUrl: "https://images.example.com/hai.png",
      };

      const patchSpy = vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
        data: updatedProfile,
      });

      const res = await UserProfileService.updateProfile({
        fullName: "Le Hoang Hai",
        avatarUrl: "https://images.example.com/hai.png",
      });

      expect(patchSpy).toHaveBeenCalledWith("/api/users/me/profile", {
        fullName: "Le Hoang Hai",
        avatarUrl: "https://images.example.com/hai.png",
      });
      expect(res.fullName).toBe("Le Hoang Hai");
      expect(res.avatarUrl).toBe("https://images.example.com/hai.png");
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "12/09/2026",
      description: "PATCH /api/users/me/profile gui avatarUrl rong de xoa avatar",
    },
    async () => {
      const updatedProfile: UserProfileResponse = {
        ...mockProfile,
        avatarUrl: null,
      };

      const patchSpy = vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
        data: updatedProfile,
      });

      const res = await UserProfileService.updateProfile({
        avatarUrl: "",
      });

      expect(patchSpy).toHaveBeenCalledWith("/api/users/me/profile", {
        avatarUrl: "",
      });
      expect(res.avatarUrl).toBeNull();
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "A",
      executedDate: "12/09/2026",
      description: "updateProfile nem loi khi fullName rong hoac chi toan khoang trang",
    },
    async () => {
      await expect(UserProfileService.updateProfile({ fullName: "" })).rejects.toThrow(
        "Full name cannot be empty"
      );
      await expect(UserProfileService.updateProfile({ fullName: "    " })).rejects.toThrow(
        "Full name cannot be empty"
      );
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "A",
      executedDate: "12/09/2026",
      description: "updateProfile nem loi khi fullName vuot qua 255 ky tu",
    },
    async () => {
      const longName = "A".repeat(256);
      await expect(UserProfileService.updateProfile({ fullName: longName })).rejects.toThrow(
        "Full name cannot exceed 255 characters"
      );
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "A",
      executedDate: "12/09/2026",
      description: "updateProfile nem loi khi avatarUrl vuot qua 500 ky tu",
    },
    async () => {
      const longUrl = "https://example.com/" + "a".repeat(500);
      await expect(UserProfileService.updateProfile({ avatarUrl: longUrl })).rejects.toThrow(
        "Avatar URL cannot exceed 500 characters"
      );
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "A",
      executedDate: "12/09/2026",
      description: "updateProfile nem loi khi avatarUrl khong bat dau bang http:// hoac https://",
    },
    async () => {
      await expect(
        UserProfileService.updateProfile({ avatarUrl: "ftp://example.com/avatar.png" })
      ).rejects.toThrow("Avatar URL must start with http:// or https://");
      await expect(
        UserProfileService.updateProfile({ avatarUrl: "invalid-url-avatar.png" })
      ).rejects.toThrow("Avatar URL must start with http:// or https://");
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "A",
      executedDate: "12/09/2026",
      description: "getProfile nem loi khi Backend tra ve HTTP 401 Unauthorized",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(new Error("Authentication failed."));

      await expect(UserProfileService.getProfile()).rejects.toThrow("Authentication failed.");
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "B",
      executedDate: "12/09/2026",
      description: "updateProfile chi cap nhat fullName ma khong truyen avatarUrl",
    },
    async () => {
      const patchSpy = vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
        data: { ...mockProfile, fullName: "Tran Thi B" },
      });

      const res = await UserProfileService.updateProfile({
        fullName: "Tran Thi B",
      });

      expect(patchSpy).toHaveBeenCalledWith("/api/users/me/profile", {
        fullName: "Tran Thi B",
      });
      expect(res.fullName).toBe("Tran Thi B");
    }
  );

  fptTest(
    {
      id: "UTCID10",
      type: "B",
      executedDate: "12/09/2026",
      description: "updateProfile chi cap nhat avatarUrl ma khong truyen fullName",
    },
    async () => {
      const patchSpy = vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
        data: { ...mockProfile, avatarUrl: "https://cdn.example.com/photo.jpg" },
      });

      const res = await UserProfileService.updateProfile({
        avatarUrl: "https://cdn.example.com/photo.jpg",
      });

      expect(patchSpy).toHaveBeenCalledWith("/api/users/me/profile", {
        avatarUrl: "https://cdn.example.com/photo.jpg",
      });
      expect(res.avatarUrl).toBe("https://cdn.example.com/photo.jpg");
    }
  );
});
