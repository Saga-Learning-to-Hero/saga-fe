"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import type { LecturerTeamItem } from "@/features/lecturer/teams/types/lecturer-team";

const PROJECT_READY_COLOR = "var(--chart-2)";
const PROJECT_WAITING_COLOR = "var(--chart-4)";
const MEMBER_BAR_COLOR = "var(--chart-1)";

interface CourseAnalyticsChartsProps {
  teams: LecturerTeamItem[];
}

export function CourseAnalyticsCharts({ teams }: CourseAnalyticsChartsProps) {
  const projectStatus = useMemo(() => {
    const withProject = teams.filter((team) => Boolean(team.projectId)).length;
    const waiting = teams.length - withProject;
    return [
      { name: "Đã có dự án", value: withProject, color: PROJECT_READY_COLOR },
      { name: "Chưa khởi tạo", value: waiting, color: PROJECT_WAITING_COLOR },
    ].filter((item) => item.value > 0);
  }, [teams]);

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
        <p className="text-sm font-semibold">Chưa có dữ liệu biểu đồ</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Phân nhóm bằng Excel để xem trạng thái dự án và số thành viên theo nhóm.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <Card className="rounded-2xl border border-border p-5 shadow-xs">
        <h3 className="text-sm font-bold">Trạng thái dự án nhóm</h3>
        <p className="mt-1 text-xs text-muted-foreground">Số nhóm đã khởi tạo dự án so với nhóm còn chờ.</p>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={projectStatus}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={88}
                paddingAngle={3}
              >
                {projectStatus.map((item) => (
                  <Cell key={item.name} fill={item.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value} nhóm`, "Số lượng"]}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  color: "var(--foreground)",
                  fontSize: 12,
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="rounded-2xl border border-border p-5 shadow-xs">
        <h3 className="text-sm font-bold">Số thành viên theo nhóm</h3>
        <p className="mt-1 text-xs text-muted-foreground">Phân bố sĩ số từng nhóm trong lớp học phần.</p>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={memberDistribution} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={56} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value) => [`${value} thành viên`, "Sĩ số"]}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  color: "var(--foreground)",
                  fontSize: 12,
                }}
              />
              <Legend />
              <Bar dataKey="members" name="Thành viên" fill={MEMBER_BAR_COLOR} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
