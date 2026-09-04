"use client";

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { GroupHealth } from "../types/course-dashboard";
import { dashboardChartColors } from "../utils/dashboard-colors";

interface Props {
  groups: GroupHealth[];
  selectedTeamId: string | null;
}

export function TeamRadarChart({ groups, selectedTeamId }: Props) {
  const selectedTeam = groups.find(g => g.id === selectedTeamId);

  // Calculate averages if no team selected or for comparison
  const averages = {
    taskCompletion: 0,
    codeActivity: 0,
    participation: 0,
    contributionBalance: 0,
    onTimeDelivery: 0,
  };

  let metricsCount = 0;
  groups.forEach(g => {
    if (g.metrics) {
      averages.taskCompletion += g.metrics.taskCompletion;
      averages.codeActivity += g.metrics.codeActivity;
      averages.participation += g.metrics.participation;
      averages.contributionBalance += g.metrics.contributionBalance;
      averages.onTimeDelivery += g.metrics.onTimeDelivery;
      metricsCount++;
    }
  });

  const count = metricsCount || 1;
  Object.keys(averages).forEach(k => {
    const key = k as keyof typeof averages;
    averages[key] = Math.round(averages[key] / count);
  });

  const data = [
    {
      subject: "Tiến độ công việc",
      classAvg: averages.taskCompletion,
      team: selectedTeam?.metrics?.taskCompletion || 0,
    },
    {
      subject: "Hoạt động mã nguồn",
      classAvg: averages.codeActivity,
      team: selectedTeam?.metrics?.codeActivity || 0,
    },
    {
      subject: "Mức độ tham gia",
      classAvg: averages.participation,
      team: selectedTeam?.metrics?.participation || 0,
    },
    {
      subject: "Cân bằng đóng góp",
      classAvg: averages.contributionBalance,
      team: selectedTeam?.metrics?.contributionBalance || 0,
    },
    {
      subject: "Hoàn thành đúng hạn",
      classAvg: averages.onTimeDelivery,
      team: selectedTeam?.metrics?.onTimeDelivery || 0,
    },
  ];

  if (!selectedTeam) {
    return null;
  }

  // Determine strengths and weaknesses
  const sortedData = [...data].sort((a, b) => b.team - a.team);
  const strengths = sortedData.slice(0, 2);
  const weaknesses = sortedData.slice(-2).reverse();

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2">
        <h3 className="text-base font-bold text-foreground">Hồ sơ hoạt động — {selectedTeam.name}</h3>
        <p className="text-[11px] text-muted-foreground">So sánh với mức trung bình của lớp</p>
      </div>

      <div className="flex-1 w-full min-h-[250px] flex flex-col sm:flex-row items-center">
        <div className="w-full sm:w-2/3 h-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
              <PolarGrid stroke={dashboardChartColors.border} />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: dashboardChartColors.foreground, fontSize: 10, fontWeight: 500 }} 
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]} 
                tick={{ fill: dashboardChartColors.muted, fontSize: 10 }}
                axisLine={false}
              />
              <Radar
                name="Trung bình lớp"
                dataKey="classAvg"
                stroke={dashboardChartColors.muted}
                fill={dashboardChartColors.muted}
                fillOpacity={0.3}
              />
              <Radar
                name={selectedTeam.name}
                dataKey="team"
                stroke={dashboardChartColors.primary}
                fill={dashboardChartColors.primary}
                fillOpacity={0.5}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: dashboardChartColors.popover,
                  borderColor: dashboardChartColors.border,
                  borderRadius: "var(--radius)",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: dashboardChartColors.popoverForeground,
                }}
                itemStyle={{ color: dashboardChartColors.foreground }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any, name: any) => [`${value}%`, name]}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full sm:w-1/3 flex flex-col justify-center pl-0 sm:pl-4 mt-4 sm:mt-0 gap-4 border-t sm:border-t-0 sm:border-l border-border/50 pt-4 sm:pt-0">
          <div>
            <h4 className="text-xs font-bold text-emerald-500 mb-1.5 flex items-center gap-1">
              <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Điểm mạnh
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              {strengths.map(s => (
                <li key={s.subject} className="flex justify-between">
                  <span>{s.subject}</span>
                  <span className="font-semibold text-foreground">{s.team}%</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-500 mb-1.5 flex items-center gap-1">
              <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
              Cần cải thiện
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              {weaknesses.map(w => (
                <li key={w.subject} className="flex justify-between">
                  <span>{w.subject}</span>
                  <span className="font-semibold text-foreground">{w.team}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
