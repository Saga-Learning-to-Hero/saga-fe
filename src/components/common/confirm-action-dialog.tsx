"use client";

import { AlertTriangleIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
  itemType?: string; // VD: "môn học", "học kỳ", "lớp học"
  isLoading?: boolean;
  confirmText?: string;
  loadingText?: string;
  confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  icon?: React.ReactNode;
  iconClassName?: string;
}

export function ConfirmActionDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  itemType = "mục này",
  isLoading = false,
  confirmText = "Xác nhận xóa",
  loadingText = "Đang xử lý...",
  confirmVariant = "destructive",
  icon = <AlertTriangleIcon className="w-5 h-5" />,
  iconClassName = "bg-danger-muted text-danger",
}: ConfirmActionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 rounded-2xl">
        <DialogHeader className="flex flex-row items-start gap-3 space-y-0 text-left">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconClassName}`}>
            {icon}
          </div>
          <div className="space-y-1">
            <DialogTitle className="text-base font-bold text-foreground">
              {title || `Xác nhận xóa ${itemType}`}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              {description ? (
                description
              ) : (
                <>
                  Bạn có chắc chắn muốn xóa {itemType}{" "}
                  {itemName && <strong className="text-foreground font-semibold">&quot;{itemName}&quot;</strong>}?
                  Hành động này không thể hoàn tác và dữ liệu liên quan sẽ bị ảnh hưởng.
                </>
              )}
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="pt-3 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="text-xs"
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            className="text-xs font-semibold"
          >
            {isLoading ? loadingText : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
