"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserProfileService } from "../api/user-profile-service";
import type { UpdateProfileRequest } from "../types/profile-dto";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

export const PROFILE_QUERY_KEYS = {
  profile: ["users", "me", "profile"] as const,
};

export function useUserProfile() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEYS.profile,
    queryFn: () => UserProfileService.getProfile(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  const { updateUserProfile } = useAuthStore();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => UserProfileService.updateProfile(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(PROFILE_QUERY_KEYS.profile, updated);
      updateUserProfile({
        name: updated.fullName,
        fullName: updated.fullName,
        avatar: updated.avatarUrl || undefined,
      });
    },
  });
}
