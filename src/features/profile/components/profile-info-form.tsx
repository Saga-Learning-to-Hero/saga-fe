"use client";

import { useState } from "react";
import {
  UserIcon,
  SaveIcon,
  CheckCircle2Icon,
  LoaderCircleIcon,
} from "lucide-react";
import type { User } from "@/types/auth";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileInfoFormProps {
  user: User;
  compact?: boolean;
}

export function ProfileInfoForm({ user, compact = false }: ProfileInfoFormProps) {
  const { updateUserProfile } = useAuthStore();

  const [form, setForm] = useState({
    name: user.name || user.fullName || "",
    username: user.username || "",
    email: user.email || "",
    avatar: user.avatar || "https://api.dicebear.com/9.x/avataaars/svg?seed=saga-user",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage("");

    await new Promise((r) => setTimeout(r, 600));

    updateUserProfile({
      name: form.name,
      fullName: form.name,
      email: form.email,
      avatar: form.avatar,
    });

    setIsSaving(false);
    setSuccessMessage("Cập nhật thông tin cá nhân thành công!");
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Quản trị viên hệ thống (ADMIN)";
      case "LECTURER":
        return "Giảng viên hướng dẫn (LECTURER)";
      case "STUDENT":
        return "Sinh viên (STUDENT)";
      default:
        return role;
    }
  };

  const formFields = (
    <form onSubmit={handleSubmit} className={compact ? "space-y-4" : "space-y-6"}>
      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-semibold flex items-center gap-2 animate-in fade-in-0">
          <CheckCircle2Icon className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        <div className="space-y-2">
          <Label htmlFor="full-name" className="text-sm font-semibold text-foreground/90">
            Họ và tên <span className="text-destructive">*</span>
          </Label>
          <Input
            id="full-name"
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="h-10 text-sm rounded-xl bg-card border-border/80 px-3.5"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-semibold text-foreground/90">
            Tên đăng nhập
          </Label>
          <Input
            id="username"
            type="text"
            disabled
            value={form.username ? `@${form.username}` : "—"}
            className="h-10 text-sm rounded-xl bg-muted/60 text-muted-foreground font-mono font-medium border-border/80 px-3.5"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email-addr" className="text-sm font-semibold text-foreground/90">
            Email tài khoản <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email-addr"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="h-10 text-sm rounded-xl bg-card border-border/80 px-3.5"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role-label" className="text-sm font-semibold text-foreground/90">
            Chức danh / Vai trò
          </Label>
          <Input
            id="role-label"
            type="text"
            disabled
            value={getRoleLabel(user.role)}
            className="h-10 text-sm rounded-xl bg-muted/60 text-muted-foreground font-medium border-border/80 px-3.5"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="avatar-url" className="text-sm font-semibold text-foreground/90">
            URL Ảnh đại diện (Avatar)
          </Label>
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 rounded-xl border border-border shrink-0">
              <AvatarImage src={form.avatar} alt={form.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                {form.name ? form.name.slice(0, 2).toUpperCase() : "SG"}
              </AvatarFallback>
            </Avatar>
            <Input
              id="avatar-url"
              type="url"
              value={form.avatar}
              onChange={(e) => setForm((f) => ({ ...f, avatar: e.target.value }))}
              placeholder="https://api.dicebear.com/..."
              className="h-10 text-sm rounded-xl bg-card border-border/80 flex-1 min-w-0 px-3.5"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={isSaving}
          className="h-10 text-sm font-semibold rounded-xl gap-2 cursor-pointer shadow-xs px-6"
        >
          {isSaving ? (
            <>
              <LoaderCircleIcon className="w-4 h-4 animate-spin" />
              Đang lưu thay đổi...
            </>
          ) : (
            <>
              <SaveIcon className="w-4 h-4" />
              Lưu thay đổi
            </>
          )}
        </Button>
      </div>
    </form>
  );

  if (compact) {
    return <div className="p-0.5">{formFields}</div>;
  }

  return (
    <Card className="rounded-3xl border border-border/80 shadow-xs bg-card h-full flex flex-col justify-between">
      <CardHeader className="p-5 sm:p-6 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <UserIcon className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-foreground">
              Thông tin cá nhân
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Thông tin tài khoản đã xác thực trên hệ thống SAGA
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        {formFields}
      </CardContent>
    </Card>
  );
}
