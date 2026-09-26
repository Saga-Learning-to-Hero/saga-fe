"use client";

import { useMemo, useState } from "react";
import {
  Flame,
  GitCommit,
  CheckSquare,
  Users,
  Info,
  Layers,
  FileText,
} from "lucide-react";
import { CustomSelect } from "@/components/common/custom-select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getAssigneeInitials,
  getAssigneeAvatarClass,
} from "@/features/student/sprint-progress/lib/assignee-avatar";
import { cn } from "@/lib/utils";
import { useTeamHeatmap } from "../hooks/use-activity-analytics";
import type {
  HeatmapCell,
  HeatmapDatePreset,
} from "../types/activity-analytics";

interface SprintOption {
  id: string;
  name: string;
  startDate?: string | null;
  endDate?: string | null;
}

interface StudentOption {
  studentId: string;
  fullName: string;
  studentCode?: string;
  avatar?: string;
}

interface ActivityHeatmapGridProps {
  courseId: string;
  teamId: string;
  sprints?: SprintOption[];
  students?: StudentOption[];
  initialPreset?: HeatmapDatePreset;
  initialSprintId?: string;
  initialStudentId?: string;
}

function formatDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getIntensityClass(activities: number): string {
  if (activities <= 0) {
    return "bg-muted/15 border-border/50 text-muted-foreground/60 hover:border-border";
  }
  if (activities <= 2) {
    return "bg-chart-2/20 border-chart-2/20 text-chart-2 hover:bg-chart-2/30";
  }
  if (activities <= 5) {
    return "bg-chart-2/40 border-chart-2/30 text-chart-2 hover:bg-chart-2/50";
  }
  if (activities <= 9) {
    return "bg-chart-2/65 border-chart-2/45 text-primary-foreground hover:bg-chart-2/80 font-semibold";
  }
  return "bg-chart-2 border-chart-2/60 text-primary-foreground font-extrabold shadow-xs hover:brightness-105 ring-1 ring-chart-2/50";
}

const WEEKDAYS = [
  { key: "mon", short: "Thứ 2", full: "Thứ Hai" },
  { key: "tue", short: "Thứ 3", full: "Thứ Ba" },
  { key: "wed", short: "Thứ 4", full: "Thứ Tư" },
  { key: "thu", short: "Thứ 5", full: "Thứ Năm" },
  { key: "fri", short: "Thứ 6", full: "Thứ Sáu" },
  { key: "sat", short: "Thứ 7", full: "Thứ Bảy" },
  { key: "sun", short: "CN", full: "Chủ Nhật" },
];

interface HeatmapCellTooltipProps {
  cell: HeatmapCell;
  formattedDate: string;
}

export function HeatmapCellTooltip({
  cell,
  formattedDate,
}: HeatmapCellTooltipProps) {
  const metrics = [
    {
      label: "Commit Git",
      value: cell.commits,
      icon: GitCommit,
      iconClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Task Jira",
      value: cell.tasks,
      icon: CheckSquare,
      iconClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    },
    {
      label: "Đánh giá chéo",
      value: cell.peerReviews,
      icon: Users,
      iconClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
    {
      label: "Tài liệu",
      value: cell.documents,
      icon: FileText,
      iconClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="w-72 max-w-[calc(100vw-2rem)]">
      <div className="flex items-start justify-between gap-3 border-b border-border/60 bg-muted/20 px-3.5 py-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Ngày hoạt động
          </p>
          <p className="mt-0.5 text-sm font-extrabold text-foreground">
            {formattedDate}
          </p>
        </div>
        <span className="shrink-0 rounded-lg bg-emerald-500/10 px-2.5 py-1 font-mono text-xs font-black text-emerald-700 dark:text-emerald-300">
          {cell.totalActivities} hoạt động
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 p-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div
              key={metric.label}
              className="flex min-w-0 items-center gap-2 rounded-xl border border-border/60 bg-background px-2.5 py-2"
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-lg",
                  metric.iconClass
                )}
              >
                <Icon className="size-3.5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[10px] font-medium text-muted-foreground">
                  {metric.label}
                </span>
                <span className="block font-mono text-sm font-black text-foreground">
                  {metric.value}
                </span>
              </span>
            </div>
          );
        })}
      </div>

      {cell.actors && cell.actors.length > 0 && (
        <div className="border-t border-border/60 bg-muted/10 px-3.5 py-2 space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Thành viên hoạt động ({cell.actors.length})
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {cell.actors.map((actor) => (
              <div
                key={actor.studentId}
                className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-card px-1.5 py-0.5 text-[11px]"
              >
                <Avatar className="size-4 rounded-full border border-border shrink-0">
                  {actor.avatar && (
                    <AvatarImage src={actor.avatar} alt={actor.fullName || ""} />
                  )}
                  <AvatarFallback className="text-[8px] font-bold">
                    {getAssigneeInitials(actor.fullName)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-foreground truncate max-w-[120px]">
                  {actor.fullName || actor.studentCode || "Sinh viên"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-border/60 bg-primary/5 px-3.5 py-2.5">
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Flame className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
          Tổng hoạt động
        </span>
        <strong className="font-mono text-base font-black text-foreground">
          {cell.totalActivities}
        </strong>
      </div>
    </div>
  );
}

export function ActivityHeatmapGrid({
  courseId,
  teamId,
  sprints = [],
  students = [],
  initialPreset,
  initialSprintId,
  initialStudentId = "ALL",
}: ActivityHeatmapGridProps) {
  const [userPreset, setUserPreset] = useState<HeatmapDatePreset | null>(initialPreset ?? null);
  const [userSprintId, setUserSprintId] = useState<string>(initialSprintId ?? "");
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudentId);

  const rawPreset = userPreset ?? (sprints.length > 0 ? "sprint" : "30days");
  const preset: HeatmapDatePreset = rawPreset === "sprint" && sprints.length === 0 ? "30days" : rawPreset;

  const effectiveSprintId = userSprintId || (sprints[0]?.id ?? "");
  const selectedSprint = useMemo(
    () => sprints.find((s) => s.id === effectiveSprintId) || sprints[0],
    [sprints, effectiveSprintId]
  );

  const dateRange = useMemo(() => {
    const today = new Date();

    if (preset === "sprint" && selectedSprint) {
      const start = selectedSprint.startDate
        ? selectedSprint.startDate.substring(0, 10)
        : formatDateString(new Date(today.getTime() - 14 * 86400000));
      const end = selectedSprint.endDate
        ? selectedSprint.endDate.substring(0, 10)
        : formatDateString(today);
      return { startDate: start, endDate: end };
    }

    if (preset === "30days") {
      const start = new Date(today);
      start.setDate(today.getDate() - 30);
      return {
        startDate: formatDateString(start),
        endDate: formatDateString(today),
      };
    }

    if (preset === "semester") {
      const start = new Date(today);
      start.setDate(today.getDate() - 90);
      return {
        startDate: formatDateString(start),
        endDate: formatDateString(today),
      };
    }

    const defaultStart = new Date(today);
    defaultStart.setDate(today.getDate() - 14);
    return {
      startDate: formatDateString(defaultStart),
      endDate: formatDateString(today),
    };
  }, [preset, selectedSprint]);

  const dayCount = useMemo(() => {
    const start = new Date(`${dateRange.startDate}T00:00:00`).getTime();
    const end = new Date(`${dateRange.endDate}T00:00:00`).getTime();
    const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diffDays);
  }, [dateRange]);

  const { data, isLoading, isError, refetch } = useTeamHeatmap(
    courseId,
    teamId,
    {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    },
    { enabled: Boolean(courseId && teamId) }
  );

  const activeDays = useMemo(() => {
    if (!data) return [];
    if (selectedStudentId === "ALL") {
      return data.days || [];
    }
    const student = data.students?.find((s) => s.studentId === selectedStudentId);
    return student?.cells || [];
  }, [data, selectedStudentId]);

  const activeStudents = useMemo(() => {
    if (!data?.students) return [];
    if (selectedStudentId === "ALL") {
      return data.students;
    }
    return data.students.filter((s) => s.studentId === selectedStudentId);
  }, [data, selectedStudentId]);

  const totals = useMemo(() => {
    if (selectedStudentId !== "ALL" && data?.students) {
      const student = data.students.find((s) => s.studentId === selectedStudentId);
      if (student) {
        return {
          activities: student.totalActivities || 0,
          commits: student.commits || 0,
          tasks: student.tasks || 0,
          peerReviews: student.peerReviews || 0,
          documents: student.documents || 0,
        };
      }
    }
    if (!data?.days || data.days.length === 0) {
      return {
        activities: 0,
        commits: 0,
        tasks: 0,
        peerReviews: 0,
        documents: 0,
      };
    }
    return data.days.reduce(
      (acc, d) => ({
        activities: acc.activities + (d.totalActivities || 0),
        commits: acc.commits + (d.commits || 0),
        tasks: acc.tasks + (d.tasks || 0),
        peerReviews: acc.peerReviews + (d.peerReviews || 0),
        documents: acc.documents + (d.documents || 0),
      }),
      { activities: 0, commits: 0, tasks: 0, peerReviews: 0, documents: 0 }
    );
  }, [data, selectedStudentId]);

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

  const studentOptions = useMemo(() => {
    const list =
      data?.students && data.students.length > 0
        ? data.students.map((st) => ({
          studentId: st.studentId,
          fullName: st.fullName || st.studentCode || "Thành viên",
          studentCode: st.studentCode || undefined,
        }))
        : students;

    return [
      {
        value: "ALL",
        label: "Toàn đội (Tất cả thành viên)",
        subLabel: `${list.length} thành viên`,
        icon: <Users className="w-3.5 h-3.5 text-primary" />,
      },
      ...list.map((st) => ({
        value: st.studentId,
        label: st.fullName,
        subLabel: st.studentCode,
        icon: (
          <span
            className={cn(
              "w-4 h-4 rounded-md text-[9px] font-bold text-white flex items-center justify-center shrink-0",
              getAssigneeAvatarClass(st.studentCode || st.studentId)
            )}
          >
            {getAssigneeInitials(st.fullName)}
          </span>
        ),
      })),
    ];
  }, [data, students]);

  const calendarWeeks = useMemo(() => {
    if (activeDays.length === 0) return [];

    const cellsByDate = new Map<string, HeatmapCell>();
    activeDays.forEach((cell) => {
      cellsByDate.set(cell.date, cell);
    });

    const start = new Date(`${dateRange.startDate}T00:00:00`);
    const end = new Date(`${dateRange.endDate}T00:00:00`);

    const startMonday = new Date(start);
    const startDay = startMonday.getDay();
    const daysToSubtract = startDay === 0 ? 6 : startDay - 1;
    startMonday.setDate(startMonday.getDate() - daysToSubtract);

    const endSunday = new Date(end);
    const endDay = endSunday.getDay();
    const daysToAdd = endDay === 0 ? 0 : 7 - endDay;
    endSunday.setDate(endSunday.getDate() + daysToAdd);

    const weeks: Array<{
      weekIndex: number;
      weekLabel: string;
      days: Array<{
        date: string;
        isOutOfBounds: boolean;
        cell: HeatmapCell;
      }>;
    }> = [];

    const cursor = new Date(startMonday);
    let currentWeek: Array<{
      date: string;
      isOutOfBounds: boolean;
      cell: HeatmapCell;
    }> = [];
    let weekIndex = 0;

    while (cursor <= endSunday) {
      const dateKey = formatDateString(cursor);
      const isOutOfBounds = cursor < start || cursor > end;

      const cell = cellsByDate.get(dateKey) || {
        date: dateKey,
        commits: 0,
        peerReviews: 0,
        documents: 0,
        tasks: 0,
        totalActivities: 0,
        actors: [],
      };

      currentWeek.push({
        date: dateKey,
        isOutOfBounds,
        cell,
      });

      if (currentWeek.length === 7) {
        const mondayDate = new Date(`${currentWeek[0].date}T00:00:00`);
        const sundayDate = new Date(`${currentWeek[6].date}T00:00:00`);
        const weekLabel = `${String(mondayDate.getDate()).padStart(2, "0")}/${String(mondayDate.getMonth() + 1).padStart(2, "0")} → ${String(sundayDate.getDate()).padStart(2, "0")}/${String(sundayDate.getMonth() + 1).padStart(2, "0")}`;
        weeks.push({
          weekIndex,
          weekLabel,
          days: currentWeek,
        });
        currentWeek = [];
        weekIndex++;
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      weeks.push({
        weekIndex,
        weekLabel: "",
        days: currentWeek,
      });
    }

    return weeks;
  }, [activeDays, dateRange]);

  return (
    <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Flame className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-foreground tracking-tight">
              Lưới hoạt động và nhịp độ đóng góp
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Theo dõi mật độ làm việc theo từng ngày qua số lượt commit mã nguồn, Task Jira, đánh giá chéo và tài liệu nộp
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-muted/40 p-1 rounded-2xl border border-border/60 flex items-center gap-1">
            <button
              type="button"
              disabled={sprints.length === 0}
              onClick={() => {
                setUserPreset("sprint");
                if (sprints.length > 0 && !userSprintId) {
                  setUserSprintId(sprints[0].id);
                }
              }}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                preset === "sprint"
                  ? "bg-card text-foreground shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground",
                sprints.length === 0 && "opacity-40 cursor-not-allowed"
              )}
            >
              Theo Sprint
            </button>
            <button
              type="button"
              onClick={() => setUserPreset("30days")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                preset === "30days"
                  ? "bg-card text-foreground shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              30 ngày qua
            </button>
            <button
              type="button"
              onClick={() => setUserPreset("semester")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                preset === "semester"
                  ? "bg-card text-foreground shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Toàn kỳ học
            </button>
          </div>

          {preset === "sprint" && sprintOptions.length > 0 && (
            <div className="w-48 sm:w-56">
              <CustomSelect
                id="heatmap-sprint-select"
                value={effectiveSprintId}
                onChange={(val) => {
                  setUserSprintId(val);
                  setUserPreset("sprint");
                }}
                options={sprintOptions}
                placeholder="Chọn Sprint..."
              />
            </div>
          )}

          {studentOptions.length > 1 && (
            <div className="w-56 sm:w-64">
              <CustomSelect
                id="heatmap-student-select"
                value={selectedStudentId}
                onChange={setSelectedStudentId}
                options={studentOptions}
                placeholder="Chọn thành viên..."
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/60">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Flame className="w-3.5 h-3.5 text-emerald-500" />
            <span>Tổng hoạt động</span>
          </div>
          <div className="text-xl font-extrabold text-foreground font-mono">
            {totals.activities}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            Tổng số lượt ghi nhận
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/60">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <GitCommit className="w-3.5 h-3.5 text-blue-500" />
            <span>Git Commits</span>
          </div>
          <div className="text-xl font-extrabold text-foreground font-mono">
            {totals.commits}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            Lượt đẩy mã nguồn
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/60">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
            <span>Jira Tasks</span>
          </div>
          <div className="text-xl font-extrabold text-foreground font-mono">
            {totals.tasks}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            Task được giao
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/60">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Users className="w-3.5 h-3.5 text-purple-500" />
            <span>Peer Reviews</span>
          </div>
          <div className="text-xl font-extrabold text-foreground font-mono">
            {totals.peerReviews}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            Đánh giá chéo đồng đẳng
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/60 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <FileText className="w-3.5 h-3.5 text-amber-500" />
            <span>Tài liệu & Files</span>
          </div>
          <div className="text-xl font-extrabold text-foreground font-mono">
            {totals.documents}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            Tài liệu đính kèm
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="h-48 rounded-2xl bg-muted/30 border border-border/60 animate-pulse flex items-center justify-center text-xs text-muted-foreground">
          Đang tổng hợp dữ liệu làm việc của nhóm...
        </div>
      ) : isError ? (
        <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/20 text-center space-y-3">
          <p className="text-sm font-semibold text-destructive">
            Không thể tải dữ liệu hoạt động của nhóm
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground text-xs font-bold cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <TooltipProvider>
          <div className="space-y-4">
            <div className="overflow-x-auto pb-2">
              <div className="w-full p-3 sm:p-4 rounded-2xl bg-muted/10 border border-border/40 space-y-1.5">
                <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center pb-1.5 border-b border-border/50">
                  {WEEKDAYS.map((day) => (
                    <div key={day.key}>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        <span className="hidden sm:inline">{day.short}</span>
                        <span className="sm:hidden">{day.short}</span>
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5">
                  {calendarWeeks.map((week) => (
                    <div key={week.weekIndex} className="space-y-0.5">
                      {calendarWeeks.length > 1 && (
                        <div className="text-[9px] font-mono text-muted-foreground/60 pl-0.5">
                          W{week.weekIndex + 1} · {week.weekLabel}
                        </div>
                      )}

                      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                        {week.days.map((item) => {
                          if (item.isOutOfBounds) {
                            return (
                              <div
                                key={item.date}
                                className="h-12 sm:h-14 rounded-lg border border-dashed border-border/20 bg-muted/5 flex items-center justify-center opacity-20 select-none"
                              >
                                <span className="text-[9px] font-mono text-muted-foreground">
                                  {item.date.substring(8, 10)}
                                </span>
                              </div>
                            );
                          }

                          const formattedDate = new Date(
                            `${item.date}T00:00:00`
                          ).toLocaleDateString("vi-VN", {
                            weekday: "short",
                            day: "2-digit",
                            month: "2-digit",
                          });

                          return (
                            <Tooltip key={item.date}>
                              <TooltipTrigger
                                className="w-full text-left"
                                aria-label={`${formattedDate}: ${item.cell.totalActivities} hoạt động`}
                              >
                                <div
                                  className={cn(
                                    "h-12 sm:h-14 rounded-lg border transition-all cursor-pointer flex flex-col items-center justify-center select-none hover:shadow-md hover:scale-[1.05] hover:z-10 relative",
                                    getIntensityClass(item.cell.totalActivities)
                                  )}
                                >
                                  <span className="text-[9px] font-mono text-muted-foreground/70 absolute top-1 left-1.5">
                                    {item.date.substring(8, 10)}
                                  </span>

                                  {item.cell.totalActivities > 0 ? (
                                    <span className="text-base sm:text-lg font-extrabold font-mono text-foreground">
                                      {item.cell.totalActivities}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-mono text-muted-foreground/30">
                                      –
                                    </span>
                                  )}

                                  {item.cell.actors && item.cell.actors.length > 0 && (
                                    <div className="absolute bottom-1 right-1 flex -space-x-1 overflow-hidden">
                                      {item.cell.actors.slice(0, 3).map((actor) => (
                                        <Avatar key={actor.studentId} className="size-3.5 ring-1 ring-background rounded-full shrink-0">
                                          {actor.avatar && (
                                            <AvatarImage src={actor.avatar} alt={actor.fullName || ""} />
                                          )}
                                          <AvatarFallback className="text-[6px] font-bold bg-muted text-foreground">
                                            {getAssigneeInitials(actor.fullName)}
                                          </AvatarFallback>
                                        </Avatar>
                                      ))}
                                      {item.cell.actors.length > 3 && (
                                        <span className="size-3.5 rounded-full bg-muted/80 text-[7px] font-bold flex items-center justify-center text-muted-foreground ring-1 ring-background">
                                          +{item.cell.actors.length - 3}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </TooltipTrigger>

                              <TooltipContent
                                side="top"
                                sideOffset={10}
                                className="block overflow-hidden rounded-2xl border border-border/80 bg-popover p-0 text-popover-foreground shadow-xl"
                              >
                                <HeatmapCellTooltip
                                  cell={item.cell}
                                  formattedDate={formattedDate}
                                />
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-2 pt-1">
              <div className="flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-muted-foreground" />
                <span>
                  Thời gian đánh giá:{" "}
                  <strong className="text-foreground font-mono">
                    {dateRange.startDate}
                  </strong>{" "}
                  →{" "}
                  <strong className="text-foreground font-mono">
                    {dateRange.endDate}
                  </strong>{" "}
                  <span className="text-muted-foreground font-sans">
                    ({dayCount} ngày)
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span>Ít</span>
                <span className="w-3.5 h-3.5 rounded-md bg-muted/20 border border-border/40" />
                <span className="w-3.5 h-3.5 rounded-md bg-emerald-500/10 border border-emerald-500/30" />
                <span className="w-3.5 h-3.5 rounded-md bg-emerald-500/20 border border-emerald-500/45" />
                <span className="w-3.5 h-3.5 rounded-md bg-emerald-500/35 border border-emerald-500/65" />
                <span className="w-3.5 h-3.5 rounded-md bg-emerald-500/55 border border-emerald-400" />
                <span>Nhiều</span>
              </div>
            </div>
          </div>
        </TooltipProvider>
      )}

      {activeStudents.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-primary" />
                {selectedStudentId === "ALL"
                  ? "Bảng đối soát đóng góp của từng thành viên"
                  : "Chi tiết đóng góp của thành viên đang chọn"}
              </h4>
              {selectedStudentId !== "ALL" && (
                <button
                  type="button"
                  onClick={() => setSelectedStudentId("ALL")}
                  className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
                >
                  (Xem toàn bộ nhóm)
                </button>
              )}
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {activeStudents.length} thành viên
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border/60">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/30 border-b border-border/60 text-muted-foreground font-semibold">
                  <th className="py-2.5 px-3.5">Thành viên</th>
                  <th className="py-2.5 px-2 text-center">Commit Git</th>
                  <th className="py-2.5 px-2 text-center">Task Jira</th>
                  <th className="py-2.5 px-2 text-center">Đánh giá chéo</th>
                  <th className="py-2.5 px-2 text-center">Tài liệu</th>
                  <th className="py-2.5 px-3 text-right">Tổng hoạt động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {activeStudents.map((student) => {
                  const studentOption = students.find(
                    (s) => s.studentId === student.studentId || (student.studentCode && s.studentCode === student.studentCode)
                  );
                  const avatarUrl = student.avatar || studentOption?.avatar || undefined;
                  const initials = getAssigneeInitials(student.fullName);
                  const avatarColorClass = getAssigneeAvatarClass(student.studentCode || student.studentId);

                  return (
                    <tr
                      key={student.studentId}
                      className="hover:bg-muted/10 transition-colors"
                    >
                      <td className="py-2.5 px-3.5 font-medium">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="w-8 h-8 rounded-xl border border-border shadow-2xs shrink-0 overflow-hidden">
                            <AvatarImage
                              src={avatarUrl}
                              alt={student.fullName || ""}
                              className="object-cover"
                            />
                            <AvatarFallback
                              className={cn(
                                "text-[11px] font-bold text-white rounded-xl",
                                avatarColorClass
                              )}
                            >
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-foreground">
                              {student.fullName}
                            </div>
                            {student.studentCode && (
                              <div className="text-[11px] font-mono text-muted-foreground">
                                {student.studentCode}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono text-foreground">
                        {student.commits}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono text-foreground">
                        {student.tasks}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono text-foreground">
                        {student.peerReviews}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono text-foreground">
                        {student.documents}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                        {student.totalActivities}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
