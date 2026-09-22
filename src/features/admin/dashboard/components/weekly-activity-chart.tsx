"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  formatDashboardDate,
  formatDashboardPercent,
} from "../lib/dashboard-format";
import type { AdminDashboardWeeklyPoint } from "../types/dashboard";

interface WeeklyActivityChartProps {
  weeklyTimeline: AdminDashboardWeeklyPoint[];
}

export function WeeklyActivityChart({
  weeklyTimeline,
}: WeeklyActivityChartProps) {
  const chartData = weeklyTimeline.map((week) => ({
    ...week,
    displayLabel: week.isCurrentWeek ? `${week.weekLabel} •` : week.weekLabel,
  }));

  return (
    <div className="overflow-x-auto pb-2 md:overflow-x-hidden">
      <div className="h-72 min-w-[720px] md:min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 8, right: 12, left: -14, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="displayLabel"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="count"
              allowDecimals={false}
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="rate"
              orientation="right"
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              labelFormatter={(_, payload) => {
                const point = payload?.[0]?.payload as
                  | AdminDashboardWeeklyPoint
                  | undefined;
                if (!point) return "";
                return `${point.weekLabel}: ${formatDashboardDate(point.startDate)} – ${formatDashboardDate(point.endDate)}`;
              }}
              formatter={(value, name) => {
                const numericValue = Number(value);
                if (name === "Tỷ lệ đối soát" || name === "Traceability") {
                  return [
                    Number.isFinite(numericValue)
                      ? formatDashboardPercent(numericValue)
                      : "Chưa có dữ liệu",
                    name,
                  ];
                }
                return [
                  Number.isFinite(numericValue)
                    ? numericValue.toLocaleString("vi-VN")
                    : "0",
                  name,
                ];
              }}
              contentStyle={{
                borderRadius: 12,
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-popover)",
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            <Bar
              yAxisId="count"
              dataKey="commits"
              name="Lượt commit"
              fill="#4F6FEA"
              radius={[5, 5, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              yAxisId="count"
              dataKey="tasksCompleted"
              name="Task hoàn thành"
              fill="#14B8A6"
              radius={[5, 5, 0, 0]}
              maxBarSize={28}
            />
            <Line
              yAxisId="rate"
              type="monotone"
              dataKey="traceabilityRate"
              name="Tỷ lệ đối soát"
              stroke="#F59E0B"
              strokeWidth={2}
              connectNulls={false}
              dot={{ r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
