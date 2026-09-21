"use client";

import dynamic from "next/dynamic";
import {
  BarChart3Icon,
  CalendarDaysIcon,
  CircleGaugeIcon,
  InfoIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  formatDashboardDate,
  formatDashboardPercent,
} from "../lib/dashboard-format";
import type {
  AdminDashboardSelectedSemester,
  AdminDashboardWeeklyPoint,
} from "../types/dashboard";

const WeeklyActivityChart = dynamic(
  () =>
    import("./weekly-activity-chart").then(
      (module) => module.WeeklyActivityChart
    ),
  {
    ssr: false,
    loading: () => <DashboardChartLoadingState />,
  }
);

interface DashboardChartsSectionProps {
  selectedSemester: AdminDashboardSelectedSemester;
  weeklyTimeline: AdminDashboardWeeklyPoint[];
}

export function DashboardChartsSection({
  selectedSemester,
  weeklyTimeline,
}: DashboardChartsSectionProps) {
  const currentWeek = weeklyTimeline.find((week) => week.isCurrentWeek);
  const currentWeekLabel =
    selectedSemester.currentWeekIndex === null
      ? "Ngoài lịch học kỳ"
      : `Tuần ${selectedSemester.currentWeekIndex} / ${selectedSemester.totalWeeks}`;

  return (
    <section aria-label="Hoạt động theo tuần của học kỳ">
      <Card className="overflow-hidden rounded-2xl border-border/80 bg-card shadow-xs">
        <CardHeader className="border-b border-border/60 p-4 pb-3 sm:p-5">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
            <div className="flex items-start gap-2.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BarChart3Icon className="size-5" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-foreground sm:text-base">
                  Hoạt động theo tuần
                </CardTitle>
                <CardDescription className="mt-0.5 text-xs text-muted-foreground">
                  Commits, completed tasks và tỷ lệ liên kết Task–Commit theo từng tuần.
                </CardDescription>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <Badge variant="outline" className="gap-1.5 text-[10px] font-medium">
                <CalendarDaysIcon className="size-3" />
                {formatDashboardDate(selectedSemester.startDate)} – {formatDashboardDate(selectedSemester.endDate)}
              </Badge>
              <Badge variant="outline" className="gap-1.5 text-[10px] font-medium">
                <CircleGaugeIcon className="size-3" />
                {currentWeekLabel}
              </Badge>
              <Badge
                variant="outline"
                className="gap-1.5 border-warning/35 bg-warning-muted/30 text-[10px] font-medium text-warning"
              >
                Traceability tuần này: {formatDashboardPercent(currentWeek?.traceabilityRate ?? null)}
              </Badge>
              <span
                title="Completed tasks phản ánh trạng thái hiện tại, không phải lịch sử chuyển trạng thái bất biến."
                className="inline-flex size-6 items-center justify-center rounded-full text-muted-foreground"
                aria-label="Giải thích số liệu completed tasks"
              >
                <InfoIcon className="size-3.5" />
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5">
          {weeklyTimeline.length === 0 ? (
            <div className="flex min-h-72 items-center justify-center rounded-xl border border-dashed border-border/80 p-8 text-center text-xs text-muted-foreground">
              Học kỳ này chưa có dữ liệu theo tuần để hiển thị.
            </div>
          ) : (
            <WeeklyActivityChart weeklyTimeline={weeklyTimeline} />
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function DashboardChartLoadingState() {
  return (
    <div
      aria-label="Đang tải biểu đồ hoạt động theo tuần"
      className="h-72 animate-pulse rounded-xl bg-muted/35"
    />
  );
}
