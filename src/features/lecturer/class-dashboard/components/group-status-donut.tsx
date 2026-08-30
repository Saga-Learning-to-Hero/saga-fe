"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { GroupHealth } from "../types/course-dashboard";

export function GroupStatusDonut({ groups }: { groups: GroupHealth[] }) {
  const statusCounts = groups.reduce(
    (acc, group) => {
      acc[group.status] = (acc[group.status] || 0) + 1;
      return acc;
    },
    { HEALTHY: 0, WARNING: 0, CRITICAL: 0 } as Record<string, number>
  );

  const data = [
    { name: "Ổn định", value: statusCounts.HEALTHY, color: "hsl(var(--saga-success, 142 71% 45%))" },
    { name: "Cảnh báo", value: statusCounts.WARNING, color: "hsl(var(--saga-warning, 38 92% 50%))" },
    { name: "Nghiêm trọng", value: statusCounts.CRITICAL, color: "hsl(var(--saga-danger, 348 83% 47%))" },
  ].filter((d) => d.value > 0);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2">
        <h3 className="text-base font-bold text-foreground">Trạng thái các nhóm</h3>
        <p className="text-xs text-muted-foreground">Phân bổ sức khỏe dự án</p>
      </div>
      <div className="flex-1 min-h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="hsl(var(--background))"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                borderColor: "hsl(var(--border))",
                borderRadius: "var(--radius)",
                fontSize: "12px",
                fontWeight: 500,
              }}
              itemStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: "12px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
