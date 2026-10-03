"use client";

import { useState } from "react";
import {
  UserIcon,
  LayersIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
  FilterIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XIcon,
  SearchIcon,
  ListTreeIcon,
  TablePropertiesIcon,
} from "lucide-react";
import { CustomSelect, type CustomSelectOption } from "@/components/common/custom-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PipelineAnomalyFilterType } from "../types/pipeline";

interface PipelineFilterBarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  selectedStudentId: string;
  onSelectStudent: (studentId: string) => void;
  selectedSprint: string;
  onSelectSprint: (sprint: string) => void;
  anomalyType: PipelineAnomalyFilterType;
  onSelectAnomalyType: (type: PipelineAnomalyFilterType) => void;
  onReset: () => void;
  memberOptions: CustomSelectOption[];
  sprintOptions: CustomSelectOption[];
  anomalyOptions: CustomSelectOption[];
  viewMode: "FLOW" | "MATRIX";
  onSelectViewMode: (mode: "FLOW" | "MATRIX") => void;
  repositoryFiltersNode?: React.ReactNode;
  activeRepositoryFiltersCount?: number;
  repositoryFilterTags?: Array<{
    key: string;
    label: string;
    onClear: () => void;
  }>;
}

export function PipelineFilterBar({
  searchQuery,
  onSearchQueryChange,
  selectedStudentId,
  onSelectStudent,
  selectedSprint,
  onSelectSprint,
  anomalyType,
  onSelectAnomalyType,
  onReset,
  memberOptions,
  sprintOptions,
  anomalyOptions,
  viewMode,
  onSelectViewMode,
  repositoryFiltersNode,
  activeRepositoryFiltersCount = 0,
  repositoryFilterTags = [],
}: PipelineFilterBarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const activeFiltersCount =
    (selectedStudentId !== "ALL" ? 1 : 0) +
    (selectedSprint !== "ALL" ? 1 : 0) +
    (anomalyType !== "ALL" ? 1 : 0) +
    activeRepositoryFiltersCount;

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-border/80 bg-card p-2 shadow-xs sm:p-2.5">
        <div className="flex min-w-[240px] max-w-md flex-1 items-center gap-2 relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Tìm Task key, title, người làm..."
            className="h-9 pl-8 text-xs rounded-xl bg-muted/40 border-border/60 w-full"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchQueryChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <XIcon className="size-3" />
            </button>
          )}
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-primary/20 bg-primary/10 p-1 text-xs">
            <button
              onClick={() => onSelectViewMode("FLOW")}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 font-extrabold transition-all ${viewMode === "FLOW"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-primary hover:bg-primary/10"
                }`}
            >
              <ListTreeIcon className="size-3.5" />
              <span className="hidden sm:inline">Luồng công việc</span>
            </button>
            <button
              onClick={() => onSelectViewMode("MATRIX")}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 font-extrabold transition-all ${viewMode === "MATRIX"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-primary hover:bg-primary/10"
                }`}
            >
              <TablePropertiesIcon className="size-3.5" />
              <span className="hidden sm:inline">Ma trận đối soát</span>
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`h-9 cursor-pointer gap-1.5 rounded-xl text-xs font-bold transition-all ${isFilterOpen || activeFiltersCount > 0
              ? "border-primary/50 bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <FilterIcon className="size-3.5" />
            <span>Bộ lọc</span>
            {activeFiltersCount > 0 && (
              <span className="flex size-4 items-center justify-center rounded-full bg-primary font-mono text-xs text-primary-foreground">
                {activeFiltersCount}
              </span>
            )}
            {isFilterOpen ? (
              <ChevronUpIcon className="size-3.5 opacity-60" />
            ) : (
              <ChevronDownIcon className="size-3.5 opacity-60" />
            )}
          </Button>

          {(activeFiltersCount > 0 || searchQuery) && (
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
        </div>
      </div>

      {isFilterOpen && (
        <div className="animate-in fade-in-0 slide-in-from-top-2 rounded-xl border border-primary/20 bg-card p-3 shadow-xs duration-200 sm:p-4">
          <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-1.5">
              <label
                htmlFor="pipeline-member-filter"
                className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground"
              >
                <UserIcon className="size-3.5 text-primary" />
                Thành viên
              </label>
              <CustomSelect
                id="pipeline-member-filter"
                value={selectedStudentId}
                onChange={onSelectStudent}
                options={memberOptions}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="pipeline-sprint-filter"
                className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground"
              >
                <LayersIcon className="size-3.5 text-primary" />
                Sprint
              </label>
              <CustomSelect
                id="pipeline-sprint-filter"
                value={selectedSprint}
                onChange={onSelectSprint}
                options={sprintOptions}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="pipeline-anomaly-filter"
                className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground"
              >
                <AlertTriangleIcon className="size-3.5 text-primary" />
                Phân loại Task
              </label>
              <CustomSelect
                id="pipeline-anomaly-filter"
                value={anomalyType}
                onChange={(val) => onSelectAnomalyType(val as PipelineAnomalyFilterType)}
                options={anomalyOptions}
              />
            </div>

            {repositoryFiltersNode && (
              <div className="space-y-1.5">
                {repositoryFiltersNode}
              </div>
            )}
          </div>
        </div>
      )}

      {!isFilterOpen && activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-1 text-xs">
          <span className="text-xs font-bold text-muted-foreground">Đang lọc theo:</span>
          {selectedStudentId !== "ALL" && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 font-medium text-primary">
              <span>
                Thành viên: {memberOptions.find((o) => o.value === selectedStudentId)?.label}
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
                Sprint: {sprintOptions.find((o) => o.value === selectedSprint)?.label}
              </span>
              <button
                onClick={() => onSelectSprint("ALL")}
                className="ml-0.5 cursor-pointer hover:text-foreground"
              >
                <XIcon className="size-3" />
              </button>
            </span>
          )}
          {anomalyType !== "ALL" && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 font-medium text-primary">
              <span>
                Phân loại: {anomalyOptions.find((o) => o.value === anomalyType)?.label}
              </span>
              <button
                onClick={() => onSelectAnomalyType("ALL")}
                className="ml-0.5 cursor-pointer hover:text-foreground"
              >
                <XIcon className="size-3" />
              </button>
            </span>
          )}
          {repositoryFilterTags.map((tag) => (
            <span
              key={tag.key}
              className="inline-flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 font-medium text-primary"
            >
              <span>{tag.label}</span>
              <button onClick={tag.onClear} className="ml-0.5 cursor-pointer hover:text-foreground">
                <XIcon className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
