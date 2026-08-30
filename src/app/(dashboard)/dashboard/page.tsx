"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { getRoleHomePath } from "@/features/auth/lib/role-routes";

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) router.replace(getRoleHomePath(user.role));
  }, [user, router]);

  return null;
}
