"use client";

import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { ProfileView } from "@/features/profile/components/profile-view";

export default function ProfilePage() {
  const { user } = useAuthStore();

  if (!user) return null;

  return <ProfileView user={user} />;
}
