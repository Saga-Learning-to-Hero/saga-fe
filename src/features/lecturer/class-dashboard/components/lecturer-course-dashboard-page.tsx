"use client";

import { useState, useMemo } from "react";
import { CourseDashboardHeader } from "./course-dashboard-header";
import { ClassProgressChart } from "./class-progress-chart";
import { GroupHealthTable } from "./group-health-table";
import { GroupStatusDonut } from "./group-status-donut";
import { GroupPerformanceBubbleChart } from "./group-performance-bubble-chart";
import { GroupActivityHeatmap } from "./group-activity-heatmap";
import { TeamRadarChart } from "./team-radar-chart";
import { MiniSnaGraph } from "./mini-sna-graph";
import type { CourseDashboardData } from "../types/course-dashboard";
import { CustomSelect } from "@/components/common/custom-select";
import { ChevronDownIcon, ChevronUpIcon, AlertTriangleIcon, CheckCircle2Icon, AlertCircleIcon, UsersIcon, LayersIcon, ActivityIcon, CalendarClockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function LecturerCourseDashboardPage({ initialData }: { initialData: CourseDashboardData }) {
  const data = initialData;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sprintFilter, setSprintFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case "CRITICAL": return <AlertCircleIcon className="size-4 text-destructive" />;
      case "WARNING": return <AlertTriangleIcon className="size-4 text-warning" />;
      default: return <CheckCircle2Icon className="size-4 text-blue-500" />;
    }
  };

  // Lọc dữ liệu nhóm (Bubble chart, Heatmap, Bảng)
  const filteredGroups = useMemo(() => {
    return data.groups.filter(g => {
      const matchStatus = statusFilter === "all" || g.status.toLowerCase() === statusFilter;
      const matchSprint = sprintFilter === "all" || g.currentSprint.toLowerCase().replace(" ", "-") === sprintFilter;
      return matchStatus && matchSprint;
    });
  }, [data.groups, statusFilter, sprintFilter]);

  // Nếu team đang chọn bị filter mất, reset về null
  if (selectedTeamId && !filteredGroups.find(g => g.id === selectedTeamId)) {
    setSelectedTeamId(null);
  }

  const criticalGroupsCount = data.groups.filter(g => g.status === "CRITICAL").length;
  const warningGroupsCount = data.groups.filter(g => g.status === "WARNING").length;

  return (
    <div className="flex flex-col gap-6 pb-20">
      <CourseDashboardHeader course={data.course} onRefresh={handleRefresh} isRefreshing={isRefreshing} />

      {/* KPI Compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-center gap-4 bg-card border border-border p-4 rounded-xl shadow-saga-xs h-[88px]">
          <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <UsersIcon className="size-5" />
          </div>
          <div>
            <div className="text-xl font-bold">{data.summary.studentCount} Sinh viên</div>
            <div className="text-xs text-muted-foreground">{data.summary.activeStudentCount} hoạt động</div>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-card border border-border p-4 rounded-xl shadow-saga-xs h-[88px]">
          <div className="size-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <LayersIcon className="size-5" />
          </div>
          <div>
            <div className="text-xl font-bold">{data.groups.length} Nhóm</div>
            <div className="text-xs text-muted-foreground">{data.summary.healthyGroupCount} nhóm ổn định</div>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-card border border-border p-4 rounded-xl shadow-saga-xs h-[88px]">
          <div className="size-10 rounded-full bg-warning/10 text-warning flex items-center justify-center shrink-0">
            <ActivityIcon className="size-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-warning">{warningGroupsCount + criticalGroupsCount} Nhóm cần chú ý</div>
            <div className="text-xs text-muted-foreground">{criticalGroupsCount} nguy cơ cao</div>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-card border border-border p-4 rounded-xl shadow-saga-xs h-[88px]">
          <div className="size-10 rounded-full bg-chart-5/10 text-chart-5 flex items-center justify-center shrink-0">
            <CalendarClockIcon className="size-5" />
          </div>
          <div>
            <div className="text-xl font-bold">{data.summary.currentWeek}</div>
            <div className="text-xs text-muted-foreground">Tiến độ khóa học: {data.summary.semesterProgress}%</div>
          </div>
        </div>
      </div>

      {/* Bộ lọc nhỏ gọn */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-full sm:w-48">
          <CustomSelect
            value={sprintFilter}
            onChange={setSprintFilter}
            options={[
              { value: "all", label: "Tất cả Sprint" },
              { value: "sprint-1", label: "Sprint 1" },
              { value: "sprint-2", label: "Sprint 2" },
              { value: "sprint-3", label: "Sprint 3" },
            ]}
          />
        </div>
        <div className="w-full sm:w-48">
          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "all", label: "Tất cả trạng thái" },
              { value: "healthy", label: "Ổn định" },
              { value: "warning", label: "Cần chú ý" },
              { value: "critical", label: "Nguy cơ cao" },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Xu hướng tiến độ lớp (8) | Donut trạng thái (4) */}
        <div className="lg:col-span-8 rounded-2xl border border-border bg-card p-5 shadow-saga-xs min-h-[350px]">
          <ClassProgressChart data={data.weeklyProgress} currentWeekLabel={data.summary.currentWeek} />
        </div>
        <div className="lg:col-span-4 rounded-2xl border border-border bg-card p-5 shadow-saga-xs min-h-[350px]">
          <GroupStatusDonut
            groups={data.groups} // Donut luôn hiển thị toàn bộ
            selectedTeamId={selectedTeamId}
            onSelectTeam={setSelectedTeamId}
          />
        </div>

        {/* Cảnh báo (Việc cần xử lý) */}
        <div className="lg:col-span-12 flex flex-col gap-3">
          <h3 className="text-sm font-bold text-foreground px-1">Việc cần xử lý</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {data.alerts.slice(0, 3).map(alert => (
              <div key={alert.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card text-sm shadow-saga-xs">
                {getAlertIcon(alert.severity)}
                <div className="flex-1 truncate">
                  <div className="font-semibold text-foreground">{alert.title}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{alert.reason}</div>
                </div>
                {alert.actionUrl && (
                  <Link href={alert.actionUrl}>
                    <Button variant="outline" size="sm" className="h-7 text-xs font-semibold px-2">
                      {alert.actionLabel}
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Phân tích hoạt động nhóm */}
        <div className="lg:col-span-12 mt-4">
          <h3 className="text-lg font-bold text-foreground mb-4">Phân tích hoạt động nhóm</h3>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 rounded-2xl border border-border bg-card p-5 shadow-saga-xs min-h-[400px]">
              <GroupPerformanceBubbleChart
                groups={filteredGroups}
                selectedTeamId={selectedTeamId}
                onSelectTeam={setSelectedTeamId}
              />
            </div>
            <div className="lg:col-span-5 rounded-2xl border border-border bg-card p-5 shadow-saga-xs min-h-[400px]">
              <GroupActivityHeatmap
                groups={filteredGroups}
                selectedTeamId={selectedTeamId}
                onSelectTeam={setSelectedTeamId}
              />
            </div>
          </div>
        </div>

        {/* Phân tích sâu theo team (chỉ hiển thị khi có selectedTeamId) */}
        {selectedTeamId && (
          <div className="lg:col-span-12 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Phân tích chuyên sâu Nhóm</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedTeamId(null)} className="h-8 text-xs font-semibold">
                Đóng phân tích
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 rounded-2xl border border-border bg-card p-5 shadow-saga-xs min-h-[350px]">
                <TeamRadarChart groups={filteredGroups} selectedTeamId={selectedTeamId} />
              </div>
              <div className="lg:col-span-5 rounded-2xl border border-border bg-card p-5 shadow-saga-xs min-h-[350px]">
                <MiniSnaGraph groups={filteredGroups} selectedTeamId={selectedTeamId} courseId={data.course.id} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bảng chi tiết thu gọn */}
      <div className="flex flex-col gap-4 mt-8">
        <Button
          variant="outline"
          className="w-full py-6 font-bold text-muted-foreground hover:text-foreground shadow-sm"
          onClick={() => setShowTable(!showTable)}
        >
          {showTable ? "Thu gọn bảng chi tiết" : `Xem bảng chi tiết ${filteredGroups.length} nhóm`}
          {showTable ? <ChevronUpIcon className="ml-2 size-4" /> : <ChevronDownIcon className="ml-2 size-4" />}
        </Button>

        {showTable && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <GroupHealthTable groups={filteredGroups} courseId={data.course.id} />
          </div>
        )}
      </div>
    </div>
  );
}
