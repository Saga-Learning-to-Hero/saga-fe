"use client";

import { Area, CartesianGrid, ComposedChart, Line, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine, Legend } from "recharts";
import type { WeeklyProgress } from "../types/course-dashboard";
import { dashboardChartColors } from "../utils/dashboard-colors";

interface Props {
  data: WeeklyProgress[];
  currentWeekLabel?: string;
}

export function ClassProgressChart({ data, currentWeekLabel }: Props) {
  // Find current week index based on label, or fallback to the last item
  const currentIndex = currentWeekLabel
    ? data.findIndex(d => currentWeekLabel.includes(d.week))
    : data.length - 1;

  const currentWeek = currentIndex >= 0 ? data[currentIndex]?.week : undefined;

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-foreground">Tiến độ lớp theo tuần</h3>
          <p className="text-xs text-muted-foreground">Tỷ lệ hoàn thành công việc và tần suất cập nhật mã nguồn</p>
        </div>
      </div>

      <div className="h-72 min-h-0 w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <defs>
              <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={dashboardChartColors.primary} stopOpacity={0.3} />
                <stop offset="95%" stopColor={dashboardChartColors.primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dashboardChartColors.border} strokeOpacity={0.5} />

            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: dashboardChartColors.muted }}
              dy={10}
            />

            {/* Trục Y: Tiến độ % */}
            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: dashboardChartColors.muted }}
              dx={-10}
              domain={[0, 100]}
              tickFormatter={(value: number | string) => `${value}%`}
              label={{ value: '% hoàn thành', angle: -90, position: 'insideLeft', fontSize: 12, fill: dashboardChartColors.muted, dy: 40, dx: -10 }}
            />

            {/* Trục Y: Lần cập nhật */}
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: dashboardChartColors.muted }}
              dx={10}
              label={{ value: 'Lần cập nhật', angle: 90, position: 'insideRight', fontSize: 12, fill: dashboardChartColors.muted, dy: 40, dx: 10 }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: dashboardChartColors.popover,
                borderColor: dashboardChartColors.border,
                borderRadius: "var(--radius)",
                color: dashboardChartColors.popoverForeground,
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
                fontSize: "12px",
                fontWeight: 500,
              }}
              itemStyle={{ color: dashboardChartColors.foreground }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any, props: any) => {
                if (name === "commitCount") return [value, "Cập nhật mã nguồn"];
                if (name === "taskCompletion") {
                  const expected = props.payload.expectedProgress;
                  const diff = value - expected;
                  const diffText = diff > 0 ? `(Nhanh hơn ${diff}%)` : diff < 0 ? `(Chậm hơn ${Math.abs(diff)}%)` : "(Đúng hạn)";
                  return [`${value}% ${diffText}`, "Tiến độ thực tế"];
                }
                if (name === "expectedProgress") {
                  return [`${value}%`, "Tiến độ kế hoạch"];
                }
                return [value, name];
              }}
              labelStyle={{ color: dashboardChartColors.muted, marginBottom: "4px" }}
            />

            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "12px" }} />

            {currentWeek && (
              <ReferenceLine x={currentWeek} stroke={dashboardChartColors.primary} strokeDasharray="3 3" label={{ position: 'top', value: 'Hiện tại', fill: dashboardChartColors.primary, fontSize: 10 }} />
            )}

            <Bar
              name="Cập nhật mã nguồn"
              yAxisId="right"
              dataKey="commitCount"
              fill={dashboardChartColors.chart5}
              radius={[4, 4, 0, 0]}
            />
            <Area
              name="Tiến độ thực tế"
              yAxisId="left"
              type="monotone"
              dataKey="taskCompletion"
              stroke={dashboardChartColors.primary}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorProgress)"
              activeDot={{ r: 6, fill: dashboardChartColors.primary, stroke: dashboardChartColors.background, strokeWidth: 2 }}
            />
            <Line
              name="Tiến độ kế hoạch"
              yAxisId="left"
              type="monotone"
              dataKey="expectedProgress"
              stroke={dashboardChartColors.muted}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
