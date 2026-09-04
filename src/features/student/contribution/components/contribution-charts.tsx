"use client";

import {
  PieChart as PieChartIcon,
  BarChart3Icon,
  GitCommitIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import type { MemberContribution } from "../types/contribution";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ContributionChartsProps {
  members: MemberContribution[];
}

const COLORS = ["#4F46E5", "#06B6D4", "#2563EB", "#F59E0B", "#F43F5E"];

export function ContributionCharts({ members }: ContributionChartsProps) {
  // Data for Donut Chart
  const pieData = members.map((m) => ({
    name: m.name,
    value: m.contributionPercentage,
    studentCode: m.studentCode,
  }));

  // Data for Bar Chart (Normalized metrics)
  const barData = members.map((m) => ({
    name: m.name.split(" ").slice(-1)[0], // Tên ngắn
    fullName: m.name,
    Commits: m.metrics.codeCommits,
    StoryPoints: m.metrics.storyPoints,
    PeerScore: Math.round(m.metrics.peerScore * 4), // Scale up for chart visibility
    Traceability: Math.round(m.metrics.traceabilityRate / 5),
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* ── Chart 1: Donut Chart - Tỷ lệ Phân chia Pie Đóng góp Nhóm (1 Col) ──── */}
      <Card className="rounded-2xl border border-border/80 shadow-2xs bg-card flex flex-col justify-between overflow-hidden">
        <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <PieChartIcon className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                Tỷ lệ Phân chia Đóng góp (% Pie Share)
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Thống kê % khối lượng đóng góp của 5 thành viên
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(val: any, name: any, item: any) => [
                    `${val}%`,
                    `${item.payload.name} (${item.payload.studentCode})`,
                  ]}
                  contentStyle={{
                    backgroundColor: "var(--popover)",
                    borderColor: "var(--border)",
                    borderRadius: "var(--radius)",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-xs text-muted-foreground font-semibold">100% Total</span>
              <span className="text-sm font-extrabold text-foreground font-mono">5 Thành viên</span>
            </div>
          </div>

          {/* Custom Legend */}
          <div className="space-y-1.5 text-xs pt-2 border-t border-border/60">
            {members.map((m, idx) => (
              <div key={m.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-muted-foreground truncate font-medium">{m.name}</span>
                </div>
                <span className="font-mono font-bold text-foreground shrink-0">
                  {m.contributionPercentage}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Chart 2: Grouped Bar Chart - So sánh 4 Trụ cột Đóng góp (2 Cols) ── */}
      <Card className="rounded-2xl border border-border/80 shadow-2xs bg-card lg:col-span-2 flex flex-col justify-between overflow-hidden">
        <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <BarChart3Icon className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                  Phân tích So sánh 4 Nguồn Dữ liệu Đóng góp
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Commits, Story Points Jira, Đánh giá chéo và Traceability
                </CardDescription>
              </div>
            </div>

            <Badge variant="outline" className="text-[10px] font-mono font-semibold self-start sm:self-auto">
              Multi-source Analytics
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--popover)",
                    borderColor: "var(--border)",
                    borderRadius: "var(--radius)",
                    fontSize: "12px",
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(val: any, name: any) => {
                    if (name === "Commits") return [`${val} commits`, "GitHub Commits"];
                    if (name === "StoryPoints") return [`${val} SP`, "Jira Story Points"];
                    if (name === "PeerScore") return [`${(val / 4).toFixed(1)} ★`, "Đánh giá Chéo"];
                    if (name === "Traceability") return [`${val * 5}%`, "Traceability"];
                    return [val, name];
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                />
                <Bar dataKey="Commits" name="GitHub Commits" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="StoryPoints" name="Jira Story Points" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="PeerScore" name="Đánh giá Chéo (x4)" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Traceability" name="Traceability (/5)" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/60 gap-2">
            <span className="flex items-center gap-1.5 text-foreground font-medium">
              <GitCommitIcon className="w-3.5 h-3.5 text-primary" />
              Mô hình trọng số Slicing Pie đảm bảo minh bạch 100%
            </span>
            <span className="font-mono text-[10px]">Cập nhật thời gian thực</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
