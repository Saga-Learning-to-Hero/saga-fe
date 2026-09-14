"use client";

import { useState, useMemo } from "react";
import { InfoIcon, ScrollTextIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AuditStats } from "@/features/admin/audit-log/components/audit-stats";
import { AuditToolbar } from "@/features/admin/audit-log/components/audit-toolbar";
import { AuditTable } from "@/features/admin/audit-log/components/audit-table";
import { AuditDetailDialog } from "@/features/admin/audit-log/components/audit-detail-dialog";
import { MOCK_AUDIT_LOGS } from "@/features/admin/audit-log/data/mock-audit-logs";
import type { AuditLogItem, AuditFilterState } from "@/features/admin/audit-log/types/audit-log";

const INITIAL_FILTERS: AuditFilterState = {
  search: "",
  category: "ALL",
  severity: "ALL",
  timeRange: "ALL",
};

export default function AdminAuditLogPage() {
  const [logs] = useState<AuditLogItem[]>(MOCK_AUDIT_LOGS);
  const [filters, setFilters] = useState<AuditFilterState>(INITIAL_FILTERS);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleFilterChange = (updated: Partial<AuditFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchSearch =
          log.actor.fullName.toLowerCase().includes(q) ||
          log.actor.email.toLowerCase().includes(q) ||
          log.actor.ipAddress.toLowerCase().includes(q) ||
          log.target.name.toLowerCase().includes(q) ||
          log.description.toLowerCase().includes(q) ||
          log.requestId.toLowerCase().includes(q);
        if (!matchSearch) return false;
      }

      if (filters.category !== "ALL" && log.category !== filters.category) {
        return false;
      }

      if (filters.severity !== "ALL" && log.severity !== filters.severity) {
        return false;
      }

      if (filters.timeRange !== "ALL") {
        const logDate = new Date(log.timestamp).getTime();
        const now = new Date("2026-08-26T12:00:00Z").getTime();
        const diffHours = (now - logDate) / (1000 * 60 * 60);

        if (filters.timeRange === "TODAY" && diffHours > 24) return false;
        if (filters.timeRange === "7_DAYS" && diffHours > 24 * 7) return false;
        if (filters.timeRange === "30_DAYS" && diffHours > 24 * 30) return false;
      }

      return true;
    });
  }, [logs, filters]);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <ScrollTextIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-foreground tracking-tight">
                  Nhật ký hoạt động hệ thống
                </h1>
                <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-mono">
                  Dữ liệu minh họa (Chưa kết nối API)
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Theo dõi lịch sử hoạt động, an ninh và thay đổi phân quyền hệ thống lưu trữ tại MongoDB.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-9 gap-1.5 text-xs font-semibold rounded-xl cursor-pointer"
          >
            <RefreshCwIcon className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3.5 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <InfoIcon className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-muted-foreground">
            <strong className="text-foreground">Lưu ý:</strong> Bảng nhật ký kiểm toán hệ thống hiện đang hiển thị bản ghi mẫu minh họa cấu trúc Audit Log MongoDB trong lúc chờ kết nối API kiểm toán từ máy chủ.
          </span>
        </div>
        <Badge variant="outline" className="text-[10px] font-mono text-amber-600 dark:text-amber-400 border-amber-500/30 shrink-0">
          Demo Environment
        </Badge>
      </div>

      <AuditStats logs={logs} />

      <AuditToolbar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        filteredCount={filteredLogs.length}
        totalCount={logs.length}
      />

      <AuditTable logs={filteredLogs} onSelectLog={setSelectedLog} />

      <AuditDetailDialog
        log={selectedLog}
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}
