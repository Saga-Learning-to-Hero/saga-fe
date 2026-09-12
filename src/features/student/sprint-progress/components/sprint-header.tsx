"use client";

import {
  KanbanSquareIcon,
  ListTodoIcon,
  GanttChartSquareIcon,
  SearchIcon,
  CrownIcon,
  UserIcon,
  RefreshCwIcon,
  XIcon,
} from "lucide-react";
import type { Sprint } from "../types/sprint-progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/common/custom-select";
import { ProjectRealtimeBadge } from "@/features/student/project/components/project-realtime-badge";
import type { SSEConnectionStatus, ProjectRealtimeEvent } from "@/features/student/project/types/project-realtime-types";

interface SprintHeaderProps {
  sprints: Sprint[];
  selectedSprintId: string;
  onSelectSprint: (sprintId: string) => void;
  activeView: "BOARD" | "BACKLOG" | "TIMELINE";
  onSelectView: (view: "BOARD" | "BACKLOG" | "TIMELINE") => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedAssigneeId: string | null;
  onSelectAssignee: (assigneeId: string | null) => void;
  teamMembers: { id: string; name: string; avatar: string; studentCode: string }[];
  isTeamLeader: boolean;
  onToggleTeamLeader: () => void;
  courseCode?: string;
  projectName?: string;
  totalTasksCount?: number;
  onRefreshTasks?: () => void;
  isRefreshingTasks?: boolean;
  realtimeStatus?: SSEConnectionStatus;
  lastEventTime?: Date | null;
  lastEvent?: ProjectRealtimeEvent | null;
  onReconnectRealtime?: () => void;
}

export function SprintHeader({
  sprints,
  selectedSprintId,
  onSelectSprint,
  activeView,
  onSelectView,
  searchQuery,
  onSearchChange,
  selectedAssigneeId,
  onSelectAssignee,
  teamMembers,
  isTeamLeader,
  onToggleTeamLeader,
  courseCode = "SWP391",
  projectName = "SAGA Team",
  totalTasksCount,
  onRefreshTasks,
  isRefreshingTasks = false,
  realtimeStatus,
  lastEventTime,
  lastEvent,
  onReconnectRealtime,
}: SprintHeaderProps) {
  const hasActiveFilters = Boolean(searchQuery.trim() || selectedAssigneeId);

  const handleClearFilters = () => {
    onSearchChange("");
    onSelectAssignee(null);
  };

  return (
    <div className="space-y-4 pb-2 border-b border-border/70">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm font-bold text-lg">
            <KanbanSquareIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                Tiến độ Công việc (Sprint Progress)
              </h1>
              <Badge className="bg-primary/15 text-primary border-primary/25 font-bold font-mono text-xs">
                {courseCode}
              </Badge>
              {projectName ? (
                <Badge variant="outline" className="text-xs font-semibold text-muted-foreground border-border/80">
                  {projectName}
                </Badge>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">
              Quản lý Sprint, Kanban Board, Backlog và Timeline Roadmap theo chuẩn Jira Software
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-semibold text-muted-foreground hidden sm:inline">
            Thử nghiệm phân quyền:
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onToggleTeamLeader}
            className={`h-9 text-xs font-bold rounded-xl gap-1.5 cursor-pointer shadow-2xs border transition-all ${isTeamLeader
              ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/40 hover:bg-amber-500/20"
              : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
              }`}
          >
            {isTeamLeader ? (
              <>
                <CrownIcon className="w-4 h-4 text-amber-500" />
                <span>Vai trò: Trưởng nhóm (Leader)</span>
              </>
            ) : (
              <>
                <UserIcon className="w-4 h-4 text-muted-foreground" />
                <span>Vai trò: Thành viên (Member)</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border/60 w-fit">
          <button
            onClick={() => onSelectView("BOARD")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${activeView === "BOARD"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <KanbanSquareIcon className="w-4 h-4 text-blue-500" />
            <span>Board (Kanban)</span>
          </button>

          <button
            onClick={() => onSelectView("BACKLOG")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${activeView === "BACKLOG"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <ListTodoIcon className="w-4 h-4 text-purple-500" />
            <span>Backlog</span>
          </button>

          <button
            onClick={() => onSelectView("TIMELINE")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${activeView === "TIMELINE"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <GanttChartSquareIcon className="w-4 h-4 text-emerald-500" />
            <span>Timeline (Roadmap)</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {realtimeStatus && (
            <ProjectRealtimeBadge
              status={realtimeStatus}
              lastEventTime={lastEventTime}
              lastEvent={lastEvent}
              onReconnect={onReconnectRealtime}
            />
          )}
          {typeof totalTasksCount === "number" && (
            <span className="text-xs font-semibold text-muted-foreground font-mono">
              Tổng cộng: {totalTasksCount} đầu việc Jira
            </span>
          )}
          {onRefreshTasks && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefreshTasks}
              disabled={isRefreshingTasks}
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer rounded-xl border border-border/60 hover:bg-muted"
            >
              <RefreshCwIcon className={`w-3.5 h-3.5 ${isRefreshingTasks ? "animate-spin text-primary" : ""}`} />
              <span>Làm mới tasks</span>
            </Button>
          )}
        </div>
      </div>

      {activeView !== "TIMELINE" && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-2.5 rounded-2xl bg-muted/30 border border-border/60">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {activeView === "BOARD" && (
              <div className="w-full sm:w-80 shrink-0">
                <CustomSelect
                  value={selectedSprintId}
                  onChange={onSelectSprint}
                  options={sprints.map((s) => ({
                    value: s.id,
                    label: s.name,
                    subLabel: `Trạng thái: ${s.status}`,
                  }))}
                />
              </div>
            )}

            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <SearchIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Lọc theo mã task hoặc tiêu đề..."
                className="pl-8 h-9 text-xs rounded-xl bg-card border-border/80"
              />
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
              >
                <XIcon className="w-3.5 h-3.5" />
                <span>Xóa bộ lọc</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 lg:border-l border-border/60 lg:pl-3">
            <span className="text-[11px] font-semibold text-muted-foreground mr-1 hidden sm:inline">
              Người làm:
            </span>
            <button
              onClick={() => onSelectAssignee(null)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${selectedAssigneeId === null
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
            >
              Tất cả
            </button>

            <div className="flex items-center gap-1 overflow-x-auto max-w-[240px] sm:max-w-none py-0.5">
              {teamMembers.map((m) => {
                const isSelected = selectedAssigneeId === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => onSelectAssignee(isSelected ? null : m.id)}
                    title={`${m.name} (${m.studentCode})`}
                    className={`relative rounded-full transition-transform cursor-pointer shrink-0 ${isSelected ? "ring-2 ring-primary ring-offset-2 scale-110" : "opacity-80 hover:opacity-100"
                      }`}
                  >
                    <Avatar className="w-7 h-7 border border-background">
                      <AvatarImage src={m.avatar} alt={m.name} />
                      <AvatarFallback className="text-[10px] bg-primary/20 text-primary font-bold">
                        {m.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
