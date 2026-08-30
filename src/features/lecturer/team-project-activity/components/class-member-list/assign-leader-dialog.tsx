import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { TeamMember } from "../../types/team-project";

interface AssignLeaderDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember | null;
  onConfirm: () => void;
}

export function AssignLeaderDialog({
  isOpen,
  onOpenChange,
  member,
  onConfirm,
}: AssignLeaderDialogProps) {
  if (!member) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Xác nhận chỉ định nhóm trưởng</DialogTitle>
          <DialogDescription>
            Đặt <strong>{member.fullName}</strong> làm trưởng {member.groupName}?
            Trưởng nhóm hiện tại (nếu có) sẽ được chuyển thành thành viên thông thường.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={onConfirm}>Xác nhận</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
