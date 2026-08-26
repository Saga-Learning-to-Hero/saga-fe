"use client";

import { SearchIcon, XIcon, FilterIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { AuditFilterState } from "../types/audit-log";

interface AuditToolbarProps {
  filters: AuditFilterState;
  onFilterChange: (filters: Partial<AuditFilterState>) => void;
  onReset: () => void;
  filteredCount: number;
  totalCount: number;
}

export function AuditToolbar({
  filters,
  onFilterChange,
  onReset,
  filteredCount,
  totalCount,
}: AuditToolbarProps) {
  const isFiltered =
    filters.search !== "" ||
    filters.category !== "ALL" ||
    filters.severity !== "ALL" ||
    filters.timeRange !== "ALL";

  return (
    <Card className="rounded-2xl border border-border shadow-xs bg-card">
      <CardContent className="p-3.5 space-y-3">
        {/* Row 1: Search & Time Range */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Tìm theo người thực hiện, email, IP, đối tượng..."
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              className="pl-9 pr-8 h-9 text-xs rounded-xl"
            />
            {filters.search && (
              <button
                onClick={() => onFilterChange({ search: "" })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Time range tabs */}
          <div className="flex items-center gap-1 bg-muted/60 border border-border/80 rounded-xl p-1 shrink-0">
            {(
              [
                { value: "ALL", label: "Tất cả thời gian" },
                { value: "TODAY", label: "Hôm nay" },
                { value: "7_DAYS", label: "7 ngày qua" },
                { value: "30_DAYS", label: "30 ngày" },
              ] as const
            ).map((tab) => (
              <Button
                key={tab.value}
                type="button"
                variant={filters.timeRange === tab.value ? "default" : "ghost"}
                size="sm"
                onClick={() => onFilterChange({ timeRange: tab.value })}
                className={`h-7 px-2.5 text-xs font-medium rounded-lg ${filters.timeRange === tab.value ? "shadow-2xs" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Row 2: Category & Severity Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <div className="flex items-center gap-1 bg-muted/40 border border-border/60 rounded-xl p-1">
              {(
                [
                  { value: "ALL", label: "Tất cả nhóm" },
                  { value: "AUTH_SECURITY", label: "Bảo mật & Tài khoản" },
                  { value: "ACADEMIC", label: "Học thuật" },
                ] as const
              ).map((tab) => (
                <Button
                  key={tab.value}
                  type="button"
                  variant={filters.category === tab.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onFilterChange({ category: tab.value })}
                  className={`h-6 px-2 text-[11px] font-medium rounded-md ${filters.category === tab.value ? "shadow-2xs" : "text-muted-foreground"
                    }`}
                >
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-1 bg-muted/40 border border-border/60 rounded-xl p-1">
              {(
                [
                  { value: "ALL", label: "Tất cả mức độ" },
                  { value: "INFO", label: "Thông tin" },
                  { value: "WARNING", label: "Cảnh báo" },
                  { value: "CRITICAL", label: "Nghiêm trọng" },
                ] as const
              ).map((tab) => (
                <Button
                  key={tab.value}
                  type="button"
                  variant={filters.severity === tab.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onFilterChange({ severity: tab.value })}
                  className={`h-6 px-2 text-[11px] font-medium rounded-md ${filters.severity === tab.value ? "shadow-2xs" : "text-muted-foreground"
                    }`}
                >
                  {tab.label}
                </Button>
              ))}
            </div>

            {isFiltered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="h-7 text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
              >
                Đặt lại bộ lọc
              </Button>
            )}
          </div>

          {/* Result Counter */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <FilterIcon className="w-3.5 h-3.5 text-muted-foreground" />
            <span>
              Hiển thị <strong className="text-foreground">{filteredCount}</strong> / {totalCount} sự kiện
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
