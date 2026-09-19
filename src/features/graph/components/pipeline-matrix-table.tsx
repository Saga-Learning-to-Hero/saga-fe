"use client";

import { AlertTriangleIcon, CheckSquareIcon, GitCommitIcon, PaperclipIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isDoneWithoutLinkedCommit, isDocumentOrResearchTask } from "../lib/pipeline-mapper";
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
  return (
    <Card className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xs">
      <CardHeader className="border-b border-border/60 bg-muted/20 p-5">
        <Badge className="w-fit border border-primary/20 bg-primary/10 text-[10px] font-bold text-primary">
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
              <thead className="sticky top-0 z-10 border-b border-border/80 bg-background/95 text-[10px] font-bold uppercase tracking-wider text-muted-foreground backdrop-blur-md">
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
                {tasks.map((task) => {
                  const selected = task.id === selectedTaskId;
                  const isDoc = isDocumentOrResearchTask(task);
                  const hasEvidence = (task.evidenceCount ?? 0) > 0 || task.hasEvidence === true;
                  const warning = isDoneWithoutLinkedCommit(task);
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
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Badge className={`text-[10px] font-bold ${statusClass(task.status)}`}>
                            {task.status}
                          </Badge>
                          {hasEvidence && task.linkedCommitCount === 0 ? (
                            <Badge
                              variant="outline"
                              className="border-purple-500/40 bg-purple-500/10 text-[10px] font-bold text-purple-600 dark:text-purple-400"
                            >
                              <PaperclipIcon className="mr-1 size-3" />
                              Đã có minh chứng
                            </Badge>
                          ) : warning ? (
                            <Badge
                              variant="outline"
                              className={isDoc
                                ? "border-amber-500/40 bg-amber-500/10 text-[10px] font-bold text-amber-600 dark:text-amber-400"
                                : "border-destructive/40 bg-destructive/10 text-[10px] font-bold text-destructive"
                              }
                            >
                              <AlertTriangleIcon className="mr-1 size-3" />
                              {isDoc ? "Cần minh chứng" : "Thiếu Commit"}
                            </Badge>
                          ) : null}
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
                            className="border-purple-500/40 bg-purple-500/10 text-[10px] font-bold text-purple-600 dark:text-purple-400"
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
      </CardContent>
    </Card>
  );
}
