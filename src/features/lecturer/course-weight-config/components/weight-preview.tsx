"use client";

import { cn } from "@/lib/utils";
import type { ContributionWeights } from "../types/course-weight-config";

interface WeightPreviewProps {
  weights: ContributionWeights;
  className?: string;
}

export function WeightPreview({ weights, className }: WeightPreviewProps) {
  const total = weights.CODE + weights.TEST + weights.DOCUMENT + weights.RESEARCH;
  
  // Calculate relative percentages to avoid overflow if total > 100
  // Or just clamp to what fits in 100%
  const codeW = (weights.CODE / Math.max(total, 100)) * 100;
  const testW = (weights.TEST / Math.max(total, 100)) * 100;
  const docW = (weights.DOCUMENT / Math.max(total, 100)) * 100;
  const resW = (weights.RESEARCH / Math.max(total, 100)) * 100;

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      <div className="flex w-full h-3 rounded-full overflow-hidden bg-muted">
        <div style={{ width: `${codeW}%` }} className="bg-indigo-500 transition-all duration-300" title={`CODE: ${weights.CODE}%`} />
        <div style={{ width: `${testW}%` }} className="bg-blue-500 transition-all duration-300" title={`TEST: ${weights.TEST}%`} />
        <div style={{ width: `${docW}%` }} className="bg-amber-500 transition-all duration-300" title={`DOCUMENT: ${weights.DOCUMENT}%`} />
        <div style={{ width: `${resW}%` }} className="bg-emerald-500 transition-all duration-300" title={`RESEARCH: ${weights.RESEARCH}%`} />
      </div>
      <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground font-bold px-1">
        <span>C:{weights.CODE}</span>
        <span>T:{weights.TEST}</span>
        <span>D:{weights.DOCUMENT}</span>
        <span>R:{weights.RESEARCH}</span>
      </div>
    </div>
  );
}
