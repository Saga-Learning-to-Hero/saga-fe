"use client";

import { useState } from "react";
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  GraduationCapIcon,
  Building2Icon,
  FileTextIcon,
  ImageIcon,
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
  const isStudent = user.role === "STUDENT";
  const isLecturer = user.role === "LECTURER";

  const [form, setForm] = useState({
    name: user.name || user.fullName || "",
    email: user.email || "",
    phone: user.phone || "",
    studentCode: user.studentCode || user.lecturerCode || "",
    department: user.department || "",
    adminClass: user.adminClass || "",
    bio: user.bio || "",
    avatar: user.avatar || "https://api.dicebear.com/9.x/avataaars/svg?seed=saga-user",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage("");

    // Giả lập lưu dữ liệu
    await new Promise((r) => setTimeout(r, 600));

    updateUserProfile({
      name: form.name,
      fullName: form.name,
      email: form.email,
      phone: form.phone,
      ...(isStudent ? { studentCode: form.studentCode, adminClass: form.adminClass } : {}),
      ...(isLecturer ? { lecturerCode: form.studentCode } : {}),
      department: form.department,
      bio: form.bio,
      avatar: form.avatar,
    });

    setIsSaving(false);
    setSuccessMessage("Cập nhật thông tin cá nhân thành công!");
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const formFields = (
    <form onSubmit={handleSubmit} className={compact ? "space-y-3" : "space-y-5"}>
      {/* Success Feedback Alert */}
      {successMessage && (
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in-0">
          <CheckCircle2Icon className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 2 Columns Balanced Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3">
        {/* Column 1: Họ tên */}
        <div className="space-y-1">
          <Label htmlFor="full-name" className="text-[11px] font-semibold text-foreground/90">
            Họ và tên <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <UserIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="full-name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="pl-8 h-8 text-xs rounded-xl bg-card border-border/80"
            />
          </div>
        </div>

        {/* Column 2: Email */}
        <div className="space-y-1">
          <Label htmlFor="email-addr" className="text-[11px] font-semibold text-foreground/90">
            Email tài khoản <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <MailIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email-addr"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="pl-8 h-8 text-xs rounded-xl bg-card border-border/80"
            />
          </div>
        </div>

        {/* Column 1: SĐT */}
        <div className="space-y-1">
          <Label htmlFor="phone-num" className="text-[11px] font-semibold text-foreground/90">
            Số điện thoại liên hệ
          </Label>
          <div className="relative">
            <PhoneIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="phone-num"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="0987654321"
              className="pl-8 h-8 text-xs rounded-xl bg-card border-border/80"
            />
          </div>
        </div>

        {/* Column 2: MSSV / Mã CB */}
        <div className="space-y-1">
          <Label htmlFor="code-id" className="text-[11px] font-semibold text-foreground/90">
            {isStudent ? "Mã số Sinh viên (MSSV)" : "Mã Cán bộ / Giảng viên"}
          </Label>
          <div className="relative">
            <GraduationCapIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="code-id"
              type="text"
              value={form.studentCode}
              onChange={(e) => setForm((f) => ({ ...f, studentCode: e.target.value }))}
              placeholder={isStudent ? "HE170504" : "GV00123"}
              className="pl-8 h-8 text-xs rounded-xl bg-card border-border/80 font-mono"
            />
          </div>
        </div>

        {/* Column 1: Khoa */}
        <div className="space-y-1">
          <Label htmlFor="dept-name" className="text-[11px] font-semibold text-foreground/90">
            Khoa / Chuyên ngành
          </Label>
          <div className="relative">
            <Building2Icon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="dept-name"
              type="text"
              value={form.department}
              onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
              placeholder="Kỹ thuật phần mềm (SE)"
              className="pl-8 h-8 text-xs rounded-xl bg-card border-border/80"
            />
          </div>
        </div>

        {/* Column 2: Lớp hành chính / Chức danh */}
        {isStudent ? (
          <div className="space-y-1">
            <Label htmlFor="admin-cls" className="text-[11px] font-semibold text-foreground/90">
              Lớp hành chính
            </Label>
            <Input
              id="admin-cls"
              type="text"
              value={form.adminClass}
              onChange={(e) => setForm((f) => ({ ...f, adminClass: e.target.value }))}
              placeholder="SE1701"
              className="h-8 text-xs rounded-xl bg-card border-border/80 font-mono"
            />
          </div>
        ) : (
          <div className="space-y-1">
            <Label htmlFor="admin-cls" className="text-[11px] font-semibold text-foreground/90">
              Chức danh / Vai trò
            </Label>
            <Input
              id="admin-cls"
              type="text"
              disabled
              value={user.role === "LECTURER" ? "Giảng viên hướng dẫn" : "Quản trị viên hệ thống"}
              className="h-8 text-xs rounded-xl bg-muted/60 text-muted-foreground font-medium border-border/80"
            />
          </div>
        )}

        {/* Column 1: Avatar URL */}
        <div className="space-y-1">
          <Label htmlFor="avatar-url" className="text-[11px] font-semibold flex items-center gap-1 text-foreground/90">
            <ImageIcon className="w-3.5 h-3.5 text-primary" />
            URL Ảnh đại diện (Avatar)
          </Label>
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8 rounded-lg border shrink-0">
              <AvatarImage src={form.avatar} alt={form.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
                {form.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Input
              id="avatar-url"
              type="url"
              value={form.avatar}
              onChange={(e) => setForm((f) => ({ ...f, avatar: e.target.value }))}
              placeholder="https://api.dicebear.com/..."
              className="h-8 text-xs rounded-xl bg-card border-border/80 flex-1 min-w-0"
            />
          </div>
        </div>

        {/* Column 2: Bio */}
        <div className="space-y-1">
          <Label htmlFor="user-bio" className="text-[11px] font-semibold flex items-center gap-1.5 text-foreground/90">
            <FileTextIcon className="w-3.5 h-3.5 text-primary" />
            Giới thiệu bản thân (Bio)
          </Label>
          <Input
            id="user-bio"
            type="text"
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            placeholder="Nhập mô tả bản thân, định hướng nghiên cứu..."
            className="h-8 text-xs rounded-xl bg-card border-border/80"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-1">
        <Button
          type="submit"
          disabled={isSaving}
          className="h-8.5 text-xs font-semibold rounded-xl gap-2 cursor-pointer shadow-xs px-5"
        >
          {isSaving ? (
            <>
              <LoaderCircleIcon className="w-3.5 h-3.5 animate-spin" />
              Đang lưu thay đổi...
            </>
          ) : (
            <>
              <SaveIcon className="w-3.5 h-3.5" />
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
    <Card className="rounded-2xl border border-border/80 shadow-xs bg-card">
      <CardHeader className="p-5 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <UserIcon className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-foreground">
              Thông tin cá nhân
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Cập nhật thông tin tài khoản và thông tin học tập/công tác của bạn trên SAGA
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-6">
        {formFields}
      </CardContent>
    </Card>
  );
}

