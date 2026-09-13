"use client";

import {
  KanbanSquareIcon,
  ListTodoIcon,
  GanttChartSquareIcon,
  SearchIcon,
  CrownIcon,
  RefreshCwIcon,
  XIcon,
  CalendarIcon,
  FlameIcon,
  CheckCircle2Icon,
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
  courseCode?: string;
  projectName?: string;
  totalTasksCount?: number;
  totalProjectTasksCount?: number;
  productBacklogCount?: number;
  onSyncJira?: () => void;
  isSyncingJira?: boolean;
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
  courseCode = "Chưa chọn lớp",
  projectName = "Chưa xác định dự án",
  totalTasksCount,
  totalProjectTasksCount,
  productBacklogCount,
  onSyncJira,
  isSyncingJira = false,
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

  const currentSprint = sprints.find((s) => s.id === selectedSprintId);
  const isBacklogView = selectedSprintId === "backlog";

  const totalSprintSP = currentSprint?.totalStoryPoints || 0;
  const completedSprintSP = currentSprint?.completedStoryPoints || 0;
  const progressPercent = totalSprintSP > 0 ? Math.round((completedSprintSP / totalSprintSP) * 100) : 0;

  const getSprintStatusBadge = (status?: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <FlameIcon className="w-3 h-3 text-emerald-500" />
            Đang diễn ra
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-muted text-muted-foreground border border-border">
            <CheckCircle2Icon className="w-3 h-3 text-muted-foreground" />
            Đã hoàn thành
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
            <CalendarIcon className="w-3 h-3 text-blue-500" />
            Kế hoạch
          </span>
        );
    }
  };

  return (
    <div className="space-y-3.5 pb-2 border-b border-border/60">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5 bg-card/60 p-4 rounded-3xl border border-border/70 backdrop-blur-xs shadow-2xs">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-xs font-bold">
            <KanbanSquareIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight truncate">
                Tiến độ Sprint
              </h1>
              <Badge variant="outline" className="font-mono text-[11px] font-bold border-primary/30 bg-primary/10 text-primary">
                {courseCode}
              </Badge>
              {projectName && (
                <Badge variant="outline" className="text-[11px] font-medium text-muted-foreground border-border/80 truncate max-w-[200px]">
                  {projectName}
                </Badge>
              )}
              {isTeamLeader && (
                <Badge
                  variant="outline"
                  className="text-amber-700 dark:text-amber-300 border-amber-500/40 bg-amber-500/10 text-[11px] font-bold gap-1 py-0.5 px-2"
                >
                  <CrownIcon className="w-3 h-3 text-amber-500" />
                  <span>Leader</span>
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              Quản lý đầu việc Scrum, Kanban và đối soát minh chứng commit kỹ thuật
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {currentSprint && !isBacklogView && (
            <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-2xl bg-muted/40 border border-border/60 text-xs">
              <div className="flex items-center gap-1.5">
                {getSprintStatusBadge(currentSprint.status)}
              </div>
              <div className="h-4 w-px bg-border/80" />
              <div className="flex flex-col">
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="text-muted-foreground">Tiến độ SP:</span>
                  <span className="font-bold text-foreground">{completedSprintSP} / {totalSprintSP} SP</span>
                  <span className="font-bold text-primary">({progressPercent}%)</span>
                </div>
                <div className="w-32 bg-muted/80 h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-2xl border border-border/60">
            <span>Hiển thị: <strong className="text-foreground font-mono font-bold">{totalTasksCount ?? 0}</strong></span>
            <span className="text-border">|</span>
            <span>Tổng dự án: <strong className="text-foreground font-mono font-bold">{totalProjectTasksCount ?? 0}</strong></span>
          </div>

          {realtimeStatus && (
            <ProjectRealtimeBadge
              status={realtimeStatus}
              lastEventTime={lastEventTime}
              lastEvent={lastEvent}
              onReconnect={onReconnectRealtime}
            />
          )}

          {onSyncJira && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSyncJira}
              disabled={isSyncingJira}
              className="h-8.5 px-3 text-xs font-bold rounded-xl gap-1.5 cursor-pointer shadow-2xs border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20"
            >
              <RefreshCwIcon className={`w-3.5 h-3.5 ${isSyncingJira ? "animate-spin text-blue-500" : ""}`} />
              <span>{isSyncingJira ? "Đang đồng bộ..." : "Đồng bộ Jira"}</span>
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-2xl border border-border/60 w-fit">
          <button
            onClick={() => onSelectView("BOARD")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${activeView === "BOARD"
              ? "bg-card text-foreground shadow-xs border border-border/50"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <KanbanSquareIcon className="w-3.5 h-3.5 text-blue-500" />
            <span>Bảng Kanban</span>
          </button>

          <button
            onClick={() => onSelectView("BACKLOG")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${activeView === "BACKLOG"
              ? "bg-card text-foreground shadow-xs border border-border/50"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <ListTodoIcon className="w-3.5 h-3.5 text-indigo-500" />
            <span>Backlog</span>
            {typeof productBacklogCount === "number" && productBacklogCount > 0 && (
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-muted font-bold text-muted-foreground">
                {productBacklogCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectView("TIMELINE")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${activeView === "TIMELINE"
              ? "bg-card text-foreground shadow-xs border border-border/50"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <GanttChartSquareIcon className="w-3.5 h-3.5 text-emerald-500" />
            <span>Lộ trình Timeline</span>
          </button>
        </div>

        {activeView !== "TIMELINE" && (
          <div className="flex flex-wrap items-center gap-2.5 flex-1 lg:justify-end">
            {activeView === "BOARD" && (
              <div className="w-full sm:w-64 shrink-0">
                <CustomSelect
                  value={selectedSprintId}
                  onChange={onSelectSprint}
                  options={[
                    ...sprints.map((s) => ({
                      value: s.id,
                      label: s.name,
                      subLabel: s.status === "ACTIVE" ? "Đang diễn ra" : s.status === "COMPLETED" ? "Đã xong" : "Kế hoạch",
                    })),
                    {
                      value: "backlog",
                      label: "Backlog",
                      subLabel:
                        typeof productBacklogCount === "number"
                          ? `${productBacklogCount} tasks tồn đọng`
                          : "Tasks tồn đọng",
                    },
                  ]}
                />
              </div>
            )}

            <div className="relative flex-1 sm:max-w-xs min-w-[180px]">
              <SearchIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Tìm mã task, tiêu đề..."
                className="pl-8.5 pr-8 h-9 text-xs rounded-xl bg-card border-border/80 font-sans"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0 bg-muted/40 p-1 rounded-xl border border-border/50">
              <button
                onClick={() => onSelectAssignee(null)}
                className={`text-[11px] font-bold px-2 py-1 rounded-lg transition-all cursor-pointer select-none ${selectedAssigneeId === null
                  ? "bg-card text-foreground shadow-2xs font-extrabold"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Tất cả
              </button>

              <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] sm:max-w-none">
                {teamMembers.map((m) => {
                  const isSelected = selectedAssigneeId === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => onSelectAssignee(isSelected ? null : m.id)}
                      title={`${m.name} (${m.studentCode})`}
                      className={`relative rounded-full transition-all cursor-pointer shrink-0 ${isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105" : "opacity-75 hover:opacity-100"
                        }`}
                    >
                      <Avatar className="w-6.5 h-6.5 border border-border/80">
                        <AvatarImage src={m.avatar} alt={m.name} />
                        <AvatarFallback className="text-[9px] bg-primary/20 text-primary font-bold">
                          {m.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  );
                })}
              </div>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
              >
                <XIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bỏ lọc</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
