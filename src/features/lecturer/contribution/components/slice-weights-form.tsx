"use client";

import { useMemo, useState } from "react";
import {
  AlertCircleIcon,
  BrainCircuitIcon,
  CheckCircle2Icon,
  Code2Icon,
  FileTextIcon,
  FlaskConicalIcon,
  MinusIcon,
  PlusIcon,
  RotateCcwIcon,
  SaveIcon,
  SparklesIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import type { ContributionSliceWeightValues } from "../types/contribution";
import {
  SLICE_WEIGHT_FIELDS,
  SLICE_WEIGHT_LABELS,
  areSliceWeightsEqual,
  hasInvalidSliceWeight,
  isDisplayPercentSumValid,
  sumSliceWeights,
  type SliceWeightField,
} from "../lib/contribution-utils";
import { cn } from "@/lib/utils";

interface SliceWeightsFormProps {
  initialWeights: ContributionSliceWeightValues;
  initialNote?: string;
  showNote?: boolean;
  hideSave?: boolean;
  disabled?: boolean;
  isSaving?: boolean;
  saveLabel?: string;
  onSave: (weights: ContributionSliceWeightValues, extras?: { note: string }) => void;
}

interface SlicePreset {
  id: string;
  name: string;
  badge?: string;
  weights: ContributionSliceWeightValues;
}

const PRESET_CONFIGS: SlicePreset[] = [
  {
    id: "balanced",
    name: "Cân bằng SE",
    badge: "Chuẩn",
    weights: {
      codeWeight: 40,
      testWeight: 25,
      documentWeight: 20,
      researchWeight: 15,
    },
  },
  {
    id: "dev-heavy",
    name: "Lập trình",
    weights: {
      codeWeight: 60,
      testWeight: 20,
      documentWeight: 10,
      researchWeight: 10,
    },
  },
  {
    id: "qa-focused",
    name: "Kiểm thử QA",
    weights: {
      codeWeight: 35,
      testWeight: 35,
      documentWeight: 15,
      researchWeight: 15,
    },
  },
  {
    id: "research-srs",
    name: "Nghiên cứu & SRS",
    weights: {
      codeWeight: 25,
      testWeight: 15,
      documentWeight: 35,
      researchWeight: 25,
    },
  },
  {
    id: "equal",
    name: "Chia đều",
    weights: {
      codeWeight: 25,
      testWeight: 25,
      documentWeight: 25,
      researchWeight: 25,
    },
  },
];

const FIELD_CONFIG: Record<
  SliceWeightField,
  {
    icon: typeof Code2Icon;
    colorClass: string;
    bgClass: string;
    borderClass: string;
    strokeColor: string;
  }
> = {
  codeWeight: {
    icon: Code2Icon,
    colorClass: "text-blue-600 dark:text-blue-400",
    bgClass: "bg-blue-500/10",
    borderClass: "border-blue-500/30",
    strokeColor: "var(--color-blue-500, #3b82f6)",
  },
  testWeight: {
    icon: FlaskConicalIcon,
    colorClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-500/10",
    borderClass: "border-emerald-500/30",
    strokeColor: "var(--color-emerald-500, #10b981)",
  },
  documentWeight: {
    icon: FileTextIcon,
    colorClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-500/10",
    borderClass: "border-amber-500/30",
    strokeColor: "var(--color-amber-500, #f59e0b)",
  },
  researchWeight: {
    icon: BrainCircuitIcon,
    colorClass: "text-purple-600 dark:text-purple-400",
    bgClass: "bg-purple-500/10",
    borderClass: "border-purple-500/30",
    strokeColor: "var(--color-purple-500, #a855f7)",
  },
};

function calculateDonutSegments(
  weights: ContributionSliceWeightValues,
  total: number
) {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const totalSafe = Math.max(total, 1);
  const segments: Array<{
    field: SliceWeightField;
    length: number;
    offset: number;
    circumference: number;
    color: string;
  }> = [];

  let currentOffset = 0;
  for (const field of SLICE_WEIGHT_FIELDS) {
    const val = Number.isFinite(weights[field]) && weights[field] > 0 ? weights[field] : 0;
    const length = (val / totalSafe) * circumference;
    segments.push({
      field,
      length,
      offset: currentOffset,
      circumference,
      color: FIELD_CONFIG[field].strokeColor,
    });
    currentOffset += length;
  }

  return segments;
}

function autoBalanceWeights(current: ContributionSliceWeightValues): ContributionSliceWeightValues {
  const total = sumSliceWeights(current);
  if (total <= 0) {
    return { codeWeight: 25, testWeight: 25, documentWeight: 25, researchWeight: 25 };
  }
  const scaled: Record<SliceWeightField, number> = {
    codeWeight: Math.round((current.codeWeight / total) * 100),
    testWeight: Math.round((current.testWeight / total) * 100),
    documentWeight: Math.round((current.documentWeight / total) * 100),
    researchWeight: Math.round((current.researchWeight / total) * 100),
  };
  const currentSum = scaled.codeWeight + scaled.testWeight + scaled.documentWeight + scaled.researchWeight;
  const remainder = 100 - currentSum;
  if (remainder !== 0) {
    scaled.codeWeight += remainder;
  }
  return scaled as ContributionSliceWeightValues;
}

export function SliceWeightsForm({
  initialWeights,
  initialNote = "",
  showNote = false,
  hideSave = false,
  disabled,
  isSaving,
  saveLabel = "Lưu trọng số Slicing Pie",
  onSave,
}: SliceWeightsFormProps) {
  const [weights, setWeights] = useState(initialWeights);
  const [note, setNote] = useState(initialNote);
  const dirty = !areSliceWeightsEqual(weights, initialWeights) || (showNote && note !== initialNote);
  const invalid = hasInvalidSliceWeight(weights);
  const sumValid = isDisplayPercentSumValid(weights);
  const total = sumSliceWeights(weights);
  const remainder = 100 - total;
  const canSave = !hideSave && !disabled && dirty && !invalid && sumValid && !isSaving;

  const updateField = (field: SliceWeightField, value: number) => {
    setWeights((prev) => ({ ...prev, [field]: value }));
  };

  const addRemainderToField = (field: SliceWeightField) => {
    if (remainder <= 0) return;
    const currentVal = Number.isFinite(weights[field]) ? weights[field] : 0;
    updateField(field, Math.min(100, Math.max(0, currentVal + remainder)));
  };

  const donutSegments = useMemo(
    () => calculateDonutSegments(weights, total),
    [weights, total]
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="space-y-4 lg:col-span-7">
        <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
          <div className="mb-5 space-y-1">
            <h3 className="text-base font-extrabold text-foreground">
              Thiết lập trọng số tiêu chí Slicing Pie
            </h3>
            <p className="text-xs text-muted-foreground">
              Chọn mẫu cấu hình nhanh hoặc tùy chỉnh tỷ lệ % cho 4 tiêu chí cốt lõi của đồ án.
            </p>
          </div>

          <div className="mb-5 space-y-2.5 rounded-xl border border-border/60 bg-muted/20 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Mẫu thiết lập nhanh (Presets)
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled || areSliceWeightsEqual(weights, initialWeights)}
                onClick={() => setWeights(initialWeights)}
                className="h-6 cursor-pointer px-2 text-[11px] font-medium text-muted-foreground hover:text-foreground"
              >
                <RotateCcwIcon className="mr-1 size-3" />
                Đặt lại
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_CONFIGS.map((preset) => {
                const isSelected = areSliceWeightsEqual(weights, preset.weights);
                return (
                  <Button
                    key={preset.id}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    disabled={disabled}
                    onClick={() => setWeights(preset.weights)}
                    className={cn(
                      "h-7 cursor-pointer rounded-lg text-xs font-semibold transition-all",
                      isSelected
                        ? "shadow-xs"
                        : "border-border/70 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    {preset.name}
                    {preset.badge && (
                      <span
                        className={cn(
                          "ml-1.5 rounded-full px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase",
                          isSelected ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                        )}
                      >
                        {preset.badge}
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            {SLICE_WEIGHT_FIELDS.map((field) => (
              <SliceWeightFieldEditor
                key={field}
                field={field}
                value={weights[field]}
                disabled={disabled}
                remainder={remainder}
                onChange={(value) => updateField(field, value)}
                onAddRemainder={() => addRemainderToField(field)}
              />
            ))}
          </div>

          {showNote && (
            <div className="mt-6 space-y-2 border-t border-border/60 pt-4">
              <Label htmlFor="group-weight-note" className="text-xs font-bold text-foreground">
                Ghi chú cấu hình nhóm
              </Label>
              <Textarea
                id="group-weight-note"
                rows={2}
                disabled={disabled}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Ví dụ: Nhóm tập trung nhiều vào khâu Testing và Viết tài liệu SRS."
                className="rounded-xl text-xs"
              />
            </div>
          )}
        </Card>
      </div>

      <div className="space-y-4 lg:col-span-5">
        <Card className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
          <CardContent className="space-y-5 p-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-foreground">
                Mô hình Slicing Pie trực quan
              </h3>
              {sumValid ? (
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-500/10 font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400"
                >
                  <CheckCircle2Icon className="mr-1 size-3" />
                  Đủ 100%
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-destructive/30 bg-destructive/10 font-mono text-[11px] font-bold text-destructive"
                >
                  <AlertCircleIcon className="mr-1 size-3" />
                  {total < 100 ? `Thiếu ${100 - total}%` : `Dư ${total - 100}%`}
                </Badge>
              )}
            </div>

            <div className="relative mx-auto flex size-44 items-center justify-center">
              <svg className="size-full -rotate-90" viewBox="0 0 140 140">
                <circle
                  cx="70"
                  cy="70"
                  r="56"
                  fill="none"
                  className="stroke-muted/40"
                  strokeWidth="16"
                />
                {donutSegments.map((seg) => (
                  <circle
                    key={seg.field}
                    cx="70"
                    cy="70"
                    r="56"
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="16"
                    strokeDasharray={`${seg.length} ${seg.circumference}`}
                    strokeDashoffset={-seg.offset}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                ))}
              </svg>

              <div className="pointer-events-none absolute flex flex-col items-center justify-center text-center">
                <span
                  className={cn(
                    "font-mono text-3xl font-black tracking-tight",
                    sumValid ? "text-foreground" : "text-destructive"
                  )}
                >
                  {total}%
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Tổng Pie
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
                {SLICE_WEIGHT_FIELDS.map((field) => {
                  const val = Number.isFinite(weights[field]) && weights[field] > 0 ? weights[field] : 0;
                  return (
                    <div
                      key={field}
                      style={{
                        width: `${total > 0 ? (val / total) * 100 : 0}%`,
                        backgroundColor: FIELD_CONFIG[field].strokeColor,
                      }}
                      className="h-full transition-all duration-300"
                    />
                  );
                })}
              </div>

              {!sumValid && (
                <div className="flex items-center justify-between rounded-xl border border-destructive/20 bg-destructive/5 p-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
                    <AlertCircleIcon className="size-3.5 shrink-0" />
                    <span>
                      {total < 100
                        ? `Còn thiếu ${100 - total}%`
                        : `Đang vượt quá ${total - 100}%`}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={disabled}
                    onClick={() => setWeights(autoBalanceWeights(weights))}
                    className="h-6 cursor-pointer rounded-lg border-destructive/30 bg-destructive/10 px-2 text-[11px] font-bold text-destructive hover:bg-destructive/20"
                  >
                    <SparklesIcon className="mr-1 size-3" />
                    Tự cân bằng 100%
                  </Button>
                </div>
              )}
              {invalid && (
                <p className="text-center text-xs text-destructive">
                  Không chấp nhận số âm hoặc để trống ô trọng số.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {SLICE_WEIGHT_FIELDS.map((field) => {
                const cfg = FIELD_CONFIG[field];
                const Icon = cfg.icon;
                const info = SLICE_WEIGHT_LABELS[field];
                const val = Number.isFinite(weights[field]) ? weights[field] : 0;
                return (
                  <div
                    key={field}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 p-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex size-6 items-center justify-center rounded-lg",
                          cfg.bgClass,
                          cfg.colorClass
                        )}
                      >
                        <Icon className="size-3.5" />
                      </div>
                      <span className="text-xs font-bold text-foreground">{info.shortTitle}</span>
                    </div>
                    <span className="font-mono text-xs font-black text-foreground">
                      {val}%
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>

          {!hideSave && (
            <div className="mt-5 border-t border-border/60 pt-4">
              <Button
                type="button"
                className="h-10 w-full cursor-pointer gap-2 rounded-xl text-xs font-bold shadow-xs"
                disabled={!canSave}
                onClick={() => onSave(weights, { note })}
              >
                <SaveIcon className="size-4" />
                {isSaving ? "Đang lưu..." : saveLabel}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function SliceWeightFieldEditor({
  field,
  value,
  disabled,
  remainder,
  onChange,
  onAddRemainder,
}: {
  field: SliceWeightField;
  value: number;
  disabled?: boolean;
  remainder: number;
  onChange: (value: number) => void;
  onAddRemainder: () => void;
}) {
  const info = SLICE_WEIGHT_LABELS[field];
  const cfg = FIELD_CONFIG[field];
  const Icon = cfg.icon;
  const sliderValue = Number.isFinite(value) ? value : 0;

  return (
    <div className="space-y-2.5 rounded-xl border border-border/60 bg-muted/20 p-3.5 transition-colors hover:bg-muted/30">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg",
              cfg.bgClass,
              cfg.colorClass
            )}
          >
            <Icon className="size-4" />
          </div>
          <div>
            <Label htmlFor={`slice-${field}`} className="text-xs font-bold text-foreground">
              {info.title}
            </Label>
            <p className="text-[11px] text-muted-foreground">{info.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {remainder > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={onAddRemainder}
              className="h-7 cursor-pointer rounded-lg border-primary/30 bg-primary/10 px-2 font-mono text-[11px] font-bold text-primary hover:bg-primary/20"
              title={`Bù ${remainder}% còn thiếu vào ${info.title}`}
            >
              +{remainder}% bù
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={disabled || sliderValue <= 0}
            onClick={() => onChange(Math.max(0, sliderValue - 5))}
            className="size-7 cursor-pointer rounded-lg text-xs font-bold"
            aria-label="Giảm 5%"
          >
            <MinusIcon className="size-3" />
          </Button>

          <div className="relative w-20 shrink-0">
            <Input
              id={`slice-${field}`}
              type="number"
              min={0}
              max={100}
              disabled={disabled}
              value={Number.isFinite(value) ? String(value) : ""}
              className="h-7 rounded-lg pl-2 pr-6 text-right font-mono text-xs font-black [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              onChange={(event) => {
                const nextRaw = event.target.value;
                if (nextRaw === "") {
                  onChange(Number.NaN);
                  return;
                }
                onChange(Number(nextRaw));
              }}
            />
            <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[11px] font-bold text-muted-foreground">
              %
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={disabled || sliderValue >= 100}
            onClick={() => onChange(Math.min(100, sliderValue + 5))}
            className="size-7 cursor-pointer rounded-lg text-xs font-bold"
            aria-label="Tăng 5%"
          >
            <PlusIcon className="size-3" />
          </Button>
        </div>
      </div>

      <div className="space-y-1 pt-1">
        <Slider
          value={[sliderValue]}
          min={0}
          max={100}
          step={5}
          disabled={disabled}
          onValueChange={(vals) => {
            const next = Array.isArray(vals) ? vals[0] : vals;
            onChange(typeof next === "number" ? next : 0);
          }}
          aria-label={info.title}
        />
        <div className="flex justify-between px-0.5 text-[9px] font-mono text-muted-foreground">
          {[0, 25, 50, 75, 100].map((tick) => (
            <button
              key={tick}
              type="button"
              disabled={disabled}
              onClick={() => onChange(tick)}
              className="cursor-pointer transition-colors hover:text-foreground"
            >
              {tick}%
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
