"use client";

import { useState } from "react";
import { ArrowRightLeftIcon } from "lucide-react";
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
  onConfirm: (targetTeamId: string, courseEnrollmentId: string) => void;
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

  const handleOpenChange = (next: boolean) => {
    if (isSaving && !next) return;
    if (!next) setTargetTeamId("");
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex max-h-[92vh] w-[calc(100vw-2rem)] max-w-lg flex-col overflow-hidden p-0"
        showCloseButton={!isSaving}
      >
        <DialogHeader className="shrink-0 border-b border-border p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ArrowRightLeftIcon className="size-4.5" />
            </div>
            <div>
              <DialogTitle className="text-base font-extrabold text-foreground">
                Chuyển thành viên sang nhóm khác
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Thành phần nhóm và kết quả đánh giá đóng góp sẽ cập nhật sang nhóm mới.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-3">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Thành viên cần chuyển</p>
              <p className="text-sm font-bold text-foreground mt-0.5">{member?.fullName || "—"}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono font-medium">{member?.studentCode}</span>
                {member?.email && (
                  <>
                    <span>•</span>
                    <span className="truncate">{member.email}</span>
                  </>
                )}
              </div>
            </div>
            <div className="border-t border-border/60 pt-2.5">
              <p className="text-xs font-semibold text-muted-foreground">Nhóm hiện tại</p>
              <p className="text-xs font-bold text-foreground mt-0.5">{currentTeam?.teamName || "—"}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-team">Nhóm đích</Label>
            <CustomSelect
              id="target-team"
              value={targetTeamId}
              onChange={setTargetTeamId}
              options={targetOptions}
              placeholder="Chọn nhóm khác trong lớp"
              disabled={targetOptions.length === 0 || isSaving}
            />
            {targetOptions.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Chưa có nhóm đích khác trong lớp học phần này.
              </p>
            ) : null}
          </div>
        </div>

        <DialogFooter className="mx-0 mb-0 shrink-0 border-t border-border/60 p-4 bg-muted/20">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer text-xs"
            disabled={isSaving}
            onClick={() => handleOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            type="button"
            className="cursor-pointer text-xs font-bold shadow-xs"
            disabled={
              (!member?.courseEnrollmentId && !member?.teamMemberId) ||
              !targetTeamId ||
              targetTeamId === currentTeam?.teamId ||
              isSaving
            }
            onClick={() => {
              if (member) {
                onConfirm(targetTeamId, member.courseEnrollmentId || "");
              }
            }}
          >
            {isSaving ? "Đang chuyển..." : "Xác nhận chuyển"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
