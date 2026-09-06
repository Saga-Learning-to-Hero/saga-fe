"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  EyeIcon,
  EyeOffIcon,
  LoaderCircleIcon,
  AlertCircleIcon,
  CheckCircle2Icon,
  KeyRoundIcon,
  ShieldCheckIcon,
  UserCheckIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { useSetupPassword, useSession, useGoogleLogin } from "@/features/auth/hooks/useAuth";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { validatePasswordSetup } from "@/features/auth/lib/auth-validation";
import { getRoleHomePath } from "@/features/auth/lib/role-routes";
import { ensureCsrfToken } from "@/lib/axios";
import { GoogleIcon } from "./google-icon";
import { cn } from "@/lib/utils";

export function SetupPasswordForm() {
  const router = useRouter();
  const { user, isAuthenticated, passwordSetupRequired, hasHydrated } = useAuthStore();
  const { isPending: isSessionLoading, refetch } = useSession();
  const { mutate: setupPassword, isPending: isLoading } = useSetupPassword();
  const { loginWithGoogle } = useGoogleLogin();

  useEffect(() => {
    ensureCsrfToken(true);
    refetch();
  }, [refetch]);

  const isSuccessRef = useRef(false);

  useEffect(() => {
    if (!isSuccessRef.current && hasHydrated && !isSessionLoading && isAuthenticated && user && !passwordSetupRequired) {
      router.replace(getRoleHomePath(user.role));
    }
  }, [hasHydrated, isSessionLoading, isAuthenticated, user, passwordSetupRequired, router]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validation = validatePasswordSetup(form.newPassword, form.confirmPassword);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      const firstMsg = Object.values(validation.errors)[0] || "Mật khẩu chưa đạt tiêu chuẩn bảo mật.";
      toast.error(firstMsg, { id: "setup-password-validation-error" });
      return;
    }
    setFieldErrors({});

    setupPassword(
      {
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      },
      {
        onSuccess: (res) => {
          isSuccessRef.current = true;
          setSuccess(true);
          setTimeout(() => {
            const targetRole = res.user?.role || user?.role || "STUDENT";
            router.replace(getRoleHomePath(targetRole));
          }, 1200);
        },
      }
    );
  };

  const handlePasswordChange = (newVal: string) => {
    setForm((f) => ({ ...f, newPassword: newVal }));
    if (fieldErrors.newPassword) {
      setFieldErrors((prev) => ({ ...prev, newPassword: "" }));
    }
  };

  const handleConfirmPasswordChange = (confirmVal: string) => {
    setForm((f) => ({ ...f, confirmPassword: confirmVal }));
    if (fieldErrors.confirmPassword) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
    }
  };

  const canSubmit = !isLoading && form.newPassword !== "" && form.confirmPassword !== "";

  if (hasHydrated && !isSessionLoading && !isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Đặt mật khẩu đăng nhập</h1>
          <p className="text-xs text-muted-foreground">
            Tính năng này chỉ dành cho tài khoản Google trường FPT/FE trong lần đầu đăng nhập.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircleIcon className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-amber-800 dark:text-amber-300">
                Chưa nhận diện phiên đăng nhập Google
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                Bạn cần đăng nhập bằng tài khoản Google trường để hệ thống cấp quyền thiết lập mật khẩu lần đầu.
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => loginWithGoogle()}
            className="w-full font-bold h-10.5 rounded-xl shadow-sm text-xs cursor-pointer gap-2"
          >
            <GoogleIcon />
            Đăng nhập bằng tài khoản Google FPT/FE
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Đặt mật khẩu đăng nhập</h1>
        <p className="text-xs text-muted-foreground">
          {user?.email ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <UserCheckIcon className="size-3.5 text-primary" />
              Tài khoản Google: <strong className="font-mono">{user.email}</strong>
            </span>
          ) : (
            "Vui lòng đặt mật khẩu để đăng nhập trực tiếp bằng email trường mà không cần dùng Google."
          )}
        </p>
      </div>

      {success ? (
        <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3 animate-in fade-in-0 zoom-in-95">
          <CheckCircle2Icon className="size-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-emerald-600 dark:text-emerald-400">
            Đặt mật khẩu thành công!
          </h3>
          <p className="text-xs text-muted-foreground">
            Đang chuyển hướng vào hệ thống...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="newPassword" className="text-xs font-semibold">
              Mật khẩu mới (ít nhất 10 ký tự)
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                autoComplete="new-password"
                required
                disabled={isLoading}
                value={form.newPassword}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className={cn(
                  "pr-10 text-xs h-10 rounded-xl",
                  fieldErrors.newPassword && "border-destructive focus-visible:ring-destructive"
                )}
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
            {fieldErrors.newPassword && (
              <p className="text-[11px] text-destructive font-medium">{fieldErrors.newPassword}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-xs font-semibold">
              Xác nhận lại mật khẩu
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••••••"
                autoComplete="new-password"
                required
                disabled={isLoading}
                value={form.confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                className={cn(
                  "pr-10 text-xs h-10 rounded-xl",
                  fieldErrors.confirmPassword && "border-destructive focus-visible:ring-destructive"
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showConfirmPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-[11px] text-destructive font-medium">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full font-bold h-10.5 rounded-xl shadow-sm text-xs cursor-pointer mt-2"
            disabled={!canSubmit}
          >
            {isLoading ? (
              <>
                <LoaderCircleIcon className="w-4 h-4 animate-spin mr-2" aria-hidden />
                <span>Đang lưu mật khẩu...</span>
              </>
            ) : (
              <span className="inline-flex items-center gap-2">
                <KeyRoundIcon className="size-4" />
                Lưu mật khẩu và tiếp tục
              </span>
            )}
          </Button>
        </form>
      )}

      <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-xs text-muted-foreground space-y-2">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <ShieldCheckIcon className="size-4 text-emerald-500" />
          <span>Quy định đặt mật khẩu</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-[11px]">
          <li>Mật khẩu có độ dài từ 10 ký tự trở lên.</li>
          <li>Nên kết hợp cả chữ hoa, chữ thường, số hoặc ký tự đặc biệt.</li>
        </ul>
      </div>
    </div>
  );
}
