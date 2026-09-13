"use client";

import { useMemo } from "react";
import {
  GanttChartSquareIcon,
  PlusIcon,
  FlameIcon,
  CheckCircle2Icon,
  LayersIcon,
} from "lucide-react";
import type { Sprint, Epic } from "../types/sprint-progress";
import { Button } from "@/components/ui/button";

interface SprintTimelineViewProps {
  sprints: Sprint[];
  epics: Epic[];
  isTeamLeader: boolean;
  onCreateSprintClick?: () => void;
}

export function SprintTimelineView({
  sprints,
  epics,
  isTeamLeader,
  onCreateSprintClick,
}: SprintTimelineViewProps) {
  const baseStartDate = useMemo(() => {
    const validDates = sprints
      .map((s) => (s.startDate ? new Date(s.startDate).getTime() : NaN))
      .filter((t) => !Number.isNaN(t));
    if (validDates.length > 0) {
      return new Date(Math.min(...validDates));
    }
    return new Date();
  }, [sprints]);

  const dynamicWeeks = useMemo(() => {
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    return Array.from({ length: 8 }).map((_, idx) => {
      const start = new Date(baseStartDate.getTime() + idx * msPerWeek);
      const end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
      const format = (d: Date) =>
        `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
      return {
        id: `w${idx + 1}`,
        label: `Tuần ${idx + 1}`,
        date: `${format(start)} - ${format(end)}`,
      };
    });
  }, [baseStartDate]);

  const toWeekCol = (isoDate?: string): number => {
    if (!isoDate) return 1;
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return 1;
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const diffMs = date.getTime() - baseStartDate.getTime();
    const weekIndex = Math.floor(diffMs / msPerWeek) + 1;
    return Math.max(1, Math.min(dynamicWeeks.length, weekIndex));
  };

  const getSprintSpan = (sprint: Sprint) => {
    const gradientByStatus: Record<Sprint["status"], string> = {
      COMPLETED: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white",
      ACTIVE: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs",
      PLANNED: "bg-gradient-to-r from-slate-500 to-slate-600 text-white opacity-90",
    };

    let startCol = 1;
    let endCol = 1;
    try {
      startCol = toWeekCol(sprint.startDate);
      endCol = toWeekCol(sprint.endDate);
      if (endCol < startCol) endCol = startCol;
    } catch {
      startCol = 1;
      endCol = 1;
    }

    return {
      startCol,
      endCol,
      gradient: gradientByStatus[sprint.status] ?? "bg-primary text-primary-foreground",
    };
  };

  return (
    <div className="rounded-3xl border border-border/70 bg-card/60 backdrop-blur-xs p-4 sm:p-6 shadow-2xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <GanttChartSquareIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-foreground tracking-tight">
              Lộ trình Timeline (Roadmap)
            </h2>
            <p className="text-xs text-muted-foreground">
              Phối cảnh trực quan tiến độ thực thi các Sprint theo dòng thời gian
            </p>
          </div>
        </div>

        {isTeamLeader && onCreateSprintClick && (
          <Button
            type="button"
            onClick={onCreateSprintClick}
            size="sm"
            className="h-8 text-xs font-bold rounded-xl gap-1.5 cursor-pointer shadow-xs px-3.5 shrink-0"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            <span>Tạo Sprint mới</span>
          </Button>
        )}
      </div>

      <div className="overflow-x-auto space-y-6">
        <div className="min-w-[820px] space-y-5">
          <div className="grid grid-cols-12 gap-2 pb-2.5 border-b border-border/60 text-xs font-bold text-muted-foreground items-center">
            <div className="col-span-4 pl-1">Sprint / Mốc thời gian</div>
            <div className="col-span-8 grid grid-cols-8 gap-1.5 text-center font-mono text-[11px]">
              {dynamicWeeks.map((w) => (
                <div key={w.id} className="p-1.5 bg-muted/40 rounded-xl border border-border/40">
                  <div className="font-bold text-foreground">{w.label}</div>
                  <div className="text-[9px] text-muted-foreground font-normal">{w.date}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground pl-1">
              Lộ trình Sprints:
            </h4>

            {sprints.length === 0 ? (
              <div className="p-6 rounded-2xl border border-dashed border-border/80 text-center text-xs text-muted-foreground bg-muted/10">
                Chưa có Sprint nào trên lộ trình.
              </div>
            ) : (
              sprints.map((sprint) => {
                const span = getSprintSpan(sprint);

                return (
                  <div key={sprint.id} className="grid grid-cols-12 gap-2 items-center text-xs group">
                    <div className="col-span-4 flex items-center gap-2 pl-1 min-w-0">
                      <span className="font-bold text-foreground truncate">{sprint.name}</span>
                      {sprint.status === "ACTIVE" && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 shrink-0">
                          <FlameIcon className="w-2.5 h-2.5 text-blue-500" />
                          NOW
                        </span>
                      )}
                      {sprint.status === "COMPLETED" && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                          <CheckCircle2Icon className="w-2.5 h-2.5 text-emerald-500" />
                          DONE
                        </span>
                      )}
                    </div>

                    <div className="col-span-8 grid grid-cols-8 gap-1.5 relative h-9 bg-muted/20 rounded-2xl items-center p-1 border border-border/40">
                      <div
                        style={{
                          gridColumnStart: span.startCol,
                          gridColumnEnd: span.endCol + 1,
                        }}
                        className={`${span.gradient} font-bold text-[11px] h-7 rounded-xl flex items-center justify-between px-3 truncate transition-transform hover:scale-[1.005]`}
                      >
                        <span className="truncate">{sprint.name}</span>
                        <span className="font-mono text-[10px] shrink-0 font-semibold opacity-95">
                          {sprint.completedStoryPoints}/{sprint.totalStoryPoints} SP
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="space-y-3 pt-4 border-t border-border/60">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground pl-1">
              Tiến độ Phân hệ (Epics):
            </h4>

            {epics.length === 0 ? (
              <div className="p-4 rounded-2xl border border-dashed border-border/60 text-center text-xs text-muted-foreground bg-muted/10 flex items-center justify-center gap-2">
                <LayersIcon className="w-4 h-4 text-muted-foreground/60" />
                <span>Chưa có phân hệ Epic nào được liên kết trong dự án.</span>
              </div>
            ) : (
              epics.map((epic) => (
                <div key={epic.id} className="grid grid-cols-12 gap-2 items-center text-xs">
                  <div className="col-span-4 flex items-center gap-2 pl-1 min-w-0">
                    <span
                      style={{ backgroundColor: epic.color }}
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-foreground truncate">{epic.name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{epic.key}</span>
                    </div>
                  </div>

                  <div className="col-span-8 flex items-center gap-3">
                    <div className="flex-1 bg-muted rounded-full h-2.5 overflow-hidden border border-border/40">
                      <div
                        style={{ width: `${epic.progressPercent}%`, backgroundColor: epic.color }}
                        className="h-full rounded-full transition-all duration-500"
                      />
                    </div>
                    <span className="font-mono text-xs font-bold w-12 text-right text-foreground">
                      {epic.progressPercent}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
