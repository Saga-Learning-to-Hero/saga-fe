"use client";

import Link from "next/link";
import {
  AlertTriangleIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ExternalLinkIcon,
  GitCommitIcon,
  KanbanIcon,
  ListTodoIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { studentCoursePath } from "@/features/student/courses/hooks/use-student-course-context";
import { cn } from "@/lib/utils";
import type { StudentDashboardActiveTask } from "../types/student-dashboard-types";

interface StudentActiveTasksCardProps {
  tasks: StudentDashboardActiveTask[];
  courseId: string;
}

export function StudentActiveTasksCard({ tasks, courseId }: StudentActiveTasksCardProps) {
  return (
    <Card className="rounded-2xl border border-border/80 bg-card/90 shadow-xs flex flex-col">
      <CardHeader className="p-4 pb-2 border-b border-border/60 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <ListTodoIcon className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-bold">Việc cần làm của tôi</CardTitle>
              {tasks.length > 0 && (
                <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0 h-4">
                  {tasks.length}
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
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

      <CardContent className="p-4 flex-1 space-y-2.5 overflow-y-auto max-h-[380px] custom-scrollbar pr-2">
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

            return (
              <div
                key={task.id}
                className={cn(
                  "p-3 rounded-xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5",
                  task.hasAnomaly
                    ? "bg-red-500/5 border-red-500/30"
                    : "bg-muted/20 border-border/60 hover:bg-muted/40"
                )}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">
                      {task.externalKey}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] uppercase font-bold",
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
                      <Badge variant="secondary" className="text-[10px]">
                        {task.priority}
                      </Badge>
                    )}
                    {typeof task.storyPoints === "number" && task.storyPoints > 0 && (
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {task.storyPoints} SP
                      </Badge>
                    )}
                    {task.hasAnomaly && (
                      <Badge
                        variant="outline"
                        className="bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/40 text-[10px] gap-1 animate-pulse"
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

                <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground self-end sm:self-center font-mono">
                  {task.dueDate && (
                    <div className="flex items-center gap-1 text-[11px]">
                      <CalendarIcon className="size-3" />
                      <span>{new Date(task.dueDate).toLocaleDateString("vi-VN")}</span>
                    </div>
                  )}
                  <div
                    className={cn(
                      "flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md",
                      task.linkedCommitCount > 0
                        ? "bg-primary/10 text-primary font-bold"
                        : "bg-muted text-muted-foreground"
                    )}
                    title={`${task.linkedCommitCount} commit đã liên kết`}
                  >
                    <GitCommitIcon className="size-3" />
                    <span>{task.linkedCommitCount}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
