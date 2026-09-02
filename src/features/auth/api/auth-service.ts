import { apiClient, getCookie } from "@/lib/axios";
import type { Role } from "@/types/auth";
import type {
  CsrfTokenResponse,
  AuthMeResponse,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  PasswordSetupRequest,
} from "../types/auth-dto";

const API_BASE_URL = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function createMockUser(identifier: string): AuthMeResponse {
  const role = identifier.includes("admin")
    ? "ADMIN"
    : identifier.includes("lecturer")
      ? "LECTURER"
      : "STUDENT";
  
  return {
    authenticated: true,
    passwordSetupRequired: false,
    user: {
      id: `mock-${role.toLowerCase()}-123`,
      email: `${role.toLowerCase()}@mock.fpt.edu.vn`,
      fullName: `Dev Mock ${role}`,
      username: role.toLowerCase(),
      avatarUrl: null,
      role: role as Role,
    },
  };
}

export class AuthService {
  static async getCsrfToken(): Promise<CsrfTokenResponse> {
    const response = await apiClient.get<CsrfTokenResponse>("/api/auth/csrf");
    return response.data;
  }

  static async getMe(): Promise<AuthMeResponse> {
    if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
      const mockSession = getCookie("mock_session");
      if (mockSession) {
        return createMockUser(mockSession);
      }
    }
    const response = await apiClient.get<AuthMeResponse>("/api/auth/me");
    return response.data;
  }

  static async login(payload: LoginRequest): Promise<AuthMeResponse> {
    if (!payload.identifier || payload.identifier.trim() === "") {
      throw new Error("Throw ValidationException: Identifier (email or username) is required");
    }

    if (!payload.password || payload.password === "") {
      throw new Error("Throw ValidationException: Password is required");
    }

    if (process.env.NODE_ENV === "development" && payload.password === "mock") {
      if (typeof window !== "undefined") {
        document.cookie = `mock_session=${payload.identifier}; path=/`;
      }
      return createMockUser(payload.identifier);
    }

    const response = await apiClient.post<AuthMeResponse>("/api/auth/login", payload);
    return response.data;
  }

  static async register(payload: RegisterRequest): Promise<RegisterResponse> {
    if (!payload.fullName || payload.fullName.trim() === "") {
      throw new Error("Throw ValidationException: Full name is required");
    }

    if (!payload.email || payload.email.trim() === "") {
      throw new Error("Throw ValidationException: Email is required");
    }

    if (payload.email.endsWith("@fpt.edu.vn") || payload.email.endsWith("@fe.edu.vn")) {
      throw new Error(
        "Throw ValidationException: Use Google login for institutional FPT/FE accounts (INSTITUTIONAL_EMAIL_USE_GOOGLE)"
      );
    }

    if (!payload.studentCode || payload.studentCode.trim() === "") {
      throw new Error("Throw ValidationException: Student code is required");
    }

    if (!payload.password || payload.password.length < 10) {
      throw new Error("Throw ValidationException: Password must be at least 10 characters (PASSWORD_POLICY_VIOLATION)");
    }

    if (payload.password !== payload.confirmPassword) {
      throw new Error("Throw ValidationException: Passwords do not match (PASSWORD_CONFIRMATION_MISMATCH)");
    }

    const response = await apiClient.post<RegisterResponse>("/api/auth/register", payload);
    return response.data;
  }

  static async setupPassword(payload: PasswordSetupRequest): Promise<AuthMeResponse> {
    if (!payload.newPassword || payload.newPassword.length < 10) {
      throw new Error("Throw ValidationException: New password must be at least 10 characters");
    }

    if (payload.newPassword !== payload.confirmPassword) {
      throw new Error("Throw ValidationException: Passwords do not match");
    }

    const response = await apiClient.post<AuthMeResponse>("/api/auth/password/setup", payload);
    return response.data;
  }

  static async logout(): Promise<void> {
    if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
      if (getCookie("mock_session")) {
        document.cookie = "mock_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        return;
      }
    }
    await apiClient.post<void>("/api/auth/logout", {});
  }

  static getGoogleLoginUrl(): string {
    return `${API_BASE_URL}/oauth2/authorization/google`;
  }
}
