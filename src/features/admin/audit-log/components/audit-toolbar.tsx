"use client";

import {
  SearchIcon,
  XIcon,
  FilterIcon,
  CalendarIcon,
  DatabaseIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DateDdMmYyyyInput } from "./date-ddmmyyyy-input";
import { TimeHhMmInput } from "./time-hhmm-input";
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
    Boolean(filters.action && filters.action !== "ALL" && filters.action.trim()) ||
    Boolean(filters.entityType && filters.entityType !== "ALL" && filters.entityType.trim()) ||
    Boolean(filters.fromDate && filters.fromDate.trim()) ||
    Boolean(filters.toDate && filters.toDate.trim()) ||
    Boolean(filters.fromTime && filters.fromTime.trim()) ||
    Boolean(filters.toTime && filters.toTime.trim());

  const hasTimeFilter = Boolean(
    filters.fromDate || filters.toDate || filters.fromTime || filters.toTime
  );

  return (
    <Card className="rounded-2xl border border-border shadow-xs bg-card">
      <CardContent className="p-4 space-y-3">
        {/* Hàng bộ lọc chính: Hành động action, Loại đối tượng entityType, Thời gian và giờ from - to */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* 1. Hành động (action) */}
          <div className="md:col-span-3 space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
              <SearchIcon className="size-3 text-primary" />
              Hành động
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Nhập hành động..."
                value={filters.action === "ALL" ? "" : filters.action}
                onChange={(e) => onFilterChange({ action: e.target.value })}
                className="h-9 text-xs rounded-xl pr-7 font-mono"
              />
              {filters.action && filters.action !== "ALL" && (
                <button
                  type="button"
                  onClick={() => onFilterChange({ action: "ALL" })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Xóa hành động"
                >
                  <XIcon className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 2. Loại đối tượng (entityType) - Nhập tay linh hoạt */}
          <div className="md:col-span-3 space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
              <DatabaseIcon className="size-3 text-primary" />
              Loại đối tượng
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Nhập loại đối tượng..."
                value={filters.entityType === "ALL" ? "" : filters.entityType}
                onChange={(e) => onFilterChange({ entityType: e.target.value })}
                className="h-9 text-xs rounded-xl pr-7 font-mono"
              />
              {filters.entityType && filters.entityType !== "ALL" && (
                <button
                  type="button"
                  onClick={() => onFilterChange({ entityType: "ALL" })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Xóa loại đối tượng"
                >
                  <XIcon className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 3. Khoảng thời gian và giờ (from - to) khớp với cột Thời gian (Timestamp) */}
          <div className="md:col-span-6 space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                <CalendarIcon className="size-3 text-primary" />
                Khoảng thời gian
              </label>
              {hasTimeFilter && (
                <button
                  type="button"
                  onClick={() =>
                    onFilterChange({
                      fromDate: "",
                      fromTime: "",
                      toDate: "",
                      toTime: "",
                    })
                  }
                  className="text-[10px] text-destructive hover:underline cursor-pointer"
                  title="Xóa khoảng thời gian và giờ"
                >
                  Xóa thời gian
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {/* Mốc bắt đầu: Ngày (dd/mm/yyyy) + Giờ (HH:mm) */}
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <DateDdMmYyyyInput
                  id="audit-filter-from-date"
                  value={filters.fromDate}
                  onChange={(val) =>
                    onFilterChange({
                      fromDate: val,
                      fromTime: val && !filters.fromTime ? "00:00" : filters.fromTime,
                    })
                  }
                  title="Mốc ngày bắt đầu (dd/mm/yyyy)"
                />
                <TimeHhMmInput
                  id="audit-filter-from-time"
                  value={filters.fromTime || ""}
                  onChange={(val) => onFilterChange({ fromTime: val })}
                  placeholder="00:00"
                  title="Giờ bắt đầu (HH:mm, 24h)"
                />
              </div>

              <span className="text-muted-foreground text-xs font-semibold shrink-0 text-center sm:text-left">
                &rarr;
              </span>

              {/* Mốc kết thúc: Ngày (dd/mm/yyyy) + Giờ (HH:mm) */}
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <DateDdMmYyyyInput
                  id="audit-filter-to-date"
                  value={filters.toDate}
                  onChange={(val) =>
                    onFilterChange({
                      toDate: val,
                      toTime: val && !filters.toTime ? "23:59" : filters.toTime,
                    })
                  }
                  title="Mốc ngày kết thúc (dd/mm/yyyy)"
                />
                <TimeHhMmInput
                  id="audit-filter-to-time"
                  value={filters.toTime || ""}
                  onChange={(val) => onFilterChange({ toTime: val })}
                  placeholder="23:59"
                  title="Giờ kết thúc (HH:mm, 24h)"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Hàng phụ: Nút đặt lại bộ lọc và Bộ đếm kết quả */}
        <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-3 text-xs">
          <div>
            {isFiltered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
              >
                <XIcon className="size-3.5 mr-1" />
                Đặt lại bộ lọc
              </Button>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
            <FilterIcon className="size-3.5 text-muted-foreground" />
            <span>
              Hiển thị <strong className="text-foreground">{filteredCount}</strong> / {totalCount} sự kiện
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
