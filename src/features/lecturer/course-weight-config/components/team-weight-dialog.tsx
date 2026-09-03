"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ContributionWeights, ContributionCriterion } from "../types/course-weight-config";
import { WeightEditor } from "./weight-editor";
import { WeightTotalStatus } from "./weight-total-status";
import { isWeightValid } from "../lib/weight-config-utils";
import { WEIGHT_PRESETS } from "../lib/weight-presets";

interface TeamWeightDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
  teamName: string;
  projectName: string;
  initialWeights?: ContributionWeights;
  classWeights: ContributionWeights;
  onApply: (teamId: string, weights: ContributionWeights) => void;
}

export function TeamWeightDialog({
  isOpen,
  onOpenChange,
  teamId,
  teamName,
  projectName,
  initialWeights,
  classWeights,
  onApply,
}: TeamWeightDialogProps) {
  const [weights, setWeights] = useState<ContributionWeights>(initialWeights ?? classWeights);

  // Reset local state when opened
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWeights(initialWeights ?? classWeights);
    }
  }, [isOpen, initialWeights, classWeights]);

  const handleChange = (criterion: ContributionCriterion, val: number) => {
    setWeights((prev) => ({ ...prev, [criterion]: val }));
  };

  const handleApply = () => {
    onApply(teamId, weights);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-card border border-border/80 rounded-3xl shadow-2xl">
        <div className="p-5 border-b border-border/60 flex items-center justify-between shrink-0 bg-muted/20">
          <div>
            <DialogTitle className="text-base font-extrabold text-foreground flex items-center gap-2">
              Tùy chỉnh trọng số
              <span className="text-muted-foreground font-medium">—</span>
              <span className="text-primary">{teamName}</span>
            </DialogTitle>
            <DialogDescription className="text-sm font-medium mt-1">
              Dự án: <span className="text-foreground">{projectName}</span>
            </DialogDescription>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col p-5">
          <div className="mb-6">
            <h4 className="text-sm font-bold mb-3">Áp dụng nhanh</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start h-auto py-2 px-3 text-left bg-background"
                onClick={() => setWeights({ ...classWeights })}
              >
                <div className="w-full">
                  <div className="font-semibold text-xs">Sao chép cấu hình lớp</div>
                  <div className="text-[10px] text-muted-foreground truncate w-full">Khôi phục về giá trị mặc định của lớp</div>
                </div>
              </Button>
              {WEIGHT_PRESETS.map((preset) => (
                <Button
                  key={preset.id}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start h-auto py-2 px-3 text-left bg-background"
                  onClick={() => setWeights({ ...preset.weights })}
                >
                  <div className="w-full">
                    <div className="font-semibold text-xs">{preset.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate w-full">{preset.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="space-y-2 flex-1">
              <WeightEditor criterion="CODE" value={weights.CODE} onChange={(val) => handleChange("CODE", val)} />
              <WeightEditor criterion="TEST" value={weights.TEST} onChange={(val) => handleChange("TEST", val)} />
              <WeightEditor criterion="DOCUMENT" value={weights.DOCUMENT} onChange={(val) => handleChange("DOCUMENT", val)} />
              <WeightEditor criterion="RESEARCH" value={weights.RESEARCH} onChange={(val) => handleChange("RESEARCH", val)} />
            </div>

            <div className="mt-6 pt-4 border-t border-border/50">
              <WeightTotalStatus weights={weights} />
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 border-t border-border/60 flex items-center justify-end gap-2.5 shrink-0 bg-muted/20 sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy bỏ
          </Button>
          <Button onClick={handleApply} disabled={!isWeightValid(weights)}>
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
