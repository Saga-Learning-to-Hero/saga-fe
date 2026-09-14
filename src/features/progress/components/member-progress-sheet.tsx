"use client";

import { useMemo, useState } from "react";
import {
  GitCommitIcon,
  LayersIcon,
  ListTodoIcon,
  Loader2Icon,
  ShieldCheckIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMemberProgress } from "@/features/student/project/hooks/useProjectSync";
import { getApiErrorCode, getApiErrorMessage } from "@/lib/api-error";
import {
  formatDateTime,
  formatLinkedCommitRatio,
  teamRoleLabel,
} from "../lib/progress-format";

interface MemberProgressSheetProps {
  projectId?: string | null;
  studentId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MemberProgressSheet({
  projectId,
  studentId,
  open,
  onOpenChange,
}: MemberProgressSheetProps) {
  const query = useMemberProgress(projectId, studentId, {
    enabled: open && Boolean(projectId && studentId),
  });
  const data = query.data;
  const notInTeam = getApiErrorCode(query.error) === "TEAM_NOT_FOUND";
  const [taskFilter, setTaskFilter] = useState<"ALL" | "IN_PROGRESS" | "DONE">("ALL");

  const totalAssigned =
    data?.taskSummary?.assigned ?? data?.taskSummary?.assignedTotal ?? 0;
  const completedTasks = data?.taskSummary?.completed ?? 0;
  const taskCompletionRate =
    totalAssigned > 0 ? Math.round((completedTasks / totalAssigned) * 100) : 0;

  const assignedTasks = data?.assignedTasks;
  const filteredTasks = useMemo(() => {
    if (!assignedTasks) return [];
    if (taskFilter === "ALL") return assignedTasks;
    if (taskFilter === "DONE") {
      return assignedTasks.filter(
        (t) => (t.status || "").toUpperCase() === "DONE" || (t.status || "").toUpperCase() === "CLOSED"
      );
    }
    return assignedTasks.filter(
      (t) => (t.status || "").toUpperCase() !== "DONE" && (t.status || "").toUpperCase() !== "CLOSED"
    );
  }, [assignedTasks, taskFilter]);

  const initials = data?.fullName
    ? data.fullName
      .split(" ")
      .map((p) => p[0])
      .slice(-2)
      .join("")
      .toUpperCase()
    : "SV";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl md:max-w-2xl overflow-hidden p-0 flex flex-col bg-card border-l border-border/70 shadow-2xl"
      >
        <SheetHeader className="p-5 border-b border-border/60 bg-muted/20 shrink-0">
          <div className="flex items-start justify-between gap-3 pr-8">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 rounded-2xl border border-border/80 bg-primary/10 text-primary font-bold shadow-2xs">
                <AvatarFallback className="rounded-2xl">{initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-1 text-left">
                <SheetTitle className="text-base font-extrabold text-foreground flex items-center gap-2">
                  <span>{data?.fullName || "Chi tiết tiến độ thành viên"}</span>
                </SheetTitle>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0">
                    {data?.studentCode || "..."}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] font-semibold px-2 py-0 ${(data?.teamRole || "").toUpperCase() === "LEADER"
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                      : "bg-muted text-muted-foreground"
                      }`}
                  >
                    {data ? teamRoleLabel(data.teamRole) : "Thành viên"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <SheetDescription className="text-xs text-muted-foreground text-left mt-2">
            Số liệu đối soát tự động từ Jira và GitHub. Không suy ra điểm đóng góp từ số lượng commit.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          {query.isLoading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-xs text-muted-foreground">
              <Loader2Icon className="size-6 animate-spin text-primary" />
              <span>Đang tải số liệu thành viên từ máy chủ...</span>
            </div>
          ) : notInTeam ? (
            <div className="rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 p-6 text-center">
              <p className="text-sm font-bold text-foreground">Thành viên không còn thuộc nhóm</p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Máy chủ ghi nhận người này không còn là thành viên hoạt động của dự án.
              </p>
            </div>
          ) : query.isError ? (
            <div className="rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 p-6 text-center">
              <p className="text-sm font-bold text-destructive">Không thể tải thông tin thành viên</p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {getApiErrorMessage(query.error, "Vui lòng kiểm tra lại kết nối.")}
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-3.5 h-8 text-xs cursor-pointer"
                onClick={() => void query.refetch()}
              >
                Thử lại
              </Button>
            </div>
          ) : data ? (
            <>
              <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <ListTodoIcon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-foreground">Tiến độ Đầu việc (Jira Tasks)</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-foreground">
                    {completedTasks}/{totalAssigned} SP ({taskCompletionRate}%)
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-muted overflow-hidden border border-border/40">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, taskCompletionRate)}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                  <div className="rounded-xl border border-border/60 bg-card p-2">
                    <span className="text-[10px] text-muted-foreground block font-sans">Đã xong</span>
                    <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                      {data.taskSummary.completed}
                    </span>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-card p-2">
                    <span className="text-[10px] text-muted-foreground block font-sans">Chưa xong</span>
                    <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
                      {data.taskSummary.incomplete}
                    </span>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-card p-2">
                    <span className="text-[10px] text-muted-foreground block font-sans">Đang làm</span>
                    <span className="text-sm font-extrabold text-primary">
                      {data.taskSummary.inProgress}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 space-y-3 shadow-2xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <GitCommitIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-foreground">Minh chứng Kỹ thuật (GitHub Commits)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="rounded-xl border border-border/60 bg-card p-2.5">
                    <span className="text-[10px] text-muted-foreground block">Tổng Commits</span>
                    <span className="font-mono text-base font-extrabold text-foreground">
                      {data.commitSummary.total}
                    </span>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-card p-2.5">
                    <span className="text-[10px] text-muted-foreground block">Đã gắn mã Jira</span>
                    <span className="font-mono text-base font-extrabold text-foreground">
                      {data.commitSummary.linkedToTasks}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono ml-1">
                      (
                      {formatLinkedCommitRatio(
                        data.commitSummary.linkedToTasks,
                        data.commitSummary.total
                      )}
                      )
                    </span>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-card p-2.5 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-muted-foreground block">Task có commit</span>
                    <span className="font-mono text-base font-extrabold text-foreground">
                      {data.commitSummary.tasksWithLinkedCommits}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/40">
                  <span>Lần commit gần nhất:</span>
                  <span className="font-mono text-foreground font-medium">
                    {formatDateTime(
                      data.commitSummary.lastCommitAt ?? data.commitSummary.lastCommittedAt
                    )}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 space-y-3 shadow-2xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <ShieldCheckIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-foreground">Tài liệu & Phiên làm việc</span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center font-mono">
                  <div className="rounded-xl border border-border/60 bg-card p-2">
                    <span className="text-[10px] text-muted-foreground block font-sans">Phiên</span>
                    <span className="text-sm font-extrabold text-foreground">
                      {data.evidenceSummary.workSessions}
                    </span>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-card p-2">
                    <span className="text-[10px] text-muted-foreground block font-sans">Tệp</span>
                    <span className="text-sm font-extrabold text-foreground">
                      {data.evidenceSummary.files}
                    </span>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-card p-2">
                    <span className="text-[10px] text-muted-foreground block font-sans">Web</span>
                    <span className="text-sm font-extrabold text-foreground">
                      {data.evidenceSummary.webLinks}
                    </span>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-card p-2">
                    <span className="text-[10px] text-muted-foreground block font-sans">Xác nhận</span>
                    <span className="text-sm font-extrabold text-foreground">
                      {data.evidenceSummary.confirmations}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LayersIcon className="w-4 h-4 text-primary" />
                    <h3 className="text-xs font-bold text-foreground">
                      Danh sách Task được phân công ({data.assignedTasks.length})
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 p-0.5 rounded-lg border border-border/60 bg-muted/40">
                    <button
                      type="button"
                      onClick={() => setTaskFilter("ALL")}
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${taskFilter === "ALL"
                        ? "bg-card text-foreground shadow-2xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      Tất cả
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaskFilter("IN_PROGRESS")}
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${taskFilter === "IN_PROGRESS"
                        ? "bg-card text-foreground shadow-2xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      Đang làm
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaskFilter("DONE")}
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${taskFilter === "DONE"
                        ? "bg-card text-foreground shadow-2xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      Đã xong
                    </button>
                  </div>
                </div>

                {filteredTasks.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/80 p-6 text-center text-xs text-muted-foreground">
                    Không có task nào trong trạng thái này.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
                    {filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        className="rounded-xl border border-border/70 bg-card p-3 hover:border-primary/50 transition-all shadow-2xs space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-semibold text-foreground leading-snug">
                            {task.title}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[9px] font-mono shrink-0 ${(task.status || "").toUpperCase() === "DONE"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                              : "bg-muted text-muted-foreground"
                              }`}
                          >
                            {task.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                          <span className="text-primary font-bold">{task.externalKey}</span>
                          {task.externalUpdatedAt && (
                            <span>cập nhật {formatDateTime(task.externalUpdatedAt)}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        <div className="p-4 border-t border-border/60 bg-muted/20 flex justify-end shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer text-xs h-8 px-4 rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            Đóng
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
