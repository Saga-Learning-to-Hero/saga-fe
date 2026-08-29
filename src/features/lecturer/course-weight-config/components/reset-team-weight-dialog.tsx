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
import type { ContributionWeights } from "../types/course-weight-config";

interface ResetTeamWeightDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  teamName: string;
  currentWeights: ContributionWeights;
  classWeights: ContributionWeights;
  onConfirm: () => void;
}

export function ResetTeamWeightDialog({
  isOpen,
  onOpenChange,
  teamName,
  currentWeights,
  classWeights,
  onConfirm,
}: ResetTeamWeightDialogProps) {
  const format = (w: ContributionWeights) => `${w.CODE}/${w.TEST}/${w.DOCUMENT}/${w.RESEARCH}`;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Đặt lại cấu hình {teamName}?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2 pt-2">
            <p>
              Cấu hình riêng <strong>{format(currentWeights)}</strong> sẽ bị xóa.
            </p>
            <p>
              {teamName} sẽ sử dụng cấu hình chung <strong>{format(classWeights)}</strong> của lớp. Hành động này không thể hoàn tác trừ khi bạn tùy chỉnh lại.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
              onOpenChange(false);
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Đặt lại
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
