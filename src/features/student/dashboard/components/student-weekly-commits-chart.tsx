"use client";

import { useMemo, useState } from "react";
import {
  ActivityIcon,
  BarChart3Icon,
  CheckCircle2Icon,
  FlameIcon,
  GitCommitIcon,
  LineChartIcon,
  PieChart as PieChartIcon,
  TrendingUpIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type {
  StudentDashboardTaskMetrics,
  StudentDashboardWeeklyCommit,
} from "../types/student-dashboard-types";

interface StudentWeeklyCommitsChartProps {
  weeklyCommits: StudentDashboardWeeklyCommit[];
  tasks: StudentDashboardTaskMetrics;
}

export function StudentWeeklyCommitsChart({
  weeklyCommits,
  tasks,
}: StudentWeeklyCommitsChartProps) {
  // Chế độ hiển thị: Dạng sóng mượt (Area Wave) hoặc Dạng cột hiện đại (Bar)
  const [chartMode, setChartMode] = useState<"area" | "bar">("area");

  const chartData = useMemo(() => {
    return weeklyCommits.map((item, idx) => {
      const dateToFormat = item.endDate || item.startDate;
      let displayDate = dateToFormat;
      let fullDate = dateToFormat;
      let dayOfWeek = "";

      try {
        const d = new Date(dateToFormat);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        displayDate = `${day}/${month}`;
        fullDate = `${day}/${month}/${year}`;

        const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
        dayOfWeek = days[d.getDay()];
      } catch {
        displayDate = dateToFormat;
      }

      return {
        id: idx,
        dateLabel: displayDate, // Hiển thị ngày tháng rõ ràng ở trục X: dd/MM (ví dụ 20/09)
        fullDate,
        dayOfWeek,
        commits: item.commits,
      };
    });
  }, [weeklyCommits]);

  // Thống kê nhanh
  const totalCommits = useMemo(
    () => chartData.reduce((acc, cur) => acc + cur.commits, 0),
    [chartData]
  );

  const peakDay = useMemo(() => {
    if (chartData.length === 0) return null;
    return chartData.reduce((max, cur) => (cur.commits > max.commits ? cur : max), chartData[0]);
  }, [chartData]);

  const avgCommits = useMemo(() => {
    if (chartData.length === 0) return "0";
    return (totalCommits / chartData.length).toFixed(1);
  }, [chartData, totalCommits]);

  // Dữ liệu phân bố nhiệm vụ
  const statusSegments = [
    { key: "todo", name: "Cần làm", value: tasks.todo, color: "#94A3B8" },
    { key: "inProgress", name: "Đang làm", value: tasks.inProgress, color: "#3B82F6" },
    { key: "inReview", name: "Đang duyệt", value: tasks.inReview, color: "#A855F7" },
    { key: "done", name: "Hoàn thành", value: tasks.done, color: "#10B981" },
    ...(tasks.blocked > 0 ? [{ key: "blocked", name: "Bị chặn", value: tasks.blocked, color: "#F43F5E" }] : []),
  ];

  const activeSegments = statusSegments.filter((item) => item.value > 0);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      {/* 1. Biểu đồ Commit Hiện Đại (Area Gradient hoặc Capsule Bar) */}
      <Card className="flex flex-col overflow-hidden rounded-3xl border border-border/80 bg-card/90 shadow-xs lg:col-span-7">
        <CardHeader className="border-b border-border/60 p-4 pb-3 sm:p-5 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
              <ActivityIcon className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-foreground tracking-tight">
                  Nhịp độ đóng góp mã nguồn
                </CardTitle>
                <Badge variant="outline" className="font-mono text-[10px] bg-primary/10 text-primary border-primary/25">
                  {totalCommits} commits
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Dấu vết commit của bạn ghi nhận theo từng mốc ngày thực tế
              </CardDescription>
            </div>
          </div>

          {/* Công tắc chuyển đổi giao diện: Sóng Gradient vs Cột Hiện Đại */}
          <div className="flex items-center rounded-xl border border-border/70 bg-muted/40 p-1">
            <button
              type="button"
              onClick={() => setChartMode("area")}
              title="Dạng sóng mềm mại (Smooth Wave)"
              className={cn(
                "rounded-lg p-1.5 transition-all cursor-pointer",
                chartMode === "area"
                  ? "bg-card text-primary shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LineChartIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setChartMode("bar")}
              title="Dạng cột bo tròn (Modern Bars)"
              className={cn(
                "rounded-lg p-1.5 transition-all cursor-pointer",
                chartMode === "bar"
                  ? "bg-card text-primary shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <BarChart3Icon className="size-4" />
            </button>
          </div>
        </CardHeader>

        {/* Quick Stats Ribbon */}
        {chartData.length > 0 && (
          <div className="flex items-center justify-between px-5 py-2.5 bg-muted/20 border-b border-border/50 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <FlameIcon className="size-3.5 text-amber-500" />
              <span>Cao điểm:</span>
              <span className="font-mono font-bold text-foreground">
                {peakDay ? `${peakDay.commits} commit (${peakDay.dateLabel})` : "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <TrendingUpIcon className="size-3.5 text-emerald-500" />
              <span>Trung bình:</span>
              <span className="font-mono font-bold text-foreground">{avgCommits} commit/ngày</span>
            </div>
          </div>
        )}

        <CardContent className="p-5 flex-1 flex flex-col justify-center">
          {chartData.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border/80 p-8 text-center text-xs text-muted-foreground">
              Chưa có dữ liệu commit để hiển thị biểu đồ.
            </p>
          ) : (
            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {chartMode === "area" ? (
                  /* Option 1: Area Chart Linear Wave with Gradient Glow */
                  <AreaChart data={chartData} margin={{ top: 16, right: 24, left: -18, bottom: 6 }}>
                    <defs>
                      <linearGradient id="commitGlowGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="commitLineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#818cf8" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="4 4"
                      vertical={false}
                      stroke="var(--border)"
                      opacity={0.4}
                    />
                    <XAxis
                      dataKey="dateLabel"
                      tick={{
                        fontSize: 11,
                        fill: "var(--muted-foreground)",
                        fontFamily: "var(--font-mono)",
                      }}
                      tickMargin={6}
                      padding={{ left: 16, right: 16 }}
                      interval={0}
                      tickLine={false}
                      axisLine={{ stroke: "var(--border)" }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fontSize: 11,
                        fill: "var(--muted-foreground)",
                        fontFamily: "var(--font-mono)",
                      }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const data = payload[0].payload as (typeof chartData)[number];
                        return (
                          <div className="rounded-2xl border border-primary/30 bg-card/95 p-3 text-xs shadow-2xl backdrop-blur-md space-y-1.5 min-w-[150px]">
                            <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-1">
                              <span className="text-muted-foreground text-[11px]">{data.dayOfWeek}</span>
                              <span className="font-mono font-bold text-foreground">{data.fullDate}</span>
                            </div>
                            <p className="flex items-center gap-1.5 font-mono text-xs text-primary font-bold pt-0.5">
                              <GitCommitIcon className="size-4" />
                              <span>{data.commits} commit</span>
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="commits"
                      stroke="url(#commitLineGradient)"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#commitGlowGradient)"
                      dot={{
                        r: 4,
                        fill: "var(--card)",
                        stroke: "#818cf8",
                        strokeWidth: 2,
                      }}
                      activeDot={{
                        r: 6,
                        fill: "#818cf8",
                        stroke: "var(--card)",
                        strokeWidth: 3,
                      }}
                    />
                  </AreaChart>
                ) : (
                  /* Option 2: Modern Rounded Capsule Bar Chart */
                  <BarChart data={chartData} margin={{ top: 16, right: 24, left: -18, bottom: 6 }}>
                    <defs>
                      <linearGradient id="barModernGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="4 4"
                      vertical={false}
                      stroke="var(--border)"
                      opacity={0.4}
                    />
                    <XAxis
                      dataKey="dateLabel"
                      tick={{
                        fontSize: 11,
                        fill: "var(--muted-foreground)",
                        fontFamily: "var(--font-mono)",
                      }}
                      tickMargin={6}
                      padding={{ left: 16, right: 16 }}
                      interval={0}
                      tickLine={false}
                      axisLine={{ stroke: "var(--border)" }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fontSize: 11,
                        fill: "var(--muted-foreground)",
                        fontFamily: "var(--font-mono)",
                      }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const data = payload[0].payload as (typeof chartData)[number];
                        return (
                          <div className="rounded-2xl border border-primary/30 bg-card/95 p-3 text-xs shadow-2xl backdrop-blur-md space-y-1.5 min-w-[150px]">
                            <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-1">
                              <span className="text-muted-foreground text-[11px]">{data.dayOfWeek}</span>
                              <span className="font-mono font-bold text-foreground">{data.fullDate}</span>
                            </div>
                            <p className="flex items-center gap-1.5 font-mono text-xs text-primary font-bold pt-0.5">
                              <GitCommitIcon className="size-4" />
                              <span>{data.commits} commit</span>
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Bar
                      dataKey="commits"
                      fill="url(#barModernGradient)"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Biểu đồ Phân Bố Nhiệm Vụ (Donut Gauge Style) */}
      <Card className="flex flex-col overflow-hidden rounded-3xl border border-border/80 bg-card/90 shadow-xs lg:col-span-5">
        <CardHeader className="border-b border-border/60 p-4 pb-3 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
              <PieChartIcon className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-foreground tracking-tight">
                Phân bố nhiệm vụ của tôi
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Tỷ lệ hoàn thành công việc theo quy trình Jira chuẩn
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col justify-between space-y-4 p-5">
          {tasks.totalAssigned === 0 || activeSegments.length === 0 ? (
            <p className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border/80 p-8 text-center text-xs text-muted-foreground">
              Bạn chưa có nhiệm vụ nào được phân công.
            </p>
          ) : (
            <>
              <div className="relative flex h-48 w-full items-center justify-center sm:h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activeSegments}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={84}
                      paddingAngle={activeSegments.length > 1 ? 4 : 0}
                      dataKey="value"
                    >
                      {activeSegments.map((entry) => (
                        <Cell key={entry.key} fill={entry.color} stroke="var(--card)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const data = payload[0].payload as (typeof activeSegments)[number];
                        return (
                          <div className="rounded-xl border border-border bg-popover/95 p-2 text-xs shadow-xl backdrop-blur-xs">
                            <span className="font-semibold">{data.name}: </span>
                            <span className="font-mono font-bold">{data.value} task</span>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <div className="p-1.5 rounded-full bg-primary/10 text-primary mb-1">
                    <CheckCircle2Icon className="size-4" />
                  </div>
                  <span className="font-mono text-2xl font-black text-foreground">
                    {typeof tasks.completionPercent === "number"
                      ? `${Math.round(tasks.completionPercent)}%`
                      : "0%"}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">Hoàn thành</span>
                </div>
              </div>

              {/* Các thẻ trạng thái pill bên dưới */}
              <div className="grid grid-cols-2 gap-2 pt-2 sm:grid-cols-4">
                {statusSegments.map((seg) => (
                  <div
                    key={seg.key}
                    className="flex flex-col items-center rounded-2xl border border-border/60 bg-muted/20 p-2.5 text-center transition-all hover:bg-muted/40"
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="size-2 rounded-full" style={{ backgroundColor: seg.color }} />
                      <span className="text-[10px] text-muted-foreground font-medium">{seg.name}</span>
                    </div>
                    <span className="font-mono text-sm font-bold text-foreground">{seg.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
