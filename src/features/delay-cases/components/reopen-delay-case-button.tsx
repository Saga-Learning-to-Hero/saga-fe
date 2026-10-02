"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useReopenDelayCase } from "../hooks/use-delay-cases";
import type { DelayCaseResponse } from "../types/delay-cases";
import { Button } from "@/components/ui/button";
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
import { RefreshCw } from "lucide-react";

export function ReopenDelayCaseButton({ delayCase }: { delayCase: DelayCaseResponse }) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const reopenMutation = useReopenDelayCase();

  const onConfirm = () => {
    reopenMutation.mutate({
      projectId: delayCase.projectId,
      caseId: delayCase.id,
    }, {
      onSuccess: () => {
        toast.success("Đã mở lại hồ sơ");
        setIsAlertOpen(false);
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (err: any) => {
        const errCode = err?.response?.data?.code;
        if (errCode === "DELAY_CASE_STATE_CONFLICT") {
          toast.error("Hồ sơ đã thay đổi, hệ thống đang tải lại dữ liệu.");
          setIsAlertOpen(false);
        } else if (errCode === "DELAY_CASE_FORBIDDEN") {
          toast.error("Bạn không có quyền thực hiện bước này.");
          setIsAlertOpen(false);
        } else if (errCode === "DELAY_CASE_NOT_FOUND") {
          toast.error("Không tìm thấy hồ sơ trễ hạn.");
          setIsAlertOpen(false);
        } else {
          toast.error("Đã có lỗi xảy ra khi mở lại hồ sơ");
        }
      }
    });
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsAlertOpen(true)}>
        <RefreshCw className="w-4 h-4 mr-2" />
        Mở lại hồ sơ
      </Button>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận mở lại hồ sơ</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn mở lại hồ sơ này?
              Hồ sơ sẽ được đưa về trạng thái chờ xử lý tương ứng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={reopenMutation.isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); onConfirm(); }} disabled={reopenMutation.isPending}>
              {reopenMutation.isPending ? "Đang mở lại..." : "Xác nhận"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
