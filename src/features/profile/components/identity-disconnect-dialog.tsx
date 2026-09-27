"use client";

import { ConfirmActionDialog } from "@/components/common/confirm-action-dialog";
import { AlertTriangleIcon } from "lucide-react";

interface IdentityDisconnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: "JIRA" | "GITHUB" | null;
  accountLabel?: string;
  isPending: boolean;
  onConfirm: () => Promise<void> | void;
}

export function IdentityDisconnectDialog({
  open,
  onOpenChange,
  provider,
  accountLabel,
  isPending,
  onConfirm,
}: IdentityDisconnectDialogProps) {
  if (!provider) return null;

  const isJira = provider === "JIRA";
  const title = isJira
    ? "Hủy liên kết tài khoản Jira cá nhân?"
    : "Hủy liên kết tài khoản GitHub cá nhân?";
  const description = isJira
    ? `Bạn có chắc chắn muốn hủy liên kết tài khoản Jira ${accountLabel ? `(${accountLabel})` : ""}? Hệ thống SAGA sẽ không thể tự động nhận diện các task được giao cho bạn trong các dự án nhóm.`
    : `Bạn có chắc chắn muốn hủy liên kết tài khoản GitHub ${accountLabel ? `(${accountLabel})` : ""}? Hệ thống SAGA sẽ không thể tự động ghi nhận các commit mã nguồn và đóng góp của bạn vào các dự án nhóm.`;

  return (
    <ConfirmActionDialog
      isOpen={open}
      onClose={() => !isPending && onOpenChange(false)}
      onConfirm={onConfirm}
      isLoading={isPending}
      title={title}
      description={description}
      confirmText="Hủy liên kết"
      loadingText="Đang hủy..."
      icon={<AlertTriangleIcon className="w-5 h-5" />}
      iconClassName="bg-danger-muted text-danger"
    />
  );
}
