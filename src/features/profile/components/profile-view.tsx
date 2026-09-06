"use client";

import Link from "next/link";
import { Link2Icon, ArrowRightIcon } from "lucide-react";
import type { User } from "@/types/auth";
import { ProfileHeader } from "./profile-header";
import { ProfileInfoForm } from "./profile-info-form";
import { Button } from "@/components/ui/button";

interface ProfileViewProps {
  user: User;
  compact?: boolean;
}

export function ProfileView({ user, compact = false }: ProfileViewProps) {
  return (
    <div className={compact ? "space-y-4 max-w-full pb-1" : "space-y-6 max-w-4xl lg:max-w-5xl mx-auto pb-12"}>
      <ProfileHeader user={user} compact={compact} />

      {!compact && user.role === "STUDENT" && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4.5 rounded-2xl bg-card border border-border/80 shadow-2xs gap-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Link2Icon className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Tích hợp Công cụ Jira Software & GitHub</p>
              <p className="text-xs text-muted-foreground">
                Quản lý kết nối tài khoản, API Token và Repository để đồng bộ và liên kết dữ liệu đồ án.
              </p>
            </div>
          </div>

          <Link href="/profile/integrations">
            <Button
              variant="outline"
              size="sm"
              className="text-xs rounded-xl gap-1.5 hover:bg-primary/10 hover:text-primary hover:border-primary/30 shrink-0 cursor-pointer h-9 px-4"
            >
              <span>Đi đến trang Tích hợp</span>
              <ArrowRightIcon className="size-3.5" />
            </Button>
          </Link>
        </div>
      )}

      <ProfileInfoForm user={user} compact={compact} />
    </div>
  );
}
