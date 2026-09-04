"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const burndownData = [
  { day: "12/08", ideal: 48, actual: 48 },
  { day: "15/08", ideal: 40, actual: 44 },
  { day: "18/08", ideal: 32, actual: 37 },
  { day: "21/08", ideal: 24, actual: 29 },
  { day: "24/08", ideal: 16, actual: 21 },
  { day: "27/08", ideal: 8, actual: 13 },
  { day: "30/08", ideal: 0, actual: 7 },
];

const workDistributionData = [
  { label: "Công việc", todo: 8, progress: 6, review: 4, blocked: 2, done: 21 },
];

const flowData = [
  { day: "Tuần 1", todo: 22, progress: 6, review: 2, done: 3 },
  { day: "Tuần 2", todo: 16, progress: 8, review: 4, done: 8 },
  { day: "Tuần 3", todo: 10, progress: 7, review: 5, done: 16 },
  { day: "Tuần 4", todo: 6, progress: 5, review: 3, done: 25 },
];

const velocityData = [
  { sprint: "Sprint 1", committed: 34, completed: 28 },
  { sprint: "Sprint 2", committed: 38, completed: 35 },
  { sprint: "Sprint 3", committed: 42, completed: 31 },
];

const activityData = [
  { day: "12/08", commits: 4, issues: 1 },
  { day: "15/08", commits: 7, issues: 3 },
  { day: "18/08", commits: 5, issues: 2 },
  { day: "21/08", commits: 11, issues: 4 },
  { day: "24/08", commits: 8, issues: 3 },
  { day: "27/08", commits: 13, issues: 5 },
  { day: "30/08", commits: 6, issues: 2 },
];

const cycleTimeData = [
  { type: "Story", hours: 42 },
  { type: "Task", hours: 28 },
  { type: "Bug", hours: 18 },
];

const contributionData = [
  { member: "Nguyễn Văn A", commit: 18, pullRequest: 5, review: 7, jira: 8 },
  { member: "Trần Thị B", commit: 15, pullRequest: 4, review: 6, jira: 7 },
  { member: "Lê Văn C", commit: 12, pullRequest: 3, review: 5, jira: 6 },
  { member: "Phạm Thị D", commit: 7, pullRequest: 2, review: 3, jira: 4 },
];

const chartColors = {
  primary: "var(--chart-1)",
  accent: "var(--chart-2)",
  success: "var(--saga-success)",
  warning: "var(--saga-warning)",
  danger: "var(--saga-danger)",
  muted: "var(--muted-foreground)",
  border: "var(--border)",
};

const axisStyle = { fontSize: 11, fill: chartColors.muted };
const gridColor = chartColors.border;
const tooltipContentStyle = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  color: "var(--popover-foreground)",
  boxShadow: "var(--shadow-md)",
};
const tooltipLabelStyle = { color: "var(--foreground)", fontWeight: 700 };
const tooltipItemStyle = { color: "var(--foreground)" };

export function SprintBurndownChart() {
  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={240}>
      <LineChart data={burndownData} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="day" tick={axisStyle} tickLine={false} axisLine={false} />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} />
        <Legend />
        <Line name="Lý tưởng" dataKey="ideal" stroke={chartColors.muted} strokeWidth={2} strokeDasharray="6 4" dot={false} />
        <Line name="Thực tế" dataKey="actual" stroke={chartColors.primary} strokeWidth={3} dot={{ r: 3, fill: chartColors.primary }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function WorkDistributionChart() {
  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={240}>
      <BarChart data={workDistributionData} layout="vertical" margin={{ top: 25, right: 12, left: 0, bottom: 25 }}>
        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tick={axisStyle} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="label" hide />
        <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} />
        <Legend />
        <Bar name="Chờ xử lý" dataKey="todo" stackId="work" fill={chartColors.muted} radius={[4, 0, 0, 4]} />
        <Bar name="Đang làm" dataKey="progress" stackId="work" fill={chartColors.primary} />
        <Bar name="Đang rà soát" dataKey="review" stackId="work" fill={chartColors.warning} />
        <Bar name="Bị chặn" dataKey="blocked" stackId="work" fill={chartColors.danger} />
        <Bar name="Hoàn thành" dataKey="done" stackId="work" fill={chartColors.success} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CumulativeFlowChart() {
  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={250}>
      <AreaChart data={flowData} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="day" tick={axisStyle} tickLine={false} axisLine={false} />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} /><Legend />
        <Area name="Chờ xử lý" dataKey="todo" stackId="flow" fill={chartColors.muted} stroke={chartColors.muted} fillOpacity={0.55} />
        <Area name="Đang làm" dataKey="progress" stackId="flow" fill={chartColors.primary} stroke={chartColors.primary} fillOpacity={0.7} />
        <Area name="Đang rà soát" dataKey="review" stackId="flow" fill={chartColors.warning} stroke={chartColors.warning} fillOpacity={0.72} />
        <Area name="Hoàn thành" dataKey="done" stackId="flow" fill={chartColors.success} stroke={chartColors.success} fillOpacity={0.75} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function VelocityChart() {
  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={250}>
      <BarChart data={velocityData} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="sprint" tick={axisStyle} tickLine={false} axisLine={false} />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} /><Legend />
        <Bar name="Cam kết" dataKey="committed" fill={chartColors.warning} radius={[4, 4, 0, 0]} />
        <Bar name="Hoàn thành" dataKey="completed" fill={chartColors.success} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CommitIssueChart() {
  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={250}>
      <ComposedChart data={activityData} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="day" tick={axisStyle} tickLine={false} axisLine={false} />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} /><Legend />
        <Bar name="Cập nhật mã nguồn" dataKey="commits" fill={chartColors.primary} radius={[4, 4, 0, 0]} />
        <Line name="Công việc hoàn thành" dataKey="issues" stroke={chartColors.accent} strokeWidth={3} dot={{ r: 3, fill: chartColors.accent }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function CycleTimeChart() {
  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={250}>
      <BarChart data={cycleTimeData} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" unit="h" tick={axisStyle} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="type" width={48} tick={axisStyle} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} />
        <Bar name="Giờ trung bình" dataKey="hours" fill={chartColors.accent} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MemberContributionChart() {
  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={260}>
      <BarChart data={contributionData} layout="vertical" margin={{ top: 8, right: 16, left: 18, bottom: 0 }}>
        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tick={axisStyle} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="member" width={100} tick={axisStyle} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} /><Legend />
        <Bar name="Cập nhật mã nguồn" dataKey="commit" stackId="member" fill={chartColors.primary} />
        <Bar name="Yêu cầu hợp nhất" dataKey="pullRequest" stackId="member" fill={chartColors.accent} />
        <Bar name="Rà soát mã nguồn" dataKey="review" stackId="member" fill={chartColors.warning} />
        <Bar name="Công việc Jira" dataKey="jira" stackId="member" fill={chartColors.success} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
