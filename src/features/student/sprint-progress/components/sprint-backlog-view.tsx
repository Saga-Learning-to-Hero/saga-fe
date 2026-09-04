"use client";

import { useState } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  CheckCircle2Icon,
  CalendarIcon,
  PlayIcon,
  Edit3Icon,
  SparklesIcon,
  LockIcon,
} from "lucide-react";
import type { Sprint, SprintIssue } from "../types/sprint-progress";
import { renderTypeIcon, renderPriorityIcon } from "./sprint-board-view";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SprintBacklogViewProps {
  sprints: Sprint[];
  issues: SprintIssue[];
  onIssueClick: (issue: SprintIssue) => void;
  onCreateIssueClick: (sprintId?: string) => void;
  onCreateSprintClick: () => void;
  onMoveTaskSprint: (issueId: string, newSprintId: string) => void;
  onStartSprint: (sprintId: string) => void;
  onCompleteSprint: (sprintId: string) => void;
  onEditSprint: (sprint: Sprint) => void;
  isTeamLeader: boolean;
  currentUserStudentCode: string;
}

export function SprintBacklogView({
  sprints,
  issues,
  onIssueClick,
  onCreateIssueClick,
  onCreateSprintClick,
  onMoveTaskSprint,
  onStartSprint,
  onCompleteSprint,
  onEditSprint,
  isTeamLeader,
  currentUserStudentCode,
}: SprintBacklogViewProps) {
  const [collapsedSprints, setCollapsedSprints] = useState<Record<string, boolean>>({});
  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null);

  const toggleSprint = (sprintId: string) => {
    setCollapsedSprints((prev) => ({ ...prev, [sprintId]: !prev[sprintId] }));
  };

  const handleDragStart = (e: React.DragEvent, issue: SprintIssue) => {
    const canDrag = isTeamLeader || issue.assignee.studentCode === currentUserStudentCode;
    if (!canDrag) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("issueId", issue.id);
    e.dataTransfer.effectAllowed = "move";
    setDraggedIssueId(issue.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetSprintId: string) => {
    e.preventDefault();
    const issueId = e.dataTransfer.getData("issueId") || draggedIssueId;
    if (issueId) {
      onMoveTaskSprint(issueId, targetSprintId);
    }
    setDraggedIssueId(null);
  };

  return (
    <div className="space-y-5">
      {/* Backlog Top Bar with + Tạo Sprint mới (Leader Only) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-muted/40 border border-border/60">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-sm font-bold text-foreground">
            Quản lý Sprints & Task Backlog
          </h2>
          <span className="text-xs text-muted-foreground font-mono">
            ({sprints.length} sprints)
          </span>
        </div>

        {/* Create Sprint Button - Leader Only */}
        {isTeamLeader ? (
          <Button
            type="button"
            onClick={onCreateSprintClick}
            className="h-9 text-xs font-bold rounded-xl gap-1.5 cursor-pointer shadow-xs bg-purple-600 hover:bg-purple-700 text-white px-4"
          >
            <SparklesIcon className="w-3.5 h-3.5" />
            + Tạo Sprint mới
          </Button>
        ) : (
          <Badge variant="outline" className="text-muted-foreground border-border text-[11px] font-medium gap-1">
            <LockIcon className="w-3 h-3 text-amber-500" />
            Chỉ Trưởng nhóm mới có quyền quản lý Sprint
          </Badge>
        )}
      </div>

      {/* Sprints List */}
      {sprints.map((sprint) => {
        const sprintIssues = issues.filter((i) => i.sprintId === sprint.id);
        const isCollapsed = collapsedSprints[sprint.id];
        const completedSP = sprintIssues
          .filter((i) => i.status === "DONE")
          .reduce((sum, i) => sum + i.storyPoints, 0);
        const totalSP = sprintIssues.reduce((sum, i) => sum + i.storyPoints, 0);

        return (
          <Card
            key={sprint.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, sprint.id)}
            className="rounded-2xl border border-border/80 shadow-xs bg-card overflow-hidden transition-all"
          >
            {/* Sprint Header */}
            <CardHeader className="p-4 sm:p-5 bg-muted/30 border-b border-border/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleSprint(sprint.id)}
                    className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
                  >
                    {isCollapsed ? (
                      <ChevronRightIcon className="w-5 h-5" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5" />
                    )}
                  </button>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-foreground">
                        {sprint.name}
                      </h3>

                      {sprint.status === "ACTIVE" && (
                        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0 text-[10px] font-bold">
                          ACTIVE SPRINT
                        </Badge>
                      )}
                      {sprint.status === "COMPLETED" && (
                        <Badge variant="secondary" className="text-[10px] font-bold">
                          COMPLETED
                        </Badge>
                      )}
                      {sprint.status === "PLANNED" && (
                        <Badge variant="outline" className="text-[10px] font-bold">
                          PLANNED
                        </Badge>
                      )}

                      <span className="text-xs text-muted-foreground font-mono">
                        ({sprintIssues.length} tasks)
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        {sprint.startDate} ~ {sprint.endDate}
                      </span>
                      <span>•</span>
                      <span className="truncate max-w-md">{sprint.goal}</span>
                    </p>
                  </div>
                </div>

                {/* Right side stats & Lifecycle Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <div className="text-right text-xs font-mono mr-2">
                    <span className="text-muted-foreground">Tiến độ SP: </span>
                    <strong className="text-emerald-600 font-bold">{completedSP}</strong>
                    <span className="text-muted-foreground">/{totalSP} SP</span>
                  </div>

                  {/* Lifecycle Action Buttons - Leader Only */}
                  {isTeamLeader && (
                    <>
                      {sprint.status === "PLANNED" && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => onStartSprint(sprint.id)}
                          className="h-8 text-xs font-bold rounded-xl gap-1 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer px-3"
                        >
                          <PlayIcon className="w-3.5 h-3.5" />
                          Bắt đầu Sprint
                        </Button>
                      )}

                      {sprint.status === "ACTIVE" && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => onCompleteSprint(sprint.id)}
                          className="h-8 text-xs font-bold rounded-xl gap-1 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer px-3"
                        >
                          <CheckCircle2Icon className="w-3.5 h-3.5" />
                          Hoàn thành Sprint
                        </Button>
                      )}

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditSprint(sprint)}
                        className="h-8 text-xs font-bold rounded-xl gap-1 border-border/80 cursor-pointer"
                      >
                        <Edit3Icon className="w-3.5 h-3.5" />
                        Sửa
                      </Button>
                    </>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onCreateIssueClick(sprint.id)}
                    className="h-8 text-xs font-bold rounded-xl gap-1.5 border-blue-500/40 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 cursor-pointer shadow-2xs"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                    Tạo Task mới
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Sprint Issues List */}
            {!isCollapsed && (
              <CardContent className="p-0 divide-y divide-border/60 min-h-[60px]">
                {sprintIssues.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground italic">
                    Chưa có công việc nào trong Sprint này. Kéo thả thẻ task vào đây hoặc bấm &quot;+ Tạo Task mới&quot; để thêm.
                  </div>
                ) : (
                  sprintIssues.map((issue) => {
                    const canDrag = isTeamLeader || issue.assignee.studentCode === currentUserStudentCode;

                    return (
                      <div
                        key={issue.id}
                        draggable={canDrag}
                        onDragStart={(e) => handleDragStart(e, issue)}
                        onClick={() => onIssueClick(issue)}
                        className={`p-3 sm:px-5 hover:bg-muted/40 transition-colors flex items-center justify-between gap-4 group ${canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-pointer opacity-90"
                          }`}
                      >
                        {/* Left: Issue Key, Type, Summary & Labels */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {renderTypeIcon(issue.type)}

                          <span className="text-xs font-mono font-bold text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                            {issue.key}
                          </span>

                          {!canDrag && (
                            <span title="Chỉ đọc (Task của thành viên khác)">
                              <LockIcon className="w-3 h-3 text-muted-foreground/70 shrink-0" />
                            </span>
                          )}

                          <span className="text-xs font-semibold text-foreground truncate">
                            {issue.summary}
                          </span>

                          {/* Labels Badges */}
                          {issue.labels && issue.labels.length > 0 && (
                            <div className="hidden sm:flex items-center gap-1 shrink-0">
                              {issue.labels.map((lbl, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-[9px] font-mono px-1.5 py-0 bg-muted/80 text-muted-foreground border-border/40"
                                >
                                  #{lbl}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {issue.epic && (
                            <Badge
                              style={{ backgroundColor: `${issue.epic.color}15`, color: issue.epic.color }}
                              className="border-0 text-[10px] font-bold px-2 py-0.2 shrink-0 hidden md:inline-flex"
                            >
                              {issue.epic.name}
                            </Badge>
                          )}
                        </div>

                        {/* Right: Priority, Status, SP, Assignee */}
                        <div className="flex items-center gap-3 shrink-0 text-xs">
                          {renderPriorityIcon(issue.priority)}

                          <Badge
                            variant="outline"
                            className={
                              issue.status === "DONE"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-bold text-[10px]"
                                : issue.status === "IN_PROGRESS"
                                  ? "bg-blue-500/10 text-blue-600 border-blue-500/30 font-bold text-[10px]"
                                  : "text-[10px] font-medium"
                            }
                          >
                            {issue.status}
                          </Badge>

                          <Badge variant="secondary" className="font-mono text-[10px] px-2 py-0.5">
                            {issue.storyPoints} SP
                          </Badge>

                          <Avatar className="w-6 h-6 border shrink-0">
                            <AvatarImage src={issue.assignee.avatar} alt={issue.assignee.name} />
                            <AvatarFallback className="text-[9px] bg-primary/20 text-primary font-bold">
                              {issue.assignee.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
