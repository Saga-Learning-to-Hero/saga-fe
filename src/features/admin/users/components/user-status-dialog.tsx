"use client";

import { ShieldAlertIcon, ShieldCheckIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="max-w-md p-6 rounded-2xl">
        <DialogHeader className="flex flex-row items-center gap-3 space-y-0 text-left">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDeactivating
              ? "bg-danger-muted text-danger"
              : "bg-success-muted text-success"
              }`}
          >
            {isDeactivating ? (
              <ShieldAlertIcon className="w-5 h-5" />
            ) : (
              <ShieldCheckIcon className="w-5 h-5" />
            )}
          </div>
          <div>
            <DialogTitle className="text-base font-bold text-foreground">
              {isDeactivating
                ? "Xác nhận tạm ngưng tài khoản"
                : "Xác nhận kích hoạt tài khoản"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              {isDeactivating
                ? "Tài khoản sẽ bị chuyển sang trạng thái không hoạt động."
                : "Tài khoản sẽ được khôi phục quyền truy cập và hoạt động bình thường."}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="bg-muted/50 border border-border rounded-xl p-3.5 space-y-1.5 text-xs">
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

        <DialogFooter className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isPending}
            className="text-xs rounded-xl cursor-pointer"
          >
            Hủy
          </Button>
          <Button
            variant={isDeactivating ? "destructive" : "default"}
            size="sm"
            onClick={handleConfirm}
            disabled={isPending}
            className="text-xs rounded-xl cursor-pointer font-semibold"
          >
            {isPending
              ? "Đang xử lý..."
              : isDeactivating
                ? "Xác nhận tạm ngưng"
                : "Kích hoạt tài khoản"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
