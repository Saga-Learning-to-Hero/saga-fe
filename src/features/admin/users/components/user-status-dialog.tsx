"use client";

import { useState } from "react";
import { ShieldAlertIcon, ShieldCheckIcon, AlertTriangleIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ManagedUser } from "../types/user-management";

interface UserStatusDialogProps {
  user: ManagedUser | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userId: string, newStatus: "ACTIVE" | "BANNED", reason?: string) => void;
}

export function UserStatusDialog({
  user,
  isOpen,
  onClose,
  onConfirm,
}: UserStatusDialogProps) {
  const [reason, setReason] = useState("");

  if (!user) return null;

  const isBanning = user.status !== "BANNED";

  const handleConfirm = () => {
    onConfirm(user.id, isBanning ? "BANNED" : "ACTIVE", reason.trim() || undefined);
    setReason("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 rounded-2xl">
        <DialogHeader className="flex flex-row items-center gap-3 space-y-0 text-left">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isBanning ? "bg-danger-muted text-danger" : "bg-success-muted text-success"
              }`}
          >
            {isBanning ? (
              <ShieldAlertIcon className="w-5 h-5" />
            ) : (
              <ShieldCheckIcon className="w-5 h-5" />
            )}
          </div>
          <div>
            <DialogTitle className="text-base font-bold text-foreground">
              {isBanning ? "Xác nhận khóa tài khoản" : "Xác nhận mở khóa tài khoản"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              {isBanning
                ? "Tài khoản sẽ bị tạm ngưng quyền truy cập hệ thống SAGA."
                : "Tài khoản sẽ được khôi phục quyền truy cập và hoạt động bình thường."}
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* User Info Box */}
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
        </div>

        {/* Reason Input (Khi Khóa tài khoản) */}
        {isBanning && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center gap-1">
              <AlertTriangleIcon className="w-3.5 h-3.5 text-warning" />
              Lý do khóa tài khoản (Tùy chọn)
            </label>
            <Textarea
              placeholder="VD: Vi phạm quy chế học thuật, bảo lưu kỳ học..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="text-xs min-h-[70px] resize-none"
            />
          </div>
        )}

        {/* Footer Actions */}
        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Hủy bỏ
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            className={`text-xs font-semibold ${isBanning
                ? "bg-destructive text-white hover:bg-destructive/90"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
          >
            {isBanning ? "Khóa tài khoản" : "Mở khóa tài khoản"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
