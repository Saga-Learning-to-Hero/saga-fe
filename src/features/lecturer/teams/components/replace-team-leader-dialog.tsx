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
import type { LecturerTeamMember } from "../types/lecturer-team";

interface ReplaceTeamLeaderDialogProps {
  open: boolean;
  member: LecturerTeamMember | null;
  isSaving?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ReplaceTeamLeaderDialog({
  open,
  member,
  isSaving,
  onOpenChange,
  onConfirm,
}: ReplaceTeamLeaderDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Đặt làm trưởng nhóm?</AlertDialogTitle>
          <AlertDialogDescription>
            {member
              ? `${member.fullName} (${member.studentCode}) sẽ trở thành trưởng nhóm. Trưởng nhóm hiện tại sẽ được chuyển thành thành viên theo hợp đồng máy chủ.`
              : "Chọn một thành viên để đổi trưởng nhóm."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            disabled={!member?.teamMemberId || isSaving}
            onClick={onConfirm}
          >
            {isSaving ? "Đang lưu..." : "Xác nhận đổi"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
