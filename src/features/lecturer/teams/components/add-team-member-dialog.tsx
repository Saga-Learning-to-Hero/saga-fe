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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CustomSelect } from "@/components/common/custom-select";
import type { LecturerTeamItem, UnassignedStudent } from "../types/lecturer-team";

interface AddTeamMemberDialogProps {
  open: boolean;
  team: LecturerTeamItem | null;
  unassignedStudents: UnassignedStudent[];
  isSaving?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (courseEnrollmentId: string) => void;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "SV";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AddTeamMemberDialog({
  open,
  team,
  unassignedStudents,
  isSaving,
  onOpenChange,
  onConfirm,
}: AddTeamMemberDialogProps) {
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState("");

  const studentOptions = unassignedStudents.map((s) => ({
    value: s.courseEnrollmentId,
    label: `${s.fullName} (${s.studentCode})`,
    subLabel: s.email || undefined,
  }));

  const selectedStudent = unassignedStudents.find(
    (s) => s.courseEnrollmentId === selectedEnrollmentId
  );

  const handleOpenChange = (next: boolean) => {
    if (isSaving && !next) return;
    if (!next) setSelectedEnrollmentId("");
    onOpenChange(next);
  };

  const handleConfirm = () => {
    if (!selectedEnrollmentId || isSaving) return;
    onConfirm(selectedEnrollmentId);
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
                Thêm sinh viên vào nhóm
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Chỉ định sinh viên chưa có nhóm vào{" "}
                <span className="font-semibold text-foreground">
                  {team?.teamName || `Nhóm ${team?.teamNo}`}
                </span>
                .
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Nhóm tiếp nhận</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded-md border border-primary/25 bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                Team #{team?.teamNo}
              </span>
              <span className="text-sm font-bold text-foreground">
                {team?.teamName || `Nhóm ${team?.teamNo}`}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unassigned-student" className="text-xs font-semibold text-foreground">
              Chọn sinh viên chưa có nhóm
            </Label>
            {unassignedStudents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-4 text-center">
                <p className="text-xs font-semibold text-muted-foreground">
                  Hiện không còn sinh viên nào chưa có nhóm trong lớp học phần này.
                </p>
              </div>
            ) : (
              <CustomSelect
                id="unassigned-student"
                value={selectedEnrollmentId}
                onChange={setSelectedEnrollmentId}
                options={studentOptions}
                placeholder="Chọn sinh viên từ danh sách chờ..."
                disabled={isSaving}
              />
            )}
          </div>

          {selectedStudent && (
            <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-muted/30 p-3.5">
              <Avatar size="sm" className="border border-border/60 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary font-mono text-xs font-bold">
                  {getInitials(selectedStudent.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate">
                  {selectedStudent.fullName}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono font-medium">{selectedStudent.studentCode}</span>
                  {selectedStudent.email && (
                    <>
                      <span>•</span>
                      <span className="truncate">{selectedStudent.email}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
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
            disabled={!selectedEnrollmentId || isSaving || unassignedStudents.length === 0}
            onClick={handleConfirm}
          >
            {isSaving ? "Đang thêm..." : "Thêm vào nhóm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
