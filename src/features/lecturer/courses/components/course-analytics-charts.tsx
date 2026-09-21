"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { InfoIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  buildPeerReviewChartData,
  buildTaskStatusTotalsFromTeams,
  buildTaskStatusChartData,
  formatNullablePercent,
  formatRiskReason,
  formatRiskPolicyLegend,
} from "../lib/lecturer-dashboard-format";
import type {
  LecturerDashboardRiskPolicy,
  LecturerDashboardTaskStatusTotals,
  LecturerDashboardTeam,
} from "../types/lecturer-course-dashboard";
import { useDashboardChartFilter } from "../hooks/use-dashboard-chart-filter";
import { CourseChartTeamFilter } from "./course-chart-filters";

const TASK_BAR_COLORS: Record<string, string> = {
  todo: "var(--chart-1)",
  inProgress: "var(--chart-2)",
  inReview: "var(--chart-4)",
  done: "var(--chart-3)",
  blocked: "var(--chart-5)",
  overdue: "var(--destructive)",
};

const RISK_BAR_COLORS: Record<string, string> = {
  HEALTHY: "var(--chart-3)",
  WARNING: "var(--chart-4)",
  CRITICAL: "var(--destructive)",
  UNKNOWN: "var(--muted-foreground)",
};

const CHART_TOOLTIP_STYLE = {
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--card)",
  color: "var(--foreground)",
  fontSize: 12,
};

interface CourseAnalyticsChartsProps {
  riskPolicy: LecturerDashboardRiskPolicy;
  taskStatusTotals: LecturerDashboardTaskStatusTotals;
  teams: LecturerDashboardTeam[];
  onHighlightedTeamIdsChange: (teamIds: string[]) => void;
}

export function CourseAnalyticsCharts({
  riskPolicy,
  taskStatusTotals,
  teams,
  onHighlightedTeamIdsChange,
}: CourseAnalyticsChartsProps) {
  const taskFilter = useDashboardChartFilter(teams);
  const riskFilter = useDashboardChartFilter(teams);
  const peerFilter = useDashboardChartFilter(teams);
  const visibleTaskTotals = useMemo(
    () => taskFilter.isDefault
      ? taskStatusTotals
      : buildTaskStatusTotalsFromTeams(taskFilter.filteredTeams),
    [taskFilter.filteredTeams, taskFilter.isDefault, taskStatusTotals]
  );
  const taskData = useMemo(
    () => buildTaskStatusChartData(visibleTaskTotals),
    [visibleTaskTotals]
  );
  const riskData = useMemo(() => {
    const counts = new Map<string, number>();
    riskFilter.filteredTeams.forEach((team) => counts.set(team.risk.level, (counts.get(team.risk.level) ?? 0) + 1));
    return [
      { key: "HEALTHY", name: "Ổn định", value: counts.get("HEALTHY") ?? 0 },
      { key: "WARNING", name: "Cần chú ý", value: counts.get("WARNING") ?? 0 },
      { key: "CRITICAL", name: "Nghiêm trọng", value: counts.get("CRITICAL") ?? 0 },
      { key: "UNKNOWN", name: "Thiếu dữ liệu", value: counts.get("UNKNOWN") ?? 0 },
    ];
  }, [riskFilter.filteredTeams]);
  const peerData = useMemo(
    () => buildPeerReviewChartData(peerFilter.filteredTeams),
    [peerFilter.filteredTeams]
  );
  const hasAnyPeerData = useMemo(
    () => buildPeerReviewChartData(teams).length > 0,
    [teams]
  );
  const policyLines = useMemo(() => formatRiskPolicyLegend(riskPolicy), [riskPolicy]);
  const hasTasks = visibleTaskTotals.total > 0;
  const hasTeams = riskFilter.filteredTeams.length > 0;
  const hasSubmittedPeerReviews = peerData.some((item) => item.submittedReviews > 0);

  return (
    <div
      className={
        hasAnyPeerData
          ? "grid grid-cols-1 items-start gap-4 xl:grid-cols-3"
          : "grid grid-cols-1 items-start gap-4 xl:grid-cols-2"
      }
    >
      <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-foreground">Công việc Sprint hiện tại</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Trạng thái công việc của các nhóm đang có Sprint.
            </p>
          </div>
          <Badge variant="outline" className="font-mono text-[11px] font-bold">
            {formatNullablePercent(visibleTaskTotals.completionPercent)}
          </Badge>
        </div>
        <div className="mt-3">
          <CourseChartTeamFilter
            idPrefix="task-status-chart"
            teamId={taskFilter.selectedTeamId}
            teamOptions={taskFilter.teamOptions}
            onTeamChange={taskFilter.setSelectedTeamId}
          />
        </div>
        {hasTasks ? (
          <div className="mt-3 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={taskData} margin={{ top: 12, right: 8, left: -16, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
                interval={0}
                angle={-18}
                textAnchor="end"
                height={48}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip
                formatter={(value) => [`${value} công việc`, "Số lượng"]}
                contentStyle={CHART_TOOLTIP_STYLE}
              />
              <Bar dataKey="value" maxBarSize={36} radius={[6, 6, 0, 0]}>
                {taskData.map((item) => (
                  <Cell key={item.key} fill={TASK_BAR_COLORS[item.key] ?? "var(--chart-1)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-border/80 px-4 py-10 text-center">
            <p className="text-sm font-semibold text-foreground">
              Chưa có công việc trong Sprint hiện tại
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Biểu đồ sẽ xuất hiện khi các nhóm bắt đầu lập kế hoạch công việc.
            </p>
          </div>
        )}
        {hasTasks ? (
          <p className="mt-2 border-t border-border/50 pt-2 text-xs text-muted-foreground">
            Tổng {visibleTaskTotals.total} công việc
            {visibleTaskTotals.overdue > 0
              ? ` · ${visibleTaskTotals.overdue} quá hạn`
              : " · không có công việc quá hạn"}
          </p>
        ) : null}
      </Card>

      <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-foreground">Tình trạng các nhóm</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Số nhóm theo từng mức độ cần theo dõi.
            </p>
          </div>
          <Popover>
            <PopoverTrigger
              aria-label="Xem cách xác định nhóm cần theo dõi"
              className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <InfoIcon className="size-4" />
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-4">
              <PopoverHeader>
                <PopoverTitle>Cách xác định nhóm cần theo dõi</PopoverTitle>
                <PopoverDescription>
                  Các ngưỡng đang áp dụng cho Sprint hiện tại.
                </PopoverDescription>
              </PopoverHeader>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {policyLines.map((line) => (
                  <li key={line} className="rounded-lg bg-muted/50 px-3 py-2">
                    {line}
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>
        </div>
        <div className="mt-3">
          <CourseChartTeamFilter
            idPrefix="risk-chart"
            teamId={riskFilter.selectedTeamId}
            teamOptions={riskFilter.teamOptions}
            onTeamChange={riskFilter.setSelectedTeamId}
          />
        </div>
        {hasTeams ? (
          <div className="mt-6">
            <TooltipProvider delay={100}>
              <div
                className="flex h-4 overflow-hidden rounded-full bg-muted"
                aria-label="Phân bố tình trạng các nhóm"
              >
                {riskData
                  .filter((item) => item.value > 0)
                  .map((item) => {
                    const matchingTeams = riskFilter.filteredTeams.filter((team) => team.risk.level === item.key);
                    const teamIds = matchingTeams.map((team) => team.teamId);
                    return (
                      <Tooltip key={item.key}>
                        <TooltipTrigger
                          aria-label={`${item.name}: ${item.value} nhóm`}
                          onMouseEnter={() => onHighlightedTeamIdsChange(teamIds)}
                          onMouseLeave={() => onHighlightedTeamIdsChange([])}
                          onFocus={() => onHighlightedTeamIdsChange(teamIds)}
                          onBlur={() => onHighlightedTeamIdsChange([])}
                          className="h-full cursor-pointer outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                          style={{
                            width: `${(item.value / riskFilter.filteredTeams.length) * 100}%`,
                            backgroundColor: RISK_BAR_COLORS[item.key] ?? "var(--muted-foreground)",
                          }}
                        />
                        <TooltipContent className="block w-64 max-w-64 rounded-xl bg-popover p-3 text-popover-foreground ring-1 ring-border">
                          <p className="font-bold text-foreground">{item.name} · {item.value} nhóm</p>
                          <ul className="mt-2 space-y-1.5 text-[11px] text-muted-foreground">
                            {matchingTeams.slice(0, 3).map((team) => (
                              <li key={team.teamId}>
                                <span className="font-semibold text-foreground">{team.teamName}</span>
                                {team.risk.reasons[0]
                                  ? ` · ${formatRiskReason(team.risk.reasons[0])}`
                                  : " · Không có lý do chi tiết"}
                              </li>
                            ))}
                          </ul>
                          {matchingTeams.length > 3 ? (
                            <p className="mt-2 text-[11px] text-muted-foreground">
                              +{matchingTeams.length - 3} nhóm khác
                            </p>
                          ) : null}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
              </div>
            </TooltipProvider>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {riskData.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between rounded-xl border border-border/70 px-3 py-2.5"
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: RISK_BAR_COLORS[item.key] ?? "var(--muted-foreground)" }}
                    />
                    {item.name}
                  </div>
                  <strong className="font-mono text-sm text-foreground">{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-border/80 px-4 py-10 text-center">
            <p className="text-sm font-semibold text-foreground">Chưa có nhóm để theo dõi</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Hãy phân nhóm sinh viên để bắt đầu theo dõi tiến độ.
            </p>
          </div>
        )}
      </Card>

      {hasAnyPeerData ? (
        <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-foreground">Tiến độ đánh giá chéo</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Tỷ lệ thành viên đã hoàn tất đánh giá trong từng nhóm.
          </p>
        </div>
        <div className="mt-3">
          <CourseChartTeamFilter
            idPrefix="peer-review-chart"
            teamId={peerFilter.selectedTeamId}
            teamOptions={peerFilter.teamOptions}
            onTeamChange={peerFilter.setSelectedTeamId}
          />
        </div>
        {hasSubmittedPeerReviews ? (
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peerData} margin={{ top: 12, right: 8, left: -16, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                  interval={0}
                  angle={peerData.length > 4 ? -20 : 0}
                  textAnchor={peerData.length > 4 ? "end" : "middle"}
                  height={peerData.length > 4 ? 50 : 30}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  unit="%"
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.[0]?.payload) return null;
                    const bar = payload[0].payload as (typeof peerData)[number];
                    return (
                      <div className="min-w-56 rounded-xl border border-border bg-card p-3 text-xs shadow-lg">
                        <p className="font-bold text-foreground">{bar.name}</p>
                        <p className="mt-0.5 text-muted-foreground">
                          {bar.projectName || "Chưa có tên dự án"} · {bar.sprintName || "Sprint hiện tại"}
                        </p>
                        <dl className="mt-2 space-y-1 border-t border-border pt-2">
                          <div className="flex justify-between gap-4"><dt>Đã hoàn tất</dt><dd className="font-mono font-bold">{bar.submittedReviews}/{bar.expectedReviews}</dd></div>
                          <div className="flex justify-between gap-4"><dt>Tỷ lệ</dt><dd className="font-mono font-bold">{formatNullablePercent(bar.completionRate)}</dd></div>
                          <div className="flex justify-between gap-4"><dt>Thành viên chưa nộp</dt><dd className="font-mono font-bold">{bar.pendingStudentCount}</dd></div>
                        </dl>
                      </div>
                    );
                  }}
                  contentStyle={CHART_TOOLTIP_STYLE}
                />
                <Bar dataKey="completionRate" fill="var(--chart-2)" maxBarSize={36} radius={[6, 6, 0, 0]}>
                  {peerData.map((item) => (
                    <Cell
                      key={item.teamId}
                      fill="var(--chart-2)"
                      onMouseEnter={() => onHighlightedTeamIdsChange([item.teamId])}
                      onMouseLeave={() => onHighlightedTeamIdsChange([])}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-border/80 px-4 py-10 text-center">
            <p className="text-sm font-semibold text-foreground">Chưa có lượt đánh giá nào</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {peerData.reduce((total, item) => total + item.expectedReviews, 0)} lượt đang chờ hoàn tất trong Sprint hiện tại.
            </p>
          </div>
        )}
        </Card>
      ) : null}
    </div>
  );
}
