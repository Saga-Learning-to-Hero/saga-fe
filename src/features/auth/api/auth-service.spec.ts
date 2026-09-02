import { describe, expect, vi, beforeEach } from "vitest";
import { AuthService } from "./auth-service";
import { apiClient } from "@/lib/axios";
import { fptTest } from "@/testing/fpt-test-helper";

vi.mock("@/lib/axios");

describe("LoginWithGoogleOAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockAuthMeResponse = {
    authenticated: true,
    passwordSetupRequired: false,
    user: {
      id: "00000000-0000-0000-0000-000000000001",
      email: "hailhse183904@fpt.edu.vn",
      username: "hailh",
      fullName: "Le Hoang Hai",
      avatarUrl: null,
      role: "STUDENT" as const,
    },
  };

  // ── [UTCID01] ──────────────────────────────────────────────────────────────────
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "10/08/2026",
      description: "Đăng nhập thành công với identifier và password hợp lệ",
    },
    async () => {
      vi.spyOn(apiClient, "post").mockResolvedValueOnce({ data: mockAuthMeResponse });

      const res = await AuthService.login({
        identifier: "hailhse183904@fpt.edu.vn",
        password: "securePassword123",
      });

      expect(res.authenticated).toBe(true);
      expect(res.user?.email).toBe("hailhse183904@fpt.edu.vn");
      expect(res.user?.role).toBe("STUDENT");
    }
  );

  // ── [UTCID02] ──────────────────────────────────────────────────────────────────
  fptTest(
    {
      id: "UTCID02",
      type: "A",
      executedDate: "10/08/2026",
      description: "Throw ValidationException khi identifier bị rỗng",
    },
    async () => {
      await expect(
        AuthService.login({
          identifier: "",
          password: "securePassword123",
        })
      ).rejects.toThrow("Throw ValidationException: Identifier (email or username) is required");
    }
  );

  // ── [UTCID03] ──────────────────────────────────────────────────────────────────
  fptTest(
    {
      id: "UTCID03",
      type: "A",
      executedDate: "10/08/2026",
      description: "Throw ValidationException khi password bị rỗng",
    },
    async () => {
      await expect(
        AuthService.login({
          identifier: "hailhhe170504@fpt.edu.vn",
          password: "",
        })
      ).rejects.toThrow("Throw ValidationException: Password is required");
    }
  );

  // ── [UTCID04] ──────────────────────────────────────────────────────────────────
  fptTest(
    {
      id: "UTCID04",
      type: "A",
      executedDate: "10/08/2026",
      description: "Xử lý lỗi khi Backend trả về 401 INVALID_CREDENTIALS",
    },
    async () => {
      vi.spyOn(apiClient, "post").mockRejectedValueOnce(new Error("Authentication failed."));

      await expect(
        AuthService.login({
          identifier: "wrong@fpt.edu.vn",
          password: "wrongPassword",
        })
      ).rejects.toThrow("Authentication failed.");
    }
  );

  // ── [UTCID05] ──────────────────────────────────────────────────────────────────
  fptTest(
    {
      id: "UTCID05",
      type: "N",
      executedDate: "10/08/2026",
      description: "Đăng ký tài khoản Sinh viên thành công với email cá nhân",
    },
    async () => {
      vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: {
          registered: true,
          user: {
            id: "user-new-uuid",
            email: "personal.student@gmail.com",
            fullName: "Nguyen Van B",
            role: "STUDENT",
          },
        },
      });

      const res = await AuthService.register({
        email: "personal.student@gmail.com",
        fullName: "Nguyen Van B",
        studentCode: "SE179999",
        password: "securePassword123",
        confirmPassword: "securePassword123",
      });

      expect(res.registered).toBe(true);
      expect(res.user.email).toBe("personal.student@gmail.com");
    }
  );

  // ── [UTCID06] ──────────────────────────────────────────────────────────────────
  fptTest(
    {
      id: "UTCID06",
      type: "A",
      executedDate: "10/08/2026",
      description: "Từ chối đăng ký với email @fpt.edu.vn (yêu cầu dùng Google Login)",
    },
    async () => {
      await expect(
        AuthService.register({
          email: "student@fpt.edu.vn",
          fullName: "FPT Student",
          studentCode: "SE170001",
          password: "securePassword123",
          confirmPassword: "securePassword123",
        })
      ).rejects.toThrow("Use Google login for institutional FPT/FE accounts");
    }
  );

  // ── [UTCID07] ──────────────────────────────────────────────────────────────────
  fptTest(
    {
      id: "UTCID07",
      type: "A",
      executedDate: "10/08/2026",
      description: "Từ chối đặt mật khẩu khi 2 mật khẩu không khớp nhau",
    },
    async () => {
      await expect(
        AuthService.setupPassword({
          newPassword: "password12345",
          confirmPassword: "differentPassword12345",
        })
      ).rejects.toThrow("Throw ValidationException: Passwords do not match");
    }
  );

  // ── [UTCID08] ──────────────────────────────────────────────────────────────────
  fptTest(
    {
      id: "UTCID08",
      type: "N",
      executedDate: "10/08/2026",
      description: "Lấy thông tin phiên hiện tại (me) qua Cookie session",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockAuthMeResponse });

      const res = await AuthService.getMe();
      expect(res.authenticated).toBe(true);
      expect(res.user?.fullName).toBe("Le Hoang Hai");
    }
  );
});
