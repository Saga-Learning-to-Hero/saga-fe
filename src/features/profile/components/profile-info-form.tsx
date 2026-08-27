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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileInfoFormProps {
  user: User;
}

export function ProfileInfoForm({ user }: ProfileInfoFormProps) {
  const { updateUserProfile } = useAuthStore();

  const [form, setForm] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "0987654321",
    studentCode: user.studentCode || "HE170504",
    department: user.department || "Kỹ thuật phần mềm (SE)",
    adminClass: user.adminClass || "SE1701",
    bio: user.bio || "Sinh viên K17 ngành Kỹ thuật phần mềm. Đang thực hiện đồ án tốt nghiệp SAGA.",
    avatar: user.avatar || "https://api.dicebear.com/9.x/avataaars/svg?seed=saga-user",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage("");

    // Simulate saving delay
    await new Promise((r) => setTimeout(r, 600));

    updateUserProfile({
      name: form.name,
      email: form.email,
      phone: form.phone,
      studentCode: form.studentCode,
      department: form.department,
      adminClass: form.adminClass,
      bio: form.bio,
      avatar: form.avatar,
    });

    setIsSaving(false);
    setSuccessMessage("Cập nhật thông tin cá nhân thành công!");
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const isStudent = user.role === "STUDENT";

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
        {/* Success Feedback Alert */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in-0">
            <CheckCircle2Icon className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar Preview & URL */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-muted/40 border border-border/60">
            <Avatar className="w-16 h-16 rounded-xl border shadow-xs shrink-0">
              <AvatarImage src={form.avatar} alt={form.name} />
              <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                {form.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1.5 flex-1 w-full">
              <Label htmlFor="avatar-url" className="text-xs font-semibold flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-primary" />
                URL Ảnh đại diện (Avatar)
              </Label>
              <Input
                id="avatar-url"
                type="url"
                value={form.avatar}
                onChange={(e) => setForm((f) => ({ ...f, avatar: e.target.value }))}
                placeholder="https://api.dicebear.com/..."
                className="h-9 text-xs rounded-xl bg-card"
              />
            </div>
          </div>

          {/* Grid 2 Columns: Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Họ và tên */}
            <div className="space-y-1.5">
              <Label htmlFor="full-name" className="text-xs font-semibold">
                Họ và tên <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="full-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="pl-9 h-9 text-xs rounded-xl bg-card"
                />
              </div>
            </div>

            {/* Email trường */}
            <div className="space-y-1.5">
              <Label htmlFor="email-addr" className="text-xs font-semibold">
                Email tài khoản <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <MailIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email-addr"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="pl-9 h-9 text-xs rounded-xl bg-card"
                />
              </div>
            </div>

            {/* Số điện thoại */}
            <div className="space-y-1.5">
              <Label htmlFor="phone-num" className="text-xs font-semibold">
                Số điện thoại liên hệ
              </Label>
              <div className="relative">
                <PhoneIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone-num"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="0987654321"
                  className="pl-9 h-9 text-xs rounded-xl bg-card"
                />
              </div>
            </div>

            {/* Mã số Sinh viên / Cán bộ */}
            <div className="space-y-1.5">
              <Label htmlFor="code-id" className="text-xs font-semibold">
                {isStudent ? "Mã số Sinh viên (MSSV)" : "Mã Cán bộ / Giảng viên"}
              </Label>
              <div className="relative">
                <GraduationCapIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="code-id"
                  type="text"
                  value={form.studentCode}
                  onChange={(e) => setForm((f) => ({ ...f, studentCode: e.target.value }))}
                  placeholder={isStudent ? "HE170504" : "GV00123"}
                  className="pl-9 h-9 text-xs rounded-xl bg-card font-mono"
                />
              </div>
            </div>

            {/* Khoa / Chuyên ngành */}
            <div className="space-y-1.5">
              <Label htmlFor="dept-name" className="text-xs font-semibold">
                Khoa / Chuyên ngành
              </Label>
              <div className="relative">
                <Building2Icon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="dept-name"
                  type="text"
                  value={form.department}
                  onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                  placeholder="Kỹ thuật phần mềm (SE)"
                  className="pl-9 h-9 text-xs rounded-xl bg-card"
                />
              </div>
            </div>

            {/* Lớp hành chính */}
            <div className="space-y-1.5">
              <Label htmlFor="admin-cls" className="text-xs font-semibold">
                Lớp hành chính
              </Label>
              <Input
                id="admin-cls"
                type="text"
                value={form.adminClass}
                onChange={(e) => setForm((f) => ({ ...f, adminClass: e.target.value }))}
                placeholder="SE1701"
                className="h-9 text-xs rounded-xl bg-card font-mono"
              />
            </div>
          </div>

          {/* Tiểu sử cá nhân */}
          <div className="space-y-1.5">
            <Label htmlFor="user-bio" className="text-xs font-semibold flex items-center gap-1.5">
              <FileTextIcon className="w-3.5 h-3.5 text-primary" />
              Giới thiệu bản thân (Bio)
            </Label>
            <Textarea
              id="user-bio"
              rows={3}
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              placeholder="Nhập mô tả bản thân, định hướng nghiên cứu đồ án..."
              className="text-xs rounded-xl bg-card resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              disabled={isSaving}
              className="h-9 text-xs font-semibold rounded-xl gap-2 cursor-pointer shadow-xs px-5"
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
      </CardContent>
    </Card>
  );
}
