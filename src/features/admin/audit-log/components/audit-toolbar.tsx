"use client";

import {
  SearchIcon,
  XIcon,
  FilterIcon,
  CalendarIcon,
  UserIcon,
  DatabaseIcon,
  SparklesIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CustomSelect, type CustomSelectOption } from "@/components/common/custom-select";
import type { AuditFilterState } from "../types/audit-log";

interface AuditToolbarProps {
  filters: AuditFilterState;
  onFilterChange: (filters: Partial<AuditFilterState>) => void;
  onReset: () => void;
  filteredCount: number;
  totalCount: number;
}

const ENTITY_TYPE_OPTIONS: CustomSelectOption[] = [
  { value: "ALL", label: "Tất cả đối tượng (ALL)" },
  { value: "USER", label: "Người dùng (USER)", subLabel: "Tài khoản hệ thống" },
  { value: "COURSE", label: "Lớp học phần (COURSE)", subLabel: "Khóa học mở trong kỳ" },
  { value: "CLASS", label: "Lớp sinh viên (CLASS)", subLabel: "Lớp niên khóa" },
  { value: "SUBJECT", label: "Môn học (SUBJECT)", subLabel: "Đề cương & môn học" },
  { value: "jira_integration", label: "Tích hợp Jira (jira_integration)", subLabel: "Webhook & liên kết repo" },
];

const COMMON_ACTIONS = [
  { value: "USER_STATUS_CHANGE", label: "Đổi trạng thái" },
  { value: "JIRA_INTEGRATION_DISCONNECTED", label: "Ngắt Jira" },
  { value: "COURSE_CREATE", label: "Tạo lớp học phần" },
  { value: "CLASS_CREATE", label: "Tạo lớp sinh viên" },
  { value: "USER_BAN", label: "Khóa tài khoản" },
];

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
    Boolean(filters.actorUserId && filters.actorUserId.trim()) ||
    Boolean(filters.entityId && filters.entityId.trim()) ||
    Boolean(filters.fromDate && filters.fromDate.trim()) ||
    Boolean(filters.toDate && filters.toDate.trim());



  return (
    <Card className="rounded-2xl border border-border shadow-xs bg-card">
      <CardContent className="p-4 space-y-3.5">
        {/* Hàng 1: Bộ lọc chính (Hành động action, Loại đối tượng entityType, Thời gian from - to) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* 1. Hành động (action) */}
          <div className="md:col-span-4 space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
              <SearchIcon className="size-3 text-primary" />
              Hành động (Action)
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Nhập hành động (vd: USER_STATUS_CHANGE)..."
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

          {/* 2. Loại đối tượng (entityType) */}
          <div className="md:col-span-3 space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
              <DatabaseIcon className="size-3 text-primary" />
              Loại đối tượng (Entity Type)
            </label>
            <CustomSelect
              id="audit-entity-type-filter"
              value={filters.entityType || "ALL"}
              onChange={(val) => onFilterChange({ entityType: val })}
              options={ENTITY_TYPE_OPTIONS}
              placeholder="Chọn loại đối tượng..."
              className="h-9 text-xs rounded-xl"
            />
          </div>

          {/* 3. Khoảng thời gian (from - to) khớp với cột Thời gian (Timestamp) */}
          <div className="md:col-span-5 space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                <CalendarIcon className="size-3 text-primary" />
                Thời gian (Timestamp: From &bull; To)
              </label>
              {(filters.fromDate || filters.toDate) && (
                <button
                  type="button"
                  onClick={() => onFilterChange({ fromDate: "", toDate: "" })}
                  className="text-[10px] text-destructive hover:underline cursor-pointer"
                  title="Xóa khoảng thời gian"
                >
                  Xóa ngày
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={filters.fromDate}
                onChange={(e) => onFilterChange({ fromDate: e.target.value })}
                className="h-9 text-xs rounded-xl flex-1 font-mono"
                title="Từ mốc thời gian (from)"
              />
              <span className="text-muted-foreground text-xs font-semibold shrink-0">&rarr;</span>
              <Input
                type="date"
                value={filters.toDate}
                onChange={(e) => onFilterChange({ toDate: e.target.value })}
                className="h-9 text-xs rounded-xl flex-1 font-mono"
                title="Đến mốc thời gian (to)"
              />
            </div>
          </div>
        </div>

        {/* Hàng gợi ý nhanh hành động phổ biến */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground pt-0.5">
          <span className="text-[11px] flex items-center gap-1">
            <SparklesIcon className="size-3 text-primary" />
            Gợi ý hành động:
          </span>
          {COMMON_ACTIONS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onFilterChange({ action: item.value })}
              className={`text-[10px] font-mono px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                filters.action === item.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/40 hover:bg-muted/80 text-foreground border-border/60"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Hàng 2: Bộ lọc nâng cao theo UUID (actorUserId, entityId) + Nút đặt lại + Bộ đếm */}
        <div className="pt-2.5 border-t border-border/60 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <div className="relative min-w-[200px] flex-1 max-w-xs">
              <UserIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Mã actorUserId (UUID)..."
                value={filters.actorUserId}
                onChange={(e) => onFilterChange({ actorUserId: e.target.value })}
                className="pl-8 pr-7 h-8 text-[11px] rounded-lg font-mono"
              />
              {filters.actorUserId && (
                <button
                  type="button"
                  onClick={() => onFilterChange({ actorUserId: "" })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <XIcon className="size-3" />
                </button>
              )}
            </div>

            <div className="relative min-w-[200px] flex-1 max-w-xs">
              <DatabaseIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Mã entityId (UUID)..."
                value={filters.entityId}
                onChange={(e) => onFilterChange({ entityId: e.target.value })}
                className="pl-8 pr-7 h-8 text-[11px] rounded-lg font-mono"
              />
              {filters.entityId && (
                <button
                  type="button"
                  onClick={() => onFilterChange({ entityId: "" })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <XIcon className="size-3" />
                </button>
              )}
            </div>

            {isFiltered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="h-8 text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
              >
                <XIcon className="size-3.5 mr-1" />
                Đặt lại bộ lọc
              </Button>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0 justify-end">
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
