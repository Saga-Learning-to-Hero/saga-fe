"use client";

import { UsersIcon, FolderKanbanIcon, GitCommitIcon, RadioIcon, ArrowUpRightIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardKPIs } from "../types/dashboard";

interface DashboardKPIsProps {
  kpis: DashboardKPIs;
}

export function DashboardKPIsSection({ kpis }: DashboardKPIsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Sinh viên */}
      <Card className="rounded-2xl border border-border/80 shadow-xs bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200 relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/40 opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Sinh viên làm đồ án</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-foreground font-mono tracking-tight">
                {kpis.totalStudents}
              </span>
              <span className="text-[11px] text-success font-semibold inline-flex items-center">
                <ArrowUpRightIcon className="w-3 h-3" />
                +{kpis.studentsGrowth}%
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">Tổng sinh viên ghi danh kỳ này</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
            <UsersIcon className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      {/* KPI 2: Nhóm đồ án */}
      <Card className="rounded-2xl border border-border/80 shadow-xs bg-card hover:border-info/40 hover:shadow-md transition-all duration-200 relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-info to-info/40 opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Nhóm đồ án Capstone</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-foreground font-mono tracking-tight">
                {kpis.totalGroups}
              </span>
              <span className="text-[11px] text-info font-semibold">
                {kpis.connectedGroupsRate}% kết nối
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Đã liên kết Jira & GitHub Workspace
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-info-muted flex items-center justify-center text-info shrink-0 group-hover:scale-105 transition-transform">
            <FolderKanbanIcon className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      {/* KPI 3: Traceability Index */}
      <Card className="rounded-2xl border border-border/80 shadow-xs bg-card hover:border-success/40 hover:shadow-md transition-all duration-200 relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-success to-success/40 opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Chỉ số Traceability</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-success font-mono tracking-tight">
                {kpis.traceabilityRate}%
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">Chuẩn dữ liệu</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Commit đã map chuẩn về Jira Task
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-success-muted flex items-center justify-center text-success shrink-0 group-hover:scale-105 transition-transform">
            <GitCommitIcon className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      {/* KPI 4: Webhook Events 24h */}
      <Card className="rounded-2xl border border-border/80 shadow-xs bg-card hover:border-warning/40 hover:shadow-md transition-all duration-200 relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-warning to-warning/40 opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Sự kiện Webhook (24h)</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-foreground font-mono tracking-tight">
                {kpis.webhookEvents24h}
              </span>
              <span className="text-[11px] text-warning font-semibold">Thời gian thực</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Tổng {kpis.totalCommitsSynced.toLocaleString()} commits đã đồng bộ
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-warning-muted flex items-center justify-center text-warning shrink-0 group-hover:scale-105 transition-transform">
            <RadioIcon className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
