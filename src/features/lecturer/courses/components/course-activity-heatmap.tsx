"use client";

import { useMemo } from "react";
import { ActivityIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  buildActivityHeatmapData,
  formatSeriesDate,
  getActivityIntensityLevel,
} from "../lib/lecturer-dashboard-format";
import { useDashboardChartFilter } from "../hooks/use-dashboard-chart-filter";
import type {
  LecturerDashboardActivityPoint,
  LecturerDashboardTeam,
} from "../types/lecturer-course-dashboard";
import { CourseChartTeamFilter } from "./course-chart-filters";

const INTENSITY_CLASSES = [
  "border-border bg-muted/55",
  "border-chart-2/20 bg-chart-2/20",
  "border-chart-2/30 bg-chart-2/40",
  "border-chart-2/45 bg-chart-2/65",
  "border-chart-2/60 bg-chart-2 text-primary-foreground",
] as const;

interface CourseActivityHeatmapProps {
  teams: LecturerDashboardTeam[];
  onHighlightedTeamIdsChange: (teamIds: string[]) => void;
}

export function CourseActivityHeatmap({
  teams,
  onHighlightedTeamIdsChange,
}: CourseActivityHeatmapProps) {
  const filter = useDashboardChartFilter(teams);
  const heatmap = useMemo(
    () => buildActivityHeatmapData(filter.filteredTeams),
    [filter.filteredTeams]
  );

  return (
    <Card className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-chart-2/15 text-chart-2">
            <ActivityIcon className="size-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-foreground">
              Nhịp độ hoạt động theo ngày
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              So sánh mật độ commit, công việc, đánh giá chéo và tài liệu của từng nhóm.
            </p>
          </div>
        </div>
        <CourseChartTeamFilter
          idPrefix="activity-heatmap"
          teamId={filter.selectedTeamId}
          teamOptions={filter.teamOptions}
          onTeamChange={filter.setSelectedTeamId}
        />
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5 text-[11px] text-muted-foreground">
          <span>Ít</span>
          {INTENSITY_CLASSES.map((className, index) => (
            <span
              key={className}
              aria-label={`Mức hoạt động ${index}`}
              className={cn("size-3 rounded-sm border", className)}
            />
          ))}
          <span>Nhiều</span>
      </div>

      {heatmap.rows.length > 0 && heatmap.dates.length > 0 ? (
        <TooltipProvider delay={100}>
          <div className="mt-5 overflow-x-auto pb-2">
            <div
              className="grid min-w-max gap-1.5"
              style={{
                gridTemplateColumns: `minmax(11rem, 14rem) repeat(${heatmap.dates.length}, minmax(2.5rem, 1fr))`,
              }}
            >
              <div className="sticky left-0 z-10 bg-card" />
              {heatmap.dates.map((date) => (
                <div
                  key={date}
                  className="flex min-h-8 items-end justify-center px-1 pb-1 font-mono text-[10px] font-semibold text-muted-foreground"
                >
                  {formatSeriesDate(date)}
                </div>
              ))}

              {heatmap.rows.map((row) => (
                <div key={row.teamId} className="contents">
                  <div className="sticky left-0 z-10 flex min-h-11 min-w-0 flex-col justify-center border-r border-border/70 bg-card pr-3">
                    <strong className="truncate text-xs text-foreground">{row.teamName}</strong>
                    <span className="truncate text-[10px] text-muted-foreground">
                      {row.projectName || row.sprintName || "Chưa có tên dự án"}
                    </span>
                  </div>
                  {heatmap.dates.map((date) => {
                    const point = row.pointsByDate.get(date);
                    return point ? (
                      <ActivityCell
                        key={`${row.teamId}-${date}`}
                        teamId={row.teamId}
                        teamName={row.teamName}
                        projectName={row.projectName}
                        sprintName={row.sprintName}
                        point={point}
                        maxActivity={heatmap.maxActivity}
                        onHighlightedTeamIdsChange={onHighlightedTeamIdsChange}
                      />
                    ) : (
                      <div
                        key={`${row.teamId}-${date}`}
                        aria-label={`${row.teamName}, ${formatSeriesDate(date)}: chưa có dữ liệu`}
                        className="flex min-h-11 items-center justify-center rounded-lg border border-dashed border-border/70 bg-muted/20 text-[10px] text-muted-foreground/60"
                      >
                        —
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </TooltipProvider>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-border/80 px-4 py-10 text-center">
          <p className="text-sm font-semibold text-foreground">Chưa có dữ liệu hoạt động theo ngày</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Heatmap sẽ xuất hiện khi nhóm có Sprint và phát sinh dữ liệu hoạt động.
          </p>
        </div>
      )}
    </Card>
  );
}

interface ActivityCellProps {
  teamId: string;
  teamName: string;
  projectName: string | null;
  sprintName: string | null;
  point: LecturerDashboardActivityPoint;
  maxActivity: number;
  onHighlightedTeamIdsChange: (teamIds: string[]) => void;
}

function ActivityCell({
  teamId,
  teamName,
  projectName,
  sprintName,
  point,
  maxActivity,
  onHighlightedTeamIdsChange,
}: ActivityCellProps) {
  const level = getActivityIntensityLevel(point.totalActivities, maxActivity);
  const description = `${teamName}, ${formatSeriesDate(point.date)}: ${point.totalActivities} hoạt động`;

  return (
    <Tooltip>
      <TooltipTrigger
        aria-label={description}
        onMouseEnter={() => onHighlightedTeamIdsChange([teamId])}
        onMouseLeave={() => onHighlightedTeamIdsChange([])}
        onFocus={() => onHighlightedTeamIdsChange([teamId])}
        onBlur={() => onHighlightedTeamIdsChange([])}
        className={cn(
          "flex min-h-11 cursor-pointer items-center justify-center rounded-lg border font-mono text-xs font-black outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring",
          INTENSITY_CLASSES[level]
        )}
      >
        {point.totalActivities}
      </TooltipTrigger>
      <TooltipContent className="block w-64 max-w-64 rounded-xl bg-popover p-3 text-popover-foreground ring-1 ring-border">
        <p className="font-bold text-foreground">{teamName}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {projectName || "Chưa có tên dự án"} · {sprintName || "Sprint hiện tại"}
        </p>
        <p className="mt-2 border-t border-border pt-2 font-mono font-bold text-foreground">
          {formatSeriesDate(point.date)} · {point.totalActivities} hoạt động
        </p>
        <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
          <Metric label="Git commits" value={point.commits} />
          <Metric label="Jira tasks" value={point.tasks} />
          <Metric label="Đánh giá chéo" value={point.peerReviews} />
          <Metric label="Tài liệu & bình luận" value={point.documents} />
        </dl>
      </TooltipContent>
    </Tooltip>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-mono font-bold text-foreground">{value}</dd>
    </div>
  );
}
