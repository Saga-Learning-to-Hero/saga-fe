"use client";

import { cn } from "@/lib/utils";

interface GaugeProps {
  value: number;
  label: string;
  subLabel: string;
  colorClass: string;
}

function RadialGauge({ value, label, subLabel, colorClass }: GaugeProps) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center">
        {/* Background circle */}
        <svg className="size-24 transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-muted/50"
          />
          {/* Progress circle */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn("transition-all duration-1000", colorClass)}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-xl font-extrabold text-foreground">{value}%</span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-xs font-bold text-foreground">{label}</div>
        <div className="text-[10px] text-muted-foreground">{subLabel}</div>
      </div>
    </div>
  );
}

interface Props {
  semesterProgress: number;
  jiraConnected: number;
  jiraTotal: number;
  githubConnected: number;
  githubTotal: number;
}

export function IntegrationRadialGauges({ 
  semesterProgress, 
  jiraConnected, 
  jiraTotal, 
  githubConnected, 
  githubTotal 
}: Props) {
  const jiraPercent = jiraTotal > 0 ? (jiraConnected / jiraTotal) * 100 : 0;
  const githubPercent = githubTotal > 0 ? (githubConnected / githubTotal) * 100 : 0;

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <h3 className="text-base font-bold text-foreground">Chỉ số tổng quan</h3>
        <p className="text-xs text-muted-foreground">Tiến độ khóa học và trạng thái kết nối</p>
      </div>

      <div className="flex flex-1 items-center justify-between px-2">
        <RadialGauge 
          value={Math.round(semesterProgress)} 
          label="Tiến độ học kỳ" 
          subLabel="Đang diễn ra"
          colorClass="text-primary" 
        />
        <RadialGauge 
          value={Math.round(jiraPercent)} 
          label="Kết nối Jira" 
          subLabel={`${jiraConnected}/${jiraTotal} nhóm`}
          colorClass="text-emerald-500" 
        />
        <RadialGauge 
          value={Math.round(githubPercent)} 
          label="Kết nối GitHub" 
          subLabel={`${githubConnected}/${githubTotal} nhóm`}
          colorClass="text-emerald-500" 
        />
      </div>
    </div>
  );
}
