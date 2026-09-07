"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import type { User } from "@/types/auth";
import { ProfileHeader } from "./profile-header";
import { ProfileInfoForm } from "./profile-info-form";
import { Button } from "@/components/ui/button";

interface ProfileViewProps {
  user: User;
  compact?: boolean;
}

export function ProfileView({ user, compact = false }: ProfileViewProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 2) {
      router.back();
    } else {
      const defaultPath =
        user.role === "STUDENT"
          ? "/student/dashboard"
          : user.role === "LECTURER"
            ? "/lecturer/courses"
            : "/admin/dashboard";
      router.push(defaultPath);
    }
  };

  if (compact) {
    return (
      <div className="space-y-4 max-w-full pb-1">
        <ProfileHeader user={user} compact={true} />
        <ProfileInfoForm user={user} compact={true} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl lg:max-w-5xl mx-auto space-y-4">
      {/* Nút quay lại */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="h-8 px-2 -ml-2 rounded-xl gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors border border-transparent hover:border-border"
        >
          <ArrowLeftIcon className="size-4" />
          <span>Quay lại</span>
        </Button>
      </div>

      {/* Banner thông tin cá nhân & Tích hợp ở trên */}
      <ProfileHeader user={user} compact={false} />

      {/* Form thông tin cá nhân ở dưới */}
      <ProfileInfoForm user={user} compact={false} />
    </div>
  );
}
