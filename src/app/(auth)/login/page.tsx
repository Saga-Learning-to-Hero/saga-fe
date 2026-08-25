"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeOffIcon, GitGraphIcon, LoaderCircleIcon, ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    login();
    router.push("/dashboard");
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    login();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen grid md:grid-cols-[3fr_2fr] lg:grid-cols-[7fr_5fr]">
      {/* Branding panel — trái */}
      <div
        className="hidden md:flex flex-col justify-between p-10 lg:p-14 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, oklch(from var(--saga-primary) calc(l - 0.15) c h), oklch(from var(--saga-accent) calc(l - 0.1) c h))",
        }}
      >
        {/* Vòng trang trí */}
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: "oklch(1 0 0 / 15%)" }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-10"
          style={{ background: "oklch(1 0 0 / 20%)" }}
        />

        {/* Logo */}
        <div className="flex items-center gap-3 relative">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <GitGraphIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">SAGA</span>
        </div>

        {/* Quote giữa */}
        <div className="relative space-y-6">
          <p className="text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            Hiểu sinh viên{" "}
            <span className="text-white/70">qua từng hoạt động</span>
          </p>
          <p className="text-white/70 text-lg leading-relaxed max-w-md">
            Đồ thị học tập giúp bạn nhìn thấy toàn bộ hành trình học tập,
            không chỉ điểm số cuối kỳ.
          </p>

          {/* Stat badges */}
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

        {/* Footer */}
        <p className="text-white/40 text-sm relative">
          © 2025 SAGA — Capstone Project
        </p>
      </div>

      {/* Form panel — phải */}
      <div className="flex items-center justify-center p-6 md:p-10 bg-background">
        <div className="w-full max-w-sm space-y-8">
          {/* Nút quay lại trang chủ */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-fast group"
          >
            <ArrowLeftIcon className="w-4 h-4 transition-fast group-hover:-translate-x-0.5" />
            Quay lại trang chủ
          </Link>

          {/* Mobile logo */}
          <div className="flex md:hidden items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <GitGraphIcon className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-lg">SAGA</span>
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold text-foreground">Đăng nhập</h1>
            <p className="text-sm text-muted-foreground">
              Chào mừng trở lại! Nhập thông tin tài khoản của bạn.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@university.edu.vn"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="mat-khau">Mật khẩu</Label>
                <Link
                  href="#"
                  className="text-xs text-primary hover:underline transition-fast"
                >
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
                  className="pr-10"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-fast"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? (
                    <EyeOffIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoaderCircleIcon className="w-4 h-4 mr-2 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </Button>
          </form>

          {/* Separator */}
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground whitespace-nowrap">hoặc tiếp tục với</span>
            <Separator className="flex-1" />
          </div>

          {/* Google button */}
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
            <Link href="#" className="text-primary hover:underline">
              điều khoản sử dụng
            </Link>{" "}
            của SAGA.
          </p>
        </div>
      </div>
    </div>
  );
}
