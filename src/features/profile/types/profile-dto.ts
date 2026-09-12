import type { Role } from "@/types/auth";

export interface UserProfileResponse {
  id: string;
  email: string;
  username: string | null;
  fullName: string;
  avatarUrl: string | null;
  role: Role;
  accountStatus: string;
  studentCode: string | null;
}

export interface UpdateProfileRequest {
  fullName?: string;
  avatarUrl?: string;
}
