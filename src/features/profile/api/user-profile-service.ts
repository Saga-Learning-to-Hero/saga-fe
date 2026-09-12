import { apiClient } from "@/lib/axios";
import type { UserProfileResponse, UpdateProfileRequest } from "../types/profile-dto";

export class UserProfileService {
  static async getProfile(): Promise<UserProfileResponse> {
    const response = await apiClient.get<UserProfileResponse>("/api/users/me/profile");
    return response.data;
  }

  static async updateProfile(data: UpdateProfileRequest): Promise<UserProfileResponse> {
    if (data.fullName !== undefined) {
      if (data.fullName.trim() === "") {
        throw new Error("Throw ValidationException: Full name cannot be empty (PROFILE_FULL_NAME_INVALID)");
      }
      if (data.fullName.length > 255) {
        throw new Error("Throw ValidationException: Full name cannot exceed 255 characters (PROFILE_FULL_NAME_INVALID)");
      }
    }

    if (data.avatarUrl !== undefined && data.avatarUrl !== "") {
      if (data.avatarUrl.length > 500) {
        throw new Error("Throw ValidationException: Avatar URL cannot exceed 500 characters (PROFILE_AVATAR_URL_INVALID)");
      }
      if (!data.avatarUrl.startsWith("http://") && !data.avatarUrl.startsWith("https://")) {
        throw new Error("Throw ValidationException: Avatar URL must start with http:// or https:// (PROFILE_AVATAR_URL_INVALID)");
      }
    }

    const payload: UpdateProfileRequest = {};
    if (data.fullName !== undefined) {
      payload.fullName = data.fullName.trim();
    }
    if (data.avatarUrl !== undefined) {
      payload.avatarUrl = data.avatarUrl;
    }

    const response = await apiClient.patch<UserProfileResponse>("/api/users/me/profile", payload);
    return response.data;
  }
}
