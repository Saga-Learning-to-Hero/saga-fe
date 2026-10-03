"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangleIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ExternalLinkIcon,
  FolderGit2Icon,
  GitCommitIcon,
  GitMergeIcon,
  KanbanIcon,
  ListTodoIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { studentCoursePath } from "@/features/student/courses/hooks/use-student-course-context";
import { CommitDetailModal } from "@/features/student/commits/components/commit-detail-modal";
import { cn } from "@/lib/utils";
import type {
  StudentDashboardActiveTask,
  StudentDashboardLinkedCommit,
} from "../types/student-dashboard-types";

interface StudentActiveTasksCardProps {
  tasks: StudentDashboardActiveTask[];
  courseId: string;
  projectId?: string | null;
}

function formatCommitTime(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    let clean = dateStr.trim();
    if (clean.includes("T") && !clean.endsWith("Z") && !/[+-]\d{2}(:\d{2})?$/.test(clean)) {
      clean += "Z";
    }
    const d = new Date(clean);
    return Number.isNaN(d.getTime())
      ? dateStr
      : new Intl.DateTimeFormat("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }).format(d);
  } catch {
    return dateStr;
  }
}

export function StudentActiveTasksCard({
  tasks,
  courseId,
  projectId,
}: StudentActiveTasksCardProps) {
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({});
  const [selectedCommit, setSelectedCommit] = useState<StudentDashboardLinkedCommit | null>(null);

  const toggleTaskCommits = (taskId: string) => {
    setExpandedTaskIds((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  return (
    <>
      <Card className="rounded-xl border border-border/80 bg-card/90 shadow-xs flex flex-col">
        <CardHeader className="p-4 pb-2 border-b border-border/60 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <ListTodoIcon className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-bold">Việc cần làm của tôi</CardTitle>
                {tasks.length > 0 && (
                  <Badge variant="secondary" className="font-mono text-xs px-1.5 py-0 h-4">
                    {tasks.length}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Các nhiệm vụ Jira đang được phân công cho bạn
              </p>
            </div>
          </div>
          <Link
            href={studentCoursePath("/student/sprint-progress", courseId)}
            prefetch={true}
            className={cn(buttonVariants({ size: "sm", variant: "ghost" }), "text-xs h-8 gap-1")}
          >
            <KanbanIcon className="size-3.5" />
            <span>Bảng Kanban</span>
            <ExternalLinkIcon className="size-3" />
          </Link>
        </CardHeader>

        <CardContent className="p-4 flex-1 space-y-2.5 overflow-y-auto max-h-[480px] custom-scrollbar pr-2">
          {tasks.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground space-y-2">
              <CheckCircle2Icon className="mx-auto size-7 text-emerald-500/70" />
              <p className="text-xs">Bạn chưa có nhiệm vụ nào được phân công trong Sprint này.</p>
            </div>
          ) : (
            tasks.map((task) => {
              const isDone = (task.status || "").toUpperCase() === "DONE";
              const isInProgress = (task.status || "").toUpperCase() === "IN_PROGRESS";
              const isBlocked = (task.status || "").toUpperCase() === "BLOCKED";
              const hasLinkedCommits =
                Array.isArray(task.linkedCommits) && task.linkedCommits.length > 0;
              const isExpanded = Boolean(expandedTaskIds[task.id]);

              return (
                <div
                  key={task.id}
                  className={cn(
                    "p-3 rounded-xl border transition-colors flex flex-col gap-2.5",
                    task.hasAnomaly
                      ? "bg-red-500/5 border-red-500/30"
                      : "bg-muted/20 border-border/60 hover:bg-muted/30"
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary">
                          {task.externalKey}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs uppercase font-bold",
                            isDone
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                              : isInProgress
                                ? "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30"
                                : isBlocked
                                  ? "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30"
                                  : "bg-muted text-muted-foreground border-border"
                          )}
                        >
                          {task.status}
                        </Badge>
                        {task.priority && (
                          <Badge variant="secondary" className="text-xs">
                            {task.priority}
                          </Badge>
                        )}
                        {typeof task.storyPoints === "number" && task.storyPoints > 0 && (
                          <Badge variant="outline" className="font-mono text-xs">
                            {task.storyPoints} SP
                          </Badge>
                        )}
                        {task.hasAnomaly && (
                          <Badge
                            variant="outline"
                            className="bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/40 text-xs gap-1 animate-pulse"
                          >
                            <AlertTriangleIcon className="size-3" />
                            0 Commit linked
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-foreground font-medium truncate" title={task.title}>
                        {task.title}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-xs text-muted-foreground self-end sm:self-center font-mono">
                      {task.dueDate && (
                        <div className="flex items-center gap-1 text-xs">
                          <CalendarIcon className="size-3" />
                          <span>{new Date(task.dueDate).toLocaleDateString("vi-VN")}</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => hasLinkedCommits && toggleTaskCommits(task.id)}
                        disabled={!hasLinkedCommits}
                        className={cn(
                          "flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-md transition-all",
                          hasLinkedCommits
                            ? "cursor-pointer hover:bg-primary/20 bg-primary/10 text-primary font-bold"
                            : task.linkedCommitCount > 0
                              ? "bg-primary/10 text-primary font-bold"
                              : "bg-muted text-muted-foreground cursor-default"
                        )}
                        title={
                          hasLinkedCommits
                            ? `Bấm để ${isExpanded ? "thu gọn" : "xem"} ${task.linkedCommits!.length} commit liên kết`
                            : `${task.linkedCommitCount} commit đã liên kết`
                        }
                      >
                        <GitCommitIcon className="size-3" />
                        <span>{task.linkedCommitCount}</span>
                        {typeof task.evidenceCommitCount === "number" &&
                          task.evidenceCommitCount > 0 && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                              ({task.evidenceCommitCount} MC)
                            </span>
                          )}
                        {hasLinkedCommits && (
                          <ChevronDownIcon
                            className={cn(
                              "size-3 transition-transform duration-200",
                              isExpanded && "rotate-180 text-primary"
                            )}
                          />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Danh sách linkedCommits khi mở rộng */}
                  {isExpanded && hasLinkedCommits && (
                    <div className="mt-1 pt-2 border-t border-border/50 space-y-1.5 animate-in fade-in-50 duration-150">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
                        <span className="font-semibold text-foreground/80">
                          Commits liên kết ({task.linkedCommits!.length}
                          {task.linkedCommitCount > task.linkedCommits!.length
                            ? ` / ${task.linkedCommitCount}`
                            : ""}
                          )
                        </span>
                        {task.linkedCommitCount > task.linkedCommits!.length && (
                          <span className="text-[10px] text-muted-foreground italic">
                            Tối đa 20 commit mới nhất
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
                        {task.linkedCommits!.map((commit) => (
                          <div
                            key={commit.id || commit.sha}
                            onClick={() => setSelectedCommit(commit)}
                            className="group p-2 rounded-lg border border-border/50 bg-background/80 hover:bg-muted/50 hover:border-primary/40 transition-all cursor-pointer flex items-center justify-between gap-2"
                            title="Bấm để xem chi tiết commit"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {commit.isMerge ? (
                                <GitMergeIcon className="size-3.5 text-purple-500 shrink-0" />
                              ) : (
                                <GitCommitIcon className="size-3.5 text-primary shrink-0" />
                              )}
                              <span className="font-mono text-xs font-semibold text-primary shrink-0">
                                {commit.sha.slice(0, 7)}
                              </span>
                              {commit.isMerge && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1 py-0 h-4 bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 shrink-0 font-bold"
                                >
                                  Merge
                                </Badge>
                              )}
                              <span className="text-xs text-foreground font-normal truncate group-hover:text-primary transition-colors">
                                {commit.message}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 text-[11px] text-muted-foreground font-mono">
                              {commit.repositoryFullName && (
                                <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-muted-foreground/80 max-w-[120px] truncate">
                                  <FolderGit2Icon className="size-2.5 shrink-0" />
                                  <span className="truncate">{commit.repositoryFullName}</span>
                                </span>
                              )}
                              <span>{formatCommitTime(commit.committedAt)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Modal xem chi tiết commit */}
      {selectedCommit && (
        <CommitDetailModal
          isOpen={Boolean(selectedCommit)}
          onClose={() => setSelectedCommit(null)}
          projectId={projectId}
          gitCommitId={selectedCommit.id}
          fallbackShortHash={selectedCommit.sha.slice(0, 7)}
          fallbackMessage={selectedCommit.message}
          fallbackCommit={{
            commitHash: selectedCommit.sha,
            commitMessage: selectedCommit.message,
            committedDate: selectedCommit.committedAt,
          }}
        />
      )}
    </>
  );
}
