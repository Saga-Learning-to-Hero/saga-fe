"use client";

import { ChevronDownIcon, ChevronRightIcon, GitCommitIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isDoneWithoutLinkedCommit } from "../lib/pipeline-mapper";
import type { PipelineCommit, PipelineTask } from "../types/pipeline";

interface PipelineMatrixTableProps {
  tasks: PipelineTask[];
  selectedTaskId: string | null;
  selectedCommits: PipelineCommit[];
  isLoadingTaskCommits: boolean;
  onSelectTask: (taskId: string) => void;
}

export function PipelineMatrixTable({
  tasks,
  selectedTaskId,
  selectedCommits,
  isLoadingTaskCommits,
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
          Mở một dòng để chọn Task và tải Commit liên kết. Chỉ một Task được mở tại một thời điểm.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {tasks.length === 0 ? (
          <p className="p-6 text-center text-xs text-muted-foreground">
            Chưa có Task để đối soát.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/60 bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-4">Task</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4">Sprint</th>
                  <th className="p-4">Người làm</th>
                  <th className="p-4 text-right">Commit liên kết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {tasks.map((task) => {
                  const open = task.id === selectedTaskId;
                  const warning = isDoneWithoutLinkedCommit(task);
                  return (
                    <tr key={task.id} className={open ? "bg-primary/5" : "hover:bg-muted/30"}>
                      <td colSpan={5} className="p-0">
                        <button
                          type="button"
                          onClick={() => onSelectTask(task.id)}
                          className="grid w-full grid-cols-1 items-start gap-2 p-4 text-left md:grid-cols-5"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              {open ? (
                                <ChevronDownIcon className="size-3.5 text-primary" />
                              ) : (
                                <ChevronRightIcon className="size-3.5 text-muted-foreground" />
                              )}
                              <span className="font-mono font-bold text-primary">{task.key}</span>
                            </div>
                            <p className="mt-1 line-clamp-2 font-semibold text-foreground">{task.title}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{task.status}</Badge>
                            {warning ? (
                              <span className="text-[11px] font-semibold text-destructive">
                                Thiếu Commit
                              </span>
                            ) : null}
                          </div>
                          <p className="text-muted-foreground">{task.sprintName}</p>
                          <p>{task.assigneeDisplayName || "Chưa phân công"}</p>
                          <p className="flex items-center justify-start gap-1 font-mono md:justify-end">
                            <GitCommitIcon className="size-3" />
                            {task.linkedCommitCount}
                          </p>
                        </button>
                        {open ? (
                          <div className="border-t border-border/50 bg-muted/20 px-4 py-3">
                            {isLoadingTaskCommits ? (
                              <div className="h-12 animate-pulse rounded-xl bg-muted" />
                            ) : selectedCommits.length === 0 ? (
                              <p className="text-xs text-muted-foreground">
                                Task này chưa có Commit liên kết.
                              </p>
                            ) : (
                              <ul className="space-y-1.5">
                                {selectedCommits.map((commit) => (
                                  <li key={commit.id} className="text-xs">
                                    <span className="font-mono font-bold text-primary">
                                      {commit.shortHash}
                                    </span>
                                    <span className="mx-1.5 text-muted-foreground">·</span>
                                    <span className="text-foreground">{commit.message}</span>
                                    <span className="mx-1.5 text-muted-foreground">·</span>
                                    <span className="text-muted-foreground">{commit.authorLabel}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ) : null}
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
