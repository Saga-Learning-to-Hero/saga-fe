"use client";

import { useState } from "react";
import { BarChart3Icon, PieChartIcon, TrendingUpIcon, GitCommitIcon, CheckSquareIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface WeeklyActivity {
  week: string;
  commits: number;
  tasks: number;
  traceability: number;
}

const WEEKLY_DATA: WeeklyActivity[] = [
  { week: "Tuần 01", commits: 120, tasks: 45, traceability: 82 },
  { week: "Tuần 02", commits: 210, tasks: 78, traceability: 88 },
  { week: "Tuần 03", commits: 285, tasks: 92, traceability: 91 },
  { week: "Tuần 04", commits: 340, tasks: 110, traceability: 94 },
  { week: "Tuần 05", commits: 410, tasks: 135, traceability: 93 },
  { week: "Tuần 06", commits: 380, tasks: 125, traceability: 95 },
  { week: "Tuần 07", commits: 450, tasks: 148, traceability: 96 },
  { week: "Tuần 08 (Nay)", commits: 290, tasks: 85, traceability: 94 },
];

export function DashboardChartsSection() {
  const [hoveredWeek, setHoveredWeek] = useState<WeeklyActivity | null>(null);
  const [filterType, setFilterType] = useState<"ALL" | "COMMITS" | "TASKS">("ALL");

  const maxVal = 500;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Biểu đồ 1: Cường độ hoạt động Tuần (Commits vs Jira Tasks) */}
      <Card className="rounded-2xl border border-border/80 shadow-xs bg-card lg:col-span-2 flex flex-col justify-between overflow-hidden">
        <CardHeader className="p-4 pb-3 border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <BarChart3Icon className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-foreground">
                  Cường độ hoạt động: Commits vs Jira Tasks
                </CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground">
                  Số lượng commit đẩy về GitHub và task Jira qua 8 tuần học kỳ
                </CardDescription>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/60">
              <Button
                type="button"
                variant={filterType === "ALL" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilterType("ALL")}
                className="h-6 px-2 text-[11px] font-medium rounded-lg"
              >
                Tất cả
              </Button>
              <Button
                type="button"
                variant={filterType === "COMMITS" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilterType("COMMITS")}
                className="h-6 px-2 text-[11px] font-medium rounded-lg text-primary"
              >
                Chỉ Commits
              </Button>
              <Button
                type="button"
                variant={filterType === "TASKS" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilterType("TASKS")}
                className="h-6 px-2 text-[11px] font-medium rounded-lg text-info"
              >
                Chỉ Tasks
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          {/* Chart Canvas */}
          <div className="relative h-60 w-full pt-6 flex items-end">
            {/* Trục Y Ticks & Đường gióng */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] font-mono text-muted-foreground/60">
              <div className="flex items-center gap-2 w-full">
                <span className="w-6 text-right">450</span>
                <div className="border-b border-dashed border-border/70 flex-1" />
              </div>
              <div className="flex items-center gap-2 w-full">
                <span className="w-6 text-right">300</span>
                <div className="border-b border-dashed border-border/70 flex-1" />
              </div>
              <div className="flex items-center gap-2 w-full">
                <span className="w-6 text-right">150</span>
                <div className="border-b border-dashed border-border/70 flex-1" />
              </div>
              <div className="flex items-center gap-2 w-full">
                <span className="w-6 text-right">0</span>
                <div className="border-b border-border flex-1" />
              </div>
            </div>

            {/* Các cột dữ liệu */}
            <div className="ml-8 w-full h-full flex items-end justify-between gap-2 sm:gap-4 relative z-10">
              {WEEKLY_DATA.map((item, idx) => {
                const commitHeight = Math.round((item.commits / maxVal) * 190);
                const taskHeight = Math.round(((item.tasks * 2.8) / maxVal) * 190);
                const isHovered = hoveredWeek?.week === item.week;

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredWeek(item)}
                    onMouseLeave={() => setHoveredWeek(null)}
                    className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                  >
                    {/* Hover Guideline */}
                    {isHovered && (
                      <div className="absolute inset-x-0 bottom-0 top-0 bg-primary/5 rounded-xl pointer-events-none -z-10 animate-in fade-in-0" />
                    )}

                    {/* Tooltip nổi cao cấp */}
                    {isHovered && (
                      <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-popover/95 backdrop-blur-md text-popover-foreground border border-border shadow-xl rounded-xl p-2.5 text-[11px] whitespace-nowrap z-40 pointer-events-none animate-in fade-in-0 zoom-in-95 space-y-1">
                        <p className="font-bold text-foreground text-xs">{item.week}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-primary font-semibold flex items-center gap-1">
                            <GitCommitIcon className="w-3 h-3" />
                            {item.commits} commits
                          </span>
                          <span className="text-info font-semibold flex items-center gap-1">
                            <CheckSquareIcon className="w-3 h-3" />
                            {item.tasks} tasks
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          Traceability: <strong className="text-success font-mono">{item.traceability}%</strong>
                        </p>
                      </div>
                    )}

                    {/* Dual Columns */}
                    <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 pb-0.5">
                      {(filterType === "ALL" || filterType === "COMMITS") && (
                        <div
                          style={{ height: `${commitHeight}px` }}
                          className={`w-3.5 sm:w-5 rounded-t-md transition-all duration-300 ${isHovered
                            ? "bg-primary shadow-md shadow-primary/30"
                            : "bg-primary/80 group-hover:bg-primary"
                            }`}
                        />
                      )}
                      {(filterType === "ALL" || filterType === "TASKS") && (
                        <div
                          style={{ height: `${taskHeight}px` }}
                          className={`w-3.5 sm:w-5 rounded-t-md transition-all duration-300 ${isHovered
                            ? "bg-info shadow-md shadow-info/30"
                            : "bg-info/75 group-hover:bg-info"
                            }`}
                        />
                      )}
                    </div>

                    {/* Label dưới cột */}
                    <span
                      className={`text-[10px] font-mono mt-2 transition-colors truncate w-full text-center ${isHovered ? "text-primary font-bold" : "text-muted-foreground"
                        }`}
                    >
                      {item.week.replace(" (Nay)", "")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer note */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
            <div className="flex items-center gap-1.5 text-success font-medium">
              <TrendingUpIcon className="w-4 h-4" />
              <span>Tiến độ commit tăng 24% so với mốc Sprint 2.</span>
            </div>
            <Badge variant="outline" className="font-mono text-[10px] border-border">
              Đỉnh điểm: 450 Commits/Tuần
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Biểu đồ 2: Sức khỏe Đồ án & Tiến độ các Sprint */}
      <Card className="rounded-2xl border border-border/80 shadow-xs bg-card flex flex-col justify-between overflow-hidden">
        <CardHeader className="p-4 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-success-muted flex items-center justify-center text-success">
              <PieChartIcon className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-foreground">
                Sức khỏe & Tiến độ đồ án
              </CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground">
                Phân bố tình trạng 32 nhóm đồ án kỳ này
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-5">
          {/* Donut Chart SVG Visual */}
          <div className="flex items-center justify-center gap-6">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                {/* Background Ring */}
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  className="text-muted/40"
                />
                {/* 1. Xanh lá: 75% = 24 nhóm */}
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray="66 100"
                  strokeDashoffset="0"
                  className="text-success transition-all duration-500"
                />
                {/* 2. Vàng: 15.6% = 5 nhóm */}
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray="14 100"
                  strokeDashoffset="-66"
                  className="text-warning transition-all duration-500"
                />
                {/* 3. Đỏ: 9.4% = 3 nhóm */}
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray="8 100"
                  strokeDashoffset="-80"
                  className="text-danger transition-all duration-500"
                />
              </svg>

              {/* Center Text */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xl font-extrabold text-foreground font-mono leading-none">
                  32
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Nhóm</span>
              </div>
            </div>

            {/* Legend List */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-success shrink-0" />
                <span className="text-muted-foreground">Đúng tiến độ:</span>
                <strong className="text-foreground font-mono">24 (75%)</strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-warning shrink-0" />
                <span className="text-muted-foreground">Có rủi ro:</span>
                <strong className="text-foreground font-mono">5 (15.6%)</strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-danger shrink-0" />
                <span className="text-muted-foreground">Chậm trễ:</span>
                <strong className="text-foreground font-mono">3 (9.4%)</strong>
              </div>
            </div>
          </div>

          {/* Sprints Progress List */}
          <div className="space-y-2.5 pt-3 border-t border-border/60">
            <p className="text-xs font-semibold text-foreground">Tiến độ nghiệm thu các Sprint:</p>

            <div className="space-y-2.5 text-xs">
              {/* Sprint 1 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-foreground">Sprint 1 (Khởi tạo & Đặc tả)</span>
                  <span className="font-mono font-bold text-success">100%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-success to-success/80 rounded-full w-full" />
                </div>
              </div>

              {/* Sprint 2 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-foreground">Sprint 2 (MVP & Kiến trúc)</span>
                  <span className="font-mono font-bold text-success">96.8%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-success to-success/80 rounded-full w-[96.8%]" />
                </div>
              </div>

              {/* Sprint 3 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-foreground">Sprint 3 (Tích hợp & Core Logic)</span>
                  <span className="font-mono font-bold text-primary">87.5%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full w-[87.5%]" />
                </div>
              </div>

              {/* Sprint 4 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-foreground">Sprint 4 (Testing & Tối ưu)</span>
                  <span className="font-mono font-bold text-warning">46.8%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-warning to-warning/80 rounded-full w-[46.8%]" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
