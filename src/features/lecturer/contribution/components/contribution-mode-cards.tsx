"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ContributionConfigMode } from "../types/contribution";

interface ContributionModeCardsProps {
  value: ContributionConfigMode;
  disabled?: boolean;
  onRequestChange: (next: ContributionConfigMode) => void;
}

const MODES: { value: ContributionConfigMode; title: string; description: string }[] = [
  {
    value: "COURSE",
    title: "Dùng chung cho cả lớp",
    description: "Một bộ trọng số áp dụng cho mọi nhóm. Giảng viên chỉnh bốn tiêu chí ngay trên trang này.",
  },
  {
    value: "PROJECT_GROUP",
    title: "Thiết lập riêng theo từng dự án nhóm",
    description: "Mỗi dự án nhóm có bộ trọng số riêng. Trang này chỉ theo dõi trạng thái đã cấu hình.",
  },
];

export function ContributionModeCards({
  value,
  disabled,
  onRequestChange,
}: ContributionModeCardsProps) {
  return (
    <RadioGroup
      value={value}
      disabled={disabled}
      onValueChange={(next) => {
        if (next === "COURSE" || next === "PROJECT_GROUP") {
          onRequestChange(next);
        }
      }}
      className="grid gap-3 md:grid-cols-2"
    >
      {MODES.map((mode) => {
        const selected = value === mode.value;
        return (
          <Label
            key={mode.value}
            htmlFor={`contribution-mode-${mode.value}`}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors",
              selected
                ? "border-primary/40 bg-primary/5"
                : "border-border bg-card hover:border-primary/20",
              disabled && "cursor-not-allowed opacity-70"
            )}
          >
            <RadioGroupItem
              id={`contribution-mode-${mode.value}`}
              value={mode.value}
              className="mt-0.5"
            />
            <span className="space-y-1">
              <span className="block text-sm font-bold text-foreground">{mode.title}</span>
              <span className="block text-xs leading-relaxed text-muted-foreground">
                {mode.description}
              </span>
            </span>
          </Label>
        );
      })}
    </RadioGroup>
  );
}
