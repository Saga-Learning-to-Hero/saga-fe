"use client";

import { LayersIcon } from "lucide-react";
import { CustomSelect } from "@/components/common/custom-select";
import type { JiraSourceSummary } from "../types/jira-sources";
import { cn } from "@/lib/utils";

interface JiraSourceSwitcherProps {
  sources: JiraSourceSummary[];
  value?: string;
  onChange: (integrationId: string) => void;
  className?: string;
  compact?: boolean;
}

export function JiraSourceSwitcher({
  sources,
  value,
  onChange,
  className,
  compact = false,
}: JiraSourceSwitcherProps) {
  if (sources.length < 2) return null;

  return (
    <div
      className={cn(
        compact
          ? "min-w-60"
          : "flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-500/30 bg-blue-500/[0.04] px-4 py-3",
        className
      )}
    >
      <div className={cn("flex items-center gap-2.5", !compact && "flex-wrap")}>
        {!compact && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <LayersIcon className="size-4 text-blue-500" />
            <span>Nguồn Jira đang xem</span>
          </div>
        )}
        <div className={compact ? "w-full" : "w-72"}>
          <CustomSelect
            id={compact ? "jira-source-switcher-compact" : "jira-source-switcher"}
            value={value || ""}
            onChange={onChange}
            options={sources.map((source) => ({
              value: source.integrationId,
              label: `${source.projectKey || "JIRA"} · ${source.siteName}`,
              subLabel: source.boardId ? `Board: ${source.boardId}` : "Board mặc định",
            }))}
            className="text-xs"
          />
        </div>
      </div>
      {!compact && (
        <span className="text-[11px] text-muted-foreground">
          Dữ liệu Task và Sprint chỉ thuộc nguồn Jira đang chọn.
        </span>
      )}
    </div>
  );
}
