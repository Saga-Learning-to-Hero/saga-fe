"use client";

import { useMemo, useState } from "react";
import {
  TrendingDown,
  Calendar,
  CheckCircle2,
  Layers,
  Info,
  Flame,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { CustomSelect } from "@/components/common/custom-select";
import { useSprintBurndown } from "../hooks/use-activity-analytics";
import type { BurndownPoint } from "../types/activity-analytics";

interface SprintOption {
  id: string;
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  state?: string | null;
}

interface SprintBurndownChartProps {
  courseId: string;
  teamId: string;
  sprints?: SprintOption[];
  initialSprintId?: string;
  onSelectSprint?: (sprintId: string) => void;
}

function formatDateLabel(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}`;
  }
  return dateStr;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    dataKey: string;
    color: string;
  }>;
  label?: string;
}

function CustomBurndownTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const actual = payload.find((p) => p.dataKey === "actualRemaining")?.value ?? 0;
  const done = payload.find((p) => p.dataKey === "doneCount")?.value ?? 0;

  const formattedDate = label
    ? new Date(`${label}T00:00:00`).toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    : label;

  return (
    <div className="bg-popover text-popover-foreground p-3.5 rounded-2xl border border-border/80 shadow-2xl space-y-2.5 text-xs min-w-[220px]">
      <div className="font-bold border-b border-border/60 pb-1.5 flex items-center justify-between">
        <span className="capitalize">{formattedDate}</span>
        <span className="font-mono text-[11px] text-muted-foreground">{label}</span>
      </div>

      <div className="space-y-2 pt-0.5">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
            Công việc còn lại:
          </span>
          <strong className="text-blue-500 font-mono font-bold">{actual} task</strong>
        </div>

        <div className="flex items-center justify-between text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
            Đã hoàn thành:
          </span>
          <strong className="text-emerald-500 font-mono font-bold">{done} task</strong>
        </div>
      </div>
    </div>
  );
}

export function SprintBurndownChart({
  courseId,
  teamId,
  sprints = [],
  initialSprintId,
  onSelectSprint,
}: SprintBurndownChartProps) {
  const [selectedSprintId, setSelectedSprintId] = useState<string>("");
  const defaultSprintId = useMemo(
    () =>
      sprints.find((sprint) => sprint.id === initialSprintId)?.id ??
      sprints.find((sprint) => sprint.state?.toLowerCase() === "active")?.id ??
      sprints[0]?.id ??
      "",
    [initialSprintId, sprints]
  );
  const activeSprintId = sprints.some(
    (sprint) => sprint.id === selectedSprintId
  )
    ? selectedSprintId
    : defaultSprintId;

  const handleSprintChange = (sprintId: string) => {
    setSelectedSprintId(sprintId);
    if (onSelectSprint) {
      onSelectSprint(sprintId);
    }
  };

  const selectedSprint = useMemo(
    () => sprints.find((s) => s.id === activeSprintId) || sprints[0],
    [sprints, activeSprintId]
  );

  const { data, isLoading, isError, refetch } = useSprintBurndown(
    courseId,
    teamId,
    activeSprintId,
    { enabled: Boolean(courseId && teamId && activeSprintId) }
  );

  const chartData = useMemo(() => {
    if (!data?.points || data.points.length === 0) return [];
    return data.points.map((pt: BurndownPoint) => ({
      ...pt,
      dateLabel: formatDateLabel(pt.date),
    }));
  }, [data]);

  const sprintOptions = useMemo(
    () =>
      sprints.map((s) => ({
        value: s.id,
        label: s.name,
        subLabel:
          s.startDate && s.endDate
            ? `${s.startDate.substring(0, 10)} → ${s.endDate.substring(0, 10)}`
            : undefined,
      })),
    [sprints]
  );

  const summary = useMemo(() => {
    if (!data) {
      return {
        totalScope: 0,
        currentActual: 0,
        doneCount: 0,
        progressPercent: 0,
      };
    }

    const totalScope = data.totalScope ?? 0;
    const points = data.points ?? [];
    const latestPoint = points[points.length - 1];

    const currentActual =
      latestPoint?.actualRemaining !== undefined
        ? latestPoint.actualRemaining
        : totalScope;

    const doneCount =
      latestPoint?.doneCount !== undefined
        ? latestPoint.doneCount
        : Math.max(0, totalScope - currentActual);

    const progressPercent =
      totalScope > 0 ? Math.round((doneCount / totalScope) * 100) : 0;

    return {
      totalScope,
      currentActual,
      doneCount,
      progressPercent,
    };
  }, [data]);

  return (
    <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <TrendingDown className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-foreground tracking-tight">
              Biểu đồ tiến độ hoàn thành Sprint
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Đối chiếu số lượng task còn lại thực tế với kế hoạch dự kiến ban đầu để kịp thời nắm bắt tiến độ của nhóm
          </p>
        </div>

        {sprintOptions.length > 0 && (
          <div className="w-full sm:w-64">
            <CustomSelect
              id="burndown-sprint-select"
              value={activeSprintId}
              onChange={handleSprintChange}
              options={sprintOptions}
              placeholder="Chọn Sprint..."
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/60">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>Tổng khối lượng</span>
          </div>
          <div className="text-xl font-extrabold text-foreground font-mono">
            {summary.totalScope} <span className="text-xs font-normal text-muted-foreground font-sans">task</span>
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            Tổng số task trong Sprint
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/60">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Đã hoàn thành</span>
          </div>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            {summary.doneCount}{" "}
            <span className="text-xs font-normal font-sans text-muted-foreground">
              ({summary.progressPercent}%)
            </span>
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            Task đã hoàn thành
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/60">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Flame className="w-3.5 h-3.5 text-blue-500" />
            <span>Còn lại</span>
          </div>
          <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
            {summary.currentActual} <span className="text-xs font-normal text-muted-foreground font-sans">task</span>
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            Task cần hoàn thành
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/60">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <TrendingDown className="w-3.5 h-3.5 text-primary" />
            <span>Tiến độ hoàn thành</span>
          </div>
          <div className="text-xl font-extrabold text-foreground font-mono">
            {summary.progressPercent}%
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {summary.doneCount} trên tổng số {summary.totalScope} task
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="h-72 rounded-2xl bg-muted/30 border border-border/60 animate-pulse flex items-center justify-center text-xs text-muted-foreground">
          Đang tải dữ liệu biểu đồ tiến độ...
        </div>
      ) : isError ? (
        <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/20 text-center space-y-3">
          <p className="text-sm font-semibold text-destructive">
            Không thể tải biểu đồ tiến độ của Sprint này
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground text-xs font-bold cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-60 rounded-2xl border border-dashed border-border/80 flex flex-col items-center justify-center text-center p-6 text-muted-foreground space-y-2">
          <Calendar className="w-8 h-8 text-muted-foreground/50" />
          <p className="text-xs font-medium">
            Sprint chưa có thời gian bắt đầu - kết thúc hoặc chưa có công việc nào.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="burndownDoneGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/40" />
                <XAxis
                  dataKey="dateLabel"
                  stroke="currentColor"
                  className="text-muted-foreground text-[11px] font-mono"
                  tickLine={false}
                  dy={6}
                />
                <YAxis
                  stroke="currentColor"
                  className="text-muted-foreground text-[11px] font-mono"
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomBurndownTooltip />} />

                <Area
                  type="monotone"
                  dataKey="doneCount"
                  name="Done"
                  fill="url(#burndownDoneGradient)"
                  stroke="#10B981"
                  strokeWidth={1.5}
                />

                <Line
                  type="monotone"
                  dataKey="actualRemaining"
                  name="Actual Remaining"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#3B82F6", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#3B82F6", stroke: "#FFFFFF", strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground pt-2 border-t border-border/60">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="font-semibold text-foreground">Thực tế còn lại</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-500/40 border border-emerald-500" />
                <span>Đã hoàn thành</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Info className="w-3.5 h-3.5" />
              <span>
                {selectedSprint?.startDate && selectedSprint?.endDate ? (
                  <span>
                    Thời gian Sprint:{" "}
                    <strong className="text-foreground font-mono">
                      {selectedSprint.startDate.substring(0, 10)}
                    </strong>{" "}
                    →{" "}
                    <strong className="text-foreground font-mono">
                      {selectedSprint.endDate.substring(0, 10)}
                    </strong>
                  </span>
                ) : (
                  <span>Đang tính toán theo số lượng công việc hiện có</span>
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
