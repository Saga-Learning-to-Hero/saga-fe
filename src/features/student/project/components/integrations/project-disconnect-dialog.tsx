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
            <span>{isPending ? "Đang ngắt kết nối..." : "Xác nhận ngắt kết nối"}</span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
