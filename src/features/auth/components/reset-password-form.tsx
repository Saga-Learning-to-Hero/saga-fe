"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  ArrowLeftIcon,
  LoaderCircleIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { AuthService } from "../api/auth-service";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [token] = useState<string>(() => searchParams.get("token")?.trim() || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("token=")) {
      window.history.replaceState({}, "", "/reset-password");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!token) {
      setErrorMessage("Liên kết đặt lại mật khẩu không hợp lệ hoặc thiếu mã token xác thực.");
      toast.error("Thiếu mã token xác thực đặt lại mật khẩu.");
      return;
    }

    if (newPassword.length < 10) {
      toast.error("Mật khẩu mới phải có tối thiểu 10 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsLoading(true);
    try {
      await AuthService.resetPassword({
        token,
        newPassword,
      });

      setIsSuccess(true);
      toast.success("Đặt lại mật khẩu thành công!");

      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (err: unknown) {
      const errorObj = err as { code?: string; message?: string };
      const code = errorObj?.code;

      if (code === "PASSWORD_RESET_TOKEN_EXPIRED") {
        setErrorMessage("Liên kết đặt lại mật khẩu đã hết hạn (quá 30 phút). Vui lòng yêu cầu liên kết mới.");
        toast.error("Liên kết đặt lại mật khẩu đã hết hạn.");
      } else if (code === "PASSWORD_RESET_TOKEN_INVALID") {
        setErrorMessage("Mã xác thực không hợp lệ hoặc đã từng được sử dụng trước đó.");
        toast.error("Mã xác thực không hợp lệ.");
      } else if (code === "PASSWORD_POLICY_VIOLATION") {
        setErrorMessage("Mật khẩu mới không đáp ứng chính sách bảo mật (tối thiểu 10 ký tự).");
        toast.error("Mật khẩu phải có tối thiểu 10 ký tự.");
      } else {
        const msg = errorObj?.message || "Không thể đặt lại mật khẩu. Vui lòng thử lại sau.";
        setErrorMessage(msg);
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2Icon className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Cập nhật mật khẩu thành công!</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Mật khẩu mới của bạn đã được lưu vào hệ thống. Hệ thống đang tự động chuyển hướng bạn về trang đăng nhập...
          </p>
        </div>

        <div className="pt-2">
          <Link href="/login" className="block w-full">
            <Button
              type="button"
              className="w-full h-11 rounded-xl text-xs font-semibold gap-2 cursor-pointer"
            >
              <span>Đăng nhập ngay</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertCircleIcon className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Liên kết không hợp lệ</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Không tìm thấy mã xác thực (token) trong liên kết đặt lại mật khẩu hoặc liên kết đã bị chỉnh sửa.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <Link href="/forgot-password" className="block w-full">
            <Button
              type="button"
              className="w-full h-11 rounded-xl text-xs font-semibold gap-2 cursor-pointer"
            >
              <span>Yêu cầu liên kết mới</span>
            </Button>
          </Link>

          <Link href="/login" className="block w-full">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 rounded-xl text-xs font-semibold gap-2 cursor-pointer border-border"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Quay lại trang Đăng nhập</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Thiết lập mật khẩu mới</h1>
        <p className="text-xs text-muted-foreground">
          Nhập mật khẩu mới cho tài khoản của bạn. Mật khẩu phải có độ dài tối thiểu 10 ký tự.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-start gap-2.5">
          <AlertCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="new-password" className="text-xs font-semibold text-foreground/90">
            Mật khẩu mới (tối thiểu 10 ký tự)
          </Label>
          <div className="relative">
            <Input
              id="new-password"
              type={showPassword ? "text" : "password"}
              required
              disabled={isLoading}
              placeholder="••••••••••"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="text-xs h-11 rounded-xl px-3.5 pl-10 pr-10"
            />
            <LockIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm-new-password" className="text-xs font-semibold text-foreground/90">
            Xác nhận mật khẩu mới
          </Label>
          <div className="relative">
            <Input
              id="confirm-new-password"
              type={showConfirmPassword ? "text" : "password"}
              required
              disabled={isLoading}
              placeholder="••••••••••"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="text-xs h-11 rounded-xl px-3.5 pl-10 pr-10"
            />
            <LockIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showConfirmPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading || newPassword.length < 10 || newPassword !== confirmPassword}
          className="w-full h-11 rounded-xl text-xs font-semibold gap-2 cursor-pointer shadow-xs"
        >
          {isLoading ? (
            <>
              <LoaderCircleIcon className="w-4 h-4 animate-spin" />
              <span>Đang lưu mật khẩu mới...</span>
            </>
          ) : (
            <span>Xác nhận đặt lại mật khẩu</span>
          )}
        </Button>
      </form>

      <div className="text-center pt-2">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          <span>Quay lại Đăng nhập</span>
        </Link>
      </div>
    </div>
  );
}
