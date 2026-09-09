"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangleIcon, Loader2Icon } from "lucide-react";

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
    <AlertDialog open={open} onOpenChange={(val) => !isPending && onOpenChange(val)}>
      <AlertDialogContent className="max-w-md bg-card border border-border/80 rounded-2xl shadow-xl p-5">
        <AlertDialogHeader className="gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangleIcon className="w-5 h-5" />
            </div>
            <AlertDialogTitle className="text-base font-bold text-foreground">
              {title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-4 gap-2 border-t border-border/60 pt-3 -mx-5 -mb-5 px-5 bg-muted/20">
          <AlertDialogCancel
            disabled={isPending}
            className="rounded-xl h-8 px-3.5 text-xs font-semibold"
          >
            Hủy bỏ
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isPending}
            className="rounded-xl h-8 px-3.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white gap-1.5 cursor-pointer shadow-xs"
          >
            {isPending && <Loader2Icon className="w-3.5 h-3.5 animate-spin" />}
            <span>{isPending ? "Đang hủy..." : "Xác nhận hủy liên kết"}</span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
