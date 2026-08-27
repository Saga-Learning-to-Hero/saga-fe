"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { getRoleHomePath } from "@/features/auth/lib/role-routes";

/**
 * /dashboard is kept only for backward-compat URL support.
 * It immediately redirects to the correct role-based home route.
 * No content is rendered here.
 */
export default function DashboardRedirectPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      router.replace(getRoleHomePath(user.role));
    }
  }, [user, router]);

  return null;
}
