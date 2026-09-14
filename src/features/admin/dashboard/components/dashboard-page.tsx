"use client";

import { useState } from "react";
import { InfoIcon, LayoutDashboardIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomSelect } from "@/components/common/custom-select";
import { DashboardKPIsSection } from "./dashboard-kpis";
import { DashboardChartsSection } from "./dashboard-charts";
import { WebhookIntegrationSection } from "./webhook-integration-card";
import { RecentAuditAndQuickActionsSection } from "./recent-audit-stream";
import { MOCK_DASHBOARD_DATA } from "../data/mock-dashboard";

export function DashboardPage() {
  const [selectedSemester, setSelectedSemester] = useState<string>("FA26");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentData = MOCK_DASHBOARD_DATA[selectedSemester] || MOCK_DASHBOARD_DATA.FA26;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 400);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <LayoutDashboardIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-foreground tracking-tight">Tổng quan Quản trị Hệ thống (SAGA Admin Portal)</h1>
              <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-mono">
                Dữ liệu minh họa (Chưa kết nối API)
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Giám sát hoạt động học thuật, chỉ số Traceability và trạng thái đồng bộ Webhook Jira / GitHub.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-48">
            <CustomSelect
              value={selectedSemester}
              onChange={(val) => setSelectedSemester(val)}
              options={[
                { value: "FA26", label: "Fall 2026 (FA26)", subLabel: "Đang diễn ra" },
                { value: "SU26", label: "Summer 2026 (SU26)", subLabel: "Đã hoàn thành" },
                { value: "SP27", label: "Spring 2027 (SP27)", subLabel: "Sắp diễn ra" },
              ]}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-9 gap-1.5 text-xs font-semibold rounded-xl shrink-0"
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
            <strong className="text-foreground">Lưu ý:</strong> Bảng số liệu thống kê tổng quan quản trị và biểu đồ bên dưới đang hiển thị số liệu minh họa trong khi chờ hoàn thiện API tổng hợp từ máy chủ.
          </span>
        </div>
        <Badge variant="outline" className="text-[10px] font-mono text-amber-600 dark:text-amber-400 border-amber-500/30 shrink-0">
          Demo Environment
        </Badge>
      </div>

      <DashboardKPIsSection kpis={currentData.kpis} />
      <DashboardChartsSection />
      <WebhookIntegrationSection integrations={currentData.integrations} unconnectedGroups={currentData.unconnectedGroups} />
      <RecentAuditAndQuickActionsSection />
    </div>
  );
}
