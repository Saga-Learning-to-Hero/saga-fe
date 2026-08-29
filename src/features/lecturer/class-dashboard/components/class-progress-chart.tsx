"use client";

import { Area, CartesianGrid, ComposedChart, Line, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { WeeklyProgress } from "../types/course-dashboard";

export function ClassProgressChart({ data }: { data: WeeklyProgress[] }) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-foreground">Tiến độ & Hoạt động</h3>
          <p className="text-xs text-muted-foreground">Tỷ lệ hoàn thành task và số lượng commit</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-sm bg-primary" />
            <span className="text-muted-foreground">Thực tế (%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-0.5 w-3 border-b-2 border-dashed border-muted-foreground" />
            <span className="text-muted-foreground">Kế hoạch (%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-sm bg-blue-500/50" />
            <span className="text-muted-foreground">Commits</span>
          </div>
        </div>
      </div>

      <div className="h-72 min-h-0 w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              dy={10}
            />
            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              dx={-10}
              domain={[0, 100]}
              tickFormatter={(value: number | string) => `${value}%`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              dx={10}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--popover)",
                borderColor: "var(--border)",
                borderRadius: "var(--radius)",
                color: "var(--popover-foreground)",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
                fontSize: "12px",
                fontWeight: 500,
              }}
              itemStyle={{ color: "var(--foreground)" }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => {
                if (name === "commitCount") return [value, "Commits"];
                return [`${value}%`, name === "taskCompletion" ? "Thực tế" : "Kế hoạch"];
              }}
              labelStyle={{ color: "var(--muted-foreground)", marginBottom: "4px" }}
            />
            <Bar 
              yAxisId="right"
              dataKey="commitCount"
              fill="var(--chart-2)" 
              radius={[4, 4, 0, 0]} 
            />
            <Area
              type="monotone"
              dataKey="taskCompletion"
              stroke="var(--primary)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorProgress)"
              activeDot={{ r: 6, fill: "var(--primary)", stroke: "var(--background)", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="expectedProgress"
              stroke="var(--muted-foreground)"
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
