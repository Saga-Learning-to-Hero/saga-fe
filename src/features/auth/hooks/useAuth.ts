"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/sonner";
import { AuthService } from "../api/auth-service";
import { useAuthStore } from "../store/useAuthStore";
import { getRoleHomePath } from "../lib/role-routes";
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
    staleTime: 5 * 60 * 1000,
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
          email: res.user.email,
          avatar: res.user.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${res.user.id}`,
          role: res.user.role,
          status: "ACTIVE",
        };
        setUser(mappedUser, res.passwordSetupRequired);
        queryClient.setQueryData(AUTH_QUERY_KEY, res);

        toast.success("Đăng nhập thành công!", {
          description: `Chào mừng ${res.user.fullName || res.user.email} quay trở lại hệ thống SAGA.`,
        });

        if (res.passwordSetupRequired) {
          router.replace("/auth/setup-password");
        } else {
          router.replace(getRoleHomePath(res.user.role));
        }
      }
    },
    onError: (err: unknown) => {
      const e = err as Error;
      toast.error("Đăng nhập không thành công", {
        description: e.message || "Vui lòng kiểm tra lại tài khoản và mật khẩu.",
      });
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) => AuthService.register(data),
    onSuccess: (res) => {
      toast.success("Đăng ký tài khoản thành công!", {
        description: "Bạn có thể sử dụng email và mật khẩu vừa tạo để đăng nhập vào SAGA.",
      });
      return res;
    },
    onError: (err: unknown) => {
      const e = err as Error;
      toast.error("Đăng ký thất bại", {
        description: e.message || "Vui lòng kiểm tra lại thông tin đăng ký.",
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
          description: "Mật khẩu của bạn đã được kích hoạt thành công.",
        });
      }
    },
    onError: (err: unknown) => {
      const e = err as Error;
      toast.error("Thiết lập mật khẩu thất bại", {
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
        description: "Hẹn gặp lại bạn trong phiên làm việc tiếp theo.",
      });

      router.replace("/login");
    },
    onError: (err: unknown) => {
      const e = err as Error;
      toast.error("Đăng xuất thất bại", {
        description: e.message || "Không thể kết nối đến máy chủ để hủy phiên.",
      });
    },
  });
}

export function useGoogleLogin() {
  const loginWithGoogle = () => {
    window.location.href = AuthService.getGoogleLoginUrl();
  };

  return {
    loginWithGoogle,
  };
}

