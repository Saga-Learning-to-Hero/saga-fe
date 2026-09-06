"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/sonner";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useSession } from "@/features/auth/hooks/useAuth";
import { getRoleHomePath } from "@/features/auth/lib/role-routes";

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  useSession();

  useEffect(() => {
    if (user) {
      const isFromGoogle =
        typeof window !== "undefined" && sessionStorage.getItem("saga_auth_provider") === "google";
      if (isFromGoogle) {
        sessionStorage.removeItem("saga_auth_provider");
        toast.success("Đăng nhập Google thành công!", {
          id: "google-auth-success",
          description: `Chào mừng ${user.fullName || user.email} quay trở lại hệ thống SAGA.`,
        });
      }
      router.replace(getRoleHomePath(user.role));
    }
  }, [user, router]);

  return null;
}
