"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Label } from "recharts";
import type { GroupHealth } from "../types/course-dashboard";
import { dashboardChartColors } from "../utils/dashboard-colors";

interface Props {
  groups: GroupHealth[];
  selectedTeamId: string | null;
  onSelectTeam: (id: string | null) => void;
}

export function GroupStatusDonut({ groups, selectedTeamId, onSelectTeam }: Props) {
  const healthyGroups = groups.filter(g => g.status === "HEALTHY");
  const warningGroups = groups.filter(g => g.status === "WARNING");
  const criticalGroups = groups.filter(g => g.status === "CRITICAL");

  // Determine active slice if a team is selected
  const selectedTeam = groups.find(g => g.id === selectedTeamId);

  const data = [
    {
      id: "healthy",
      name: "Ổn định",
      value: healthyGroups.length,
      groups: healthyGroups,
      color: dashboardChartColors.success
    },
    {
      id: "warning",
      name: "Cần chú ý",
      value: warningGroups.length,
      groups: warningGroups,
      color: dashboardChartColors.warning
    },
    {
      id: "critical",
      name: "Nguy cơ cao",
      value: criticalGroups.length,
      groups: criticalGroups,
      color: dashboardChartColors.danger
    }
  ].filter(d => d.value > 0);

  // If a team is selected, maybe we highlight its slice
  const activeIndex = selectedTeam
    ? data.findIndex(d => d.groups.some(g => g.id === selectedTeam.id))
    : -1;

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2">
        <h3 className="text-base font-bold text-foreground">Trạng thái các nhóm</h3>
        <p className="text-xs text-muted-foreground">Phân bổ trạng thái của {groups.length} nhóm</p>
      </div>

      <div className="flex-1 min-h-[220px] w-full flex flex-col justify-center">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              onClick={(entry) => {
                const sliceGroups = entry.payload?.groups;
                if (!sliceGroups) return;

                if (sliceGroups.length === 1) {
                  onSelectTeam(sliceGroups[0].id === selectedTeamId ? null : sliceGroups[0].id);
                } else {
                  onSelectTeam(null);
                }
              }}
              className="cursor-pointer"
            >
              {data.map((entry) => (
                <Cell
                  key={`cell-${entry.id}`}
                  fill={entry.color}
                  style={{
                    opacity: selectedTeam && activeIndex >= 0 && !entry.groups.some(g => g.id === selectedTeam.id) ? 0.3 : 1,
                    transition: 'opacity 0.3s'
                  }}
                />
              ))}
              <Label
                value={`${groups.length} nhóm`}
                position="center"
                className="fill-foreground font-bold text-lg"
              />
            </Pie>
            <RechartsTooltip
              contentStyle={{
                backgroundColor: dashboardChartColors.popover,
                borderColor: dashboardChartColors.border,
                borderRadius: "var(--radius)",
                fontSize: "12px",
                fontWeight: 500,
                color: dashboardChartColors.popoverForeground,
              }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-popover border border-border p-3 rounded-lg shadow-md max-w-[200px]">
                      <div className="font-bold mb-2 flex items-center gap-2">
                        <div className="size-3 rounded-full" style={{ backgroundColor: data.color }} />
                        {data.name} · {data.value} nhóm
                      </div>
                      <ul className="text-xs space-y-1.5 text-muted-foreground">
                        {data.groups.map((g: GroupHealth) => (
                          <li key={g.id}>
                            <div className="font-semibold text-foreground">{g.name} — {g.projectName}</div>
                            <div>{g.tasksCompleted}/{g.totalTasks} công việc · {g.commitsLast7Days} cập nhật</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="mt-4 flex flex-col gap-2.5 px-2">
          {data.map(item => (
            <div key={item.id} className="flex flex-col text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-semibold text-foreground">{item.name}</span>
                </div>
                <span className="text-muted-foreground">{item.value} nhóm</span>
              </div>
              {/* Only show list if it's warning or critical to draw attention */}
              {item.id !== "healthy" && item.groups.length > 0 && (
                <div className="text-[11px] text-muted-foreground pl-5 mt-0.5">
                  {item.groups.map(g => g.name).join(", ")}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
