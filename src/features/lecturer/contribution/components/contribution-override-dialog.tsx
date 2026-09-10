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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ContributionMember } from "../types/contribution";
import { formatContributionPercent } from "../lib/contribution-utils";

interface ContributionOverrideDialogProps {
  open: boolean;
  member: ContributionMember | null;
  isSaving?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: { percentage: number; reason: string }) => void;
}

export function ContributionOverrideDialog({
  open,
  member,
  isSaving,
  onOpenChange,
  onSubmit,
}: ContributionOverrideDialogProps) {
  const [percentageRaw, setPercentageRaw] = useState("");
  const [reason, setReason] = useState("");

  const handleOpenChange = (next: boolean) => {
    if (isSaving && !next) return;
    if (!next) {
      setPercentageRaw("");
      setReason("");
    }
    onOpenChange(next);
  };

  const percentage = Number(percentageRaw);
  const canSubmit =
    Boolean(member?.studentProfileId) &&
    percentageRaw.trim() !== "" &&
    Number.isFinite(percentage) &&
    percentage >= 0 &&
    reason.trim().length > 0 &&
    !isSaving;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex max-h-[92vh] w-[calc(100vw-2rem)] max-w-lg flex-col overflow-hidden p-0"
        showCloseButton={!isSaving}
      >
        <DialogHeader className="shrink-0 border-b border-border p-5">
          <DialogTitle>Điều chỉnh tỷ lệ đóng góp</DialogTitle>
          <DialogDescription>
            {member
              ? `${member.fullName} · ${member.studentCode}. Giá trị hiện tại: ${formatContributionPercent(member.finalContributionPercentage)}.`
              : "Chọn thành viên để điều chỉnh."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div className="space-y-2">
            <Label htmlFor="override-percentage">Tỷ lệ đóng góp mới (%)</Label>
            <Input
              id="override-percentage"
              type="number"
              min={0}
              className="font-mono"
              value={percentageRaw}
              disabled={isSaving}
              onChange={(event) => setPercentageRaw(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="override-reason">Lý do điều chỉnh</Label>
            <Textarea
              id="override-reason"
              rows={4}
              value={reason}
              disabled={isSaving}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Nhập căn cứ, biên bản thỏa thuận hoặc lý do điều chỉnh."
            />
            <p className="text-[11px] text-muted-foreground">
              Lý do bắt buộc để truy vết điều chỉnh đóng góp.
            </p>
          </div>
        </div>

        <DialogFooter className="mx-0 mb-0 shrink-0">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            disabled={isSaving}
            onClick={() => handleOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            type="button"
            className="cursor-pointer"
            disabled={!canSubmit}
            onClick={() => {
              if (!canSubmit) return;
              onSubmit({ percentage, reason: reason.trim() });
            }}
          >
            {isSaving ? "Đang lưu..." : "Xác nhận điều chỉnh"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
