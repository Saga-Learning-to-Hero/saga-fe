"use client";

import { useState } from "react";
import {
  BookOpenIcon,
  CheckSquareIcon,
  BugIcon,
  GitBranchIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EqualIcon,
  GitCommitIcon,
  LockIcon,
} from "lucide-react";
import type { SprintIssue, IssueStatus, IssueType, IssuePriority } from "../types/sprint-progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SprintBoardViewProps {
  issues: SprintIssue[];
  onIssueClick: (issue: SprintIssue) => void;
  onMoveTaskStatus: (issueId: string, newStatus: IssueStatus) => void;
  isTeamLeader: boolean;
  currentUserStudentCode: string;
}

const COLUMNS: { id: IssueStatus; title: string; color: string }[] = [
  { id: "TODO", title: "CẦN LÀM (TO DO)", color: "border-slate-500/40 bg-slate-500/5" },
  { id: "IN_PROGRESS", title: "ĐANG LÀM (IN PROGRESS)", color: "border-blue-500/40 bg-blue-500/5" },
  { id: "IN_REVIEW", title: "ĐANG KIỂM THỬ (IN REVIEW)", color: "border-purple-500/40 bg-purple-500/5" },
  { id: "DONE", title: "HOÀN THÀNH (DONE)", color: "border-emerald-500/40 bg-emerald-500/5" },
];

export function renderTypeIcon(type: IssueType) {
  switch (type) {
    case "STORY":
      return <span title="User Story"><BookOpenIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" /></span>;
    case "TASK":
      return <span title="Task"><CheckSquareIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" /></span>;
    case "BUG":
      return <span title="Bug"><BugIcon className="w-3.5 h-3.5 text-rose-500 shrink-0" /></span>;
    case "SUBTASK":
      return <span title="Subtask"><GitBranchIcon className="w-3.5 h-3.5 text-purple-500 shrink-0" /></span>;
  }
}

export function renderPriorityIcon(priority: IssuePriority) {
  switch (priority) {
    case "HIGHEST":
      return <span title="Highest Priority"><ArrowUpIcon className="w-3.5 h-3.5 text-rose-600 font-bold shrink-0" /></span>;
    case "HIGH":
      return <span title="High Priority"><ArrowUpIcon className="w-3.5 h-3.5 text-orange-500 shrink-0" /></span>;
    case "MEDIUM":
      return <span title="Medium Priority"><EqualIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" /></span>;
    case "LOW":
      return <span title="Low Priority"><ArrowDownIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" /></span>;
  }
}

export function SprintBoardView({
  issues,
  onIssueClick,
  onMoveTaskStatus,
  isTeamLeader,
  currentUserStudentCode,
}: SprintBoardViewProps) {
  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null);

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

  const handleDrop = (e: React.DragEvent, targetStatus: IssueStatus) => {
    e.preventDefault();
    const issueId = e.dataTransfer.getData("issueId") || draggedIssueId;
    if (issueId) {
      onMoveTaskStatus(issueId, targetStatus);
    }
    setDraggedIssueId(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
      {COLUMNS.map((col) => {
        const colIssues = issues.filter((i) => i.status === col.id);
        const totalSP = colIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);

        return (
          <div
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`rounded-2xl border ${col.color} p-3.5 space-y-3 min-h-[520px] flex flex-col justify-between transition-all`}
          >
            <div className="space-y-3">
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold tracking-wider text-foreground">
                    {col.title}
                  </h3>
                  <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0.2">
                    {colIssues.length}
                  </Badge>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground font-semibold">
                  {totalSP} SP
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-2.5 min-h-[400px]">
                {colIssues.map((issue) => {
                  const canDrag = isTeamLeader || issue.assignee.studentCode === currentUserStudentCode;

                  return (
                    <div
                      key={issue.id}
                      draggable={canDrag}
                      onDragStart={(e) => handleDragStart(e, issue)}
                      onClick={() => onIssueClick(issue)}
                      className={`p-3.5 rounded-xl bg-card border border-border/70 shadow-2xs hover:shadow-xs transition-all space-y-2.5 group ${
                        canDrag
                          ? "cursor-grab active:cursor-grabbing hover:border-primary/50 hover:scale-[1.01]"
                          : "cursor-pointer opacity-90 border-dashed"
                      }`}
                    >
                      {/* Issue Key & Epic */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {renderTypeIcon(issue.type)}
                          <span className="text-xs font-mono font-bold text-muted-foreground group-hover:text-primary transition-colors">
                            {issue.key}
                          </span>
                          {!canDrag && (
                            <span title="Chỉ đọc (Task của thành viên khác)">
                              <LockIcon className="w-3 h-3 text-muted-foreground/70 shrink-0" />
                            </span>
                          )}
                        </div>

                        {issue.epic && (
                          <Badge
                            style={{ backgroundColor: `${issue.epic.color}15`, color: issue.epic.color }}
                            className="border-0 text-[10px] font-bold px-2 py-0.2 truncate max-w-[110px]"
                          >
                            {issue.epic.name}
                          </Badge>
                        )}
                      </div>

                      {/* Summary */}
                      <p className="text-xs font-semibold text-foreground line-clamp-2 leading-snug">
                        {issue.summary}
                      </p>

                      {/* Labels Badges */}
                      {issue.labels && issue.labels.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pt-0.5">
                          {issue.labels.map((lbl, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-[9px] font-mono px-1.5 py-0 bg-muted/70 text-muted-foreground border-border/50"
                            >
                              #{lbl}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Bottom Metadata Bar */}
                      <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-2">
                          {renderPriorityIcon(issue.priority)}

                          {issue.githubCommitCount ? (
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-semibold">
                              <GitCommitIcon className="w-3 h-3" />
                              {issue.githubCommitCount}
                            </span>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0">
                            {issue.storyPoints} SP
                          </Badge>

                          <Avatar className="w-5 h-5 border shadow-2xs">
                            <AvatarImage src={issue.assignee.avatar} alt={issue.assignee.name} />
                            <AvatarFallback className="text-[9px] bg-primary/20 text-primary font-bold">
                              {issue.assignee.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
