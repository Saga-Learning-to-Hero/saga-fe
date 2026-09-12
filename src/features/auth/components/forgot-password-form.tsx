"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, MailIcon, CheckCircle2Icon, LoaderCircleIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { AuthService } from "../api/auth-service";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      toast.error("Vui lòng nhập địa chỉ email.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await AuthService.forgotPassword(cleanEmail);
      setIsSuccess(true);
      setSuccessMsg(res.message || "Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi.");
      toast.success("Yêu cầu đặt lại mật khẩu đã được gửi đi.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra. Vui lòng thử lại sau.";
      toast.error(message);
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
          <h1 className="text-2xl font-bold text-foreground">Kiểm tra hộp thư của bạn</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {successMsg}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-2 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Không nhận được email?</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Kiểm tra kỹ hòm thư rác hoặc thư mục Quảng cáo (Spam/Junk).</li>
            <li>Đảm bảo địa chỉ email bạn nhập là chính xác.</li>
            <li>Liên kết đặt lại mật khẩu có hiệu lực trong vòng 30 phút.</li>
          </ul>
        </div>

        <div className="space-y-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsSuccess(false);
              setEmail("");
            }}
            className="w-full h-11 rounded-xl text-xs font-semibold cursor-pointer border-border"
          >
            Gửi lại với email khác
          </Button>

          <Link href="/login" className="block w-full">
            <Button
              type="button"
              className="w-full h-11 rounded-xl text-xs font-semibold gap-2 cursor-pointer"
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
        <h1 className="text-2xl font-bold text-foreground">Quên mật khẩu</h1>
        <p className="text-xs text-muted-foreground">
          Nhập địa chỉ email liên kết với tài khoản để nhận liên kết khôi phục mật khẩu.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="forgot-email" className="text-xs font-semibold text-foreground/90">
            Email tài khoản
          </Label>
          <div className="relative">
            <Input
              id="forgot-email"
              type="email"
              required
              disabled={isLoading}
              placeholder="name@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-xs h-11 rounded-xl px-3.5 pl-10"
            />
            <MailIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !email.trim()}
          className="w-full h-11 rounded-xl text-xs font-semibold gap-2 cursor-pointer shadow-xs"
        >
          {isLoading ? (
            <>
              <LoaderCircleIcon className="w-4 h-4 animate-spin" />
              <span>Đang gửi yêu cầu...</span>
            </>
          ) : (
            <span>Gửi liên kết đặt lại mật khẩu</span>
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
