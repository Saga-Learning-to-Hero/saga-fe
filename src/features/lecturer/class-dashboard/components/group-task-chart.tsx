"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { GroupHealth } from "../types/course-dashboard";

export function GroupTaskChart({ groups }: { groups: GroupHealth[] }) {
  // Sort groups by completion percentage to show the highest/lowest easily
  const data = [...groups].sort((a, b) => {
    const aPercent = a.tasksCompleted / a.totalTasks;
    const bPercent = b.tasksCompleted / b.totalTasks;
    return bPercent - aPercent;
  });

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <h3 className="text-base font-bold text-foreground">Hoàn thành task theo nhóm</h3>
        <p className="text-xs text-muted-foreground">So sánh tiến độ giữa các nhóm dự án</p>
      </div>

      <div className="h-72 min-h-0 w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              type="number"
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(value: number | string) => `${value}%`}
            />
            <YAxis
              dataKey="name"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--foreground))", fontWeight: 500 }}
              width={70}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                borderColor: "hsl(var(--border))",
                borderRadius: "var(--radius)",
                fontSize: "12px",
                fontWeight: 500,
              }}
              itemStyle={{ color: "hsl(var(--foreground))" }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any, props: any) => {
                const percent = Math.round((props.payload.tasksCompleted / props.payload.totalTasks) * 100);
                return [`${props.payload.tasksCompleted}/${props.payload.totalTasks} (${percent}%)`, "Hoàn thành"];
              }}
            />
            <Bar 
              dataKey={(data: GroupHealth) => (data.tasksCompleted / data.totalTasks) * 100}
              fill="hsl(var(--primary))" 
              radius={[0, 4, 4, 0]}
              barSize={16}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
