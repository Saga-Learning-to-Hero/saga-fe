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
  AlertTriangleIcon,
  AlertCircleIcon,
  NetworkIcon,
  ListTodoIcon,
  LayersIcon,
} from "lucide-react";
import type { SprintIssue, IssueStatus, IssueType, IssuePriority } from "../types/sprint-progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SprintBoardViewProps {
  issues: SprintIssue[];
  onIssueClick: (issue: SprintIssue) => void;
  onMoveTaskStatus: (issueId: string, newStatus: IssueStatus) => void;
  isTeamLeader: boolean;
  currentUserStudentCode: string;
  onSwitchToBacklog?: () => void;
  totalBacklogCount?: number;
  isLoading?: boolean;
}

const COLUMNS: { id: IssueStatus; title: string; dotColor: string; barColor: string }[] = [
  {
    id: "TODO",
    title: "CẦN LÀM",
    dotColor: "bg-slate-400 dark:bg-slate-500",
    barColor: "bg-slate-400",
  },
  {
    id: "IN_PROGRESS",
    title: "ĐANG LÀM",
    dotColor: "bg-blue-500",
    barColor: "bg-blue-500",
  },
  {
    id: "IN_REVIEW",
    title: "ĐANG KIỂM THỬ",
    dotColor: "bg-purple-500",
    barColor: "bg-purple-500",
  },
  {
    id: "DONE",
    title: "HOÀN THÀNH",
    dotColor: "bg-emerald-500",
    barColor: "bg-emerald-500",
  },
];

export function renderTypeIcon(type: IssueType) {
  switch (type) {
    case "STORY":
      return (
        <span title="User Story">
          <BookOpenIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        </span>
      );
    case "TASK":
      return (
        <span title="Task">
          <CheckSquareIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
        </span>
      );
    case "BUG":
      return (
        <span title="Bug">
          <BugIcon className="w-3.5 h-3.5 text-rose-500 shrink-0" />
        </span>
      );
    case "SUBTASK":
      return (
        <span title="Subtask">
          <GitBranchIcon className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
        </span>
      );
    default:
      return <CheckSquareIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />;
  }
}

export function renderPriorityIcon(priority: IssuePriority) {
  switch (priority) {
    case "HIGHEST":
    case "HIGH":
      return (
        <span title="Ưu tiên cao">
          <ArrowUpIcon className="w-3.5 h-3.5 text-rose-500 shrink-0" />
        </span>
      );
    case "LOW":
      return (
        <span title="Ưu tiên thấp">
          <ArrowDownIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        </span>
      );
    case "MEDIUM":
    default:
      return (
        <span title="Ưu tiên trung bình">
          <EqualIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        </span>
      );
  }
}

export function SprintBoardView({
  issues,
  onIssueClick,
  onMoveTaskStatus,
  isTeamLeader,
  currentUserStudentCode,
  onSwitchToBacklog,
  totalBacklogCount,
  isLoading = false,
}: SprintBoardViewProps) {
  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null);
  const [showEmptyColumnsAnyway, setShowEmptyColumnsAnyway] = useState<boolean>(false);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start animate-pulse">
        {COLUMNS.map((col) => (
          <div key={col.id} className="rounded-2xl border border-border/40 bg-muted/20 p-3.5 space-y-3 min-h-[420px]">
            <div className="h-5 bg-muted/60 rounded-md w-2/3" />
            <div className="h-1 bg-muted/40 rounded-full" />
            <div className="space-y-2.5 pt-2">
              <div className="h-24 bg-card/60 rounded-xl border border-border/40" />
              <div className="h-24 bg-card/60 rounded-xl border border-border/40" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const totalSprintSP = issues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);

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

  if (issues.length === 0 && !showEmptyColumnsAnyway) {
    return (
      <div className="rounded-3xl border border-dashed border-border/80 bg-card/40 p-8 sm:p-12 text-center space-y-5 max-w-2xl mx-auto shadow-2xs">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
          <LayersIcon className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h3 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight">
            Sprint này hiện chưa có task nào được kích hoạt
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            {typeof totalBacklogCount === "number" && totalBacklogCount > 0 ? (
              <>
                Hiện có <strong className="text-foreground font-mono font-bold">{totalBacklogCount}</strong> tasks đã đồng bộ từ Jira đang nằm trong mục <strong>Backlog</strong>. Bạn có thể sang tab Backlog để kéo thả task vào Sprint này.
              </>
            ) : (
              <>Bạn có thể tạo task mới hoặc sang tab Backlog để phân công đầu việc cho Sprint.</>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {onSwitchToBacklog && (
            <Button
              type="button"
              onClick={onSwitchToBacklog}
              className="h-9 px-4 text-xs font-bold rounded-xl gap-2 cursor-pointer shadow-xs"
            >
              <ListTodoIcon className="w-4 h-4" />
              <span>Chuyển sang tab Backlog để chọn task</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={() => setShowEmptyColumnsAnyway(true)}
            className="h-9 px-3.5 text-xs font-medium rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Xem khung 4 cột Kanban
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {issues.length === 0 && (
        <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <AlertCircleIcon className="w-4 h-4 text-primary shrink-0" />
            <span>Đang hiển thị 4 cột trống của Sprint. Hãy kéo task từ Backlog vào để bắt đầu.</span>
          </div>
          {onSwitchToBacklog && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onSwitchToBacklog}
              className="h-7 text-xs font-bold rounded-lg cursor-pointer shrink-0"
            >
              Mở Backlog
            </Button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {COLUMNS.map((col) => {
          const colIssues = issues.filter((i) => i.status === col.id);
          const colSP = colIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);
          const percentSP = totalSprintSP > 0 ? Math.round((colSP / totalSprintSP) * 100) : 0;

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="rounded-2xl border border-border/60 bg-muted/20 p-3 flex flex-col transition-all max-h-[calc(100vh-220px)] min-h-[500px]"
            >
              <div className="pb-2.5 mb-2.5 border-b border-border/50 shrink-0 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor} shrink-0`} />
                    <h3 className="text-xs font-bold tracking-wider text-foreground">
                      {col.title}
                    </h3>
                    <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0">
                      {colIssues.length}
                    </Badge>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground font-semibold">
                    {colSP} SP
                  </span>
                </div>
                <div className="w-full bg-muted/60 h-1 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${col.barColor} transition-all duration-300`}
                    style={{ width: `${percentSP}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2.5 flex-1 overflow-y-auto pr-2 pl-0.5 py-1 custom-scrollbar min-h-[300px] overscroll-contain">
                {colIssues.length === 0 ? (
                  <div className="h-28 flex items-center justify-center rounded-xl border border-dashed border-border/50 text-[11px] text-muted-foreground/60 select-none">
                    Chưa có task nào
                  </div>
                ) : null}

                {colIssues.map((issue) => {
                  const canDrag = isTeamLeader || issue.assignee.studentCode === currentUserStudentCode;
                  const isMsrAnomaly = issue.status === "DONE" && (issue.githubCommitCount ?? 0) === 0;

                  return (
                    <div
                      key={issue.id}
                      draggable={canDrag}
                      onDragStart={(e) => handleDragStart(e, issue)}
                      onClick={() => onIssueClick(issue)}
                      className={`p-3 rounded-xl bg-card border shadow-2xs hover:shadow-sm transition-all duration-150 space-y-2 group ${isMsrAnomaly
                          ? "border-amber-500/50 bg-amber-500/5 dark:border-amber-500/40 hover:border-amber-500"
                          : "border-border/70 hover:border-primary/60"
                        } ${canDrag
                          ? "cursor-grab active:cursor-grabbing hover:-translate-y-0.5"
                          : "cursor-pointer opacity-90 border-dashed"
                        }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {renderTypeIcon(issue.type)}
                          <span className="text-xs font-mono font-bold text-muted-foreground group-hover:text-primary transition-colors truncate">
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
                            className="border-0 text-[10px] font-bold px-1.5 py-0.2 truncate max-w-[110px]"
                          >
                            {issue.epic.name}
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs font-semibold text-foreground line-clamp-2 leading-snug">
                        {issue.summary}
                      </p>

                      {issue.labels && issue.labels.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1">
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

                      <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-2">
                          {renderPriorityIcon(issue.priority)}

                          {issue.githubCommitCount && issue.githubCommitCount > 0 ? (
                            <span
                              title={`Có ${issue.githubCommitCount} commit liên kết từ GitHub`}
                              className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-semibold"
                            >
                              <GitCommitIcon className="w-3 h-3" />
                              {issue.githubCommitCount}
                            </span>
                          ) : isMsrAnomaly ? (
                            <span
                              title="Cảnh báo MSR Anomaly: Task Done nhưng chưa có commit liên kết"
                              className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-mono text-[10px] font-semibold"
                            >
                              <AlertTriangleIcon className="w-3 h-3" />
                              0 commit
                            </span>
                          ) : null}

                          <Link
                            href={`/student/graph?taskId=${issue.key}`}
                            onClick={(e) => e.stopPropagation()}
                            title="Xem minh chứng trên Đồ thị Neo4j"
                            className="text-muted-foreground/60 hover:text-primary transition-colors p-0.5 rounded"
                          >
                            <NetworkIcon className="w-3 h-3" />
                          </Link>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0">
                            {issue.storyPoints > 0 ? `${issue.storyPoints} SP` : "0 SP"}
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
          );
        })}
      </div>
    </div>
  );
}
