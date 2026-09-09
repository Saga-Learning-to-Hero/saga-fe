"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CustomSelect } from "@/components/common/custom-select";
import type { LecturerTeamItem, LecturerTeamMember } from "../types/lecturer-team";

interface MoveTeamMemberDialogProps {
  open: boolean;
  member: LecturerTeamMember | null;
  currentTeam: LecturerTeamItem | null;
  teams: LecturerTeamItem[];
  isSaving?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (targetTeamId: string) => void;
}

export function MoveTeamMemberDialog({
  open,
  member,
  currentTeam,
  teams,
  isSaving,
  onOpenChange,
  onConfirm,
}: MoveTeamMemberDialogProps) {
  const [targetTeamId, setTargetTeamId] = useState("");
  const targetOptions = teams
    .filter((team) => team.teamId && team.teamId !== currentTeam?.teamId)
    .map((team) => ({
      value: team.teamId,
      label: team.teamName || `Nhóm ${team.teamNo}`,
      subLabel: `TeamNo ${team.teamNo}`,
    }));

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setTargetTeamId("");
        onOpenChange(next);
      }}
    >
      <DialogContent className="flex max-h-[92vh] max-w-lg flex-col overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b border-border p-5">
          <DialogTitle>Chuyển thành viên sang nhóm khác</DialogTitle>
          <DialogDescription>
            Thành phần nhóm và kết quả đánh giá đóng góp sẽ thay đổi. Không tự chặn luật nghiệp vụ ngoài hợp đồng máy chủ.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div>
            <p className="text-xs text-muted-foreground">Thành viên nguồn</p>
            <p className="text-sm font-semibold">{member?.fullName || "—"}</p>
            <p className="font-mono text-[11px] text-muted-foreground">{member?.studentCode}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Nhóm hiện tại</p>
            <p className="text-sm font-semibold">{currentTeam?.teamName || "—"}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="target-team">Nhóm đích</Label>
            <CustomSelect
              id="target-team"
              value={targetTeamId}
              onChange={setTargetTeamId}
              options={targetOptions}
              placeholder="Chọn nhóm khác trong lớp"
              disabled={targetOptions.length === 0}
            />
            {targetOptions.length === 0 ? (
              <p className="text-[11px] text-muted-foreground">Chưa có nhóm đích khác trong lớp học phần này.</p>
            ) : null}
          </div>
        </div>

        <DialogFooter className="mx-0 mb-0 shrink-0">
          <Button type="button" variant="outline" className="cursor-pointer" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            type="button"
            className="cursor-pointer"
            disabled={!member?.teamMemberId || !targetTeamId || targetTeamId === currentTeam?.teamId || isSaving}
            onClick={() => onConfirm(targetTeamId)}
          >
            {isSaving ? "Đang chuyển..." : "Xác nhận chuyển"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
