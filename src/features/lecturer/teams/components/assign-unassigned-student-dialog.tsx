"use client";

import { useState } from "react";
import { UserPlusIcon } from "lucide-react";
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
import type { LecturerTeamItem, UnassignedStudent } from "../types/lecturer-team";

interface AssignUnassignedStudentDialogProps {
  open: boolean;
  student: UnassignedStudent | null;
  teams: LecturerTeamItem[];
  isSaving?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (teamId: string, courseEnrollmentId: string) => void;
}

export function AssignUnassignedStudentDialog({
  open,
  student,
  teams,
  isSaving,
  onOpenChange,
  onConfirm,
}: AssignUnassignedStudentDialogProps) {
  const [selectedTeamId, setSelectedTeamId] = useState("");

  const teamOptions = teams.map((team) => ({
    value: team.teamId,
    label: team.teamName || `Nhóm ${team.teamNo}`,
    subLabel: `TeamNo ${team.teamNo} • ${team.members.length} thành viên`,
  }));

  const handleOpenChange = (next: boolean) => {
    if (isSaving && !next) return;
    if (!next) setSelectedTeamId("");
    onOpenChange(next);
  };

  const handleConfirm = () => {
    if (!selectedTeamId || !student?.courseEnrollmentId || isSaving) return;
    onConfirm(selectedTeamId, student.courseEnrollmentId);
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
              <UserPlusIcon className="size-4.5" />
            </div>
            <div>
              <DialogTitle className="text-base font-extrabold text-foreground">
                Phân sinh viên vào nhóm
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Chỉ định nhóm dự án cho sinh viên chưa có nhóm trong lớp.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground">Sinh viên</p>
            <p className="text-sm font-bold text-foreground">{student?.fullName || "—"}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-mono font-medium">{student?.studentCode}</span>
              {student?.email && (
                <>
                  <span>•</span>
                  <span className="truncate">{student.email}</span>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assign-target-team" className="text-xs font-semibold text-foreground">
              Chọn nhóm dự án
            </Label>
            <CustomSelect
              id="assign-target-team"
              value={selectedTeamId}
              onChange={setSelectedTeamId}
              options={teamOptions}
              placeholder="Chọn nhóm tiếp nhận..."
              disabled={teamOptions.length === 0 || isSaving}
            />
            {teamOptions.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Chưa có nhóm nào trong lớp học phần này. Hãy phân nhóm bằng Excel trước.
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
            disabled={!selectedTeamId || !student?.courseEnrollmentId || isSaving}
            onClick={handleConfirm}
          >
            {isSaving ? "Đang phân nhóm..." : "Xác nhận vào nhóm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
