"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LecturerTeamItem } from "@/features/lecturer/teams/types/lecturer-team";

interface CourseAnalyticsChartsProps {
  teams: LecturerTeamItem[];
}

export function CourseAnalyticsCharts({ teams }: CourseAnalyticsChartsProps) {
  const totalTeams = teams.length;
  const withProject = useMemo(
    () => teams.filter((team) => Boolean(team.projectId)).length,
    [teams]
  );
  const waiting = totalTeams - withProject;
  const readyPercentage = totalTeams > 0 ? Math.round((withProject / totalTeams) * 100) : 0;

  const projectStatus = useMemo(() => {
    return [
      {
        name: "Đã có dự án",
        value: withProject,
        color: "oklch(0.65 0.18 200)",
        textColor: "text-emerald-600 dark:text-emerald-400",
        dotColor: "bg-emerald-500",
      },
      {
        name: "Chưa khởi tạo",
        value: waiting,
        color: "oklch(0.72 0.18 65)",
        textColor: "text-amber-700 dark:text-amber-400",
        dotColor: "bg-amber-500",
      },
    ];
  }, [withProject, waiting]);

  const totalMembers = useMemo(
    () => teams.reduce((acc, t) => acc + (t.members?.length ?? 0), 0),
    [teams]
  );

  const avgMembers = useMemo(() => {
    if (totalTeams === 0) return 0;
    return Number((totalMembers / totalTeams).toFixed(1));
  }, [totalTeams, totalMembers]);

  const memberDistribution = useMemo(
    () =>
      teams.map((team) => ({
        name: team.teamName || `Nhóm ${team.teamNo}`,
        members: team.members.length,
      })),
    [teams]
  );

  if (teams.length === 0) {
    return (
      <Card className="rounded-2xl border border-dashed border-border p-6 text-center">
        <p className="text-sm font-semibold text-foreground">Chưa có dữ liệu biểu đồ</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Phân nhóm bằng Excel để xem trạng thái dự án và số thành viên theo nhóm.
        </p>
      </Card>
    );
  }

  const isFewTeams = teams.length <= 4;

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-foreground">Trạng thái dự án nhóm</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Tỷ lệ nhóm đã khởi tạo dự án so với nhóm còn chờ.
            </p>
          </div>
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0"
          >
            {readyPercentage}% sẵn sàng
          </Badge>
        </div>

        <div className="relative mt-3 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={projectStatus.filter((item) => item.value > 0)}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="48%"
                innerRadius={66}
                outerRadius={94}
                paddingAngle={4}
                cornerRadius={5}
              >
                {projectStatus.map((item) => (
                  <Cell key={item.name} fill={item.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [
                  `${value} nhóm (${totalTeams > 0 ? Math.round((Number(value) / totalTeams) * 100) : 0}%)`,
                  "Số lượng",
                ]}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  color: "var(--foreground)",
                  fontSize: 12,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-2">
            <span className="font-mono text-3xl font-black text-foreground">
              {readyPercentage}%
            </span>
            <span className="text-[11px] font-semibold text-muted-foreground">
              {withProject}/{totalTeams} nhóm
            </span>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-4 pt-2 border-t border-border/50">
          {projectStatus.map((item) => (
            <div key={item.name} className="flex items-center gap-2 text-xs">
              <span className={`size-2.5 rounded-full ${item.dotColor}`} />
              <span className="text-muted-foreground">{item.name}:</span>
              <span className={`font-mono font-bold ${item.textColor}`}>
                {item.value} nhóm
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-foreground">Số thành viên theo nhóm</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Phân bố sĩ số từng nhóm trong lớp học phần.
            </p>
          </div>
          <Badge
            variant="outline"
            className="border-primary/20 bg-primary/10 font-mono text-[11px] font-bold text-primary shrink-0"
          >
            TB: {avgMembers} sv/nhóm
          </Badge>
        </div>

        <div className="mt-3 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={memberDistribution}
              margin={{ top: 12, right: 12, left: -16, bottom: isFewTeams ? 8 : 24 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                interval={0}
                angle={isFewTeams ? 0 : -20}
                textAnchor={isFewTeams ? "middle" : "end"}
                height={isFewTeams ? 30 : 50}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                domain={[0, (dataMax: number) => Math.max(dataMax + 1, 4)]}
              />
              <Tooltip
                formatter={(value) => [
                  `${value} sinh viên (${totalMembers > 0 ? Math.round((Number(value) / totalMembers) * 100) : 0}% cả lớp)`,
                  "Sĩ số nhóm",
                ]}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  color: "var(--foreground)",
                  fontSize: 12,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              />
              {avgMembers > 0 && (
                <ReferenceLine
                  y={avgMembers}
                  stroke="var(--primary)"
                  strokeDasharray="4 4"
                  opacity={0.6}
                  label={{
                    value: `TB: ${avgMembers}`,
                    position: "insideTopRight",
                    fill: "var(--primary)",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                />
              )}
              <Bar
                dataKey="members"
                name="Thành viên"
                fill="var(--primary)"
                maxBarSize={44}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 flex items-center justify-between pt-2 border-t border-border/50 text-xs text-muted-foreground">
          <span>Tổng sinh viên đã vào nhóm: <strong className="font-mono text-foreground">{totalMembers}</strong></span>
          <span>Số nhóm đồ án: <strong className="font-mono text-foreground">{totalTeams}</strong></span>
        </div>
      </Card>
    </div>
  );
}
