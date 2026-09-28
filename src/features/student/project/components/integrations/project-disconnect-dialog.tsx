"use client";

import { ConfirmActionDialog } from "@/components/common/confirm-action-dialog";
import { AlertTriangleIcon } from "lucide-react";

interface ProjectDisconnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "jira" | "github" | null;
  isPending: boolean;
  onConfirm: () => Promise<void> | void;
}

export function ProjectDisconnectDialog({
  open,
  onOpenChange,
  type,
  isPending,
  onConfirm,
}: ProjectDisconnectDialogProps) {
  if (!type) return null;

  const isJira = type === "jira";
  const title = isJira
    ? "Ngắt kết nối Jira Project?"
    : "Ngắt kết nối GitHub Repositories?";
  const description = isJira
    ? "Toàn bộ liên kết Sprint, Backlog và Task Jira sẽ bị gỡ bỏ khỏi dự án nhóm này. Bạn có chắc chắn muốn tiếp tục?"
    : "Toàn bộ liên kết Repositories mã nguồn sẽ bị gỡ bỏ khỏi dự án nhóm này. Bạn có chắc chắn muốn tiếp tục?";

  return (
    <ConfirmActionDialog
      isOpen={open}
      onClose={() => !isPending && onOpenChange(false)}
      onConfirm={onConfirm}
      isLoading={isPending}
      title={title}
      description={description}
      confirmText="Ngắt kết nối"
      loadingText="Đang ngắt kết nối..."
      icon={<AlertTriangleIcon className="w-5 h-5" />}
      iconClassName="bg-danger-muted text-danger"
    />
  );
}
