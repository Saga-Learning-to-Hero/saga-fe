"use client";

import { useMemo } from "react";
import {
  LayersIcon,
  ActivityIcon,
  FingerprintIcon,
  UsersIcon,
  ArrowLeftIcon,
  CalendarIcon,
  SlidersHorizontalIcon,
  UserIcon,
} from "lucide-react";
import { CustomSelect, type CustomSelectOption } from "@/components/common/custom-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { GraphDrillDownStudent } from "../lib/student-profile-id";

export type Neo4jTabMode = "OVERVIEW" | "ACTIVITY" | "ATTRIBUTION" | "PEER_REVIEW";

export interface Neo4jTabBarProps {
  tab: Neo4jTabMode;
  onTabChange: (tab: Neo4jTabMode) => void;
  sprintOptions: CustomSelectOption[];
  selectedSprintId?: string | null;
  onSprintChange: (sprintId: string) => void;
  drillDownStudent?: GraphDrillDownStudent | null;
  onBackToOverview?: () => void;
  selectId?: string;
  scopeMode?: "COMPACT" | "FULL";
  onScopeModeChange?: (mode: "COMPACT" | "FULL") => void;
  maxNodes?: number | null;
  onMaxNodesChange?: (max: number | null) => void;
  memberOptions?: CustomSelectOption[];
  selectedStudentId?: string | null;
  onStudentChange?: (studentId: string) => void;
}

export function Neo4jTabBar({
  tab,
  onTabChange,
  sprintOptions,
  selectedSprintId,
  onSprintChange,
  drillDownStudent,
  onBackToOverview,
  selectId = "neo4j-tab-sprint-select",
  scopeMode = "COMPACT",
  onScopeModeChange,
  maxNodes = 100,
  onMaxNodesChange,
  memberOptions,
  selectedStudentId,
  onStudentChange,
}: Neo4jTabBarProps) {
  const allSprintOptions: CustomSelectOption[] = useMemo(
    () => [{ value: "ALL", label: "Tất cả Sprint (Toàn dự án)" }, ...sprintOptions],
    [sprintOptions]
  );

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card p-2.5 shadow-2xs">
        {drillDownStudent ? (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onBackToOverview}
              className="h-8.5 rounded-xl gap-1.5 text-xs font-bold cursor-pointer"
            >
              <ArrowLeftIcon className="size-3.5" />
              <span>Quay lại Tổng quan</span>
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Chi tiết đóng góp:</span>
              <Badge variant="secondary" className="font-bold text-xs">
                {drillDownStudent.label}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border/60 bg-muted/60 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => onTabChange("OVERVIEW")}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${tab === "OVERVIEW"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <LayersIcon className="size-3.5 text-primary" />
              <span>Tổng quan nhóm</span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange("ACTIVITY")}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${tab === "ACTIVITY"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <ActivityIcon className="size-3.5 text-teal-600 dark:text-teal-400" />
              <span>Hoạt động Sprint</span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange("ATTRIBUTION")}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${tab === "ATTRIBUTION"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <FingerprintIcon className="size-3.5 text-amber-600 dark:text-amber-400" />
              <span>Đối soát danh tính</span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange("PEER_REVIEW")}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${tab === "PEER_REVIEW"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <UsersIcon className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Mạng đánh giá chéo</span>
            </button>
          </div>
        )}

        {!drillDownStudent && (
          <div className="flex flex-wrap items-center gap-2.5">
            {memberOptions && memberOptions.length > 0 && onStudentChange && (
              <div className="flex items-center gap-2 min-w-[200px]">
                <span className="text-xs font-bold text-muted-foreground whitespace-nowrap flex items-center gap-1">
                  <UserIcon className="size-3.5 text-primary" />
                  Thành viên:
                </span>
                <div className="flex-1">
                  <CustomSelect
                    id={`${selectId}-student`}
                    value={selectedStudentId || "ALL"}
                    onChange={onStudentChange}
                    options={[{ value: "ALL", label: "Tất cả thành viên" }, ...memberOptions]}
                  />
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 min-w-[220px]">
              <span className="text-xs font-bold text-muted-foreground whitespace-nowrap flex items-center gap-1">
                <CalendarIcon className="size-3.5 text-primary" />
                Sprint:
              </span>
              <div className="flex-1">
                <CustomSelect
                  id={selectId}
                  value={
                    tab === "ACTIVITY" || tab === "PEER_REVIEW"
                      ? selectedSprintId || ""
                      : selectedSprintId || "ALL"
                  }
                  onChange={onSprintChange}
                  options={tab === "ACTIVITY" || tab === "PEER_REVIEW" ? sprintOptions : allSprintOptions}
                  placeholder={tab === "ACTIVITY" || tab === "PEER_REVIEW" ? "Chọn Sprint..." : "Tất cả Sprint"}
                />
              </div>
            </div>

            {onScopeModeChange && (tab === "OVERVIEW" || tab === "ACTIVITY" || tab === "ATTRIBUTION") && (
              <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-muted/60 p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => onScopeModeChange("COMPACT")}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${scopeMode === "COMPACT"
                    ? "bg-card text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                  title="Chỉ hiển thị Task và Nhóm (loại bỏ Commit dày đặc)"
                >
                  Gọn (Task & Nhóm)
                </button>
                <button
                  type="button"
                  onClick={() => onScopeModeChange("FULL")}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${scopeMode === "FULL"
                    ? "bg-card text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                  title="Hiển thị đầy đủ cả Commit và bằng chứng"
                >
                  Chi tiết (+ Commit)
                </button>
              </div>
            )}

            {onMaxNodesChange && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-muted-foreground whitespace-nowrap flex items-center gap-1">
                  <SlidersHorizontalIcon className="size-3 text-primary" />
                  Tối đa:
                </span>
                <div className="w-28">
                  <CustomSelect
                    id={`${selectId}-max-nodes`}
                    value={maxNodes ? String(maxNodes) : "ALL"}
                    onChange={(val) => onMaxNodesChange(val === "ALL" ? null : Number(val))}
                    options={[
                      { value: "50", label: "50 node" },
                      { value: "100", label: "100 node" },
                      { value: "200", label: "200 node" },
                      { value: "ALL", label: "Tất cả" },
                    ]}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
