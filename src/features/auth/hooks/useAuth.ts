"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/sonner";
import { AuthService } from "../api/auth-service";
import { useAuthStore } from "../store/useAuthStore";
import { getSafeRedirectUrl } from "../lib/role-routes";
import { ensureCsrfToken } from "@/lib/axios";
import type { LoginRequest, RegisterRequest, PasswordSetupRequest, AuthMeResponse } from "../types/auth-dto";
import type { User } from "@/types/auth";

export const AUTH_QUERY_KEY = ["auth", "session"] as const;

export function useSession() {
  const { setUser, setHasHydrated } = useAuthStore();

  return useQuery<AuthMeResponse>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      try {
        const res = await AuthService.getMe();
        if (res.authenticated && res.user) {
          const mappedUser: User = {
            id: res.user.id,
            name: res.user.fullName,
            fullName: res.user.fullName,
            username: res.user.username,
            email: res.user.email,
            avatar: res.user.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${res.user.id}`,
            role: res.user.role,
            status: "ACTIVE",
          };
          setUser(mappedUser, res.passwordSetupRequired);
        } else {
          setUser(null);
        }
        setHasHydrated(true);
        return res;
      } catch {
        setUser(null);
        setHasHydrated(true);
        return {
          authenticated: false,
          passwordSetupRequired: false,
          user: null,
        };
      }
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => AuthService.login(credentials),
    onSuccess: (res) => {
      if (res.authenticated && res.user) {
        const mappedUser: User = {
          id: res.user.id,
          name: res.user.fullName,
          fullName: res.user.fullName,
          username: res.user.username,
          email: res.user.email,
          avatar: res.user.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${res.user.id}`,
          role: res.user.role,
          status: "ACTIVE",
        };
        setUser(mappedUser, res.passwordSetupRequired);
        queryClient.setQueryData(AUTH_QUERY_KEY, res);

        toast.success("Đăng nhập thành công!", {
          id: "auth-login-success",
          description: `Chào mừng ${res.user.fullName || res.user.email} quay trở lại hệ thống SAGA.`,
        });

        if (res.passwordSetupRequired) {
          router.replace("/auth/setup-password");
        } else {
          const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
          const nextUrl = searchParams ? searchParams.get("next") : null;
          router.replace(getSafeRedirectUrl(nextUrl, res.user.role));
        }
      }
    },
    onError: (err: unknown) => {
      const e = err as Error & { code?: string };
      let desc = "Vui lòng kiểm tra lại tài khoản và mật khẩu.";
      if (e.code === "INVALID_CREDENTIALS" || e.message?.includes("INVALID_CREDENTIALS")) {
        desc = "Tên đăng nhập hoặc mật khẩu không chính xác.";
      } else if (e.code === "ACCOUNT_DISABLED") {
        desc = "Tài khoản của bạn hiện đang bị vô hiệu hóa hoặc chưa kích hoạt.";
      } else if (e.message) {
        desc = e.message;
      }
      toast.error("Đăng nhập không thành công", {
        id: "auth-login-error",
        description: desc,
      });
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) => AuthService.register(data),
    onSuccess: (res) => {
      toast.success("Đăng ký tài khoản thành công!", {
        id: "auth-register-success",
        description: "Bạn có thể sử dụng email và mật khẩu vừa tạo để đăng nhập vào SAGA.",
      });
      return res;
    },
    onError: (err: unknown) => {
      const e = err as Error & { code?: string };
      let desc = "Vui lòng kiểm tra lại thông tin đăng ký.";
      if (e.code === "EMAIL_ALREADY_EXISTS") {
        desc = "Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.";
      } else if (e.code === "INSTITUTIONAL_EMAIL_USE_GOOGLE") {
        desc = "Tài khoản FPT/FE bắt buộc phải đăng nhập bằng nút Tiếp tục với Google.";
      } else if (e.message) {
        desc = e.message;
      }
      toast.error("Đăng ký thất bại", {
        id: "auth-register-error",
        description: desc,
      });
    },
  });
}

export function useSetupPassword() {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: PasswordSetupRequest) => AuthService.setupPassword(data),
    onSuccess: (res) => {
      if (res.authenticated && res.user) {
        const mappedUser: User = {
          id: res.user.id,
          name: res.user.fullName,
          fullName: res.user.fullName,
          email: res.user.email,
          avatar: res.user.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${res.user.id}`,
          role: res.user.role,
          status: "ACTIVE",
        };
        setUser(mappedUser, false);
        queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });

        toast.success("Thiết lập mật khẩu thành công!", {
          id: "auth-setup-password-success",
          description: "Mật khẩu của bạn đã được kích hoạt thành công.",
        });
      }
    },
    onError: (err: unknown) => {
      const e = err as Error & { code?: string };
      if (
        e.code === "PASSWORD_ALREADY_SET" ||
        e.message?.includes("already set") ||
        e.message?.includes("not required")
      ) {
        toast.info("Tài khoản đã có mật khẩu. Đang chuyển hướng...", {
          id: "auth-setup-password-info",
        });
        return;
      }
      toast.error("Thiết lập mật khẩu thất bại", {
        id: "auth-setup-password-error",
        description: e.message || "Vui lòng kiểm tra lại mật khẩu.",
      });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: () => AuthService.logout(),
    onSuccess: () => {
      setUser(null);
      queryClient.setQueryData(AUTH_QUERY_KEY, {
        authenticated: false,
        passwordSetupRequired: false,
        user: null,
      });
      queryClient.clear();

      toast.info("Đã đăng xuất tài khoản", {
        id: "auth-logout-info",
        description: "Hẹn gặp lại bạn trong phiên làm việc tiếp theo.",
      });

      router.replace("/login");
    },
    onError: (err: unknown) => {
      const e = err as Error;
      toast.error("Đăng xuất thất bại", {
        id: "auth-logout-error",
        description: e.message || "Không thể kết nối đến máy chủ để hủy phiên.",
      });
    },
  });
}

export function useGoogleLogin() {
  const loginWithGoogle = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("saga_auth_provider", "google");
    }
    window.location.href = AuthService.getGoogleLoginUrl();
  };

  return {
    loginWithGoogle,
  };
}

export function useEnsureCsrf() {
  useEffect(() => {
    void ensureCsrfToken(true);
  }, []);
}

