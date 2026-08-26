"use client";

import { useState } from "react";
import { LayoutDashboardIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomSelect } from "@/components/common/custom-select";
import { DashboardKPIsSection } from "@/features/admin/dashboard/components/dashboard-kpis";
import { DashboardChartsSection } from "@/features/admin/dashboard/components/dashboard-charts";
import { WebhookIntegrationSection } from "@/features/admin/dashboard/components/webhook-integration-card";
import { RecentAuditAndQuickActionsSection } from "@/features/admin/dashboard/components/recent-audit-stream";
import { MOCK_DASHBOARD_DATA } from "@/features/admin/dashboard/data/mock-dashboard";

export default function DashboardPage() {
  const [selectedSemester, setSelectedSemester] = useState<string>("FA26");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentData = MOCK_DASHBOARD_DATA[selectedSemester] || MOCK_DASHBOARD_DATA.FA26;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <LayoutDashboardIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground tracking-tight">
                  Trung tâm điều hành SAGA
                </h1>
                <Badge className="bg-success-muted text-success border-0 text-[10px] font-semibold">
                  Hệ thống sẵn sàng
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Giám sát thời gian thực tiến độ đồ án, chỉ số Traceability và trạng thái tích hợp Webhook Jira / GitHub.
              </p>
            </div>
          </div>
        </div>

        {/* Top Controls: Semester Selector & Refresh Button */}
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
            className="h-9 gap-1.5 text-xs font-semibold rounded-xl cursor-pointer shrink-0"
          >
            <RefreshCwIcon className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* 1. KPIs Section */}
      <DashboardKPIsSection kpis={currentData.kpis} />

      {/* 2. Charts Section */}
      <DashboardChartsSection />

      {/* 3. Webhook & Integration Section */}
      <WebhookIntegrationSection
        integrations={currentData.integrations}
        unconnectedGroups={currentData.unconnectedGroups}
      />

      {/* 3. Recent Audit Logs & Quick Actions */}
      <RecentAuditAndQuickActionsSection />
    </div>
  );
}
