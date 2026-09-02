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
import { AlertCircleIcon, CheckCircle2Icon, LoaderCircleIcon, UserPlusIcon } from "lucide-react";
import { useRegister } from "../hooks/useAuth";
import { validateStudentRegistration } from "../lib/auth-validation";

interface RegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function RegisterDialog({ open, onOpenChange, onSuccess }: RegisterDialogProps) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    studentCode: "",
    password: "",
    confirmPassword: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { mutateAsync: registerStudent, isPending: isLoading } = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
        setSuccess(false);
        onOpenChange(false);
        onSuccess?.();
      }, 1500);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6">
        <DialogHeader>
          <div className="flex items-center gap-2.5 text-primary mb-1">
            <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <UserPlusIcon className="size-4.5" />
            </div>
            <DialogTitle className="text-lg font-bold">Đăng ký tài khoản Sinh viên</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Dành cho sinh viên sử dụng email cá nhân (Gmail, Outlook, v.v.). Sinh viên FPT/FE vui lòng dùng nút Đăng nhập Google.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="size-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center animate-in zoom-in-50">
              <CheckCircle2Icon className="size-6" />
            </div>
            <p className="font-bold text-foreground">Đăng ký tài khoản thành công!</p>
            <p className="text-xs text-muted-foreground">Bạn có thể đăng nhập ngay bây giờ bằng email và mật khẩu vừa tạo.</p>
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
              <Label htmlFor="reg-fullname" className="text-xs font-semibold">
                Họ và tên <span className="text-destructive">*</span>
              </Label>
              <Input
                id="reg-fullname"
                placeholder="Nguyễn Văn A"
                required
                value={form.fullName}
                onChange={(e) => {
                  setForm((f) => ({ ...f, fullName: e.target.value }));
                  if (fieldErrors.fullName) setFieldErrors((prev) => ({ ...prev, fullName: "" }));
                }}
                className="text-xs h-9"
              />
              {fieldErrors.fullName && (
                <p className="text-[11px] text-destructive font-medium">{fieldErrors.fullName}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="reg-studentcode" className="text-xs font-semibold">
                  Mã số SV (MSSV) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="reg-studentcode"
                  placeholder="SE170001"
                  required
                  value={form.studentCode}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, studentCode: e.target.value }));
                    if (fieldErrors.studentCode) setFieldErrors((prev) => ({ ...prev, studentCode: "" }));
                  }}
                  className="text-xs h-9 uppercase font-mono"
                />
                {fieldErrors.studentCode && (
                  <p className="text-[11px] text-destructive font-medium">{fieldErrors.studentCode}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="reg-email" className="text-xs font-semibold">
                  Email cá nhân <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="student@gmail.com"
                  required
                  value={form.email}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, email: e.target.value }));
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  className="text-xs h-9"
                />
                {fieldErrors.email && (
                  <p className="text-[11px] text-destructive font-medium">{fieldErrors.email}</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="reg-password" className="text-xs font-semibold">
                Mật khẩu (tối thiểu 10 ký tự) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="reg-password"
                type="password"
                placeholder="••••••••••"
                required
                minLength={10}
                value={form.password}
                onChange={(e) => {
                  setForm((f) => ({ ...f, password: e.target.value }));
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: "" }));
                }}
                className="text-xs h-9"
              />
              {fieldErrors.password && (
                <p className="text-[11px] text-destructive font-medium">{fieldErrors.password}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="reg-confirm" className="text-xs font-semibold">
                Xác nhận mật khẩu <span className="text-destructive">*</span>
              </Label>
              <Input
                id="reg-confirm"
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
                    Đang xử lý đăng ký...
                  </>
                ) : (
                  "Hoàn tất đăng ký"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
