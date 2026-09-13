"use client";

import {
  PieChart as PieChartIcon,
  BarChart3Icon,
  LayersIcon,
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
import type { ContributionMember } from "../types/contribution";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatContributionPercent } from "@/features/lecturer/contribution/lib/contribution-utils";

interface ContributionChartsProps {
  members: ContributionMember[];
}

const PIE_COLORS = ["#4F46E5", "#06B6D4", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];

export function ContributionCharts({ members }: ContributionChartsProps) {
  const pieData = members.map((m) => ({
    name: m.fullName || m.studentCode,
    value: Number(m.finalContributionPercentage) || 0,
    studentCode: m.studentCode,
  }));

  const criteriaData = members.map((m) => ({
    name: (m.fullName || m.studentCode).split(" ").slice(-1)[0],
    fullName: m.fullName || m.studentCode,
    Code: Number(m.codeContributionPercentage) || 0,
    Testing: Number(m.testContributionPercentage) || 0,
    Document: Number(m.documentContributionPercentage) || 0,
    Research: Number(m.researchContributionPercentage) || 0,
  }));

  const peerComparisonData = members.map((m) => ({
    name: (m.fullName || m.studentCode).split(" ").slice(-1)[0],
    fullName: m.fullName || m.studentCode,
    TruocPeer: Number(m.sliceContributionPercentage) || 0,
    SauPeer: Number(m.finalContributionPercentage) || 0,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <Card className="rounded-2xl border border-border/80 shadow-2xs bg-card flex flex-col justify-between overflow-hidden">
        <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <PieChartIcon className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                Tỷ Lệ Phân Chia Đóng Góp Cuối Cùng
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Tỷ lệ % sau khi kết hợp lát cắt công việc và đánh giá chéo
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 flex-1 flex flex-col items-center justify-center">
          {pieData.length === 0 || pieData.every((d) => d.value === 0) ? (
            <div className="h-56 flex items-center justify-center text-xs text-muted-foreground">
              Chưa có dữ liệu phân bổ đóng góp.
            </div>
          ) : (
            <>
              <div className="w-full h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                          stroke="transparent"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => [`${formatContributionPercent(Number(val) || 0)}`, "Tỷ lệ"]}
                      contentStyle={{
                        borderRadius: "12px",
                        backgroundColor: "var(--color-card)",
                        borderColor: "var(--color-border)",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-border/50">
                {pieData.map((entry, idx) => (
                  <div key={entry.studentCode} className="flex items-center gap-2 text-xs">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                    />
                    <span className="truncate text-muted-foreground font-medium flex-1">
                      {entry.name}
                    </span>
                    <span className="font-mono font-bold text-foreground shrink-0">
                      {formatContributionPercent(entry.value)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-border/80 shadow-2xs bg-card flex flex-col justify-between overflow-hidden">
        <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <BarChart3Icon className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                Tỷ Trọng 4 Lát Cắt Công Việc (%)
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                So sánh tỷ lệ đóng góp trong từng tiêu chí (Code, Test, Doc, Research)
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 flex-1 flex flex-col justify-center">
          {criteriaData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
              Chưa có dữ liệu tiêu chí.
            </div>
          ) : (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={criteriaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.25} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip
                    formatter={(val) => [`${formatContributionPercent(Number(val) || 0)}`]}
                    contentStyle={{
                      borderRadius: "12px",
                      backgroundColor: "var(--color-card)",
                      borderColor: "var(--color-border)",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Bar dataKey="Code" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Testing" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Document" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Research" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-border/80 shadow-2xs bg-card flex flex-col justify-between overflow-hidden">
        <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <LayersIcon className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                Tác Động Của Đánh Giá Chéo (Peer Review)
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                So sánh tỷ lệ % trước và sau khi nhân hệ số đánh giá chéo
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 flex-1 flex flex-col justify-center">
          {peerComparisonData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
              Chưa có dữ liệu đối so sánh.
            </div>
          ) : (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peerComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.25} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip
                    formatter={(val) => [`${formatContributionPercent(Number(val) || 0)}`]}
                    contentStyle={{
                      borderRadius: "12px",
                      backgroundColor: "var(--color-card)",
                      borderColor: "var(--color-border)",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Bar dataKey="TruocPeer" name="Trước Peer Review" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="SauPeer" name="Sau Peer Review" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
