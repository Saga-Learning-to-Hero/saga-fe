"use client";

import { Loader2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMemberProgress } from "@/features/student/project/hooks/useProjectSync";
import { getApiErrorCode, getApiErrorMessage } from "@/lib/api-error";
import {
  formatDateTime,
  formatLinkedCommitRatio,
  teamRoleLabel,
} from "../lib/progress-format";

interface MemberProgressDialogProps {
  projectId?: string | null;
  studentId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MemberProgressDialog({
  projectId,
  studentId,
  open,
  onOpenChange,
}: MemberProgressDialogProps) {
  const query = useMemberProgress(projectId, studentId, {
    enabled: open && Boolean(projectId && studentId),
  });
  const data = query.data;
  const notInTeam = getApiErrorCode(query.error) === "TEAM_NOT_FOUND";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-hidden p-0">
        <div className="flex max-h-[92vh] flex-col">
          <DialogHeader className="border-b border-border/60 p-5">
            <DialogTitle className="text-base font-bold">
              {data ? `Tiến độ của ${data.fullName}` : "Chi tiết tiến độ thành viên"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Số liệu factual từ máy chủ. Không suy ra điểm đóng góp từ số commit.
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto p-5">
            {query.isLoading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-xs text-muted-foreground">
                <Loader2Icon className="size-4 animate-spin" />
                Đang tải chi tiết thành viên...
              </div>
            ) : notInTeam ? (
              <div className="rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 p-5 text-center">
                <p className="text-sm font-semibold text-foreground">
                  Thành viên không còn thuộc nhóm
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Máy chủ trả TEAM_NOT_FOUND. Người này không phải thành viên ACTIVE của dự án.
                </p>
              </div>
            ) : query.isError ? (
              <div className="rounded-xl border border-dashed border-destructive/30 p-5 text-center">
                <p className="text-sm font-semibold">Không tải được chi tiết thành viên</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {getApiErrorMessage(query.error, "Vui lòng thử lại.")}
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="mt-3 h-8 cursor-pointer text-xs"
                  onClick={() => void query.refetch()}
                >
                  Thử lại
                </Button>
              </div>
            ) : data ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {data.studentCode}
                  </Badge>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {teamRoleLabel(data.teamRole)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Metric label="Task đã giao" value={data.taskSummary.assigned ?? data.taskSummary.assignedTotal} />
                  <Metric label="Đã xong" value={data.taskSummary.completed} />
                  <Metric label="Chưa xong" value={data.taskSummary.incomplete} />
                  <Metric label="Tổng commit" value={data.commitSummary.total} />
                  <Metric label="Commit đã liên kết" value={data.commitSummary.linkedToTasks} />
                  <Metric
                    label="Tỉ lệ liên kết"
                    value={formatLinkedCommitRatio(
                      data.commitSummary.linkedToTasks,
                      data.commitSummary.total
                    )}
                  />
                  <Metric
                    label="Task có commit liên kết"
                    value={data.commitSummary.tasksWithLinkedCommits}
                  />
                  <Metric label="Xác nhận" value={data.evidenceSummary.confirmations} />
                  <Metric label="Phiên làm việc" value={data.evidenceSummary.workSessions} />
                  <Metric label="Tệp" value={data.evidenceSummary.files} />
                  <Metric label="Liên kết web" value={data.evidenceSummary.webLinks} />
                  <Metric
                    label="Commit gần nhất"
                    value={formatDateTime(data.commitSummary.lastCommitAt ?? data.commitSummary.lastCommittedAt)}
                  />
                </div>

                <div>
                  <h3 className="mb-2 text-xs font-bold text-foreground">Task đã giao</h3>
                  {data.assignedTasks.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-border/80 p-4 text-center text-xs text-muted-foreground">
                      Thành viên chưa được giao task.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {data.assignedTasks.map((task) => (
                        <li
                          key={task.id}
                          className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2.5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-foreground">
                              {task.title}
                            </span>
                            <Badge variant="outline" className="font-mono text-[10px]">
                              {task.status}
                            </Badge>
                          </div>
                          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                            {task.externalKey}
                            {task.externalUpdatedAt
                              ? ` · cập nhật ${formatDateTime(task.externalUpdatedAt)}`
                              : ""}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <DialogFooter className="m-0">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => onOpenChange(false)}
            >
              Đóng
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/30 px-3 py-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="font-mono text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}
