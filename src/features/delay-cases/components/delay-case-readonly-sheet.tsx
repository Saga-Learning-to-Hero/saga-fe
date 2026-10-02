"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/api-error";
import { formatAssistantTime } from "@/features/assistant/lib/assistant-labels";
import { useDelayCase } from "../hooks/use-delay-case";
import { safeEvidenceUrl, type DelayCaseTaskRef } from "../types/delay-case";

interface DelayCaseReadonlySheetProps {
  projectId?: string | null;
  caseId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function taskLabel(task: DelayCaseTaskRef | null): string | null {
  if (!task) return null;
  if (task.externalKey && task.title) return `${task.externalKey} — ${task.title}`;
  return task.title || task.externalKey;
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="space-y-0.5">
      <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  );
}

export function DelayCaseReadonlySheet({
  projectId,
  caseId,
  open,
  onOpenChange,
}: DelayCaseReadonlySheetProps) {
  const query = useDelayCase(projectId, caseId, { enabled: open });
  const detail = query.data;
  const evidenceUrl = safeEvidenceUrl(detail?.evidenceUrl ?? null);
  const status = getApiErrorStatus(query.error);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-hidden p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border pr-12">
          <SheetTitle>Hồ sơ trễ hạn</SheetTitle>
        </SheetHeader>
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {query.isLoading ? (
            <div className="h-40 animate-pulse rounded-xl bg-muted" aria-label="Đang tải hồ sơ trễ hạn" />
          ) : query.isError ? (
            <div className="space-y-2 rounded-xl border border-dashed border-border p-4">
              <p className="text-sm text-destructive">
                {status === 403
                  ? "Bạn không có quyền xem hồ sơ trễ hạn này."
                  : status === 404
                    ? "Không tìm thấy hồ sơ trễ hạn."
                    : getApiErrorMessage(query.error, "Không tải được hồ sơ trễ hạn.")}
              </p>
              <Button type="button" variant="outline" size="sm" onClick={() => void query.refetch()}>
                Thử lại
              </Button>
            </div>
          ) : detail ? (
            <dl className="space-y-3">
              <Field label="Trạng thái" value={detail.status} />
              <Field label="Nhóm nguyên nhân" value={detail.categoryGroup} />
              <Field label="Phân loại" value={detail.category} />
              <Field label="Task" value={taskLabel(detail.task)} />
              <Field
                label="Sinh viên"
                value={
                  detail.student?.fullName
                    ? `${detail.student.fullName}${detail.student.studentCode ? ` (${detail.student.studentCode})` : ""}`
                    : null
                }
              />
              <Field label="Hạn" value={detail.dueDate} />
              <Field label="Mở lúc" value={formatAssistantTime(detail.openedAt)} />
              <Field label="Hạn giải trình" value={formatAssistantTime(detail.explanationDueAt)} />
              <Field label="Giải trình" value={detail.explanationNote} />
              <Field label="Task đang chặn" value={taskLabel(detail.blockingTask)} />
              {evidenceUrl ? (
                <div className="space-y-0.5">
                  <dt className="text-xs font-semibold text-muted-foreground">Minh chứng</dt>
                  <dd>
                    <a href={evidenceUrl} target="_blank" rel="noreferrer" className="text-sm text-primary underline">
                      Mở liên kết
                    </a>
                  </dd>
                </div>
              ) : null}
              <Field label="Xác minh" value={detail.verification} />
              <Field label="Ghi chú xác minh" value={detail.verificationNote} />
              <Field label="Quyết định trưởng nhóm" value={detail.leaderDecision} />
              <Field label="Nhận xét trưởng nhóm" value={detail.leaderComment} />
              <Field label="Kết luận giảng viên" value={detail.lecturerOutcome} />
              <Field label="Nhận xét giảng viên" value={detail.lecturerComment} />
              <Field label="Đóng lúc" value={formatAssistantTime(detail.closedAt)} />
              <Field label="Lý do đóng" value={detail.closeReason} />
              {detail.signals ? (
                <div className="space-y-1 rounded-xl border border-border p-3">
                  <p className="text-xs font-semibold text-muted-foreground">Tín hiệu hệ thống</p>
                  <p className="text-sm">Commit: {detail.signals.commitCount ?? 0}</p>
                  <p className="text-sm">Phiên làm việc: {detail.signals.workSessionCount ?? 0}</p>
                  <p className="text-sm">Minh chứng: {detail.signals.evidenceCount ?? 0}</p>
                  {detail.signals.currentlyBlocked ? <p className="text-sm">Đang bị chặn</p> : null}
                  {detail.signals.dueDateChanged ? <p className="text-sm">Hạn đã đổi</p> : null}
                  {detail.signals.storyPointIncreased ? <p className="text-sm">Story point đã tăng</p> : null}
                  {detail.signals.reassignedNearDue ? <p className="text-sm">Đổi người làm sát hạn</p> : null}
                </div>
              ) : null}
            </dl>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
