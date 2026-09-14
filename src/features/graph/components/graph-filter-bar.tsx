"use client";

import { useState } from "react";
import {
  UserIcon,
  LayersIcon,
  AlertTriangleIcon,
  DownloadIcon,
  RefreshCwIcon,
  SparklesIcon,
  NetworkIcon,
  FilterIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XIcon,
} from "lucide-react";
import { CustomSelect, type CustomSelectOption } from "@/components/common/custom-select";
import { Button } from "@/components/ui/button";

export type GraphFilterType = "ALL" | "ANOMALIES_ONLY" | "TASKS_COMMITS";

interface GraphFilterBarProps {
  selectedStudentId: string;
  onSelectStudent: (studentId: string) => void;
  selectedSprint: string;
  onSelectSprint: (sprint: string) => void;
  filterType: GraphFilterType;
  onSelectFilterType: (type: GraphFilterType) => void;
  onExport: () => void;
  onReset: () => void;
  anomaliesCount: number;
  memberOptions: CustomSelectOption[];
  sprintOptions: CustomSelectOption[];
  anomalyLabel?: string;
  viewMode?: "FLOW" | "GRAPH";
  onSelectViewMode?: (mode: "FLOW" | "GRAPH") => void;
  groupSelector?: React.ReactNode;
  extraCollapsibleContent?: React.ReactNode;
}

export function GraphFilterBar({
  selectedStudentId,
  onSelectStudent,
  selectedSprint,
  onSelectSprint,
  filterType,
  onSelectFilterType,
  onExport,
  onReset,
  anomaliesCount,
  memberOptions,
  sprintOptions,
  anomalyLabel = "Chỉ cảnh báo",
  viewMode = "GRAPH",
  onSelectViewMode,
  groupSelector,
  extraCollapsibleContent,
}: GraphFilterBarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const studentOptions = [
    { value: "ALL", label: `Tất cả thành viên nhóm (${Math.max(memberOptions.length, 0)} người)` },
    ...memberOptions,
  ];

  const resolvedSprintOptions = [{ value: "ALL", label: "Tất cả các Sprint" }, ...sprintOptions];

  const activeFiltersCount =
    (selectedStudentId !== "ALL" ? 1 : 0) + (selectedSprint !== "ALL" ? 1 : 0);

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-border/80 bg-card p-2 shadow-xs sm:p-2.5">
        {groupSelector && (
          <div className="flex min-w-[240px] max-w-md flex-1 items-center gap-2">
            {groupSelector}
          </div>
        )}

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {onSelectViewMode && (
            <div className="flex items-center gap-1 rounded-xl border border-primary/20 bg-primary/10 p-1 text-xs">
              <button
                onClick={() => onSelectViewMode("GRAPH")}
                className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 font-extrabold transition-all ${
                  viewMode === "GRAPH"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-primary hover:bg-primary/10"
                }`}
              >
                <NetworkIcon className="size-3.5" />
                <span>Neo4j Graph</span>
              </button>
              <button
                onClick={() => onSelectViewMode("FLOW")}
                className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 font-extrabold transition-all ${
                  viewMode === "FLOW"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-primary hover:bg-primary/10"
                }`}
              >
                <SparklesIcon className="size-3.5" />
                <span>Pipeline Flow</span>
              </button>
            </div>
          )}

          <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-muted/60 p-1 text-xs">
            <button
              onClick={() => onSelectFilterType("ALL")}
              className={`cursor-pointer rounded-lg px-2.5 py-1.5 font-bold transition-colors ${
                filterType === "ALL"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => onSelectFilterType("ANOMALIES_ONLY")}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-bold transition-colors ${
                filterType === "ANOMALIES_ONLY"
                  ? "border border-destructive/40 bg-destructive/15 text-destructive shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <AlertTriangleIcon className="size-3.5 text-destructive" />
              <span>
                {anomalyLabel} ({anomaliesCount})
              </span>
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`h-9 cursor-pointer gap-1.5 rounded-xl text-xs font-bold transition-all ${
              isFilterOpen || activeFiltersCount > 0
                ? "border-primary/50 bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FilterIcon className="size-3.5" />
            <span>Bộ lọc</span>
            {activeFiltersCount > 0 && (
              <span className="flex size-4 items-center justify-center rounded-full bg-primary font-mono text-[10px] text-primary-foreground">
                {activeFiltersCount}
              </span>
            )}
            {isFilterOpen ? (
              <ChevronUpIcon className="size-3.5 opacity-60" />
            ) : (
              <ChevronDownIcon className="size-3.5 opacity-60" />
            )}
          </Button>

          {(selectedStudentId !== "ALL" || selectedSprint !== "ALL" || filterType !== "ALL") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-9 cursor-pointer gap-1 rounded-xl text-xs text-muted-foreground hover:text-foreground"
              title="Đặt lại bộ lọc"
            >
              <RefreshCwIcon className="size-3" />
              <span className="hidden sm:inline">Đặt lại</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="h-9 cursor-pointer gap-1.5 rounded-xl text-xs font-semibold"
          >
            <DownloadIcon className="size-3.5 text-muted-foreground" />
            <span className="hidden md:inline">Xuất dữ liệu</span>
          </Button>
        </div>
      </div>

      {isFilterOpen && (
        <div className="animate-in fade-in-0 slide-in-from-top-2 space-y-3 rounded-2xl border border-primary/20 bg-card p-4 shadow-xs duration-200">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              <div className="min-w-[220px] max-w-xs flex-1 space-y-1">
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                  <UserIcon className="size-3.5 text-primary" />
                  Lọc theo Thành viên:
                </label>
                <CustomSelect
                  value={selectedStudentId}
                  onChange={onSelectStudent}
                  options={studentOptions}
                />
              </div>

              <div className="min-w-[200px] max-w-xs flex-1 space-y-1">
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                  <LayersIcon className="size-3.5 text-primary" />
                  Lọc theo Sprint:
                </label>
                <CustomSelect
                  value={selectedSprint}
                  onChange={onSelectSprint}
                  options={resolvedSprintOptions}
                />
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="cursor-pointer self-end text-xs text-muted-foreground hover:text-foreground md:self-center"
              >
                <RefreshCwIcon className="mr-1 size-3.5" />
                Xóa bộ lọc
              </Button>
            )}
          </div>

          {extraCollapsibleContent}
        </div>
      )}

      {!isFilterOpen && activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-1 text-xs">
          <span className="text-[11px] font-bold text-muted-foreground">Đang lọc theo:</span>
          {selectedStudentId !== "ALL" && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 font-medium text-primary">
              <span>
                Thành viên: {studentOptions.find((o) => o.value === selectedStudentId)?.label}
              </span>
              <button
                onClick={() => onSelectStudent("ALL")}
                className="ml-0.5 cursor-pointer hover:text-foreground"
              >
                <XIcon className="size-3" />
              </button>
            </span>
          )}
          {selectedSprint !== "ALL" && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 font-medium text-primary">
              <span>
                Sprint: {resolvedSprintOptions.find((o) => o.value === selectedSprint)?.label}
              </span>
              <button
                onClick={() => onSelectSprint("ALL")}
                className="ml-0.5 cursor-pointer hover:text-foreground"
              >
                <XIcon className="size-3" />
              </button>
            </span>
          )}
          <button
            onClick={onReset}
            className="ml-1 cursor-pointer text-[11px] text-muted-foreground underline hover:text-foreground"
          >
            Xóa tất cả
          </button>
        </div>
      )}
    </div>
  );
}
