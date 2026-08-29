"use client";

import {
  XIcon,
  UserIcon,
  CheckSquareIcon,
  GitCommitIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  ShieldCheckIcon,
  GitBranchIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { GraphNodeData, StudentNodeData, TaskNodeData, CommitNodeData } from "../types/graph";

interface GraphNodeDetailsModalProps {
  nodeData: GraphNodeData | null;
  onClose: () => void;
}

export function GraphNodeDetailsModal({ nodeData, onClose }: GraphNodeDetailsModalProps) {
  if (!nodeData) return null;

  const isStudent = "studentCode" in nodeData;
  const isTask = "taskType" in nodeData;
  const isCommit = "hash" in nodeData;

  const student = isStudent ? (nodeData as StudentNodeData) : null;
  const task = isTask ? (nodeData as TaskNodeData) : null;
  const commit = isCommit ? (nodeData as CommitNodeData) : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-0 duration-200">
      <div className="bg-card border border-border/80 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* ── Modal Header ── */}
        <div className="p-5 border-b border-border/60 flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs ${isStudent ? "bg-blue-600" : isTask ? "bg-emerald-600" : "bg-purple-600"
                }`}
            >
              {isStudent && <UserIcon className="w-5 h-5" />}
              {isTask && <CheckSquareIcon className="w-5 h-5" />}
              {isCommit && <GitCommitIcon className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {isStudent ? "Node: Sinh viên (:Student)" : isTask ? "Node: Jira Task (:JiraTask)" : "Node: Git Commit (:Commit)"}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-foreground truncate max-w-xs">
                {isStudent && student?.name}
                {isTask && `${task?.key} - ${task?.summary}`}
                {isCommit && `Commit ${commit?.shortHash}`}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* ── Modal Body ── */}
        <div className="p-6 space-y-4">
          {/* 1. STUDENT DETAIL */}
          {student && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-muted/40 border border-border/60">
                <Avatar className="h-12 w-12 border border-border">
                  <AvatarImage src={student.avatar} alt={student.name} />
                  <AvatarFallback>{student.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-sm font-bold">{student.name}</h4>
                  <p className="text-xs text-muted-foreground font-mono">
                    Mã SV: <strong className="text-foreground">{student.studentCode}</strong> · Vai trò: <Badge variant="outline" className="text-[10px] py-0">{student.role}</Badge>
                  </p>
                </div>
              </div>

              {/* KPI Score Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Commits</span>
                  <span className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">{student.commitsCount}</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Tasks</span>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{student.tasksCount}</span>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Trace Score</span>
                  <span className="text-xl font-black text-purple-600 dark:text-purple-400 font-mono">{student.traceabilityScore}%</span>
                </div>
              </div>

              {student.isGhosting && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-medium flex items-start gap-2.5">
                  <AlertTriangleIcon className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <strong>Cảnh báo Ghosting (Ít tương tác):</strong> Thành viên này có số lượng commit và review thấp hơn ngưỡng chuẩn của Sprint.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. JIRA TASK DETAIL */}
          {task && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-primary">{task.key}</span>
                  <Badge className={task.status === "DONE" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : "bg-blue-500/10 text-blue-600"}>
                    {task.status}
                  </Badge>
                </div>
                <h4 className="text-sm font-bold text-foreground leading-snug">{task.summary}</h4>
                <div className="text-xs text-muted-foreground flex flex-wrap gap-3 pt-2 border-t border-border/40">
                  <span>Story Points: <strong className="text-foreground font-mono">{task.storyPoints}</strong></span>
                  <span>Trọng số: <strong className="text-foreground font-mono">{task.weightType}</strong></span>
                  <span>Phân công: <strong className="text-foreground">{task.assigneeName}</strong></span>
                </div>
              </div>

              {/* MSR Anomaly Alert */}
              {task.isMSRAnomaly ? (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 text-xs space-y-1.5 animate-pulse">
                  <div className="flex items-center gap-2 font-bold text-sm text-red-600 dark:text-red-300">
                    <AlertTriangleIcon className="w-4 h-4" />
                    Cảnh báo Bất thường MSR (Phát hiện bởi AI Graph)
                  </div>
                  <p>
                    Task này đã đánh dấu <strong>DONE</strong> trên Jira nhưng hệ thống đồ thị Neo4j không tìm thấy bất kỳ commit mã nguồn GitHub nào thực thi (0 commit linked). Cần đối soát lại báo cáo công việc!
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                  <ShieldCheckIcon className="w-4 h-4 shrink-0" />
                  <span>Task đã được đối soát thành công với <strong>{task.commitCount} Git Commits</strong>.</span>
                </div>
              )}
            </div>
          )}

          {/* 3. COMMIT DETAIL */}
          {commit && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
                    {commit.shortHash}
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono gap-1 text-emerald-600 border-emerald-500/30">
                    <CheckCircle2Icon className="w-3 h-3 text-emerald-500" />
                    Verified Regex
                  </Badge>
                </div>
                <p className="text-xs font-semibold text-foreground font-mono">{commit.message}</p>
                <div className="text-xs text-muted-foreground flex flex-wrap items-center justify-between pt-2 border-t border-border/40 font-mono">
                  <span>Tác giả: <strong className="text-foreground">{commit.authorName}</strong></span>
                  <span>+{commit.additions} / -{commit.deletions} lines</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <GitBranchIcon className="w-3.5 h-3.5" />
                  Nhánh: <strong className="font-mono">{commit.branch}</strong>
                </span>
                <span>Thời gian: {commit.timestamp}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Modal Footer ── */}
        <div className="p-4 border-t border-border/60 flex items-center justify-end bg-muted/20">
          <Button onClick={onClose} size="sm" className="h-9 text-xs rounded-xl px-5 cursor-pointer">
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}
