"use client";

import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useSession } from "@/features/auth/hooks/useAuth";
import { ProfileView } from "@/features/profile/components/profile-view";

export default function ProfilePage() {
  const { user } = useAuthStore();
  useSession();

  if (!user) return null;

  return <ProfileView user={user} />;
}
