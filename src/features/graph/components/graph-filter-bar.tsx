"use client";

import {
  UserIcon,
  LayersIcon,
  AlertTriangleIcon,
  DownloadIcon,
  RefreshCwIcon,
  SparklesIcon,
  NetworkIcon,
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
  viewMode = "FLOW",
  onSelectViewMode,
}: GraphFilterBarProps) {
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

  return (
    <div className="p-4 rounded-3xl bg-card border border-border/80 shadow-xs space-y-3.5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="space-y-1 min-w-[240px]">
            <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-blue-500" />
              Lọc theo thành viên:
            </label>
            <CustomSelect
              value={selectedStudentId}
              onChange={onSelectStudent}
              options={studentOptions}
            />
          </div>

          <div className="space-y-1 min-w-[220px]">
            <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
              <LayersIcon className="w-3.5 h-3.5 text-purple-500" />
              Chu kỳ Sprint:
            </label>
            <CustomSelect
              value={selectedSprint}
              onChange={onSelectSprint}
              options={sprintOptions}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onSelectViewMode && (
            <div className="flex items-center gap-1 p-1 bg-primary/10 rounded-2xl border border-primary/20 text-xs">
              <button
                onClick={() => onSelectViewMode("FLOW")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold transition-all cursor-pointer ${viewMode === "FLOW"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-primary hover:bg-primary/10"
                  }`}
              >
                <SparklesIcon className="w-3.5 h-3.5" />
                <span>Pipeline Flow</span>
              </button>
              <button
                onClick={() => onSelectViewMode("GRAPH")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold transition-all cursor-pointer ${viewMode === "GRAPH"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-primary hover:bg-primary/10"
                  }`}
              >
                <NetworkIcon className="w-3.5 h-3.5" />
                <span>Neo4j Graph</span>
              </button>
            </div>
          )}

          <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-2xl border border-border/60 text-xs">
            <button
              onClick={() => onSelectFilterType("ALL")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${filterType === "ALL"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Toàn bộ
            </button>
            <button
              onClick={() => onSelectFilterType("ANOMALIES_ONLY")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${filterType === "ANOMALIES_ONLY"
                ? "bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/40 shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <AlertTriangleIcon className="w-3.5 h-3.5 text-red-500" />
              Cảnh báo ({anomaliesCount})
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-9 text-xs rounded-xl gap-1.5 cursor-pointer font-semibold text-muted-foreground hover:text-foreground"
            title="Đặt lại bộ lọc"
          >
            <RefreshCwIcon className="w-3.5 h-3.5" />
            Đặt lại
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="h-9 text-xs rounded-xl gap-1.5 cursor-pointer font-semibold"
          >
            <DownloadIcon className="w-3.5 h-3.5 text-primary" />
            Xuất Graph
          </Button>
        </div>
      </div>
    </div>
  );
}
