"use client";

import { useState } from "react";
import { AlertTriangleIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { REMOVAL_REASON_MAX_LENGTH } from "@/lib/removal-reason";
import { cn } from "@/lib/utils";

interface ReasonConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void | Promise<void>;
  title: string;
  description?: string;
  confirmText?: string;
  loadingText?: string;
  isLoading?: boolean;
  errorMessage?: string | null;
  children?: React.ReactNode;
  reasonLabel?: string;
  reasonDescription?: string;
}

export function ReasonConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Xác nhận",
  loadingText = "Đang xử lý...",
  isLoading = false,
  errorMessage,
  children,
  reasonLabel = "Lý do",
  reasonDescription = "Bắt buộc. Tối đa 500 ký tự. Sinh viên sẽ nhận thông báo từ hệ thống.",
}: ReasonConfirmDialogProps) {
  const [reason, setReason] = useState("");

  if (!isOpen && reason !== "") {
    setReason("");
  }

  const trimmedLength = reason.trim().length;
  const canSubmit = trimmedLength > 0 && trimmedLength <= REMOVAL_REASON_MAX_LENGTH && !isLoading;

  const handleClose = () => {
    if (isLoading) return;
    onClose();
  };

  const handleConfirm = () => {
    if (!canSubmit) return;
    void onConfirm(reason.trim());
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="flex max-h-[92vh] max-w-lg flex-col gap-0 overflow-hidden rounded-xl p-0">
        <DialogHeader className="shrink-0 space-y-1.5 border-b border-border/70 px-6 py-5 text-left">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-danger-muted text-danger">
              <AlertTriangleIcon className="size-5" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-base font-bold text-foreground">{title}</DialogTitle>
              {description ? (
                <DialogDescription className="text-xs leading-relaxed text-muted-foreground">
                  {description}
                </DialogDescription>
              ) : (
                <DialogDescription className="sr-only">{title}</DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
          {children}

          <div className="space-y-1.5">
            <Label htmlFor="removal-reason" className="text-xs font-semibold text-foreground">
              {reasonLabel} <span className="text-destructive">*</span>
            </Label>
            <p className="text-xs text-muted-foreground">{reasonDescription}</p>
            <Textarea
              id="removal-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              maxLength={REMOVAL_REASON_MAX_LENGTH}
              disabled={isLoading}
              placeholder="Nhập lý do..."
              className="min-h-24 text-sm"
              aria-invalid={trimmedLength > REMOVAL_REASON_MAX_LENGTH}
            />
            <p
              className={cn(
                "text-right font-mono text-xs",
                trimmedLength >= REMOVAL_REASON_MAX_LENGTH
                  ? "text-destructive"
                  : "text-muted-foreground"
              )}
            >
              {trimmedLength}/{REMOVAL_REASON_MAX_LENGTH}
            </p>
          </div>

          {errorMessage ? (
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs leading-relaxed text-destructive">
              {errorMessage}
            </p>
          ) : null}
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t border-border/70 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isLoading}
            className="cursor-pointer text-xs"
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleConfirm}
            disabled={!canSubmit}
            className="cursor-pointer text-xs font-semibold"
          >
            {isLoading ? loadingText : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
