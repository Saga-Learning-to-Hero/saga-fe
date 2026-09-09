"use client";

import { useState } from "react";
import { SaveIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
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

export function SliceWeightsForm({
  initialWeights,
  initialNote = "",
  showNote = false,
  hideSave = false,
  disabled,
  isSaving,
  saveLabel = "Lưu trọng số lớp",
  onSave,
}: SliceWeightsFormProps) {
  const [weights, setWeights] = useState(initialWeights);
  const [note, setNote] = useState(initialNote);
  const dirty = !areSliceWeightsEqual(weights, initialWeights) || (showNote && note !== initialNote);
  const invalid = hasInvalidSliceWeight(weights);
  const sumValid = isDisplayPercentSumValid(weights);
  const total = sumSliceWeights(weights);
  const canSave = !hideSave && !disabled && dirty && !invalid && sumValid && !isSaving;

  const updateField = (field: SliceWeightField, value: number) => {
    setWeights((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="rounded-2xl border border-border p-5 shadow-xs">
      <div className="space-y-4">
        {SLICE_WEIGHT_FIELDS.map((field) => (
          <SliceWeightFieldEditor
            key={field}
            field={field}
            value={weights[field]}
            disabled={disabled}
            onChange={(value) => updateField(field, value)}
          />
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-border bg-muted/30 p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">Tổng trọng số</span>
          <span className={cn("font-mono font-bold", sumValid ? "text-foreground" : "text-destructive")}>
            {total}%
          </span>
        </div>
        {!sumValid && (
          <p className="mt-2 text-xs text-destructive">
            Trọng số đang dùng đơn vị phần trăm. Tổng phải bằng 100% mới được lưu.
          </p>
        )}
        {invalid && (
          <p className="mt-2 text-xs text-destructive">Không chấp nhận số âm, ô trống hoặc giá trị không phải số.</p>
        )}
      </div>

      {showNote ? (
        <div className="mt-5 space-y-2">
          <Label htmlFor="group-weight-note">Ghi chú cấu hình</Label>
          <Textarea
            id="group-weight-note"
            rows={3}
            disabled={disabled}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Ví dụ: Nhóm tập trung vào phần kiểm thử."
          />
        </div>
      ) : null}

      {hideSave ? null : (
      <div className="mt-4 flex justify-end">
        <Button
          type="button"
          className="cursor-pointer"
          disabled={!canSave}
          onClick={() => onSave(weights, { note })}
        >
          <SaveIcon className="mr-2 size-4" />
          {isSaving ? "Đang lưu..." : saveLabel}
        </Button>
      </div>
      )}
    </Card>
  );
}

function SliceWeightFieldEditor({
  field,
  value,
  disabled,
  onChange,
}: {
  field: SliceWeightField;
  value: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  const info = SLICE_WEIGHT_LABELS[field];
  const sliderValue = Number.isFinite(value) ? value : 0;

  return (
    <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[160px_minmax(0,1fr)_88px]">
      <div>
        <Label htmlFor={`slice-${field}`} className="text-sm font-bold">
          {info.title}
        </Label>
        <p className="text-[11px] text-muted-foreground">{info.description}</p>
      </div>
      <Slider
        value={[sliderValue]}
        min={0}
        max={100}
        step={1}
        disabled={disabled}
        onValueChange={(vals) => {
          const next = Array.isArray(vals) ? vals[0] : vals;
          onChange(typeof next === "number" ? next : 0);
        }}
        aria-label={info.title}
      />
      <div className="relative">
        <Input
          id={`slice-${field}`}
          type="number"
          min={0}
          max={100}
          disabled={disabled}
          value={Number.isFinite(value) ? String(value) : ""}
          className="pr-7 text-right font-mono text-sm font-bold"
          onChange={(event) => {
            const nextRaw = event.target.value;
            if (nextRaw === "") {
              onChange(Number.NaN);
              return;
            }
            onChange(Number(nextRaw));
          }}
        />
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground">
          %
        </span>
      </div>
    </div>
  );
}
