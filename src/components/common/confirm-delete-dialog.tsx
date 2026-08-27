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

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
  itemType?: string; // VD: "môn học", "học kỳ", "lớp học"
  isLoading?: boolean;
}

export function ConfirmDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  itemType = "mục này",
  isLoading = false,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 rounded-2xl">
        <DialogHeader className="flex flex-row items-start gap-3 space-y-0 text-left">
          <div className="w-10 h-10 rounded-xl bg-danger-muted flex items-center justify-center text-danger shrink-0">
            <AlertTriangleIcon className="w-5 h-5" />
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
                  {itemName && <strong className="text-foreground font-semibold">"{itemName}"</strong>}?
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
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            className="text-xs font-semibold"
          >
            {isLoading ? "Đang xóa..." : "Xác nhận xóa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
