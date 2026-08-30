"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  onApply: (teamId: string, weights: ContributionWeights) => void;
}

export function TeamWeightDialog({
  isOpen,
  onOpenChange,
  teamId,
  teamName,
  projectName,
  initialWeights,
  onApply,
}: TeamWeightDialogProps) {
  const [weights, setWeights] = useState<ContributionWeights>(initialWeights ?? { CODE: 25, TEST: 25, DOCUMENT: 25, RESEARCH: 25 });
  const [initMode, setInitMode] = useState<"custom" | "preset">("custom");

  // Reset local state when opened
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWeights(initialWeights ?? { CODE: 25, TEST: 25, DOCUMENT: 25, RESEARCH: 25 });
      setInitMode("custom");
    }
  }, [isOpen, initialWeights]);

  const handleChange = (criterion: ContributionCriterion, val: number) => {
    setWeights((prev) => ({ ...prev, [criterion]: val }));
  };

  const handleApply = () => {
    onApply(teamId, weights);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-none sm:max-w-2xl lg:max-w-4xl max-h-[calc(100dvh-2rem)] p-0 gap-0 overflow-hidden bg-background">
        <DialogHeader className="p-6 pb-4 bg-muted/30 border-b">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            Tùy chỉnh trọng số
            <span className="text-muted-foreground font-medium">—</span>
            <span className="text-primary">{teamName}</span>
          </DialogTitle>
          <DialogDescription className="text-sm font-medium">
            Project: <span className="text-foreground">{projectName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)] overflow-y-auto md:overflow-hidden">
          {/* Left panel: Mode selection */}
          <div className="w-full border-b md:border-b-0 md:border-r bg-muted/10 p-4 sm:p-6 md:overflow-y-auto">
            <h4 className="text-sm font-bold mb-4">Cấu hình ban đầu</h4>
            <RadioGroup value={initMode} onValueChange={(v: "custom" | "preset") => setInitMode(v)} className="space-y-3">
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="custom" id="r-custom" className="mt-1" />
                <Label htmlFor="r-custom" className="font-semibold leading-tight cursor-pointer">
                  Tự định nghĩa
                  <p className="text-xs font-normal text-muted-foreground mt-1">
                    Nhập tay các trọng số theo ý muốn.
                  </p>
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="preset" id="r-preset" className="mt-1" />
                <Label htmlFor="r-preset" className="font-semibold leading-tight cursor-pointer">
                  Chọn mẫu
                  <p className="text-xs font-normal text-muted-foreground mt-1">
                    Sử dụng các khuôn mẫu dựng sẵn.
                  </p>
                </Label>
              </div>
            </RadioGroup>

            {initMode === "preset" && (
              <div className="mt-4 space-y-2 pl-6">
                {WEIGHT_PRESETS.map((preset) => (
                  <Button
                    key={preset.id}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start h-auto py-2 px-3 text-left"
                    onClick={() => setWeights({ ...preset.weights })}
                  >
                    <div className="w-full">
                      <div className="font-semibold text-xs">{preset.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate w-full">{preset.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Right panel: Editors */}
          <ScrollArea className="min-w-0 min-h-0 p-4 sm:p-6">
            <div className="space-y-2 mb-6">
              <WeightEditor criterion="CODE" value={weights.CODE} onChange={(val) => handleChange("CODE", val)} />
              <WeightEditor criterion="TEST" value={weights.TEST} onChange={(val) => handleChange("TEST", val)} />
              <WeightEditor criterion="DOCUMENT" value={weights.DOCUMENT} onChange={(val) => handleChange("DOCUMENT", val)} />
              <WeightEditor criterion="RESEARCH" value={weights.RESEARCH} onChange={(val) => handleChange("RESEARCH", val)} />
            </div>

            <WeightTotalStatus weights={weights} />
          </ScrollArea>
        </div>

        <DialogFooter className="p-4 border-t bg-muted/30">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleApply} disabled={!isWeightValid(weights)}>
            Áp dụng cho team
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
