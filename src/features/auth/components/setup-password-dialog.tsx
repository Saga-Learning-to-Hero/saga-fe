"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircleIcon, CheckCircle2Icon, KeyRoundIcon, LoaderCircleIcon } from "lucide-react";
import { useSetupPassword } from "../hooks/useAuth";
import { validatePasswordSetup } from "../lib/auth-validation";

interface SetupPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function SetupPasswordDialog({ open, onOpenChange, onSuccess }: SetupPasswordDialogProps) {
  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { mutateAsync: setupPassword, isPending: isLoading } = useSetupPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = validatePasswordSetup(form.newPassword, form.confirmPassword);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }
    setFieldErrors({});

    try {
      await setupPassword({
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onOpenChange(false);
        onSuccess?.();
      }, 1500);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Thiết lập mật khẩu thất bại.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6">
        <DialogHeader>
          <div className="flex items-center gap-2.5 text-primary mb-1">
            <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <KeyRoundIcon className="size-4.5" />
            </div>
            <DialogTitle className="text-lg font-bold">Thiết lập mật khẩu SAGA</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Tài khoản Google của bạn cần đặt mật khẩu lần đầu để có thể đăng nhập bằng cả Google lẫn Email/Mật khẩu sau này.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="size-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center animate-in zoom-in-50">
              <CheckCircle2Icon className="size-6" />
            </div>
            <p className="font-bold text-foreground">Đã thiết lập mật khẩu thành công!</p>
            <p className="text-xs text-muted-foreground">Bạn đã có thể truy cập đầy đủ các chức năng của hệ thống SAGA.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 mt-2">
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-xs">
                <AlertCircleIcon className="size-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="setup-new-pwd" className="text-xs font-semibold">
                Mật khẩu mới (tối thiểu 10 ký tự) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="setup-new-pwd"
                type="password"
                placeholder="••••••••••"
                required
                minLength={10}
                value={form.newPassword}
                onChange={(e) => {
                  setForm((f) => ({ ...f, newPassword: e.target.value }));
                  if (fieldErrors.newPassword) setFieldErrors((prev) => ({ ...prev, newPassword: "" }));
                }}
                className="text-xs h-9"
              />
              {fieldErrors.newPassword && (
                <p className="text-[11px] text-destructive font-medium">{fieldErrors.newPassword}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="setup-confirm-pwd" className="text-xs font-semibold">
                Xác nhận mật khẩu mới <span className="text-destructive">*</span>
              </Label>
              <Input
                id="setup-confirm-pwd"
                type="password"
                placeholder="••••••••••"
                required
                minLength={10}
                value={form.confirmPassword}
                onChange={(e) => {
                  setForm((f) => ({ ...f, confirmPassword: e.target.value }));
                  if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
                }}
                className="text-xs h-9"
              />
              {fieldErrors.confirmPassword && (
                <p className="text-[11px] text-destructive font-medium">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full text-xs font-bold h-9.5 rounded-xl" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <LoaderCircleIcon className="size-4 animate-spin mr-2" />
                    Đang lưu mật khẩu...
                  </>
                ) : (
                  "Lưu mật khẩu & Tiếp tục"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
