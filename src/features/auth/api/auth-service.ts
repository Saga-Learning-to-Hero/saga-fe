import { apiClient } from "@/lib/axios";
import type {
  CsrfTokenResponse,
  AuthMeResponse,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  PasswordSetupRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from "../types/auth-dto";

export class AuthService {
  static async getCsrfToken(): Promise<CsrfTokenResponse> {
    const response = await apiClient.get<CsrfTokenResponse>("/api/auth/csrf");
    return response.data;
  }

  static async getMe(): Promise<AuthMeResponse> {
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
    await apiClient.post<void>("/api/auth/logout", {});
  }

  static async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    if (!email || email.trim() === "") {
      throw new Error("Throw ValidationException: Email is required");
    }

    const response = await apiClient.post<ForgotPasswordResponse>("/api/auth/password/forgot", {
      email: email.trim(),
    });
    return response.data;
  }

  static async resetPassword(payload: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    if (!payload.token || payload.token.trim() === "") {
      throw new Error("Throw ValidationException: Token is required");
    }

    if (!payload.newPassword || payload.newPassword.length < 10) {
      throw new Error("Throw ValidationException: New password must be at least 10 characters (PASSWORD_POLICY_VIOLATION)");
    }

    const response = await apiClient.post<ResetPasswordResponse>("/api/auth/password/reset", payload);
    return response.data;
  }

  static getGoogleLoginUrl(): string {
    const backendOrigin = process.env.NEXT_PUBLIC_API_URL || "https://saga-be-production.up.railway.app";
    return `${backendOrigin}/oauth2/authorization/google`;
  }
}
