"use client";

import { useState } from "react";
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  MinusIcon,
  PlusIcon,
  ShieldAlertIcon,
  SlidersHorizontalIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { cn } from "@/lib/utils";

interface ContributionOverrideDialogProps {
  open: boolean;
  member: ContributionMember | null;
  isSaving?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: { percentage: number; reason: string }) => void;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "SV";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const QUICK_PERCENT_PRESETS = [10, 15, 20, 25, 30];

const REASON_SUGGESTIONS = [
  "Biên bản họp nhóm đồ án đồng thuận điều chỉnh",
  "Bổ sung công sức hỗ trợ khâu kiểm thử & sửa lỗi",
  "Đặc thù đề tài R&D cần bổ sung tỷ trọng tài liệu SRS",
  "Cân đối lại công sức do hỗ trợ hoàn thiện sản phẩm",
];

export function ContributionOverrideDialog({
  open,
  member,
  isSaving,
  onOpenChange,
  onSubmit,
}: ContributionOverrideDialogProps) {
  const [percentageRaw, setPercentageRaw] = useState("");
  const [reason, setReason] = useState("");

  const currentPercentage = Number(member?.finalContributionPercentage) || 0;
  const percentage = Number(percentageRaw);
  const isValidNumber =
    percentageRaw.trim() !== "" &&
    Number.isFinite(percentage) &&
    percentage >= 0 &&
    percentage <= 100;
  const diff = isValidNumber ? percentage - currentPercentage : 0;

  const handleOpenChange = (next: boolean) => {
    if (isSaving && !next) return;
    if (!next) {
      setPercentageRaw("");
      setReason("");
    }
    onOpenChange(next);
  };

  const handleStep = (step: number) => {
    const base =
      Number.isFinite(percentage) && percentageRaw.trim() !== ""
        ? percentage
        : currentPercentage;
    const nextVal = Math.min(100, Math.max(0, base + step));
    setPercentageRaw(String(nextVal));
  };

  const canSubmit =
    Boolean(member?.studentProfileId) &&
    isValidNumber &&
    reason.trim().length > 0 &&
    !isSaving;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex max-h-[92vh] w-[calc(100vw-2rem)] max-w-2xl flex-col overflow-hidden rounded-3xl border border-border/80 bg-card p-0 shadow-2xl"
        showCloseButton={!isSaving}
      >
        <DialogHeader className="shrink-0 border-b border-border/60 bg-muted/20 p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <SlidersHorizontalIcon className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-extrabold text-foreground">
                Điều chỉnh tỷ lệ đóng góp Slicing Pie
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Can thiệp điều chỉnh tỷ lệ cổ phần cuối cùng kèm lý do lưu vết kiểm toán.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {member && (
            <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/25 p-4">
              <div className="flex items-center gap-3.5">
                <Avatar size="default" className="border border-border/60">
                  <AvatarFallback className="bg-primary/10 font-mono text-xs font-bold text-primary">
                    {getInitials(member.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-bold text-foreground">{member.fullName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-block rounded bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-bold text-primary">
                      {member.studentCode}
                    </span>
                    {member.warnings.includes("NO_EVIDENCE") && (
                      <span className="inline-flex items-center gap-1 rounded border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive">
                        <ShieldAlertIcon className="size-3" />
                        Chưa có minh chứng
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Hiện tại
                </span>
                <p className="font-mono text-lg font-black text-foreground">
                  {formatContributionPercent(member.finalContributionPercentage)}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3.5 rounded-2xl border border-border/60 bg-muted/15 p-5">
            <div className="flex items-center justify-between">
              <Label htmlFor="override-percentage" className="text-xs font-bold text-foreground">
                Tỷ lệ đóng góp mới (%)
              </Label>
              {isValidNumber && diff !== 0 && (
                <span
                  className={cn(
                    "font-mono text-xs font-extrabold",
                    diff > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-amber-600 dark:text-amber-400"
                  )}
                >
                  {diff > 0 ? `+${diff}%` : `${diff}%`} so với hiện tại
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-card p-1.5 shadow-xs">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={isSaving}
                  onClick={() => handleStep(-5)}
                  className="size-8 cursor-pointer rounded-lg font-bold"
                  aria-label="Giảm 5%"
                >
                  <MinusIcon className="size-3.5" />
                </Button>

                <div className="relative w-24">
                  <Input
                    id="override-percentage"
                    type="number"
                    min={0}
                    max={100}
                    className="h-8 border-none bg-transparent pr-6 text-center font-mono text-base font-black shadow-none focus-visible:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    value={percentageRaw}
                    disabled={isSaving}
                    placeholder={String(currentPercentage)}
                    onChange={(event) => setPercentageRaw(event.target.value)}
                  />
                  <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                    %
                  </span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={isSaving}
                  onClick={() => handleStep(5)}
                  className="size-8 cursor-pointer rounded-lg font-bold"
                  aria-label="Tăng 5%"
                >
                  <PlusIcon className="size-3.5" />
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground">Mẫu nhanh:</span>
                {QUICK_PERCENT_PRESETS.map((p) => (
                  <Button
                    key={p}
                    type="button"
                    variant={percentage === p ? "default" : "outline"}
                    size="sm"
                    disabled={isSaving}
                    onClick={() => setPercentageRaw(String(p))}
                    className="h-8 cursor-pointer rounded-lg px-2.5 font-mono text-xs font-bold shadow-2xs"
                  >
                    {p}%
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="override-reason" className="text-xs font-bold text-foreground">
                Lý do điều chỉnh
              </Label>
              <span className="text-xs text-destructive font-semibold">* Bắt buộc</span>
            </div>

            <Textarea
              id="override-reason"
              rows={3}
              value={reason}
              disabled={isSaving}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Nhập căn cứ, biên bản thỏa thuận họp nhóm hoặc quyết định của giảng viên..."
              className="rounded-xl text-xs leading-relaxed p-3"
            />

            <div className="space-y-2 pt-1">
              <p className="text-xs font-semibold text-muted-foreground">Gợi ý lý do phổ biến:</p>
              <div className="flex flex-wrap gap-2">
                {REASON_SUGGESTIONS.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    disabled={isSaving}
                    onClick={() => setReason(sug)}
                    className="cursor-pointer rounded-xl border border-border/70 bg-muted/20 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors text-left"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>

            <p className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
              <AlertCircleIcon className="size-4 shrink-0 text-primary" />
              Lý do này sẽ được lưu vết (Audit Trail) để đối soát.
            </p>
          </div>
        </div>

        <DialogFooter className="m-0 shrink-0 border-t border-border/60 bg-muted/20 px-6 py-4 flex items-center justify-end gap-3 rounded-b-3xl">
          <Button
            type="button"
            variant="outline"
            className="h-10 cursor-pointer px-5 rounded-xl text-xs font-bold shadow-xs"
            disabled={isSaving}
            onClick={() => handleOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            type="button"
            className="h-10 cursor-pointer gap-2 px-5 rounded-xl text-xs font-bold shadow-xs"
            disabled={!canSubmit}
            onClick={() => {
              if (!canSubmit) return;
              onSubmit({ percentage, reason: reason.trim() });
            }}
          >
            <CheckCircle2Icon className="size-4" />
            {isSaving ? "Đang lưu..." : "Xác nhận điều chỉnh"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
