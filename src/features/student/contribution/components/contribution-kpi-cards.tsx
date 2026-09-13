"use client";

import {
  Code2Icon,
  FlaskConicalIcon,
  FileTextIcon,
  BrainCircuitIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  SLICE_WEIGHT_FIELDS,
  SLICE_WEIGHT_LABELS,
  type SliceWeightField,
  formatContributionPercent,
} from "@/features/lecturer/contribution/lib/contribution-utils";
import type { ContributionSliceWeightValues } from "../types/contribution";
import { cn } from "@/lib/utils";

interface ContributionKPICardsProps {
  sliceWeights: ContributionSliceWeightValues;
}

function getSliceIcon(field: SliceWeightField) {
  switch (field) {
    case "codeWeight":
      return <Code2Icon className="size-4.5" />;
    case "testWeight":
      return <FlaskConicalIcon className="size-4.5" />;
    case "documentWeight":
      return <FileTextIcon className="size-4.5" />;
    case "researchWeight":
      return <BrainCircuitIcon className="size-4.5" />;
  }
}

function getSliceBoxStyle(field: SliceWeightField) {
  switch (field) {
    case "codeWeight":
      return {
        boxClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
        borderClass: "border-blue-500/20",
      };
    case "testWeight":
      return {
        boxClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
        borderClass: "border-emerald-500/20",
      };
    case "documentWeight":
      return {
        boxClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
        borderClass: "border-amber-500/20",
      };
    case "researchWeight":
      return {
        boxClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
        borderClass: "border-purple-500/20",
      };
  }
}

export function ContributionKPICards({ sliceWeights }: ContributionKPICardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {SLICE_WEIGHT_FIELDS.map((field) => {
        const style = getSliceBoxStyle(field);
        const info = SLICE_WEIGHT_LABELS[field];
        return (
          <Card
            key={field}
            className={cn(
              "rounded-2xl border bg-card p-4 shadow-xs transition-all hover:shadow-md hover:-translate-y-0.5",
              style.borderClass
            )}
          >
            <CardContent className="space-y-3 p-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">
                  {info.title}
                </span>
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-xl",
                    style.boxClass
                  )}
                >
                  {getSliceIcon(field)}
                </div>
              </div>
              <div>
                <span className="font-mono text-2xl font-black text-foreground">
                  {formatContributionPercent(sliceWeights?.[field])}
                </span>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {info.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
