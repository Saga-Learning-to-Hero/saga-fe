"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcwIcon } from "lucide-react";
import type { ContributionWeights, ContributionCriterion } from "../types/course-weight-config";
import { WeightEditor } from "./weight-editor";
import { WeightTotalStatus } from "./weight-total-status";

interface ClassDefaultWeightCardProps {
  weights: ContributionWeights;
  onChange: (criterion: ContributionCriterion, value: number) => void;
  onReset: () => void;
  isDirty: boolean;
  totalTeams: number;
}

export function ClassDefaultWeightCard({
  weights,
  onChange,
  onReset,
  isDirty,
  totalTeams,
}: ClassDefaultWeightCardProps) {

  return (
    <Card className="surface-card border-primary/20 shadow-saga-sm overflow-hidden relative">
      {/* Decorative top border */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-accent" />
      
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              Cấu hình của lớp
              {isDirty && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Có thay đổi chưa lưu">
                <span className="sr-only">Có thay đổi chưa lưu</span>
              </span>}
            </CardTitle>
            <CardDescription className="mt-1.5">
              Áp dụng chung một bộ trọng số cho tất cả {totalTeams} team trong lớp.
            </CardDescription>
          </div>
          <div className="grid grid-cols-1 sm:flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onReset} disabled={!isDirty}>
              <RotateCcwIcon className="w-4 h-4 mr-1.5" />
              Khôi phục gốc
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-1">
        <WeightEditor criterion="CODE" value={weights.CODE} onChange={(val) => onChange("CODE", val)} />
        <WeightEditor criterion="TEST" value={weights.TEST} onChange={(val) => onChange("TEST", val)} />
        <WeightEditor criterion="DOCUMENT" value={weights.DOCUMENT} onChange={(val) => onChange("DOCUMENT", val)} />
        <WeightEditor criterion="RESEARCH" value={weights.RESEARCH} onChange={(val) => onChange("RESEARCH", val)} />
      </CardContent>

      <CardFooter className="bg-muted/30 border-t pt-5">
        <div className="w-full max-w-md ml-auto">
          <WeightTotalStatus weights={weights} />
        </div>
      </CardFooter>
    </Card>
  );
}
