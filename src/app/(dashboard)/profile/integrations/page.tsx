"use client";

import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useSession } from "@/features/auth/hooks/useAuth";
import { IntegrationsView } from "@/features/profile/components/integrations-view";

export default function IntegrationsPage() {
  const { user } = useAuthStore();
  useSession();

  if (!user) return null;

  return <IntegrationsView user={user} />;
}
