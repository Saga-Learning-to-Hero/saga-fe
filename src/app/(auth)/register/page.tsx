"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  EyeIcon,
  EyeOffIcon,
  LoaderCircleIcon,
  ArrowLeftIcon,
  AlertCircleIcon,
  CheckCircle2Icon,
  UserPlusIcon,
  GraduationCapIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SagaLogo } from "@/components/common/saga-logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { useRegister, useGoogleLogin } from "@/features/auth/hooks/useAuth";
import { validateStudentRegistration } from "@/features/auth/lib/auth-validation";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterPageContent />
    </Suspense>
  );
}

function RegisterPageContent() {
  const router = useRouter();
  const { mutateAsync: registerStudent, isPending: isLoading } = useRegister();
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
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validation = validateStudentRegistration(form);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }
    setFieldErrors({});

    try {
      await registerStudent({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        studentCode: form.studentCode.trim().toUpperCase(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      setSuccess(true);
      setTimeout(() => {
        router.replace("/login");
      }, 1800);
    } catch (err: unknown) {
      const e = err as Error;
      setServerError(e.message || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.");
    }
  };

  const updateField = (field: keyof typeof form, val: string) => {
    setForm((f) => ({ ...f, [field]: val }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-[3fr_2fr] lg:grid-cols-[7fr_5fr]">
      <div
        className="hidden md:flex flex-col justify-between p-10 lg:p-14 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, oklch(from var(--saga-primary) calc(l - 0.15) c h), oklch(from var(--saga-accent) calc(l - 0.1) c h))",
        }}
      >
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: "oklch(1 0 0 / 15%)" }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-10"
          style={{ background: "oklch(1 0 0 / 20%)" }}
        />

        <div className="relative">
          <SagaLogo
            size="md"
            variant="on-dark"
            showText={true}
            showSubtitle={true}
            subtitleText="Academic Graph Analytics"
          />
        </div>

        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-semibold">
            <GraduationCapIcon className="size-4 text-amber-300" />
            <span>Đăng ký tài khoản Sinh viên</span>
          </div>

          <p className="text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            Khởi đầu hành trình <span className="text-white/70">học tập minh bạch</span>
          </p>
          <p className="text-white/70 text-lg leading-relaxed max-w-md">
            Gia nhập đồ thị SAGA để theo dõi mức đóng góp dự án, tiến độ sprint và đánh giá năng lực liên tục.
          </p>
        </div>

        <p className="text-white/40 text-sm relative">© 2026 SAGA — FPT Capstone Project</p>
      </div>

      <div className="flex flex-col justify-center items-center px-6 py-10 lg:px-16 bg-background">
        <div className="w-full max-w-sm space-y-5">
          <div className="flex items-center justify-between">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              Quay lại đăng nhập
            </Link>
            <ThemeToggle />
          </div>

          <div className="flex md:hidden items-center mb-2">
            <SagaLogo size="sm" showText={true} showSubtitle={false} />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary mb-1">
              <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <UserPlusIcon className="size-4.5" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Đăng ký tài khoản</h1>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Dành cho sinh viên sử dụng email cá nhân. Sinh viên FPT/FE vui lòng dùng nút Google bên dưới.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full font-semibold gap-2.5 h-10.5 rounded-xl shadow-xs border-border hover:bg-muted cursor-pointer text-xs"
            disabled={isLoading}
            onClick={loginWithGoogle}
          >
            <GoogleIcon />
            <span>Sinh viên FPT / FE? Đăng nhập Google</span>
          </Button>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
              hoặc đăng ký bằng email cá nhân
            </span>
            <Separator className="flex-1" />
          </div>

          {success ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 p-6 animate-in zoom-in-95">
              <div className="size-14 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <CheckCircle2Icon className="size-7" />
              </div>
              <p className="font-bold text-foreground text-sm">Đăng ký thành công!</p>
              <p className="text-xs text-muted-foreground">Đang chuyển hướng về trang đăng nhập...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3" noValidate>
              <div className="space-y-1">
                <Label htmlFor="fullname" className="text-xs font-semibold">
                  Họ và tên <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fullname"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  required
                  disabled={isLoading}
                  value={form.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  className="text-xs h-9.5 rounded-xl"
                />
                {fieldErrors.fullName && (
                  <p className="text-[11px] text-destructive font-medium">{fieldErrors.fullName}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label htmlFor="studentcode" className="text-xs font-semibold">
                    Mã số SV (MSSV) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="studentcode"
                    type="text"
                    placeholder="SE170001"
                    required
                    disabled={isLoading}
                    value={form.studentCode}
                    onChange={(e) => updateField("studentCode", e.target.value)}
                    className="text-xs h-9.5 rounded-xl uppercase font-mono"
                  />
                  {fieldErrors.studentCode && (
                    <p className="text-[11px] text-destructive font-medium">{fieldErrors.studentCode}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="email" className="text-xs font-semibold">
                    Email cá nhân <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@gmail.com"
                    required
                    disabled={isLoading}
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="text-xs h-9.5 rounded-xl"
                  />
                  {fieldErrors.email && (
                    <p className="text-[11px] text-destructive font-medium">{fieldErrors.email}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs font-semibold">
                  Mật khẩu (tối thiểu 10 ký tự) <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••"
                    autoComplete="new-password"
                    required
                    minLength={10}
                    disabled={isLoading}
                    className="pr-10 text-xs h-9.5 rounded-xl"
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
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
                  <p className="text-[11px] text-destructive font-medium">{fieldErrors.password}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirm-password" className="text-xs font-semibold">
                  Xác nhận mật khẩu <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••••"
                    autoComplete="new-password"
                    required
                    minLength={10}
                    disabled={isLoading}
                    className="pr-10 text-xs h-9.5 rounded-xl"
                    value={form.confirmPassword}
                    onChange={(e) => updateField("confirmPassword", e.target.value)}
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

              {serverError && (
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-destructive/10 text-destructive text-xs animate-in fade-in-0">
                  <AlertCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{serverError}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full font-bold h-10 rounded-xl shadow-sm text-xs cursor-pointer mt-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoaderCircleIcon className="w-4 h-4 animate-spin mr-2" aria-hidden />
                    <span>Đang xử lý đăng ký...</span>
                  </>
                ) : (
                  "Hoàn tất đăng ký"
                )}
              </Button>
            </form>
          )}

          <p className="text-center text-xs text-muted-foreground pt-1">
            Đã có tài khoản SAGA?{" "}
            <Link href="/login" className="text-primary hover:underline font-semibold">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
