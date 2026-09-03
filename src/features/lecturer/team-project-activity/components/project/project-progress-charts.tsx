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

const axisStyle = { fontSize: 11, fill: "hsl(var(--muted-foreground))" };
const gridColor = "hsl(var(--border))";

export function SprintBurndownChart() {
  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={240}>
      <LineChart data={burndownData} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="day" tick={axisStyle} tickLine={false} axisLine={false} />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
        <Tooltip />
        <Legend />
        <Line name="Lý tưởng" dataKey="ideal" stroke="hsl(var(--muted-foreground))" strokeDasharray="6 4" dot={false} />
        <Line name="Thực tế" dataKey="actual" stroke="hsl(var(--primary))" strokeWidth={3} activeDot={{ r: 5 }} />
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
        <Tooltip />
        <Legend />
        <Bar name="Chờ xử lý" dataKey="todo" stackId="work" fill="hsl(var(--muted-foreground))" radius={[4, 0, 0, 4]} />
        <Bar name="Đang làm" dataKey="progress" stackId="work" fill="hsl(var(--chart-1))" />
        <Bar name="Đang review" dataKey="review" stackId="work" fill="hsl(var(--chart-3))" />
        <Bar name="Bị chặn" dataKey="blocked" stackId="work" fill="hsl(var(--destructive))" />
        <Bar name="Hoàn thành" dataKey="done" stackId="work" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
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
        <Tooltip /><Legend />
        <Area name="Chờ xử lý" dataKey="todo" stackId="flow" fill="hsl(var(--muted-foreground))" stroke="hsl(var(--muted-foreground))" />
        <Area name="Đang làm" dataKey="progress" stackId="flow" fill="hsl(var(--chart-1))" stroke="hsl(var(--chart-1))" />
        <Area name="Review" dataKey="review" stackId="flow" fill="hsl(var(--chart-3))" stroke="hsl(var(--chart-3))" />
        <Area name="Hoàn thành" dataKey="done" stackId="flow" fill="hsl(var(--chart-2))" stroke="hsl(var(--chart-2))" />
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
        <Tooltip /><Legend />
        <Bar name="Cam kết" dataKey="committed" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
        <Bar name="Hoàn thành" dataKey="completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
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
        <Tooltip /><Legend />
        <Bar name="Commit" dataKey="commits" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
        <Line name="Issue hoàn thành" dataKey="issues" stroke="hsl(var(--chart-2))" strokeWidth={3} />
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
        <Tooltip /><Bar name="Giờ trung bình" dataKey="hours" fill="hsl(var(--chart-5))" radius={[0, 4, 4, 0]} />
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
        <Tooltip /><Legend />
        <Bar name="Commit" dataKey="commit" stackId="member" fill="hsl(var(--chart-1))" />
        <Bar name="Pull request" dataKey="pullRequest" stackId="member" fill="hsl(var(--chart-5))" />
        <Bar name="Review" dataKey="review" stackId="member" fill="hsl(var(--chart-3))" />
        <Bar name="Jira" dataKey="jira" stackId="member" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
