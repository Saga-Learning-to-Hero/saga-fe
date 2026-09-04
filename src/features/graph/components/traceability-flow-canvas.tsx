"use client";

import { useState, useMemo } from "react";
import {
  UserIcon,
  CheckSquareIcon,
  GitCommitIcon,
  ArrowRightIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  ShieldAlertIcon,
  SparklesIcon,
  Rows3Icon,
  Columns3Icon,
  InfoIcon,
  GitBranchIcon,
  FileCode2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronsUpDownIcon,
  ChevronsDownUpIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  GraphNode,
  GraphEdge,
  GraphNodeData,
  StudentNodeData,
  TaskNodeData,
  CommitNodeData,
} from "../types/graph";

interface TraceabilityFlowCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onSelectNode: (node: GraphNodeData) => void;
  highlightMSRAnomaly?: boolean;
}

export function TraceabilityFlowCanvas({
  nodes,
  edges,
  onSelectNode,
  highlightMSRAnomaly = true,
}: TraceabilityFlowCanvasProps) {
  const [viewStyle, setViewStyle] = useState<"SWIMLANES" | "COLUMNS">("SWIMLANES");
  const [collapsedStudentIds, setCollapsedStudentIds] = useState<Set<string>>(new Set());
  const [expandedTasksMap, setExpandedTasksMap] = useState<Record<string, boolean>>({});
  const [hoveredStudentId, setHoveredStudentId] = useState<string | null>(null);
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const [hoveredCommitId, setHoveredCommitId] = useState<string | null>(null);

  const studentNodes = useMemo(
    () => nodes.filter((n) => n.type === "STUDENT").map((n) => n.data as StudentNodeData),
    [nodes]
  );

  const taskNodes = useMemo(
    () => nodes.filter((n) => n.type === "TASK").map((n) => n.data as TaskNodeData),
    [nodes]
  );

  const commitNodes = useMemo(
    () => nodes.filter((n) => n.type === "COMMIT").map((n) => n.data as CommitNodeData),
    [nodes]
  );

  const taskToCommitsMap = useMemo(() => {
    const map: Record<string, CommitNodeData[]> = {};
    taskNodes.forEach((t) => {
      map[t.id] = [];
    });

    edges
      .filter((e) => e.type === "IMPLEMENTS")
      .forEach((e) => {
        const commit = commitNodes.find((c) => c.id === e.source);
        if (commit && map[e.target]) {
          if (!map[e.target].some((c) => c.id === commit.id)) {
            map[e.target].push(commit);
          }
        }
      });

    commitNodes.forEach((c) => {
      if (c.linkedTaskKey) {
        const matchedTask = taskNodes.find((t) => t.key === c.linkedTaskKey);
        if (matchedTask && map[matchedTask.id]) {
          if (!map[matchedTask.id].some((existing) => existing.id === c.id)) {
            map[matchedTask.id].push(c);
          }
        }
      }
    });

    return map;
  }, [taskNodes, commitNodes, edges]);

  const studentToTasksMap = useMemo(() => {
    const map: Record<string, TaskNodeData[]> = {};
    studentNodes.forEach((s) => {
      map[s.id] = [];
    });

    taskNodes.forEach((t) => {
      if (t.assigneeId && map[t.assigneeId]) {
        map[t.assigneeId].push(t);
      }
    });

    return map;
  }, [studentNodes, taskNodes]);

  const activeHighlightedElements = useMemo(() => {
    const students = new Set<string>();
    const tasks = new Set<string>();
    const commits = new Set<string>();

    if (hoveredStudentId) {
      students.add(hoveredStudentId);
      const studentTasks = studentToTasksMap[hoveredStudentId] || [];
      studentTasks.forEach((t) => {
        tasks.add(t.id);
        const taskCommits = taskToCommitsMap[t.id] || [];
        taskCommits.forEach((c) => commits.add(c.id));
      });
    } else if (hoveredTaskId) {
      tasks.add(hoveredTaskId);
      const task = taskNodes.find((t) => t.id === hoveredTaskId);
      if (task?.assigneeId) students.add(task.assigneeId);
      const taskCommits = taskToCommitsMap[hoveredTaskId] || [];
      taskCommits.forEach((c) => commits.add(c.id));
    } else if (hoveredCommitId) {
      commits.add(hoveredCommitId);
      const commit = commitNodes.find((c) => c.id === hoveredCommitId);
      if (commit?.authorId) students.add(commit.authorId);
      if (commit?.linkedTaskKey) {
        const task = taskNodes.find((t) => t.key === commit.linkedTaskKey);
        if (task) {
          tasks.add(task.id);
          if (task.assigneeId) students.add(task.assigneeId);
        }
      }
    }

    return {
      hasActive: Boolean(hoveredStudentId || hoveredTaskId || hoveredCommitId),
      students,
      tasks,
      commits,
    };
  }, [
    hoveredStudentId,
    hoveredTaskId,
    hoveredCommitId,
    taskNodes,
    commitNodes,
    studentToTasksMap,
    taskToCommitsMap,
  ]);

  const toggleStudentCollapse = (studentId: string) => {
    setCollapsedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  const allCollapsed =
    studentNodes.length > 0 && studentNodes.every((s) => collapsedStudentIds.has(s.id));

  const toggleAllCollapse = () => {
    if (allCollapsed) {
      setCollapsedStudentIds(new Set());
    } else {
      setCollapsedStudentIds(new Set(studentNodes.map((s) => s.id)));
    }
  };

  const toggleTaskExpansion = (studentId: string) => {
    setExpandedTasksMap((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border border-border/80 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <SparklesIcon className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-foreground block">
              Luồng liên kết Traceability (Traceability Flow)
            </span>
            <span className="text-[11px] text-muted-foreground">
              Quy trình liên kết: Thành viên ➔ Jira Tasks ➔ GitHub Commits
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {viewStyle === "SWIMLANES" && studentNodes.length > 1 && (
            <button
              onClick={toggleAllCollapse}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer border border-border/60"
            >
              {allCollapsed ? (
                <>
                  <ChevronsUpDownIcon className="w-3.5 h-3.5 text-primary" />
                  <span>Mở rộng tất cả</span>
                </>
              ) : (
                <>
                  <ChevronsDownUpIcon className="w-3.5 h-3.5 text-primary" />
                  <span>Thu gọn tất cả</span>
                </>
              )}
            </button>
          )}

          <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-xl border border-border/60 text-xs">
            <button
              onClick={() => setViewStyle("SWIMLANES")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${viewStyle === "SWIMLANES"
                ? "bg-card text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Rows3Icon className="w-3.5 h-3.5 text-blue-500" />
              <span>Swimlanes</span>
            </button>
            <button
              onClick={() => setViewStyle("COLUMNS")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${viewStyle === "COLUMNS"
                ? "bg-card text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Columns3Icon className="w-3.5 h-3.5 text-purple-500" />
              <span>3-Column Flow</span>
            </button>
          </div>
        </div>
      </div>

      {viewStyle === "SWIMLANES" ? (
        <div className="space-y-4">
          {studentNodes.map((student) => {
            const rawTasks = studentToTasksMap[student.id] || [];
            const sortedTasks = [...rawTasks].sort((a, b) => {
              if (a.isMSRAnomaly && !b.isMSRAnomaly) return -1;
              if (!a.isMSRAnomaly && b.isMSRAnomaly) return 1;
              return 0;
            });

            const hasAnomaly = sortedTasks.some((t) => t.isMSRAnomaly);
            const isCollapsed = collapsedStudentIds.has(student.id);
            const isTasksExpanded = expandedTasksMap[student.id] || false;
            const visibleTasks = isTasksExpanded ? sortedTasks : sortedTasks.slice(0, 3);
            const remainingCount = sortedTasks.length - 3;

            return (
              <div
                key={student.id}
                className={`rounded-3xl border transition-all duration-200 overflow-hidden bg-card/90 backdrop-blur-xs shadow-xs ${hasAnomaly && highlightMSRAnomaly
                  ? "border-red-500/40 hover:border-red-500/70"
                  : "border-border/80 hover:border-primary/40"
                  }`}
              >
                <div
                  onClick={() => toggleStudentCollapse(student.id)}
                  className="p-4 sm:p-5 border-b border-border/60 bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <Avatar className="h-11 w-11 border-2 border-primary/20 shadow-2xs">
                      <AvatarImage src={student.avatar} alt={student.name} />
                      <AvatarFallback>{student.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-foreground">{student.name}</span>
                        <Badge
                          variant="outline"
                          className="text-[10px] font-mono py-0 px-2 font-bold"
                        >
                          {student.studentCode}
                        </Badge>
                        <Badge
                          className={
                            student.role === "LEADER"
                              ? "bg-primary/15 text-primary border-primary/30 text-[10px] font-bold"
                              : "bg-muted text-muted-foreground text-[10px]"
                          }
                        >
                          {student.role}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5 font-medium">
                        <span>Phân công: <strong className="text-foreground">{sortedTasks.length} tasks</strong></span>
                        <span>·</span>
                        <span>Commits: <strong className="text-foreground font-mono">{student.commitsCount}</strong></span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-start md:self-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="px-3 py-1.5 rounded-xl bg-card border border-border/80 text-right shadow-2xs">
                      <span className="text-[10px] text-muted-foreground font-semibold block uppercase tracking-wider">
                        Traceability Score
                      </span>
                      <span className="text-xs font-black font-mono text-primary">
                        {student.traceabilityScore}%
                      </span>
                    </div>

                    {hasAnomaly && highlightMSRAnomaly && (
                      <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 font-extrabold text-xs gap-1.5 animate-pulse">
                        <ShieldAlertIcon className="w-3.5 h-3.5 text-red-500" />
                        <span>Có Task thiếu Commit</span>
                      </Badge>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectNode(student)}
                      className="h-8.5 rounded-xl text-xs font-bold gap-1.5 cursor-pointer hover:bg-primary/10 hover:text-primary"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-primary" />
                      <span className="hidden sm:inline">Hồ sơ</span>
                    </Button>

                    <button
                      onClick={() => toggleStudentCollapse(student.id)}
                      className="w-8.5 h-8.5 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card border border-border/60 transition-all cursor-pointer"
                      title={isCollapsed ? "Mở rộng" : "Thu gọn"}
                    >
                      {isCollapsed ? (
                        <ChevronDownIcon className="w-4 h-4 text-primary" />
                      ) : (
                        <ChevronUpIcon className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="p-4 sm:p-5 space-y-3 animate-in fade-in-0 duration-200">
                    {sortedTasks.length === 0 ? (
                      <div className="p-6 text-center rounded-2xl bg-muted/20 border border-dashed border-border/80 text-xs text-muted-foreground">
                        Chưa có task Jira nào được phân công cho thành viên này trong bộ lọc.
                      </div>
                    ) : (
                      <>
                        {visibleTasks.map((task) => {
                          const linkedCommits = taskToCommitsMap[task.id] || [];
                          const isTaskAnomaly = Boolean(task.isMSRAnomaly && highlightMSRAnomaly);

                          return (
                            <div
                              key={task.id}
                              className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${isTaskAnomaly
                                ? "bg-red-500/5 border-red-500/30"
                                : "bg-muted/15 border-border/60 hover:bg-muted/30"
                                }`}
                            >
                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-center">
                                <div className="lg:col-span-5 space-y-2">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => onSelectNode(task)}
                                        className="font-mono text-xs font-black text-primary hover:underline cursor-pointer flex items-center gap-1.5"
                                      >
                                        <CheckSquareIcon className="w-3.5 h-3.5 text-emerald-500" />
                                        <span>{task.key}</span>
                                      </button>
                                      <Badge
                                        variant="outline"
                                        className="text-[10px] font-mono px-1.5 py-0 uppercase font-semibold"
                                      >
                                        {task.taskType}
                                      </Badge>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                      <Badge
                                        className={
                                          task.status === "DONE"
                                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold"
                                            : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-[10px] font-bold"
                                        }
                                      >
                                        {task.status}
                                      </Badge>
                                      <span className="text-[11px] font-mono font-bold text-muted-foreground px-1.5 py-0.5 rounded-md bg-card border border-border/60">
                                        {task.storyPoints} SP
                                      </span>
                                    </div>
                                  </div>

                                  <p
                                    onClick={() => onSelectNode(task)}
                                    className="text-xs font-bold text-foreground leading-snug cursor-pointer hover:text-primary transition-colors"
                                  >
                                    {task.summary}
                                  </p>

                                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                    <span>Trọng số: <strong className="text-foreground font-mono">{task.weightType}</strong></span>
                                    <span>·</span>
                                    <span>Sprint: <strong className="text-foreground font-mono">{task.sprintId}</strong></span>
                                  </div>
                                </div>

                                <div className="hidden lg:flex lg:col-span-1 items-center justify-center text-muted-foreground/60">
                                  <div className="flex flex-col items-center gap-1">
                                    <ArrowRightIcon className="w-4 h-4 text-primary" />
                                    <span className="text-[9px] font-mono font-bold uppercase text-muted-foreground">
                                      Liên kết
                                    </span>
                                  </div>
                                </div>

                                <div className="lg:col-span-6 space-y-2">
                                  {isTaskAnomaly ? (
                                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-700 dark:text-red-400 flex items-start gap-2.5">
                                      <AlertTriangleIcon className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                      <div className="space-y-0.5">
                                        <span className="font-black block text-[11px] uppercase tracking-wide text-red-600 dark:text-red-300">
                                          Cảnh báo: Task DONE nhưng chưa có Commit!
                                        </span>
                                        <p className="text-[11px] leading-relaxed">
                                          Task này đã xong (DONE) trên Jira nhưng chưa tìm thấy commit nào gắn mã <strong>{task.key}</strong> trên GitHub.
                                        </p>
                                      </div>
                                    </div>
                                  ) : linkedCommits.length === 0 ? (
                                    <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-xs text-muted-foreground flex items-center gap-2">
                                      <InfoIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                      <span>Task đang làm, chưa có commit liên kết.</span>
                                    </div>
                                  ) : (
                                    <div className="space-y-1.5">
                                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                        <span className="font-bold flex items-center gap-1">
                                          <GitCommitIcon className="w-3.5 h-3.5 text-purple-500" />
                                          {linkedCommits.length} Git Commits liên kết:
                                        </span>
                                      </div>

                                      <div className="space-y-1.5">
                                        {linkedCommits.map((commit) => (
                                          <div
                                            key={commit.id}
                                            onClick={() => onSelectNode(commit)}
                                            className="p-2.5 rounded-xl bg-card border border-border/80 hover:border-purple-500/50 transition-all cursor-pointer text-xs space-y-1 group"
                                          >
                                            <div className="flex items-center justify-between gap-2">
                                              <div className="flex items-center gap-2">
                                                <span className="font-mono text-[11px] font-bold text-purple-600 dark:text-purple-400 group-hover:underline">
                                                  {commit.shortHash}
                                                </span>
                                                <Badge
                                                  variant="outline"
                                                  className="text-[9px] font-mono py-0 px-1 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-0.5"
                                                >
                                                  <CheckCircle2Icon className="w-2.5 h-2.5 text-emerald-500" />
                                                  Verified
                                                </Badge>
                                              </div>
                                              <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                                                <GitBranchIcon className="w-3 h-3 text-muted-foreground" />
                                                {commit.branch}
                                              </span>
                                            </div>

                                            <p className="text-[11px] font-mono text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                              {commit.message}
                                            </p>

                                            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono pt-1 border-t border-border/40">
                                              <span>Tác giả: <strong className="text-foreground">{commit.authorName}</strong></span>
                                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                                +{commit.additions} <span className="text-red-500 font-normal">-{commit.deletions}</span> lines
                                              </span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {remainingCount > 0 && (
                          <button
                            onClick={() => toggleTaskExpansion(student.id)}
                            className="w-full py-2.5 px-4 rounded-2xl bg-muted/30 hover:bg-muted/70 border border-border/60 hover:border-primary/40 font-bold text-xs text-primary flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                          >
                            {isTasksExpanded ? (
                              <>
                                <ChevronUpIcon className="w-3.5 h-3.5" />
                                <span>Thu gọn danh sách task của {student.name}</span>
                              </>
                            ) : (
                              <>
                                <ChevronDownIcon className="w-3.5 h-3.5" />
                                <span>Xem thêm {remainingCount} task khác của {student.name}...</span>
                              </>
                            )}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="p-3.5 rounded-3xl bg-muted/20 border border-border/70 flex flex-col space-y-3.5">
            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-black text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                  1. Thành Viên
                </span>
              </div>
              <Badge variant="outline" className="font-mono text-[10px] font-bold">
                {studentNodes.length} Nodes
              </Badge>
            </div>

            <div className="flex flex-col gap-3 max-h-[620px] overflow-y-auto p-1 pr-2.5">
              {studentNodes.map((s) => {
                const isHovered = hoveredStudentId === s.id;
                const isDimmed =
                  activeHighlightedElements.hasActive &&
                  !activeHighlightedElements.students.has(s.id);

                return (
                  <div
                    key={s.id}
                    onMouseEnter={() => setHoveredStudentId(s.id)}
                    onMouseLeave={() => setHoveredStudentId(null)}
                    onClick={() => onSelectNode(s)}
                    className={`relative w-full p-3.5 rounded-2xl border transition-all cursor-pointer ${isHovered
                      ? "z-10 bg-blue-500/10 border-blue-500 ring-2 ring-blue-500/40 shadow-md"
                      : "z-0 bg-card border-border/80 hover:border-blue-400"
                      } ${isDimmed ? "opacity-30" : "opacity-100"}`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-border shadow-2xs shrink-0">
                        <AvatarImage src={s.avatar} alt={s.name} />
                        <AvatarFallback>{s.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-extrabold text-xs text-foreground truncate">{s.name}</span>
                          <span className="text-[10px] font-mono text-muted-foreground">{s.studentCode}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1 font-mono">
                          <span>{s.commitsCount} Commits</span>
                          <span className="font-bold text-primary">{s.traceabilityScore}% Traceability</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 rounded-3xl bg-muted/20 border border-border/70 flex flex-col space-y-3.5">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquareIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                  2. Jira Tasks
                </span>
              </div>
              <Badge variant="outline" className="font-mono text-[10px] font-bold">
                {taskNodes.length} Nodes
              </Badge>
            </div>

            <div className="flex flex-col gap-3 max-h-[620px] overflow-y-auto p-1 pr-2.5">
              {taskNodes.map((t) => {
                const isHovered = hoveredTaskId === t.id;
                const isDimmed =
                  activeHighlightedElements.hasActive &&
                  !activeHighlightedElements.tasks.has(t.id);
                const isAnomaly = Boolean(t.isMSRAnomaly && highlightMSRAnomaly);

                return (
                  <div
                    key={t.id}
                    onMouseEnter={() => setHoveredTaskId(t.id)}
                    onMouseLeave={() => setHoveredTaskId(null)}
                    onClick={() => onSelectNode(t)}
                    className={`relative w-full p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${isAnomaly
                      ? "z-10 bg-red-500/10 border-red-500/60 ring-2 ring-red-500/40 shadow-sm"
                      : isHovered
                        ? "z-10 bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/40 shadow-md"
                        : "z-0 bg-card border-border/80 hover:border-emerald-400"
                      } ${isDimmed ? "opacity-30" : "opacity-100"}`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-xs font-black text-primary">{t.key}</span>
                      <div className="flex items-center gap-1">
                        {isAnomaly && (
                          <span className="px-1.5 py-0.5 rounded-md bg-red-500 text-white font-bold text-[9px] animate-pulse">
                            Thiếu Commit
                          </span>
                        )}
                        <Badge
                          className={
                            t.status === "DONE"
                              ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[9px] py-0"
                              : "bg-blue-500/15 text-blue-600 border-blue-500/30 text-[9px] py-0"
                          }
                        >
                          {t.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-foreground leading-snug line-clamp-2">
                      {t.summary}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40 font-mono">
                      <span>Assignee: <strong className="text-foreground">{t.assigneeName}</strong></span>
                      <span>{t.storyPoints} SP</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 rounded-3xl bg-muted/20 border border-border/70 flex flex-col space-y-3.5">
            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode2Icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-black text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                  3. Git Commits
                </span>
              </div>
              <Badge variant="outline" className="font-mono text-[10px] font-bold">
                {commitNodes.length} Nodes
              </Badge>
            </div>

            <div className="flex flex-col gap-3 max-h-[620px] overflow-y-auto p-1 pr-2.5">
              {commitNodes.map((c) => {
                const isHovered = hoveredCommitId === c.id;
                const isDimmed =
                  activeHighlightedElements.hasActive &&
                  !activeHighlightedElements.commits.has(c.id);

                return (
                  <div
                    key={c.id}
                    onMouseEnter={() => setHoveredCommitId(c.id)}
                    onMouseLeave={() => setHoveredCommitId(null)}
                    onClick={() => onSelectNode(c)}
                    className={`relative w-full p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${isHovered
                      ? "z-10 bg-purple-500/10 border-purple-500 ring-2 ring-purple-500/40 shadow-md"
                      : "z-0 bg-card border-border/80 hover:border-purple-400"
                      } ${isDimmed ? "opacity-30" : "opacity-100"}`}
                  >
                    <div className="flex items-center justify-between gap-1 font-mono text-[11px]">
                      <span className="font-bold text-purple-600 dark:text-purple-400">{c.shortHash}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        +{c.additions} / -{c.deletions}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-foreground line-clamp-2 leading-relaxed">
                      {c.message}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40 font-mono">
                      <span>Tác giả: <strong className="text-foreground">{c.authorName}</strong></span>
                      <span className="text-primary font-bold">{c.linkedTaskKey || "N/A"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
