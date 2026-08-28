"use client";

import {
  GanttChartSquareIcon,
  SparklesIcon,
} from "lucide-react";
import type { Sprint, Epic } from "../types/sprint-progress";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SprintTimelineViewProps {
  sprints: Sprint[];
  epics: Epic[];
  isTeamLeader: boolean;
  onCreateSprintClick?: () => void;
}

const WEEKS = [
  { id: "w1", label: "Tuần 1", date: "01/08 - 07/08" },
  { id: "w2", label: "Tuần 2", date: "08/08 - 14/08" },
  { id: "w3", label: "Tuần 3", date: "15/08 - 21/08" },
  { id: "w4", label: "Tuần 4", date: "22/08 - 28/08" },
  { id: "w5", label: "Tuần 5", date: "29/08 - 04/09" },
  { id: "w6", label: "Tuần 6", date: "05/09 - 11/09" },
  { id: "w7", label: "Tuần 7", date: "12/09 - 18/09" },
  { id: "w8", label: "Tuần 8", date: "19/09 - 25/09" },
];

export function SprintTimelineView({
  sprints,
  epics,
  isTeamLeader,
  onCreateSprintClick,
}: SprintTimelineViewProps) {
  // Mapping sprint positions on week grid
  const getSprintSpan = (sprintId: string) => {
    switch (sprintId) {
      case "sprint-01":
        return { startCol: 1, endCol: 2, color: "bg-emerald-500", label: "Sprint 1 (Done)" };
      case "sprint-02":
        return { startCol: 3, endCol: 4, color: "bg-emerald-500", label: "Sprint 2 (Done)" };
      case "sprint-03":
        return { startCol: 4, endCol: 6, color: "bg-blue-600 animate-pulse", label: "Sprint 3 (Active)" };
      case "sprint-04":
        return { startCol: 6, endCol: 8, color: "bg-slate-400", label: "Sprint 4 (Planned)" };
      default:
        return { startCol: 1, endCol: 2, color: "bg-primary", label: "Sprint" };
    }
  };

  return (
    <Card className="rounded-2xl border border-border/80 shadow-xs bg-card">
      <CardHeader className="p-5 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <GanttChartSquareIcon className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Timeline Roadmap Tiến độ Đồ án (Gantt Chart)
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Sơ đồ lộ trình phát triển các Sprint và Phân hệ Epic theo mốc thời gian học kỳ
              </CardDescription>
            </div>
          </div>

          {isTeamLeader && onCreateSprintClick && (
            <Button
              type="button"
              onClick={onCreateSprintClick}
              className="h-9 text-xs font-bold rounded-xl gap-1.5 cursor-pointer shadow-xs bg-purple-600 hover:bg-purple-700 text-white px-4 shrink-0"
            >
              <SparklesIcon className="w-3.5 h-3.5" />
              + Tạo Sprint mới
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-5 overflow-x-auto space-y-6">
        {/* Timeline Grid Table */}
        <div className="min-w-[800px] space-y-4">
          {/* Header Dates Column */}
          <div className="grid grid-cols-12 gap-2 pb-2 border-b border-border/60 text-xs font-bold text-muted-foreground">
            <div className="col-span-4">MỤC MỤC TÍCH HỢP / EPICS</div>
            <div className="col-span-8 grid grid-cols-8 gap-1 text-center font-mono text-[11px]">
              {WEEKS.map((w) => (
                <div key={w.id} className="p-1 bg-muted/40 rounded-lg">
                  <div>{w.label}</div>
                  <div className="text-[9px] text-muted-foreground font-normal">{w.date}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 1: Sprints Timeline Rows */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">
              Lộ trình Sprints:
            </h4>

            {sprints.map((sprint) => {
              const span = getSprintSpan(sprint.id);

              return (
                <div key={sprint.id} className="grid grid-cols-12 gap-2 items-center text-xs">
                  <div className="col-span-4 flex items-center gap-2">
                    <span className="font-bold text-foreground truncate">{sprint.name}</span>
                    {sprint.status === "ACTIVE" && (
                      <Badge className="bg-blue-500/15 text-blue-600 border-0 text-[10px] font-bold">
                        NOW
                      </Badge>
                    )}
                  </div>

                  <div className="col-span-8 grid grid-cols-8 gap-1 relative h-8 bg-muted/20 rounded-xl items-center p-1">
                    <div
                      style={{
                        gridColumnStart: span.startCol,
                        gridColumnEnd: span.endCol + 1,
                      }}
                      className={`${span.color} text-white font-bold text-[11px] h-6 rounded-lg flex items-center justify-between px-3 shadow-xs truncate`}
                    >
                      <span className="truncate">{sprint.name}</span>
                      <span className="font-mono text-[10px] shrink-0">
                        {sprint.completedStoryPoints}/{sprint.totalStoryPoints} SP
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Section 2: Epics Progress Rows */}
          <div className="space-y-3 pt-4 border-t border-border/60">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">
              Tiến độ Phân hệ (Epics):
            </h4>

            {epics.map((epic) => (
              <div key={epic.id} className="grid grid-cols-12 gap-2 items-center text-xs">
                <div className="col-span-4 flex items-center gap-2">
                  <span
                    style={{ backgroundColor: epic.color }}
                    className="w-3 h-3 rounded-full shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-foreground truncate">{epic.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{epic.key}</span>
                  </div>
                </div>

                <div className="col-span-8 flex items-center gap-3">
                  <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden border border-border/50">
                    <div
                      style={{ width: `${epic.progressPercent}%`, backgroundColor: epic.color }}
                      className="h-full rounded-full transition-all duration-500"
                    />
                  </div>
                  <span className="font-mono text-xs font-bold w-12 text-right">
                    {epic.progressPercent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
