"use client";

import { useState } from "react";
import { XIcon, SlidersHorizontalIcon, Loader2Icon, AlertCircleIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useOverrideContribution } from "../hooks/use-lecturer-contribution";
import type { ContributionMember } from "../types/contribution";
import { formatContributionPercent } from "../lib/contribution-utils";

interface OverrideContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  member: ContributionMember | null;
}

export function OverrideContributionModal({
  isOpen,
  onClose,
  teamId,
  member,
}: OverrideContributionModalProps) {
  const [percentage, setPercentage] = useState<string>(() =>
    member?.finalContributionPercentage != null
      ? String(member.finalContributionPercentage)
      : ""
  );
  const [reason, setReason] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);

  const overrideMutation = useOverrideContribution(teamId);

  if (!isOpen || !member) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const numPercent = parseFloat(percentage);
    if (isNaN(numPercent) || numPercent < 0 || numPercent > 100) {
      setFormError("Tỷ lệ phần trăm đóng góp phải từ 0% đến 100%.");
      return;
    }

    if (!reason.trim()) {
      setFormError("Vui lòng nhập lý do điều chỉnh tỷ lệ đóng góp.");
      return;
    }

    try {
      await overrideMutation.mutateAsync({
        studentProfileId: member.studentProfileId,
        percentage: numPercent,
        reason: reason.trim(),
      });
      onClose();
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border/80 rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-border/60 flex items-center justify-between shrink-0 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <SlidersHorizontalIcon className="size-4.5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-foreground">
                Điều chỉnh tỷ lệ đóng góp
              </h3>
              <p className="text-xs text-muted-foreground">
                Ghi đè tỷ lệ đóng góp cuối cùng và chuẩn hóa lại toàn nhóm
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={overrideMutation.isPending}
            className="rounded-xl p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form id="override-contribution-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Member Info Card */}
          <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center font-bold text-xs">
                <UserIcon className="size-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">{member.fullName}</p>
                <span className="font-mono text-[11px] font-semibold text-primary">
                  {member.studentCode}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-muted-foreground block">Tỷ lệ hiện tại</span>
              <Badge variant="outline" className="font-mono text-xs font-bold bg-card border-border/80">
                {formatContributionPercent(member.finalContributionPercentage)}
              </Badge>
            </div>
          </div>

          {/* New Percentage Input */}
          <div className="space-y-1.5">
            <Label htmlFor="override-percentage" className="text-xs font-bold text-foreground">
              Tỷ lệ phần trăm mới (%) <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="override-percentage"
                type="number"
                step="0.01"
                min="0"
                max="100"
                required
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                placeholder="VD: 35.5"
                className="h-10 text-sm font-mono pr-8 rounded-xl"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                %
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Nhập giá trị từ 0 đến 100.
            </p>
          </div>

          {/* Reason Textarea */}
          <div className="space-y-1.5">
            <Label htmlFor="override-reason" className="text-xs font-bold text-foreground">
              Lý do điều chỉnh <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="override-reason"
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Điều chỉnh sau buổi bảo vệ đồ án, cộng thêm điểm phụ trách kiến trúc hệ thống..."
              className="text-xs rounded-xl resize-none"
            />
          </div>

          {/* Notice Alert */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-foreground/90 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-primary">
              <AlertCircleIcon className="size-3.5 shrink-0" />
              <span>Cơ chế chuẩn hóa nhóm tự động</span>
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground pl-5">
              Sau khi lưu tỷ lệ mới, hệ thống SAGA sẽ tự động chuẩn hóa lại tổng điểm % đóng góp của toàn bộ các thành viên trong nhóm về đúng 100%.
            </p>
          </div>

          {formError && (
            <p className="text-xs font-medium text-destructive flex items-center gap-1">
              <AlertCircleIcon className="size-3.5 shrink-0" />
              {formError}
            </p>
          )}
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-border/60 flex items-center justify-end gap-2.5 shrink-0 bg-muted/20">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={overrideMutation.isPending}
            className="cursor-pointer text-xs font-semibold rounded-xl"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            form="override-contribution-form"
            size="sm"
            disabled={overrideMutation.isPending}
            className="cursor-pointer text-xs font-bold rounded-xl"
          >
            {overrideMutation.isPending ? (
              <>
                <Loader2Icon className="size-3.5 animate-spin mr-1.5" />
                Đang lưu...
              </>
            ) : (
              "Lưu điều chỉnh"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
