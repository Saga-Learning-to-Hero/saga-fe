"use client";

import { useState } from "react";
import {
  UserIcon,
  SaveIcon,
  CheckCircle2Icon,
  LoaderCircleIcon,
  Trash2Icon,
  LockIcon,
} from "lucide-react";
import type { User } from "@/types/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/sonner";
import { useUserProfile, useUpdateUserProfile } from "../hooks/use-user-profile";

interface ProfileInfoFormProps {
  user: User;
  compact?: boolean;
}

export function ProfileInfoForm({ user, compact = false }: ProfileInfoFormProps) {
  const { data: profileData } = useUserProfile();
  const updateMutation = useUpdateUserProfile();

  const defaultFullName = profileData?.fullName || user.fullName || user.name || "";
  const defaultAvatarUrl = profileData?.avatarUrl || user.avatar || "";

  const [userEditedName, setUserEditedName] = useState<string | null>(null);
  const [userEditedAvatar, setUserEditedAvatar] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const currentFullName = userEditedName !== null ? userEditedName : defaultFullName;
  const currentAvatarUrl = userEditedAvatar !== null ? userEditedAvatar : defaultAvatarUrl;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");

    const trimmedName = currentFullName.trim();
    if (!trimmedName) {
      toast.error("Họ và tên không được để trống.");
      return;
    }

    if (trimmedName.length > 255) {
      toast.error("Họ và tên không được vượt quá 255 ký tự.");
      return;
    }

    if (currentAvatarUrl && currentAvatarUrl.trim() !== "") {
      const trimmedAvatar = currentAvatarUrl.trim();
      if (!trimmedAvatar.startsWith("http://") && !trimmedAvatar.startsWith("https://")) {
        toast.error("URL ảnh đại diện phải bắt đầu bằng http:// hoặc https://.");
        return;
      }
      if (trimmedAvatar.length > 500) {
        toast.error("URL ảnh đại diện không được vượt quá 500 ký tự.");
        return;
      }
    }

    try {
      await updateMutation.mutateAsync({
        fullName: trimmedName,
        avatarUrl: currentAvatarUrl.trim(),
      });
      setUserEditedName(null);
      setUserEditedAvatar(null);
      setSuccessMessage("Cập nhật thông tin cá nhân thành công!");
      toast.success("Hồ sơ cá nhân đã được lưu thành công!");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể cập nhật hồ sơ.";
      toast.error(message);
    }
  };

  const handleClearAvatar = () => {
    setUserEditedAvatar("");
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

  const emailDisplay = profileData?.email || user.email || "—";
  const usernameDisplay = profileData?.username || user.username || "";
  const roleDisplay = profileData?.role || user.role;
  const studentCodeDisplay = profileData?.studentCode || ("studentCode" in user ? (user as unknown as { studentCode: string }).studentCode : "");

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
            value={currentFullName}
            onChange={(e) => setUserEditedName(e.target.value)}
            className="h-10 text-sm rounded-xl bg-card border-border/80 px-3.5"
            placeholder="Nhập họ và tên..."
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="username" className="text-sm font-semibold text-foreground/90">
              Tên đăng nhập
            </Label>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
              <LockIcon className="w-3 h-3" /> Cố định
            </span>
          </div>
          <Input
            id="username"
            type="text"
            disabled
            value={usernameDisplay ? `@${usernameDisplay}` : "—"}
            className="h-10 text-sm rounded-xl bg-muted/60 text-muted-foreground font-mono font-medium border-border/80 px-3.5 cursor-not-allowed"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-addr" className="text-sm font-semibold text-foreground/90">
              Email tài khoản
            </Label>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
              <LockIcon className="w-3 h-3" /> Đã xác thực
            </span>
          </div>
          <Input
            id="email-addr"
            type="email"
            disabled
            value={emailDisplay}
            className="h-10 text-sm rounded-xl bg-muted/60 text-muted-foreground font-mono font-medium border-border/80 px-3.5 cursor-not-allowed"
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
            value={getRoleLabel(roleDisplay)}
            className="h-10 text-sm rounded-xl bg-muted/60 text-muted-foreground font-medium border-border/80 px-3.5 cursor-not-allowed"
          />
        </div>

        {studentCodeDisplay && (
          <div className="space-y-2 sm:col-span-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="student-code" className="text-sm font-semibold text-foreground/90">
                Mã số sinh viên
              </Label>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                <LockIcon className="w-3 h-3" /> Hồ sơ đào tạo
              </span>
            </div>
            <Input
              id="student-code"
              type="text"
              disabled
              value={studentCodeDisplay}
              className="h-10 text-sm rounded-xl bg-muted/60 text-muted-foreground font-mono font-bold border-border/80 px-3.5 cursor-not-allowed"
            />
          </div>
        )}

        <div className="space-y-2 sm:col-span-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="avatar-url" className="text-sm font-semibold text-foreground/90">
              URL Ảnh đại diện (Avatar)
            </Label>
            {currentAvatarUrl && (
              <button
                type="button"
                onClick={handleClearAvatar}
                className="text-[11px] text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Trash2Icon className="w-3 h-3" /> Xóa avatar
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 rounded-xl border border-border shrink-0">
              <AvatarImage src={currentAvatarUrl || undefined} alt={currentFullName} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                {currentFullName ? currentFullName.slice(0, 2).toUpperCase() : "SG"}
              </AvatarFallback>
            </Avatar>
            <Input
              id="avatar-url"
              type="url"
              value={currentAvatarUrl}
              onChange={(e) => setUserEditedAvatar(e.target.value)}
              placeholder="https://example.com/avatar.png"
              className="h-10 text-sm rounded-xl bg-card border-border/80 flex-1 min-w-0 px-3.5"
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Hỗ trợ liên kết ảnh trực tiếp qua giao thức HTTPS. Để trống hoặc bấm Xóa avatar nếu muốn hoàn về ảnh mặc định.
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={updateMutation.isPending}
          className="h-10 text-sm font-semibold rounded-xl gap-2 cursor-pointer shadow-xs px-6"
        >
          {updateMutation.isPending ? (
            <>
              <LoaderCircleIcon className="w-4 h-4 animate-spin" />
              <span>Đang lưu hồ sơ...</span>
            </>
          ) : (
            <>
              <SaveIcon className="w-4 h-4" />
              <span>Lưu thay đổi</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );

  if (compact) {
    return formFields;
  }

  return (
    <Card className="rounded-2xl border border-border/80 shadow-xs bg-card overflow-hidden">
      <CardHeader className="p-4 sm:p-5 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <UserIcon className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-foreground">
              Thông tin cá nhân
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Quản lý tên hiển thị và ảnh đại diện được sử dụng trên toàn hệ thống SAGA
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {formFields}
      </CardContent>
    </Card>
  );
}
