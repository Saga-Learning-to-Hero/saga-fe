"use client";

import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { IntegrationsView } from "@/features/profile/components/integrations-view";

export default function SettingsIntegrationsPage() {
  const { user } = useAuthStore();

  if (!user) return null;

  return <IntegrationsView user={user} />;
}
