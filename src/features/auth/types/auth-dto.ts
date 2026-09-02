import type { Role } from "@/types/auth";

export interface CsrfTokenResponse {
  parameterName: string;
  token: string;
  headerName: string;
}

export interface AuthUserDto {
  id: string;
  email: string;
  username: string | null;
  fullName: string;
  avatarUrl: string | null;
  role: Role;
}

export interface AuthMeResponse {
  authenticated: boolean;
  passwordSetupRequired: boolean;
  user: AuthUserDto | null;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  fullName: string;
  studentCode: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  registered: boolean;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: Role;
  };
}

export interface PasswordSetupRequest {
  newPassword: string;
  confirmPassword: string;
}
