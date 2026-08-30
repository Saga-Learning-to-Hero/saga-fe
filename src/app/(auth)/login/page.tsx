"use client";

import { useState, useEffect, useId, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  EyeIcon, EyeOffIcon, LoaderCircleIcon, ArrowLeftIcon,
  ShieldCheckIcon, PresentationIcon, GraduationCapIcon, CheckIcon, AlertCircleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SagaLogo } from "@/components/common/saga-logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { getRoleHomePath, isPathAllowedForRole } from "@/features/auth/lib/role-routes";
import type { Role } from "@/types/auth";

/* ─── Google Icon ─────────────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}

/* ─── Role definitions ─────────────────────────────────────────────────── */
const ROLES: { value: Role; label: string; description: string; Icon: React.ElementType }[] = [
  {
    value: "ADMIN",
    label: "Quản trị viên",
    description: "Quản lý hệ thống và dữ liệu học thuật",
    Icon: ShieldCheckIcon,
  },
  {
    value: "LECTURER",
    label: "Giảng viên",
    description: "Quản lý lớp học và theo dõi sinh viên",
    Icon: PresentationIcon,
  },
  {
    value: "STUDENT",
    label: "Sinh viên",
    description: "Theo dõi nhiệm vụ và mức đóng góp",
    Icon: GraduationCapIcon,
  },
];

/* ─── Component ────────────────────────────────────────────────────────── */
export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, login } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [roleError, setRoleError] = useState(false);

  const groupId = useId();

  // Hàm tính URL đích sau khi đăng nhập
  const getRedirectUrl = (role: Role): string => {
    const nextUrl = searchParams.get("next");
    if (nextUrl && isPathAllowedForRole(nextUrl, role)) {
      return nextUrl;
    }
    return getRoleHomePath(role);
  };

  // Already-logged-in guard — redirect to correct home
  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(getRedirectUrl(user.role));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, router]);

  const doLogin = async (role: Role) => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 900)); // simulate network
      login(role);
      router.replace(getRedirectUrl(role));
    } catch {
      setError("Đăng nhập thất bại. Vui lòng thử lại.");
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      setRoleError(true);
      document.getElementById("role-selector")?.focus();
      return;
    }
    setRoleError(false);
    await doLogin(selectedRole);
  };

  const handleGoogleLogin = async () => {
    if (!selectedRole) {
      setRoleError(true);
      document.getElementById("role-selector")?.focus();
      return;
    }
    setRoleError(false);
    await doLogin(selectedRole);
  };

  const canSubmit = !isLoading && selectedRole !== null && form.email.trim() !== "" && form.password !== "";

  return (
    <div className="min-h-screen grid md:grid-cols-[3fr_2fr] lg:grid-cols-[7fr_5fr]">
      {/* ── Branding panel (left) ──────────────────────────────────────── */}
      <div
        className="hidden md:flex flex-col justify-between p-10 lg:p-14 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, oklch(from var(--saga-primary) calc(l - 0.15) c h), oklch(from var(--saga-accent) calc(l - 0.1) c h))",
        }}
      >
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20" style={{ background: "oklch(1 0 0 / 15%)" }} />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-10" style={{ background: "oklch(1 0 0 / 20%)" }} />

        {/* Logo */}
        <div className="relative">
          <SagaLogo size="md" variant="on-dark" showText={true} showSubtitle={true} subtitleText="Academic Graph Analytics" />
        </div>

        {/* Hero quote */}
        <div className="relative space-y-6">
          <p className="text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            Hiểu sinh viên{" "}
            <span className="text-white/70">qua từng hoạt động</span>
          </p>
          <p className="text-white/70 text-lg leading-relaxed max-w-md">
            Đồ thị học tập giúp bạn nhìn thấy toàn bộ hành trình học tập, không chỉ điểm số cuối kỳ.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            {[
              { so: "100%", nhan: "Minh bạch" },
              { so: "Real-time", nhan: "Cập nhật" },
              { so: "Đa chiều", nhan: "Đánh giá" },
            ].map((s) => (
              <div
                key={s.nhan}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white"
                style={{ background: "oklch(1 0 0 / 12%)" }}
              >
                <span className="font-bold">{s.so}</span>
                <span className="text-white/70">{s.nhan}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/40 text-sm relative">© 2025 SAGA — Capstone Project</p>
      </div>

      {/* ── Form panel (right) ─────────────────────────────────────────── */}
      <div className="flex flex-col justify-center items-center px-6 py-12 lg:px-16 bg-background">
        <div className="w-full max-w-sm space-y-7">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group">
              <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              Quay lại trang chủ
            </Link>
            <ThemeToggle />
          </div>

          {/* Mobile logo */}
          <div className="flex md:hidden items-center mb-2">
            <SagaLogo size="sm" showText={true} showSubtitle={false} />
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Đăng nhập</h1>
            <p className="text-sm text-muted-foreground">Chọn vai trò và nhập thông tin tài khoản.</p>
          </div>

          {/* ── Role selector (radio group) ─────────────────────────────── */}
          <div
            id="role-selector"
            role="radiogroup"
            aria-labelledby="role-selector-label"
            aria-required="true"
            tabIndex={-1}
            className="space-y-2 outline-none"
          >
            <p id="role-selector-label" className="text-sm font-medium text-foreground">
              Vai trò <span className="text-destructive" aria-hidden="true">*</span>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {ROLES.map(({ value, label, description, Icon }) => {
                const isSelected = selectedRole === value;
                const inputId = `${groupId}-${value}`;
                return (
                  <label
                    key={value}
                    htmlFor={inputId}
                    className={[
                      "relative flex flex-col gap-1.5 rounded-xl border p-3.5 cursor-pointer transition-all duration-150",
                      "hover:bg-muted/50 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border bg-card",
                      roleError && !selectedRole ? "border-destructive" : "",
                    ].join(" ")}
                  >
                    {/* Hidden native radio for a11y */}
                    <input
                      id={inputId}
                      type="radio"
                      name={`${groupId}-role`}
                      value={value}
                      checked={isSelected}
                      onChange={() => { setSelectedRole(value); setRoleError(false); }}
                      className="sr-only"
                    />

                    {/* Check badge */}
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <CheckIcon className="w-2.5 h-2.5 text-primary-foreground" aria-hidden />
                      </span>
                    )}

                    {/* Icon */}
                    <span
                      className={[
                        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                        isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                      ].join(" ")}
                    >
                      <Icon className="w-4.5 h-4.5" aria-hidden />
                    </span>

                    {/* Text */}
                    <span className={["text-xs font-semibold leading-tight", isSelected ? "text-primary" : "text-foreground"].join(" ")}>
                      {label}
                    </span>
                    <span className="text-[11px] text-muted-foreground leading-snug">{description}</span>
                  </label>
                );
              })}
            </div>

            {roleError && (
              <p role="alert" className="flex items-center gap-1.5 text-xs text-destructive mt-1">
                <AlertCircleIcon className="w-3.5 h-3.5 shrink-0" />
                Vui lòng chọn vai trò trước khi đăng nhập.
              </p>
            )}
          </div>

          {/* ── Credentials form ─────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@university.edu.vn"
                autoComplete="email"
                required
                disabled={isLoading}
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
                <Link href="#" className="text-xs text-primary hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  className="pr-10"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Login error */}
            {error && (
              <p role="alert" className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircleIcon className="w-3.5 h-3.5 shrink-0" />
                {error}
              </p>
            )}

            {/* Submit */}
            <Button type="submit" className="w-full font-semibold" disabled={!canSubmit}>
              {isLoading ? (
                <>
                  <LoaderCircleIcon className="w-4 h-4 animate-spin" aria-hidden />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                "Đăng nhập"
              )}
            </Button>
          </form>

          {/* ── Google ─────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground whitespace-nowrap">hoặc tiếp tục với</span>
            <Separator className="flex-1" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full font-medium gap-2.5"
            disabled={isLoading}
            onClick={handleGoogleLogin}
          >
            <GoogleIcon />
            Tiếp tục với Google
          </Button>

          {/* Footer note */}
          <p className="text-center text-xs text-muted-foreground">
            Bằng cách đăng nhập, bạn đồng ý với{" "}
            <Link href="#" className="text-primary hover:underline">điều khoản sử dụng</Link>{" "}
            của SAGA.
          </p>
        </div>
      </div>
    </div>
  );
}
