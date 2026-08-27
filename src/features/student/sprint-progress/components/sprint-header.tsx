"use client";

import {
  KanbanSquareIcon,
  ListTodoIcon,
  GanttChartSquareIcon,
  SearchIcon,
  ChevronDownIcon,
  CrownIcon,
  UserIcon,
} from "lucide-react";
import type { Sprint } from "../types/sprint-progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

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
}: SprintHeaderProps) {
  return (
    <div className="space-y-4 pb-2 border-b border-border/70">
      {/* Top Title Bar & Role Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-lg">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                Tiến độ Công việc (Sprint Progress)
              </h1>
              <Badge className="bg-primary/15 text-primary border-primary/20 font-bold text-xs">
                SWP490_SAGA
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Quản lý Sprint, Kanban Board, Backlog và Timeline Roadmap theo chuẩn Jira Software
            </p>
          </div>
        </div>

        {/* Role Switcher Toggle (Leader vs Member) */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-semibold text-muted-foreground hidden sm:inline">
            Thử nghiệm phân quyền:
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onToggleTeamLeader}
            className={`h-9 text-xs font-bold rounded-xl gap-1.5 cursor-pointer shadow-2xs border transition-all ${
              isTeamLeader
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

      {/* Navigation Tabs & Toolbars */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border/60 w-fit">
          <button
            onClick={() => onSelectView("BOARD")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
              activeView === "BOARD"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <KanbanSquareIcon className="w-4 h-4 text-blue-500" />
            <span>Board (Kanban)</span>
          </button>

          <button
            onClick={() => onSelectView("BACKLOG")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
              activeView === "BACKLOG"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ListTodoIcon className="w-4 h-4 text-purple-500" />
            <span>Backlog</span>
          </button>

          <button
            onClick={() => onSelectView("TIMELINE")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
              activeView === "TIMELINE"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <GanttChartSquareIcon className="w-4 h-4 text-emerald-500" />
            <span>Timeline (Roadmap)</span>
          </button>
        </div>

        {/* Filters: Search & Member Avatar Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Sprint Selector Dropdown */}
          <div className="relative">
            <select
              value={selectedSprintId}
              onChange={(e) => onSelectSprint(e.target.value)}
              className="h-9 pl-3 pr-8 text-xs font-bold rounded-xl bg-card border border-border/80 focus:outline-hidden focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
            >
              {sprints.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.status})
                </option>
              ))}
            </select>
            <ChevronDownIcon className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-48">
            <SearchIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Lọc mã/tên task..."
              className="pl-8 h-9 text-xs rounded-xl bg-card border-border/80"
            />
          </div>

          {/* Assignee Avatar Filters */}
          <div className="flex items-center gap-1 pl-1 border-l border-border/60">
            <span className="text-[11px] font-medium text-muted-foreground mr-1 hidden sm:inline">
              Người làm:
            </span>
            <button
              onClick={() => onSelectAssignee(null)}
              className={`text-[11px] font-bold px-2 py-1 rounded-lg transition-all cursor-pointer ${
                selectedAssigneeId === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Tất cả
            </button>

            {teamMembers.map((m) => {
              const isSelected = selectedAssigneeId === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => onSelectAssignee(isSelected ? null : m.id)}
                  title={`${m.name} (${m.studentCode})`}
                  className={`relative rounded-full transition-transform cursor-pointer ${
                    isSelected ? "ring-2 ring-primary ring-offset-2 scale-110" : "opacity-80 hover:opacity-100"
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
    </div>
  );
}
