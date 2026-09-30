"use client";

import { useState, useMemo } from "react";
import { AlertTriangleIcon, CheckSquareIcon, GitCommitIcon, PaperclipIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isMissingCommit, isMissingDocument } from "../lib/pipeline-mapper";
import type { PipelineCommit, PipelineTask } from "../types/pipeline";

interface PipelineMatrixTableProps {
  tasks: PipelineTask[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
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
}: PipelineMatrixTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;

  const [prevTasksLength, setPrevTasksLength] = useState(tasks.length);
  if (tasks.length !== prevTasksLength) {
    setCurrentPage(1);
    setPrevTasksLength(tasks.length);
  }

  const { paginatedTasks, totalPages } = useMemo(() => {
    const total = Math.ceil(tasks.length / PAGE_SIZE);
    const start = (currentPage - 1) * PAGE_SIZE;
    return {
      paginatedTasks: tasks.slice(start, start + PAGE_SIZE),
      totalPages: total,
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
                {paginatedTasks.map((task) => {
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
                        : "hover:bg-muted/30"
                        }`}
                    >
                      <td className="p-3.5 pl-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <CheckSquareIcon className="size-3.5 text-emerald-500 shrink-0" />
                          <span className="font-mono font-black text-primary">{task.key}</span>
                        </div>
                      </td>
                      <td className="p-3.5 max-w-xs">
                        <p className="line-clamp-2 font-semibold text-foreground">{task.title}</p>
                      </td>
                      <td className="p-3.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge className={`text-xs font-bold ${statusClass(task.status)}`}>
                            {task.status}
                          </Badge>

                          {task.evidenceCheck?.status === "MISSING_COMMIT" && (
                            <Badge
                              variant="outline"
                              className="border-destructive/40 bg-destructive/10 text-xs font-bold text-destructive"
                            >
                              <AlertTriangleIcon className="mr-1 size-3" />
                              Thiếu Commit
                            </Badge>
                          )}
                          {task.evidenceCheck?.status === "MISSING_DOCUMENT" && (
                            <Badge
                              variant="outline"
                              className="border-amber-500/40 bg-amber-500/10 text-xs font-bold text-amber-600 dark:text-amber-400"
                            >
                              <AlertTriangleIcon className="mr-1 size-3" />
                              Thiếu tài liệu
                            </Badge>
                          )}
                          {task.evidenceCheck?.status === "MISSING_COMMIT_AND_DOCUMENT" && (
                            <Badge
                              variant="outline"
                              className="border-destructive/40 bg-destructive/10 text-xs font-bold text-destructive"
                            >
                              <AlertTriangleIcon className="mr-1 size-3" />
                              Thiếu Commit và tài liệu
                            </Badge>
                          )}
                          {task.evidenceCheck?.status === "UNLABELED" && (
                            <Badge
                              variant="outline"
                              className="border-muted-foreground/40 bg-muted/10 text-xs font-bold text-muted-foreground"
                            >
                              <AlertTriangleIcon className="mr-1 size-3" />
                              Chưa gắn nhãn SAGA
                            </Badge>
                          )}
                          {(task.evidenceCheck?.status === "SATISFIED" || task.evidenceCheck?.status === "NOT_DONE" || (!task.evidenceCheck && hasEvidence)) && (
                            hasEvidence ? (
                              <Badge
                                variant="outline"
                                className="border-purple-500/40 bg-purple-500/10 text-xs font-bold text-purple-600 dark:text-purple-400"
                              >
                                <PaperclipIcon className="mr-1 size-3" />
                                Đã có minh chứng
                              </Badge>
                            ) : null
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-muted-foreground whitespace-nowrap">
                        {task.sprintName || "Chưa vào Sprint"}
                      </td>
                      <td className="p-3.5 text-foreground whitespace-nowrap">
                        {task.assigneeDisplayName || "Chưa phân công"}
                      </td>
                      <td className="p-3.5 pr-4 text-right whitespace-nowrap">
                        {task.linkedCommitCount > 0 ? (
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-foreground">
                            <GitCommitIcon className="size-3 text-primary" />
                            {task.linkedCommitCount}
                          </span>
                        ) : hasEvidence ? (
                          <Badge
                            variant="outline"
                            className="border-purple-500/40 bg-purple-500/10 text-xs font-bold text-purple-600 dark:text-purple-400"
                          >
                            <PaperclipIcon className="mr-1 size-3" />
                            {task.evidenceCount ? `${task.evidenceCount} tệp` : "Đã có minh chứng"}
                          </Badge>
                        ) : (
                          <span className={`inline-flex items-center gap-1 font-mono font-bold ${warning ? "text-destructive" : "text-muted-foreground"}`}>
                            <GitCommitIcon className="size-3 text-muted-foreground" />
                            0
                          </span>
                        )}
                      </td>
                    </tr>
                  );
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
