"use client";

import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useProfileModalStore } from "../store/useProfileModalStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ProfileView } from "./profile-view";

export function ProfileModal() {
  const { user } = useAuthStore();
  const { isOpen, setProfileModalOpen } = useProfileModalStore();

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setProfileModalOpen}>
      <DialogContent
        showCloseButton={true}
        className="w-[94vw] max-w-4xl lg:max-w-5xl max-h-[90vh] flex flex-col p-5 sm:p-6 rounded-3xl border border-border/80 bg-card shadow-2xl overflow-hidden gap-0"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Hồ sơ cá nhân</DialogTitle>
          <DialogDescription>
            Xem và chỉnh sửa thông tin cá nhân, cài đặt tích hợp Jira & GitHub
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Container if viewport is very short */}
        <div className="flex-1 overflow-y-auto pr-1 -mr-1 scrollbar-thin">
          <ProfileView user={user} compact={true} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

