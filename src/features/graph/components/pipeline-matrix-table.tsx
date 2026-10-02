"use client";
import type React from 'react';

import { useState, useMemo } from "react";
import { AlertTriangleIcon, CheckSquareIcon, GitCommitIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isMissingCommit, isMissingDocument } from "../lib/pipeline-mapper";
import type { PipelineCommit, PipelineTask } from "../types/pipeline";
import type { PipelineHierarchy } from "../lib/pipeline-hierarchy";

interface PipelineMatrixTableProps {
  tasks: PipelineTask[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  hierarchy?: PipelineHierarchy;
  selectedCommits?: PipelineCommit[];
  isLoadingTaskCommits?: boolean;
}

function statusClass(status: string): string {
  const value = status.toUpperCase();
  if (value.includes("DONE") || value.includes("RESOLVED") || value.includes("CLOSED")) {
    return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  }
  if (value.includes("PROGRESS") || value.includes("REVIEW")) {
    return "bg-primary/15 text-primary";
  }
  if (value.includes("BLOCK")) {
    return "bg-destructive/15 text-destructive";
  }
  return "bg-muted text-muted-foreground";
}

export function PipelineMatrixTable({
  tasks,
  selectedTaskId,
  onSelectTask,
  hierarchy,
}: PipelineMatrixTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;

  const [prevTasksLength, setPrevTasksLength] = useState(tasks.length);
  if (tasks.length !== prevTasksLength) {
    setCurrentPage(1);
    setPrevTasksLength(tasks.length);
  }

  const { paginatedUnits, totalPages, taskSet } = useMemo(() => {
    const taskSet = new Set(tasks.map(t => t.id));

    // A task is a "display root" if it has no parent OR its parent is not in the filtered tasks list
    const displayRoots = tasks.filter(task => {
      if (!task.parent?.taskId) return true;
      return !taskSet.has(task.parent.taskId);
    });

    const total = Math.ceil(displayRoots.length / PAGE_SIZE);
    const start = (currentPage - 1) * PAGE_SIZE;
    const paginated = displayRoots.slice(start, start + PAGE_SIZE);

    return {
      displayUnits: displayRoots,
      paginatedUnits: paginated,
      totalPages: total,
      taskSet,
    };
  }, [tasks, currentPage]);

  return (
    <Card className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs">
      <CardHeader className="border-b border-border/60 bg-muted/20 p-5">
        <Badge className="w-fit border border-primary/20 bg-primary/10 text-xs font-bold text-primary">
          Bảng đối soát Task–Commit
        </Badge>
        <CardTitle className="mt-1 text-base font-extrabold tracking-tight">
          Đối soát Task và Commit liên kết
        </CardTitle>
        <CardDescription className="text-xs">
          Nhấp vào bất kỳ dòng nào để kiểm tra thông tin và danh sách Commit liên kết ở bảng Inspector.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {tasks.length === 0 ? (
          <p className="p-8 text-center text-xs text-muted-foreground">
            Chưa có Task phù hợp bộ lọc để đối soát.
          </p>
        ) : (
          <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 z-10 border-b border-border/80 bg-background/95 text-xs font-bold uppercase tracking-wider text-muted-foreground backdrop-blur-sm">
                <tr>
                  <th className="p-3.5 pl-4">Mã Task</th>
                  <th className="p-3.5">Tiêu đề</th>
                  <th className="p-3.5">Trạng thái</th>
                  <th className="p-3.5">Sprint</th>
                  <th className="p-3.5">Người làm</th>
                  <th className="p-3.5 pr-4 text-right">Commit liên kết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {paginatedUnits.map((rootTask) => {

                  const renderTaskRow = (task: PipelineTask, isChild: boolean, parentBreadcrumb?: string) => {
                    const selected = task.id === selectedTaskId;
                    const hasEvidence = (task.evidenceCount ?? 0) > 0 || task.hasEvidence === true;
                    const missingCommit = isMissingCommit(task);
                    const missingDoc = isMissingDocument(task);
                    const warning = missingCommit || missingDoc;

                    return (
                      <tr
                        key={task.id}
                        onClick={() => onSelectTask(task.id)}
                        className={`cursor-pointer transition-colors ${selected
                          ? "bg-primary/10 font-medium text-foreground hover:bg-primary/15"
                          : warning
                            ? "bg-destructive/5 hover:bg-destructive/10 text-destructive/90"
                            : hasEvidence && task.linkedCommitCount === 0
                              ? "bg-purple-500/5 hover:bg-purple-500/10"
                              : "hover:bg-muted/30"
                          }`}
                      >
                        <td className="p-3.5 pl-4 align-top w-[140px]">
                          <div className={`flex items-center gap-1.5 ${isChild ? "ml-4 relative" : ""}`}>
                            {isChild && <div className="absolute -left-3 top-1/2 -mt-px w-2 border-t border-dashed border-border/70" />}
                            <CheckSquareIcon className={`size-3.5 ${isChild ? "text-muted-foreground/70" : "text-emerald-500"}`} />
                            <span className="font-mono font-bold text-primary">{task.key}</span>
                          </div>
                          {parentBreadcrumb && !isChild && (
                            <div className="mt-1 text-[10px] text-muted-foreground font-mono truncate max-w-[120px]">
                              Thuộc: {parentBreadcrumb}
                            </div>
                          )}
                        </td>
                        <td className="p-3.5 align-top">
                          <p className="line-clamp-2 max-w-[320px] font-semibold text-foreground leading-snug">
                            {task.title}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <Badge variant="outline" className="px-1.5 py-0 text-[10px] uppercase text-muted-foreground">
                              {task.issueTypeName}
                            </Badge>
                            {task.issueTypeLevel && (
                              <Badge variant="outline" className="px-1.5 py-0 text-[10px] uppercase text-muted-foreground border-dashed">
                                {task.issueTypeLevel}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5 align-top w-[120px]">
                          <Badge className={`text-xs font-bold ${statusClass(task.status)}`}>{task.status}</Badge>
                        </td>
                        <td className="p-3.5 align-top text-muted-foreground min-w-[100px]">
                          <span className="line-clamp-2">{task.sprintName}</span>
                        </td>
                        <td className="p-3.5 align-top text-muted-foreground min-w-[120px]">
                          {task.assigneeDisplayName || "Chưa phân công"}
                        </td>
                        <td className="p-3.5 pr-4 align-top text-right w-[160px]">
                          <div className="flex flex-col items-end gap-1.5">
                            <span className="inline-flex items-center gap-1 font-mono font-bold">
                              <GitCommitIcon className="size-3.5 text-primary" />
                              {task.linkedCommitCount}
                            </span>
                            {warning && (
                              <span className="inline-flex items-center gap-1 font-semibold text-destructive text-[10px]">
                                <AlertTriangleIcon className="size-3" />
                                {missingCommit ? "Thiếu Commit" : "Thiếu tài liệu"}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  };

                  const elements: React.ReactNode[] = [];

                  const parentBreadcrumb = (rootTask.parent?.taskId && !taskSet.has(rootTask.parent.taskId))
                    ? (rootTask.parent.externalKey || rootTask.parent.externalId || undefined)
                    : undefined;

                  elements.push(renderTaskRow(rootTask, false, parentBreadcrumb));

                  const getDescendants = (nodeId: string): PipelineTask[] => {
                    const result: PipelineTask[] = [];
                    const children = hierarchy?.childrenMap.get(nodeId) || [];
                    for (const c of children) {
                      if (taskSet.has(c.id)) {
                        result.push(c);
                        result.push(...getDescendants(c.id));
                      } else {
                        result.push(...getDescendants(c.id));
                      }
                    }
                    return result;
                  };

                  const descendants = getDescendants(rootTask.id);
                  if (descendants.length > 0) {
                    descendants.forEach(desc => {
                      elements.push(renderTaskRow(desc, true));
                    });
                  }

                  return elements;
                })}
              </tbody>
            </table>
          </div>
        )}

        {tasks.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border/50 p-4 bg-muted/10">
            <span className="text-xs text-muted-foreground font-medium">
              Hiển thị {((currentPage - 1) * PAGE_SIZE) + 1} - {Math.min(currentPage * PAGE_SIZE, tasks.length)} trong tổng số {tasks.length} task
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-7 w-7 p-0 rounded-lg cursor-pointer disabled:opacity-50"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <span className="text-xs font-bold px-3 text-foreground min-w-[80px] text-center">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-7 w-7 p-0 rounded-lg cursor-pointer disabled:opacity-50"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
