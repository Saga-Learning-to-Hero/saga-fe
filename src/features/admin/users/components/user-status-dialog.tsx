"use client";

import { ShieldAlertIcon, ShieldCheckIcon } from "lucide-react";
import { ConfirmActionDialog } from "@/components/common/confirm-action-dialog";
import type { ManagedUser } from "../types/user-management";

interface UserStatusDialogProps {
  user: ManagedUser | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userId: string, newStatus: "ACTIVE" | "INACTIVE") => void;
  isPending?: boolean;
}

export function UserStatusDialog({
  user,
  isOpen,
  onClose,
  onConfirm,
  isPending = false,
}: UserStatusDialogProps) {
  if (!user) return null;

  const isDeactivating = user.status === "ACTIVE";

  const handleConfirm = () => {
    onConfirm(user.id, isDeactivating ? "INACTIVE" : "ACTIVE");
  };

  return (
    <ConfirmActionDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      isLoading={isPending}
      title={isDeactivating ? "Xác nhận tạm ngưng tài khoản" : "Xác nhận kích hoạt tài khoản"}
      description={isDeactivating
        ? "Tài khoản sẽ bị chuyển sang trạng thái không hoạt động."
        : "Tài khoản sẽ được khôi phục quyền truy cập và hoạt động bình thường."}
      confirmText={isDeactivating ? "Tạm ngưng" : "Kích hoạt"}
      confirmVariant={isDeactivating ? "destructive" : "default"}
      loadingText="Đang xử lý..."
      icon={isDeactivating ? <ShieldAlertIcon className="w-5 h-5" /> : <ShieldCheckIcon className="w-5 h-5" />}
      iconClassName={isDeactivating ? "bg-danger-muted text-danger" : "bg-success-muted text-success"}
    >
      <div className="bg-muted/50 border border-border rounded-xl p-3.5 space-y-1.5 text-xs mt-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Họ và tên:</span>
          <span className="font-semibold text-foreground">{user.fullName}</span>
        </div>
        {user.studentCode && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mã số sinh viên (MSSV):</span>
            <span className="font-mono font-medium text-foreground">{user.studentCode}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Email:</span>
          <span className="font-medium text-foreground">{user.email}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Vai trò:</span>
          <span className="font-medium text-foreground">
            {user.role === "LECTURER" ? "Giảng viên" : "Sinh viên"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Trạng thái hiện tại:</span>
          <span className="font-bold text-foreground">
            {user.status === "ACTIVE" ? "Đang hoạt động" : "Không hoạt động"}
          </span>
        </div>
      </div>
    </ConfirmActionDialog>
  );
}
