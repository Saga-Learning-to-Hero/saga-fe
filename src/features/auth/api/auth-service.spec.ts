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

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "06/09/2026",
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

  fptTest(
    {
      id: "UTCID02",
      type: "A",
      executedDate: "06/09/2026",
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

  fptTest(
    {
      id: "UTCID03",
      type: "A",
      executedDate: "06/09/2026",
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

  fptTest(
    {
      id: "UTCID04",
      type: "A",
      executedDate: "06/09/2026",
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

  fptTest(
    {
      id: "UTCID05",
      type: "N",
      executedDate: "06/09/2026",
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

  fptTest(
    {
      id: "UTCID06",
      type: "A",
      executedDate: "06/09/2026",
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

  fptTest(
    {
      id: "UTCID07",
      type: "A",
      executedDate: "06/09/2026",
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

  fptTest(
    {
      id: "UTCID08",
      type: "N",
      executedDate: "06/09/2026",
      description: "Lấy thông tin phiên hiện tại (me) qua Cookie session",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockAuthMeResponse });

      const res = await AuthService.getMe();
      expect(res.authenticated).toBe(true);
      expect(res.user?.fullName).toBe("Le Hoang Hai");
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "N",
      executedDate: "06/09/2026",
      description: "Lấy mã CSRF token thành công từ endpoint /api/auth/csrf",
    },
    async () => {
      const mockCsrf = {
        token: "test-csrf-token-12345",
        headerName: "X-XSRF-TOKEN",
        parameterName: "_csrf",
      };
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockCsrf });

      const res = await AuthService.getCsrfToken();
      expect(res.token).toBe("test-csrf-token-12345");
      expect(res.headerName).toBe("X-XSRF-TOKEN");
    }
  );

  fptTest(
    {
      id: "UTCID10",
      type: "A",
      executedDate: "06/09/2026",
      description: "Xử lý ngoại lệ khi máy chủ không phản hồi lấy CSRF token",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(new Error("Network Error"));

      await expect(AuthService.getCsrfToken()).rejects.toThrow("Network Error");
    }
  );

  fptTest(
    {
      id: "UTCID11",
      type: "A",
      executedDate: "06/09/2026",
      description: "Xử lý ngoại lệ khi phiên cookie hết hạn hoặc trả về 401",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(new Error("Unauthorized: Session expired"));

      await expect(AuthService.getMe()).rejects.toThrow("Unauthorized: Session expired");
    }
  );

  fptTest(
    {
      id: "UTCID12",
      type: "B",
      executedDate: "06/09/2026",
      description: "Throw ValidationException khi identifier chỉ toàn khoảng trắng",
    },
    async () => {
      await expect(
        AuthService.login({
          identifier: "   ",
          password: "securePassword123",
        })
      ).rejects.toThrow("Throw ValidationException: Identifier (email or username) is required");
    }
  );

  fptTest(
    {
      id: "UTCID13",
      type: "A",
      executedDate: "06/09/2026",
      description: "Xử lý lỗi khi Backend trả về mã lỗi 403 ACCOUNT_DISABLED",
    },
    async () => {
      vi.spyOn(apiClient, "post").mockRejectedValueOnce(new Error("Account has been disabled"));

      await expect(
        AuthService.login({
          identifier: "disabled@fpt.edu.vn",
          password: "securePassword123",
        })
      ).rejects.toThrow("Account has been disabled");
    }
  );

  fptTest(
    {
      id: "UTCID14",
      type: "A",
      executedDate: "06/09/2026",
      description: "Xử lý lỗi khi máy chủ gặp sự cố HTTP 500 Internal Server Error",
    },
    async () => {
      vi.spyOn(apiClient, "post").mockRejectedValueOnce(new Error("Internal Server Error"));

      await expect(
        AuthService.login({
          identifier: "admin@fpt.edu.vn",
          password: "adminPassword",
        })
      ).rejects.toThrow("Internal Server Error");
    }
  );

  fptTest(
    {
      id: "UTCID15",
      type: "A",
      executedDate: "06/09/2026",
      description: "Throw ValidationException khi họ và tên bị để trống",
    },
    async () => {
      await expect(
        AuthService.register({
          fullName: "  ",
          email: "student@gmail.com",
          studentCode: "SE170001",
          password: "securePassword123",
          confirmPassword: "securePassword123",
        })
      ).rejects.toThrow("Throw ValidationException: Full name is required");
    }
  );

  fptTest(
    {
      id: "UTCID16",
      type: "A",
      executedDate: "06/09/2026",
      description: "Throw ValidationException khi mã sinh viên bị để trống",
    },
    async () => {
      await expect(
        AuthService.register({
          fullName: "Nguyen Van C",
          email: "student@gmail.com",
          studentCode: "",
          password: "securePassword123",
          confirmPassword: "securePassword123",
        })
      ).rejects.toThrow("Throw ValidationException: Student code is required");
    }
  );

  fptTest(
    {
      id: "UTCID17",
      type: "B",
      executedDate: "06/09/2026",
      description: "Đăng ký thành công với mật khẩu đạt giá trị biên tối thiểu đúng 10 ký tự",
    },
    async () => {
      vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: {
          registered: true,
          user: {
            id: "user-boundary-id",
            email: "student.boundary@gmail.com",
            fullName: "Boundary User",
            role: "STUDENT",
          },
        },
      });

      const res = await AuthService.register({
        fullName: "Boundary User",
        email: "student.boundary@gmail.com",
        studentCode: "SE170002",
        password: "1234567890",
        confirmPassword: "1234567890",
      });

      expect(res.registered).toBe(true);
      expect(res.user.role).toBe("STUDENT");
    }
  );

  fptTest(
    {
      id: "UTCID18",
      type: "B",
      executedDate: "06/09/2026",
      description: "Từ chối đăng ký với mật khẩu cận biên dưới 9 ký tự",
    },
    async () => {
      await expect(
        AuthService.register({
          fullName: "Boundary User",
          email: "student.boundary@gmail.com",
          studentCode: "SE170002",
          password: "123456789",
          confirmPassword: "123456789",
        })
      ).rejects.toThrow("Throw ValidationException: Password must be at least 10 characters");
    }
  );

  fptTest(
    {
      id: "UTCID19",
      type: "A",
      executedDate: "06/09/2026",
      description: "Từ chối đăng ký tài khoản với email tổ chức @fe.edu.vn",
    },
    async () => {
      await expect(
        AuthService.register({
          fullName: "Lecturer Fe",
          email: "teacher@fe.edu.vn",
          studentCode: "GV170001",
          password: "securePassword123",
          confirmPassword: "securePassword123",
        })
      ).rejects.toThrow("Throw ValidationException: Use Google login for institutional FPT/FE accounts");
    }
  );

  fptTest(
    {
      id: "UTCID20",
      type: "A",
      executedDate: "06/09/2026",
      description: "Xử lý lỗi khi Backend trả về mã lỗi 409 EMAIL_ALREADY_EXISTS",
    },
    async () => {
      vi.spyOn(apiClient, "post").mockRejectedValueOnce(new Error("Email already exists in system"));

      await expect(
        AuthService.register({
          fullName: "Duplicate User",
          email: "existing@gmail.com",
          studentCode: "SE170003",
          password: "securePassword123",
          confirmPassword: "securePassword123",
        })
      ).rejects.toThrow("Email already exists in system");
    }
  );

  fptTest(
    {
      id: "UTCID21",
      type: "N",
      executedDate: "06/09/2026",
      description: "Thiết lập mật khẩu mới thành công khi thông tin hợp lệ",
    },
    async () => {
      vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: {
          authenticated: true,
          passwordSetupRequired: false,
          user: mockAuthMeResponse.user,
        },
      });

      const res = await AuthService.setupPassword({
        newPassword: "validPassword123",
        confirmPassword: "validPassword123",
      });

      expect(res.authenticated).toBe(true);
      expect(res.passwordSetupRequired).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID22",
      type: "B",
      executedDate: "06/09/2026",
      description: "Đặt mật khẩu thành công tại giá trị biên đúng 10 ký tự",
    },
    async () => {
      vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: {
          authenticated: true,
          passwordSetupRequired: false,
          user: mockAuthMeResponse.user,
        },
      });

      const res = await AuthService.setupPassword({
        newPassword: "exact10len",
        confirmPassword: "exact10len",
      });

      expect(res.authenticated).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID23",
      type: "B",
      executedDate: "06/09/2026",
      description: "Từ chối đặt mật khẩu tại giá trị cận biên 9 ký tự",
    },
    async () => {
      await expect(
        AuthService.setupPassword({
          newPassword: "ninechars",
          confirmPassword: "ninechars",
        })
      ).rejects.toThrow("Throw ValidationException: New password must be at least 10 characters");
    }
  );

  fptTest(
    {
      id: "UTCID24",
      type: "A",
      executedDate: "06/09/2026",
      description: "Xử lý lỗi khi Backend trả về mã lỗi PASSWORD_ALREADY_SET",
    },
    async () => {
      vi.spyOn(apiClient, "post").mockRejectedValueOnce(new Error("Password already set for user"));

      await expect(
        AuthService.setupPassword({
          newPassword: "newPassword1234",
          confirmPassword: "newPassword1234",
        })
      ).rejects.toThrow("Password already set for user");
    }
  );

  fptTest(
    {
      id: "UTCID25",
      type: "N",
      executedDate: "06/09/2026",
      description: "Đăng xuất thành công, gửi request POST tới /api/auth/logout",
    },
    async () => {
      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({ data: {} });

      await AuthService.logout();

      expect(postSpy).toHaveBeenCalledWith("/api/auth/logout", {});
    }
  );

  fptTest(
    {
      id: "UTCID26",
      type: "A",
      executedDate: "06/09/2026",
      description: "Xử lý lỗi ngoại lệ khi máy chủ thất bại lúc hủy phiên đăng xuất",
    },
    async () => {
      vi.spyOn(apiClient, "post").mockRejectedValueOnce(new Error("Logout server error"));

      await expect(AuthService.logout()).rejects.toThrow("Logout server error");
    }
  );

  fptTest(
    {
      id: "UTCID27",
      type: "N",
      executedDate: "06/09/2026",
      description: "Trả về chính xác đường dẫn Google OAuth2 OIDC từ biến môi trường",
    },
    () => {
      const originalEnv = process.env.NEXT_PUBLIC_API_URL;
      process.env.NEXT_PUBLIC_API_URL = "https://custom-saga.railway.app";

      const url = AuthService.getGoogleLoginUrl();
      expect(url).toBe("https://custom-saga.railway.app/oauth2/authorization/google");

      process.env.NEXT_PUBLIC_API_URL = originalEnv;
    }
  );

  fptTest(
    {
      id: "UTCID28",
      type: "B",
      executedDate: "06/09/2026",
      description: "Sử dụng đường dẫn Railway production mặc định khi biến môi trường rỗng",
    },
    () => {
      const originalEnv = process.env.NEXT_PUBLIC_API_URL;
      delete process.env.NEXT_PUBLIC_API_URL;

      const url = AuthService.getGoogleLoginUrl();
      expect(url).toBe("https://saga-be-production.up.railway.app/oauth2/authorization/google");

      process.env.NEXT_PUBLIC_API_URL = originalEnv;
    }
  );
});
