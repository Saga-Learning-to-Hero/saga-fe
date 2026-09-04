"use client";

import {
  ShieldCheckIcon,
  AlertTriangleIcon,
  GitCommitIcon,
  XCircleIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MOCK_GRAPH_TASKS, MOCK_GRAPH_COMMITS, MOCK_GRAPH_STUDENTS } from "../data/mock-graph-data";

export function TraceabilityMatrixTable() {
  return (
    <Card className="rounded-3xl border border-border/80 shadow-xs bg-card overflow-hidden">
      <CardHeader className="p-5 border-b border-border/60 bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold">
                Traceability Matrix
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">Jira Task ➔ Git Commit</span>
            </div>
            <CardTitle className="text-base font-extrabold tracking-tight mt-1">
              Bảng Đối Soát Jira Task & Git Commit (Traceability Matrix)
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Bảng đối soát liên kết giữa các Task trên Jira và lịch sử Commit tương ứng trên GitHub.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground font-semibold">Độ tin cậy:</span>
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
              94.5% Verified
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 text-muted-foreground font-bold border-b border-border/60 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Task Jira</th>
                <th className="p-4">Người làm (Assignee)</th>
                <th className="p-4 text-center">Weight & SP</th>
                <th className="p-4">Git Commits liên kết</th>
                <th className="p-4 text-center">Thay đổi code (+ / -)</th>
                <th className="p-4 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {MOCK_GRAPH_TASKS.map((task) => {
                const linkedCommits = MOCK_GRAPH_COMMITS.filter((c) => c.linkedTaskKey === task.key);
                const student = MOCK_GRAPH_STUDENTS.find((s) => s.id === task.assigneeId);
                const totalAdditions = linkedCommits.reduce((acc, c) => acc + c.additions, 0);
                const totalDeletions = linkedCommits.reduce((acc, c) => acc + c.deletions, 0);

                return (
                  <tr key={task.id} className="hover:bg-muted/30 transition-colors">
                    {/* Task Info */}
                    <td className="p-4 align-top">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-primary">{task.key}</span>
                          <Badge variant="outline" className="text-[10px] py-0">
                            {task.taskType}
                          </Badge>
                        </div>
                        <p className="font-semibold text-foreground max-w-xs leading-snug line-clamp-2">
                          {task.summary}
                        </p>
                      </div>
                    </td>

                    {/* Assignee */}
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-7 w-7 border border-border">
                          <AvatarImage src={student?.avatar} alt={task.assigneeName} />
                          <AvatarFallback>{task.assigneeName.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-bold text-foreground block leading-tight">{task.assigneeName}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{student?.studentCode}</span>
                        </div>
                      </div>
                    </td>

                    {/* Weight & Story Points */}
                    <td className="p-4 align-top text-center">
                      <div className="space-y-0.5">
                        <span className="font-mono font-bold text-foreground block">{task.storyPoints} SP</span>
                        <Badge variant="secondary" className="text-[10px] py-0 font-medium">
                          {task.weightType}
                        </Badge>
                      </div>
                    </td>

                    {/* Linked Commits */}
                    <td className="p-4 align-top">
                      {linkedCommits.length > 0 ? (
                        <div className="space-y-1.5 max-w-sm">
                          {linkedCommits.map((c) => (
                            <div
                              key={c.id}
                              className="p-1.5 rounded-lg bg-muted/50 border border-border/50 flex items-center justify-between gap-2 font-mono text-[11px]"
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <GitCommitIcon className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                                <span className="font-bold text-purple-600 dark:text-purple-400">{c.shortHash}</span>
                                <span className="text-muted-foreground truncate">{c.message}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-1.5">
                          <XCircleIcon className="w-4 h-4 shrink-0" />
                          <span>Chưa có commit</span>
                        </div>
                      )}
                    </td>

                    {/* Code Diff */}
                    <td className="p-4 align-top text-center font-mono text-xs">
                      {linkedCommits.length > 0 ? (
                        <div className="space-y-0.5">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold block">+{totalAdditions}</span>
                          <span className="text-red-600 dark:text-red-400 font-bold block">-{totalDeletions}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* Audit Status */}
                    <td className="p-4 align-top text-right">
                      {task.isMSRAnomaly ? (
                        <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 gap-1 font-bold animate-pulse text-[11px]">
                          <AlertTriangleIcon className="w-3.5 h-3.5" />
                          Thiếu Commit
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 gap-1 font-bold text-[11px]">
                          <ShieldCheckIcon className="w-3.5 h-3.5" />
                          Đã xác thực (Verified)
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
