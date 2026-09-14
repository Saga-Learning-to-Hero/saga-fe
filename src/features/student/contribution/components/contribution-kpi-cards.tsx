"use client";

import {
  Code2Icon,
  FlaskConicalIcon,
  FileTextIcon,
  BrainCircuitIcon,
  InfoIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  type SliceWeightField,
  formatContributionPercent,
} from "@/features/lecturer/contribution/lib/contribution-utils";
import type { ContributionSliceWeightValues } from "../types/contribution";
import { cn } from "@/lib/utils";

interface ContributionKPICardsProps {
  sliceWeights: ContributionSliceWeightValues;
}

const FIELD_CONFIG: Record<
  SliceWeightField,
  { title: string; subtitle: string; description: string }
> = {
  codeWeight: {
    title: "Lập trình (Code)",
    subtitle: "Trọng số mã nguồn",
    description: "Quy đổi từ commits, PR merges và task phát triển phần mềm",
  },
  testWeight: {
    title: "Kiểm thử (Testing)",
    subtitle: "Trọng số kiểm thử",
    description: "Quy đổi từ test cases, bug reports và kịch bản kiểm thử",
  },
  documentWeight: {
    title: "Tài liệu (Documentation)",
    subtitle: "Trọng số tài liệu",
    description: "Quy đổi từ tài liệu SRS, thiết kế SDS, biên bản và báo cáo",
  },
  researchWeight: {
    title: "Nghiên cứu (Research)",
    subtitle: "Trọng số nghiên cứu",
    description: "Quy đổi từ báo cáo PoC, nghiên cứu công nghệ và giải pháp",
  },
};

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
  const researchWeightValue = Number(sliceWeights?.researchWeight) || 0;
  const isResearchActive = researchWeightValue > 0;

  const displayFields: SliceWeightField[] = isResearchActive
    ? ["codeWeight", "testWeight", "documentWeight", "researchWeight"]
    : ["codeWeight", "testWeight", "documentWeight"];

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-extrabold text-foreground">
            Trọng số quy đổi công sức
          </h3>
          <span className="text-[11px] text-muted-foreground font-medium">
            (Cấu hình dự án Slicing Pie)
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Trọng số quy đổi chung của dự án, không phải tỷ lệ đóng góp của từng cá nhân.
        </p>
      </div>

      <div
        className={cn(
          "grid gap-4",
          isResearchActive
            ? "grid-cols-2 md:grid-cols-4"
            : "grid-cols-1 sm:grid-cols-3"
        )}
      >
        {displayFields.map((field) => {
          const style = getSliceBoxStyle(field);
          const config = FIELD_CONFIG[field];
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
                  <div>
                    <span className="text-xs font-bold text-foreground block">
                      {config.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {config.subtitle}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "flex size-8 items-center justify-center rounded-xl shrink-0",
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
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    {config.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!isResearchActive && (
        <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3.5 py-2 text-xs text-muted-foreground">
          <InfoIcon className="size-3.5 text-muted-foreground shrink-0" />
          <span>
            Nghiên cứu (Research): <strong>0%</strong> — Chưa áp dụng trong cấu hình hiện tại của dự án.
          </span>
        </div>
      )}
    </div>
  );
}
