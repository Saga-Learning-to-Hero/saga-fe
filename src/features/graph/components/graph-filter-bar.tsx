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
import { CustomSelect } from "@/components/common/custom-select";
import { Button } from "@/components/ui/button";
import { MOCK_GRAPH_STUDENTS } from "../data/mock-graph-data";

interface GraphFilterBarProps {
  selectedStudentId: string;
  onSelectStudent: (studentId: string) => void;
  selectedSprint: string;
  onSelectSprint: (sprint: string) => void;
  filterType: "ALL" | "ANOMALIES_ONLY" | "TASKS_COMMITS";
  onSelectFilterType: (type: "ALL" | "ANOMALIES_ONLY" | "TASKS_COMMITS") => void;
  onExport: () => void;
  onReset: () => void;
  anomaliesCount: number;
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
  viewMode = "GRAPH",
  onSelectViewMode,
  groupSelector,
  extraCollapsibleContent,
}: GraphFilterBarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const studentOptions = [
    { value: "ALL", label: "Tất cả thành viên nhóm (5 người)" },
    ...MOCK_GRAPH_STUDENTS.map((s) => ({
      value: s.id,
      label: s.name,
      subLabel: `${s.studentCode} (${s.role})`,
    })),
  ];

  const sprintOptions = [
    { value: "ALL", label: "Tất cả các Sprint" },
    { value: "sprint-01", label: "Sprint 1 - Foundation & Integration", subLabel: "Đã hoàn thành" },
    { value: "sprint-02", label: "Sprint 2 - Slicing Pie & Traceability", subLabel: "Đang diễn ra" },
  ];

  const activeFiltersCount =
    (selectedStudentId !== "ALL" ? 1 : 0) + (selectedSprint !== "ALL" ? 1 : 0);

  return (
    <div className="space-y-2.5">
      {/* ── Thanh điều khiển tinh gọn 1 hàng (Unified Control Bar) ── */}
      <div className="p-2 sm:p-2.5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
        {/* Khối bên trái: Group selector hoặc Project Info */}
        {groupSelector && (
          <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md">
            {groupSelector}
          </div>
        )}

        {/* Khối bên phải: Chuyển đổi đồ thị, Lọc cảnh báo, Nút mở rộng bộ lọc, Thao tác */}
        <div className="flex flex-wrap items-center gap-2 ml-auto">
          {onSelectViewMode && (
            <div className="flex items-center gap-1 p-1 bg-primary/10 rounded-xl border border-primary/20 text-xs">
              <button
                onClick={() => onSelectViewMode("GRAPH")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-extrabold transition-all cursor-pointer ${viewMode === "GRAPH"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-primary hover:bg-primary/10"
                  }`}
              >
                <NetworkIcon className="w-3.5 h-3.5" />
                <span>Neo4j Graph</span>
              </button>
              <button
                onClick={() => onSelectViewMode("FLOW")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-extrabold transition-all cursor-pointer ${viewMode === "FLOW"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-primary hover:bg-primary/10"
                  }`}
              >
                <SparklesIcon className="w-3.5 h-3.5" />
                <span>Pipeline Flow</span>
              </button>
            </div>
          )}

          <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-xl border border-border/60 text-xs">
            <button
              onClick={() => onSelectFilterType("ALL")}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${filterType === "ALL"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => onSelectFilterType("ANOMALIES_ONLY")}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${filterType === "ANOMALIES_ONLY"
                  ? "bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/40 shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <AlertTriangleIcon className="w-3.5 h-3.5 text-red-500" />
              <span>Chỉ cảnh báo ({anomaliesCount})</span>
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`h-9 text-xs rounded-xl gap-1.5 cursor-pointer font-bold transition-all ${isFilterOpen || activeFiltersCount > 0
                ? "border-primary/50 bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <FilterIcon className="w-3.5 h-3.5" />
            <span>Bộ lọc</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-mono">
                {activeFiltersCount}
              </span>
            )}
            {isFilterOpen ? (
              <ChevronUpIcon className="w-3.5 h-3.5 opacity-60" />
            ) : (
              <ChevronDownIcon className="w-3.5 h-3.5 opacity-60" />
            )}
          </Button>

          {(selectedStudentId !== "ALL" || selectedSprint !== "ALL" || filterType !== "ALL") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-9 text-xs rounded-xl gap-1 cursor-pointer text-muted-foreground hover:text-foreground"
              title="Đặt lại bộ lọc"
            >
              <RefreshCwIcon className="w-3 h-3" />
              <span className="hidden sm:inline">Đặt lại</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="h-9 text-xs rounded-xl gap-1.5 cursor-pointer font-semibold"
          >
            <DownloadIcon className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="hidden md:inline">Xuất dữ liệu</span>
          </Button>
        </div>
      </div>

      {/* ── Bảng Bộ Lọc Thu Gọn (Collapsible Filter Panel) ── */}
      {isFilterOpen && (
        <div className="p-4 rounded-2xl bg-card border border-primary/20 shadow-xs space-y-3 animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="space-y-1 min-w-[220px] flex-1 max-w-xs">
                <label className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-blue-500" />
                  Lọc theo Thành viên:
                </label>
                <CustomSelect
                  value={selectedStudentId}
                  onChange={onSelectStudent}
                  options={studentOptions}
                />
              </div>

              <div className="space-y-1 min-w-[200px] flex-1 max-w-xs">
                <label className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
                  <LayersIcon className="w-3.5 h-3.5 text-purple-500" />
                  Lọc theo Sprint:
                </label>
                <CustomSelect
                  value={selectedSprint}
                  onChange={onSelectSprint}
                  options={sprintOptions}
                />
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer self-end md:self-center"
              >
                <RefreshCwIcon className="w-3.5 h-3.5 mr-1" />
                Xóa bộ lọc
              </Button>
            )}
          </div>

          {extraCollapsibleContent}
        </div>
      )}

      {/* ── Chip gắn nhãn bộ lọc đang áp dụng (khi thu gọn) ── */}
      {!isFilterOpen && activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs px-1">
          <span className="text-[11px] font-bold text-muted-foreground">Đang lọc theo:</span>
          {selectedStudentId !== "ALL" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 font-medium">
              <span>
                Thành viên: {studentOptions.find((o) => o.value === selectedStudentId)?.label.split(" (")[0]}
              </span>
              <button
                onClick={() => onSelectStudent("ALL")}
                className="hover:text-foreground cursor-pointer ml-0.5"
              >
                <XIcon className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedSprint !== "ALL" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-medium">
              <span>
                Sprint: {sprintOptions.find((o) => o.value === selectedSprint)?.label.split(" - ")[0]}
              </span>
              <button
                onClick={() => onSelectSprint("ALL")}
                className="hover:text-foreground cursor-pointer ml-0.5"
              >
                <XIcon className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={onReset}
            className="text-[11px] text-muted-foreground hover:text-foreground underline cursor-pointer ml-1"
          >
            Xóa tất cả
          </button>
        </div>
      )}
    </div>
  );
}
