"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  EyeIcon,
  EyeOffIcon,
  LoaderCircleIcon,
  UserPlusIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/sonner";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { getSafeRedirectUrl } from "@/features/auth/lib/role-routes";
import { useLogin, useSession, useGoogleLogin, useEnsureCsrf } from "@/features/auth/hooks/useAuth";
import { validateLogin, getGoogleErrorMessage } from "@/features/auth/lib/auth-validation";
import { GoogleIcon } from "./google-icon";
import { cn } from "@/lib/utils";
import type { Role } from "@/types/auth";

const emptySubscribe = () => () => { };

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, passwordSetupRequired } = useAuthStore();
  const { mutate: login, isPending: isLoading } = useLogin();
  const { loginWithGoogle } = useGoogleLogin();
  const { isPending: isSessionLoading } = useSession();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEnsureCsrf();

  const googleError = searchParams.get("error");

  useEffect(() => {
    if (googleError) {
      if (typeof window !== "undefined") sessionStorage.removeItem("saga_auth_provider");
      toast.error(getGoogleErrorMessage(googleError), { id: "google-auth-error", duration: 6000 });
    }
  }, [googleError]);

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const getRedirectUrl = useCallback(
    (role: Role): string => {
      return getSafeRedirectUrl(searchParams.get("next"), role);
    },
    [searchParams]
  );

  useEffect(() => {
    if (isAuthenticated && user) {
      const isFromGoogle =
        typeof window !== "undefined" && sessionStorage.getItem("saga_auth_provider") === "google";

      if (isFromGoogle) {
        sessionStorage.removeItem("saga_auth_provider");
        toast.success("Đăng nhập Google thành công!", {
          id: "google-auth-success",
          description: `Chào mừng ${user.fullName || user.email} quay trở lại hệ thống SAGA.`,
        });
      }

      if (passwordSetupRequired) {
        if (isFromGoogle) {
          toast.info("Yêu cầu đặt mật khẩu", {
            id: "google-auth-setup-info",
            description: "Vui lòng đặt mật khẩu đăng nhập cho tài khoản trường của bạn.",
          });
        }
        router.replace("/auth/setup-password");
      } else {
        router.replace(getRedirectUrl(user.role));
      }
    }
  }, [isAuthenticated, user, passwordSetupRequired, router, getRedirectUrl]);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validation = validateLogin(form.identifier, form.password);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      const firstMsg = Object.values(validation.errors)[0] || "Vui lòng nhập đầy đủ thông tin đăng nhập.";
      toast.error(firstMsg, { id: "login-validation-error" });
      return;
    }
    setFieldErrors({});

    login({
      identifier: form.identifier.trim(),
      password: form.password,
    });
  };

  const handleGoogleLogin = () => loginWithGoogle();
  const canSubmit = !isLoading && form.identifier.trim() !== "" && form.password !== "";
  const isPendingGoogle =
    mounted && typeof window !== "undefined" && sessionStorage.getItem("saga_auth_provider") === "google";

  if (mounted && ((isSessionLoading && isPendingGoogle) || (isAuthenticated && user))) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4 animate-in fade-in-0">
        <LoaderCircleIcon className="size-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground font-medium">
          {isPendingGoogle ? "Đang hoàn tất đăng nhập Google..." : "Đang chuyển hướng vào hệ thống..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Đăng nhập</h1>
        <p className="text-xs text-muted-foreground">
          Đăng nhập bằng tài khoản Google FPT/FE hoặc tài khoản nội bộ.
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full font-semibold gap-2.5 h-11 rounded-xl shadow-xs border-border hover:bg-muted cursor-pointer"
        disabled={isLoading}
        onClick={handleGoogleLogin}
      >
        <GoogleIcon />
        <span>Tiếp tục với Google (FPT / FE)</span>
      </Button>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
          hoặc đăng nhập nội bộ
        </span>
        <Separator className="flex-1" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="identifier" className="text-xs font-semibold text-foreground/90">
            Email hoặc Tên đăng nhập
          </Label>
          <Input
            id="identifier"
            type="text"
            placeholder="anvse170102@fpt.edu.vn hoặc admin"
            autoComplete="username"
            required
            disabled={isLoading}
            value={form.identifier}
            onChange={(e) => {
              setForm((f) => ({ ...f, identifier: e.target.value }));
              if (fieldErrors.identifier) setFieldErrors((prev) => ({ ...prev, identifier: "" }));
            }}
            className={cn(
              "text-xs h-10 rounded-xl px-3.5",
              fieldErrors.identifier && "border-destructive focus-visible:ring-destructive"
            )}
          />
          {fieldErrors.identifier && (
            <p className="text-xs text-destructive font-medium">{fieldErrors.identifier}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-semibold text-foreground/90">
              Mật khẩu
            </Label>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline font-medium">
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••"
              autoComplete="current-password"
              required
              disabled={isLoading}
              className={cn(
                "pr-10 text-xs h-10 rounded-xl px-3.5",
                fieldErrors.password && "border-destructive focus-visible:ring-destructive"
              )}
              value={form.password}
              onChange={(e) => {
                setForm((f) => ({ ...f, password: e.target.value }));
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: "" }));
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="text-xs text-destructive font-medium">{fieldErrors.password}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full font-bold h-10.5 rounded-xl shadow-sm text-xs cursor-pointer"
          disabled={!canSubmit}
        >
          {isLoading ? (
            <>
              <LoaderCircleIcon className="w-4 h-4 animate-spin mr-2" aria-hidden />
              <span>Đang xác thực...</span>
            </>
          ) : (
            "Đăng nhập"
          )}
        </Button>
      </form>

      <div className="text-center pt-1">
        <Link
          href="/register"
          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold"
        >
          <UserPlusIcon className="size-3.5" />
          <span>Chưa có tài khoản? Đăng ký cho sinh viên dùng email cá nhân</span>
        </Link>
      </div>
    </div>
  );
}
