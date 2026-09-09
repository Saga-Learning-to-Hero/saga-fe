"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  EyeIcon,
  EyeOffIcon,
  LoaderCircleIcon,
  CheckCircle2Icon,
  UserPlusIcon,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useRegister, useGoogleLogin } from "@/features/auth/hooks/useAuth";
import { validateStudentRegistration } from "@/features/auth/lib/auth-validation";
import { GoogleIcon } from "./google-icon";
import { cn } from "@/lib/utils";

export function RegisterForm() {
  const router = useRouter();
  const { mutate: registerStudent, isPending: isLoading } = useRegister();
  const { loginWithGoogle } = useGoogleLogin();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    studentCode: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validation = validateStudentRegistration(form);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      const firstMsg = Object.values(validation.errors)[0] || "Vui lòng kiểm tra lại thông tin đăng ký.";
      toast.error(firstMsg, { id: "register-validation-error" });
      return;
    }
    setFieldErrors({});

    registerStudent(
      {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        studentCode: form.studentCode.trim().toUpperCase(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      },
      {
        onSuccess: () => {
          setSuccess(true);
          setTimeout(() => {
            router.replace("/login");
          }, 1500);
        },
      }
    );
  };

  const updateField = (field: keyof typeof form, val: string) => {
    setForm((f) => ({ ...f, [field]: val }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const canSubmit =
    !isLoading &&
    form.fullName.trim() !== "" &&
    form.email.trim() !== "" &&
    form.studentCode.trim() !== "" &&
    form.password !== "" &&
    form.confirmPassword !== "";

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Tạo tài khoản sinh viên</h1>
        <p className="text-xs text-muted-foreground">
          Dành cho sinh viên dùng email cá nhân để tham gia dự án nhóm.
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full font-semibold gap-2.5 h-10 rounded-xl shadow-xs border-border hover:bg-muted cursor-pointer text-xs"
        disabled={isLoading}
        onClick={() => loginWithGoogle()}
      >
        <GoogleIcon />
        <span>Có email trường @fpt.edu.vn? Đăng nhập Google</span>
      </Button>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
          hoặc đăng ký bằng email cá nhân
        </span>
        <Separator className="flex-1" />
      </div>

      {success ? (
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2 animate-in fade-in-0 zoom-in-95">
          <CheckCircle2Icon className="size-10 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            Tạo tài khoản thành công!
          </h3>
          <p className="text-xs text-muted-foreground">
            Đang chuyển sang trang đăng nhập...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <Label htmlFor="fullName" className="text-xs font-semibold">
                Họ và tên
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Nguyễn Văn A"
                disabled={isLoading}
                value={form.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                className={cn(
                  "text-xs h-9.5 rounded-xl",
                  fieldErrors.fullName && "border-destructive focus-visible:ring-destructive"
                )}
              />
              {fieldErrors.fullName && (
                <p className="text-[10px] text-destructive font-medium">{fieldErrors.fullName}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="studentCode" className="text-xs font-semibold">
                Mã sinh viên
              </Label>
              <Input
                id="studentCode"
                type="text"
                placeholder="SE170504"
                disabled={isLoading}
                value={form.studentCode}
                onChange={(e) => updateField("studentCode", e.target.value)}
                className={cn(
                  "text-xs h-9.5 rounded-xl font-mono uppercase",
                  fieldErrors.studentCode && "border-destructive focus-visible:ring-destructive"
                )}
              />
              {fieldErrors.studentCode && (
                <p className="text-[10px] text-destructive font-medium">{fieldErrors.studentCode}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="email" className="text-xs font-semibold">
              Email cá nhân
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="student.personal@gmail.com"
              disabled={isLoading}
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className={cn(
                "text-xs h-9.5 rounded-xl",
                fieldErrors.email && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {fieldErrors.email && (
              <p className="text-[10px] text-destructive font-medium">{fieldErrors.email}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="password" className="text-xs font-semibold">
              Mật khẩu (ít nhất 10 ký tự)
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                disabled={isLoading}
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                className={cn(
                  "pr-10 text-xs h-9.5 rounded-xl",
                  fieldErrors.password && "border-destructive focus-visible:ring-destructive"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeOffIcon className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-[10px] text-destructive font-medium">{fieldErrors.password}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="confirmPassword" className="text-xs font-semibold">
              Xác nhận mật khẩu
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••••••"
                disabled={isLoading}
                value={form.confirmPassword}
                onChange={(e) => updateField("confirmPassword", e.target.value)}
                className={cn(
                  "pr-10 text-xs h-9.5 rounded-xl",
                  fieldErrors.confirmPassword && "border-destructive focus-visible:ring-destructive"
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showConfirmPassword ? <EyeOffIcon className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-[10px] text-destructive font-medium">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full font-bold h-10 rounded-xl shadow-sm text-xs cursor-pointer mt-1"
            disabled={!canSubmit}
          >
            {isLoading ? (
              <>
                <LoaderCircleIcon className="w-4 h-4 animate-spin mr-2" aria-hidden />
                <span>Đang tạo tài khoản...</span>
              </>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <UserPlusIcon className="size-3.5" />
                Tạo tài khoản
              </span>
            )}
          </Button>
        </form>
      )}

      <div className="text-center pt-1">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>Đã có tài khoản?</span>
          <span className="text-primary font-bold hover:underline">Đăng nhập ngay</span>
        </Link>
      </div>
    </div>
  );
}
