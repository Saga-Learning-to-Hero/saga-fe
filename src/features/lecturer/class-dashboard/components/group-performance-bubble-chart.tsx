"use client";

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell, LabelList, ZAxis, ReferenceArea } from "recharts";
import type { GroupHealth } from "../types/course-dashboard";
import { dashboardChartColors } from "../utils/dashboard-colors";

interface Props {
  groups: GroupHealth[];
  selectedTeamId: string | null;
  onSelectTeam: (id: string) => void;
}

export function GroupPerformanceBubbleChart({ groups, selectedTeamId, onSelectTeam }: Props) {
  // Format data for ScatterChart
  const data = groups.map(g => {
    const completionRate = g.totalTasks > 0 ? (g.tasksCompleted / g.totalTasks) * 100 : 0;
    return {
      ...g,
      x: Math.round(completionRate),
      y: g.commitsLast7Days,
      z: g.totalTasks, // size of bubble
      shortName: g.name.replace("Nhóm ", "N"),
    };
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "HEALTHY": return dashboardChartColors.success;
      case "WARNING": return dashboardChartColors.warning;
      case "CRITICAL": return dashboardChartColors.danger;
      default: return dashboardChartColors.muted;
    }
  };

  // Calculate medians for quadrants
  const avgX = data.reduce((acc, curr) => acc + curr.x, 0) / (data.length || 1);
  const avgY = data.reduce((acc, curr) => acc + curr.y, 0) / (data.length || 1);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <h3 className="text-base font-bold text-foreground">Bản đồ hiệu suất các nhóm</h3>
        <p className="text-xs text-muted-foreground">Phân bổ tiến độ công việc và cập nhật mã nguồn</p>
      </div>
      
      <div className="flex-1 min-h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={dashboardChartColors.border} />
            
            {/* Quadrant backgrounds */}
            <ReferenceArea x1={Math.round(avgX)} x2={100} y1={Math.round(avgY)} y2={1000} fill={dashboardChartColors.success} fillOpacity={0.05} />
            <ReferenceArea x1={0} x2={Math.round(avgX)} y1={0} y2={Math.round(avgY)} fill={dashboardChartColors.danger} fillOpacity={0.05} />

            <XAxis 
              type="number" 
              dataKey="x" 
              name="Tiến độ" 
              unit="%" 
              domain={[0, 100]} 
              tick={{ fontSize: 12, fill: dashboardChartColors.muted }}
              axisLine={{ stroke: dashboardChartColors.border }}
              tickLine={false}
              label={{ value: 'Công việc hoàn thành (%)', position: 'bottom', offset: 0, fontSize: 12, fill: dashboardChartColors.muted }}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name="Hoạt động" 
              tick={{ fontSize: 12, fill: dashboardChartColors.muted }}
              axisLine={{ stroke: dashboardChartColors.border }}
              tickLine={false}
              label={{ value: 'Cập nhật mã nguồn (7 ngày)', angle: -90, position: 'left', offset: 0, fontSize: 12, fill: dashboardChartColors.muted }}
            />
            <ZAxis dataKey="z" range={[100, 400]} />
            
            {/* Quadrant lines */}
            <ReferenceLine x={Math.round(avgX)} stroke={dashboardChartColors.muted} strokeDasharray="3 3" opacity={0.5} />
            <ReferenceLine y={Math.round(avgY)} stroke={dashboardChartColors.muted} strokeDasharray="3 3" opacity={0.5} />

            <Tooltip 
              cursor={{ strokeDasharray: '3 3', stroke: dashboardChartColors.muted }}
              contentStyle={{
                backgroundColor: dashboardChartColors.popover,
                borderColor: dashboardChartColors.border,
                borderRadius: "var(--radius)",
                color: dashboardChartColors.popoverForeground,
                fontSize: "12px",
                fontWeight: 500,
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
              }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-popover border border-border p-3 rounded-lg shadow-md max-w-[220px]">
                      <div className="font-bold text-foreground mb-1 flex items-center gap-2">
                        <div className="size-3 rounded-full" style={{ backgroundColor: getStatusColor(data.status) }} />
                        {data.name}
                      </div>
                      <div className="text-xs text-muted-foreground mb-3">{data.projectName}</div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        <span className="text-muted-foreground">Tiến độ:</span>
                        <span className="font-semibold text-foreground text-right">{data.x}%</span>
                        <span className="text-muted-foreground">Cập nhật:</span>
                        <span className="font-semibold text-foreground text-right">{data.y} lần</span>
                        <span className="text-muted-foreground">Công việc:</span>
                        <span className="font-semibold text-foreground text-right">{data.z}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            
            <Scatter 
              name="Nhóm" 
              data={data} 
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={(e: any) => {
                const id = e?.payload?.id || e?.id;
                if (id) onSelectTeam(id);
              }}
              className="cursor-pointer transition-all"
            >
              {data.map((entry) => {
                const isSelected = selectedTeamId === entry.id;
                const opacity = selectedTeamId && !isSelected ? 0.45 : 1;
                return (
                  <Cell 
                    key={entry.id} 
                    fill={getStatusColor(entry.status)}
                    stroke={isSelected ? dashboardChartColors.primary : "none"}
                    strokeWidth={isSelected ? 3 : 0}
                    opacity={opacity}
                  />
                );
              })}
              <LabelList 
                dataKey="shortName" 
                position="center" 
                fill={dashboardChartColors.background} 
                fontSize={11} 
                fontWeight="bold"
                style={{ pointerEvents: 'none' }}
              />
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground px-4">
        <span>Góc dưới trái: Nguy cơ cao</span>
        <span>Góc trên phải: Ổn định</span>
      </div>
    </div>
  );
}
