"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useSession } from "@/features/auth/hooks/useAuth";
import { IntegrationsView } from "@/features/profile/components/integrations-view";

export default function IntegrationsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  useSession();

  useEffect(() => {
    if (user?.role === "STUDENT") {
      router.replace("/student/integrations");
    }
  }, [user, router]);

  if (!user) return null;

  return <IntegrationsView user={user} />;
}
