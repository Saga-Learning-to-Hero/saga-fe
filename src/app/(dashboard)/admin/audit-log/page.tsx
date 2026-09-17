"use client";

import { useState, useMemo, useEffect } from "react";
import { ScrollTextIcon, RefreshCwIcon, AlertCircleIcon, DatabaseIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AuditStats } from "@/features/admin/audit-log/components/audit-stats";
import { AuditToolbar } from "@/features/admin/audit-log/components/audit-toolbar";
import { AuditTable } from "@/features/admin/audit-log/components/audit-table";
import { AuditDetailDialog } from "@/features/admin/audit-log/components/audit-detail-dialog";
import { useAdminAuditLogs } from "@/features/admin/audit-log/hooks/use-admin-audit";
import {
  mapAdminAuditLogResponseToItem,
  type AuditLogItem,
  type AuditFilterState,
  type GetAdminAuditLogsParams,
} from "@/features/admin/audit-log/types/audit-log";

const INITIAL_FILTERS: AuditFilterState = {
  action: "",
  entityType: "ALL",
  actorUserId: "",
  entityId: "",
  fromDate: "",
  toDate: "",
};

const PAGE_SIZE = 10;

export default function AdminAuditLogPage() {
  const [filters, setFilters] = useState<AuditFilterState>(INITIAL_FILTERS);
  const [debouncedFilters, setDebouncedFilters] = useState<AuditFilterState>(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  // Debounce các trường filter 350ms để tránh spam API
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [filters]);

  // Chuẩn hóa params gửi lên API máy chủ theo đúng 100% Swagger OpenAPI
  const queryParams: GetAdminAuditLogsParams = useMemo(() => {
    const params: GetAdminAuditLogsParams = {
      page: page - 1, // Spring Boot 0-indexed
      size: PAGE_SIZE,
    };

    if (debouncedFilters.action && debouncedFilters.action !== "ALL" && debouncedFilters.action.trim()) {
      params.action = debouncedFilters.action.trim();
    }

    if (debouncedFilters.entityType && debouncedFilters.entityType !== "ALL" && debouncedFilters.entityType.trim()) {
      params.entityType = debouncedFilters.entityType.trim();
    }

    if (debouncedFilters.actorUserId && debouncedFilters.actorUserId.trim()) {
      params.actorUserId = debouncedFilters.actorUserId.trim();
    }

    if (debouncedFilters.entityId && debouncedFilters.entityId.trim()) {
      params.entityId = debouncedFilters.entityId.trim();
    }

    if (debouncedFilters.fromDate && debouncedFilters.fromDate.trim()) {
      params.from = `${debouncedFilters.fromDate.trim()}T00:00:00Z`;
    }

    if (debouncedFilters.toDate && debouncedFilters.toDate.trim()) {
      params.to = `${debouncedFilters.toDate.trim()}T23:59:59Z`;
    }

    return params;
  }, [page, debouncedFilters]);

  const { data, isLoading, isError, error, refetch, isFetching } =
    useAdminAuditLogs(queryParams);

  const mappedLogs: AuditLogItem[] = useMemo(() => {
    if (!data?.items) return [];
    return data.items.map(mapAdminAuditLogResponseToItem);
  }, [data]);

  const totalLogs = data?.total ?? 0;

  const handleFilterChange = (updated: Partial<AuditFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setPage(1);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in-0 duration-200">
      {/* 1. Header trang */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-2xs">
            <ScrollTextIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                Nhật ký hoạt động hệ thống (Audit Logs)
              </h1>
              <Badge
                variant="outline"
                className="border-primary/30 bg-primary/10 text-primary text-[10px] font-mono font-bold"
              >
                REST API / Audit Store
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Theo dõi lịch sử hoạt động, bảo mật và thay đổi dữ liệu được lưu trữ bất biến tại cơ sở dữ liệu kiểm toán.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="h-8.5 px-3 text-xs font-semibold rounded-xl gap-1.5 cursor-pointer shadow-2xs"
          >
            <RefreshCwIcon className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-primary" : ""}`} />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {/* 2. Banner thông tin lưu trữ */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3.5 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <DatabaseIcon className="size-4 text-primary shrink-0" />
          <span className="text-muted-foreground">
            <strong className="text-foreground">Cơ sở dữ liệu kiểm toán:</strong> Mọi thao tác quản trị, phân quyền người dùng và cập nhật cấu trúc dự án đều được ghi vết tự động kèm snapshot dữ liệu trước & sau (State Diff).
          </span>
        </div>
        <Badge variant="outline" className="text-[10px] font-mono text-primary border-primary/30 shrink-0">
          Immutable Logs
        </Badge>
      </div>

      {/* 3. Lỗi kết nối máy chủ nếu có */}
      {isError && (
        <div className="p-5 rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircleIcon className="w-5 h-5 text-destructive shrink-0" />
            <div>
              <p className="text-sm font-bold text-foreground">
                Không thể tải nhật ký kiểm toán hệ thống
              </p>
              <p className="text-xs text-muted-foreground">
                {(error as Error)?.message || "Đã có lỗi xảy ra trong quá trình kết nối đến máy chủ SAGA."}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-xs cursor-pointer shrink-0"
          >
            Thử lại
          </Button>
        </div>
      )}

      {/* 4. Thống kê nhanh */}
      <AuditStats logs={mappedLogs} totalCount={totalLogs} />

      {/* 5. Toolbar bộ lọc */}
      <AuditToolbar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        filteredCount={mappedLogs.length}
        totalCount={totalLogs}
      />

      {/* 6. Bảng dữ liệu phân trang Server */}
      <AuditTable
        logs={mappedLogs}
        onSelectLog={setSelectedLog}
        page={page}
        pageSize={PAGE_SIZE}
        totalItems={totalLogs}
        onPageChange={(newPage) => setPage(newPage)}
        isLoading={isLoading}
      />

      {/* 7. Modal chi tiết nhật ký */}
      <AuditDetailDialog
        log={selectedLog}
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}
