"use client";

import { useMemo } from "react";
import { formatVietnamDateTime, formatDateOnly, getCountdownParts } from "../lib/time-utils";
import {
  getStatusConfig,
  getCategoryConfig,
  getVerificationConfig,
  getCloseReasonLabel,
} from "../lib/delay-case-constants";
import type { DelayCaseResponse } from "../types/delay-cases";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, ExternalLink, ShieldAlert, CheckCircle2, XCircle, User, Calendar } from "lucide-react";
import { DelayCaseExplanationForm } from "./delay-case-explanation-form";
import { DelayCaseLeaderReviewForm } from "./delay-case-leader-review-form";
import { DelayCaseLecturerReviewForm } from "./delay-case-lecturer-review-form";
import { ReopenDelayCaseButton } from "./reopen-delay-case-button";

interface DelayCaseCardProps {
  delayCase: DelayCaseResponse;
}

export function DelayCaseCard({ delayCase }: DelayCaseCardProps) {
  const statusConfig = getStatusConfig(delayCase.status);

  const { isExpired, days, hours, minutes } = useMemo(() => {
    if (!delayCase.explanationDueAt) return { isExpired: true, days: 0, hours: 0, minutes: 0 };
    // parseVietnamDateTime is used directly in countdown 
    return getCountdownParts(new Date(delayCase.explanationDueAt + "+07:00"));
  }, [delayCase.explanationDueAt]);

  return (
    <div className="bg-card border border-border/60 rounded-xl overflow-hidden flex flex-col shadow-sm transition-all hover:shadow-md">
      <div className="bg-muted/40 p-5 border-b border-border/60 flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="font-mono bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 border border-blue-500/20 rounded-md">
              {delayCase.task?.externalKey}
            </Badge>
            <h3 className="text-base font-bold text-foreground">
              {delayCase.task?.title}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span className="font-medium text-foreground">{delayCase.student?.fullName}</span>
              <span className="text-xs">({delayCase.student?.studentCode})</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>Hạn:</span>
              <span className="font-medium text-foreground">{formatDateOnly(delayCase.dueDate)}</span>
            </div>
          </div>
        </div>
        <Badge variant="outline" className={`shrink-0 text-sm px-3 py-1 shadow-sm ${statusConfig.colorClass}`}>
          {statusConfig.label}
        </Badge>
      </div>

      <div className="p-4 sm:p-5 space-y-6">
        {/* System Signals (Dấu hiệu hệ thống) */}
        <div className="bg-muted/20 border border-border/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <ShieldAlert className="w-4 h-4 text-muted-foreground" />
            Dấu hiệu hệ thống
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Số Commit:</span>
              <span className="font-mono font-medium">{delayCase.signals.commitCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Số phiên làm việc:</span>
              <span className="font-mono font-medium">{delayCase.signals.workSessionCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Số minh chứng:</span>
              <span className="font-mono font-medium">{delayCase.signals.evidenceCount}</span>
            </div>
            {delayCase.signals.firstWorkAt && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Bắt đầu lúc:</span>
                <span className="font-mono text-xs">{formatVietnamDateTime(delayCase.signals.firstWorkAt)}</span>
              </div>
            )}
            {delayCase.signals.lastWorkAt && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Hoạt động cuối:</span>
                <span className="font-mono text-xs">{formatVietnamDateTime(delayCase.signals.lastWorkAt)}</span>
              </div>
            )}
          </div>

          {/* Signal flags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {delayCase.signals.currentlyBlocked && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">Đang bị chặn</Badge>
            )}
            {delayCase.signals.dueDateChanged && (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">Hạn hoàn thành đã bị thay đổi</Badge>
            )}
            {delayCase.signals.storyPointIncreased && (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">Story Point đã tăng</Badge>
            )}
            {delayCase.signals.reassignedNearDue && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">Được giao sát hạn</Badge>
            )}
            {delayCase.signals.otherOpenTasksNearDue > 0 && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                Đang có thêm {delayCase.signals.otherOpenTasksNearDue} Task gần hạn
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground italic mt-2">
            Lịch sử thay đổi hạn hoàn thành, Story Point và người thực hiện chỉ được ghi nhận từ khi tính năng này được kích hoạt.
          </p>
        </div>

        {/* Explanation Section */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground border-b border-border/50 pb-2">Giải trình của sinh viên</h4>

          {delayCase.explainedAt === null ? (
            <div className="text-sm text-muted-foreground italic flex items-center gap-2">
              <Clock className="w-4 h-4" /> Chưa gửi giải trình
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground block text-xs mb-1">Thời gian gửi</span>
                  <span className="font-mono text-xs">{formatVietnamDateTime(delayCase.explainedAt || "")}</span>
                </div>
                {delayCase.category && (
                  <div>
                    <span className="text-muted-foreground block text-xs mb-1">Nguyên nhân</span>
                    <span className="font-medium">{getCategoryConfig(delayCase.category).label}</span>
                  </div>
                )}
                {delayCase.blockingTask?.externalKey && (
                  <div>
                    <span className="text-muted-foreground block text-xs mb-1">Task chặn</span>
                    <span className="font-mono font-medium text-blue-600 dark:text-blue-400">{delayCase.blockingTask?.externalKey}</span>
                  </div>
                )}
              </div>

              <div>
                <span className="text-muted-foreground block text-xs mb-1">Nội dung giải trình</span>
                {delayCase.explanationNote === null ? (
                  <span className="italic text-muted-foreground">Nội dung giải trình được giới hạn theo quyền truy cập.</span>
                ) : (
                  <div className="bg-muted/30 p-3 rounded-md whitespace-pre-wrap">
                    {delayCase.explanationNote || <span className="italic text-muted-foreground">Không có ghi chú</span>}
                  </div>
                )}
              </div>

              {delayCase.evidenceUrl !== undefined && (
                <div>
                  <span className="text-muted-foreground block text-xs mb-1">Minh chứng</span>
                  {delayCase.evidenceUrl === null ? (
                    <span className="italic text-muted-foreground">Đường dẫn minh chứng được giới hạn theo quyền truy cập.</span>
                  ) : delayCase.evidenceUrl ? (
                    <a href={delayCase.evidenceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                      <ExternalLink className="w-3.5 h-3.5" /> Xem minh chứng
                    </a>
                  ) : (
                    <span className="italic text-muted-foreground">Không có minh chứng</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Verification */}
        {delayCase.verification && (
          <div className="bg-muted/10 border border-border/50 rounded-lg p-3 flex flex-col sm:flex-row gap-3">
            <div className="shrink-0">
              <Badge variant="outline" className={getVerificationConfig(delayCase.verification).colorClass}>
                {getVerificationConfig(delayCase.verification).label}
              </Badge>
            </div>
            {delayCase.verificationNote && (
              <p className="text-sm text-muted-foreground">{delayCase.verificationNote}</p>
            )}
          </div>
        )}

        {/* Leader Review */}
        {delayCase.leaderReviewedAt && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground border-b border-border/50 pb-2">Ý kiến trưởng nhóm</h4>
            <div className="text-sm space-y-2">
              <div className="flex items-center gap-2">
                {delayCase.leaderDecision === "AGREE" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                <span className="font-medium">
                  {delayCase.leaderDecision === "AGREE" ? "Đồng ý với giải trình" : "Không đồng ý"}
                </span>
                <span className="text-muted-foreground mx-1">•</span>
                <span className="font-mono text-xs text-muted-foreground">{formatVietnamDateTime(delayCase.leaderReviewedAt)}</span>
              </div>

              {delayCase.leaderComment === null ? (
                <p className="italic text-muted-foreground text-sm">Nhận xét được giới hạn theo quyền truy cập.</p>
              ) : delayCase.leaderComment ? (
                <div className="bg-muted/30 p-3 rounded-md whitespace-pre-wrap">{delayCase.leaderComment}</div>
              ) : null}
            </div>
          </div>
        )}

        {/* Lecturer Review / Close Info */}
        {(delayCase.closedAt || delayCase.lecturerReviewedAt) && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground border-b border-border/50 pb-2">Quyết định của giảng viên & Hệ thống</h4>
            <div className="text-sm space-y-2">
              {delayCase.closedAt && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground block text-xs">Lý do đóng</span>
                    <span className="font-medium">{getCloseReasonLabel(delayCase.closeReason || "")}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Thời gian đóng</span>
                    <span className="font-mono text-xs">{formatVietnamDateTime(delayCase.closedAt)}</span>
                  </div>
                </div>
              )}

              {delayCase.lecturerOutcome && (
                <div className="mt-2">
                  <Badge variant="outline" className={delayCase.lecturerOutcome === "EXCUSED" ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30" : "bg-red-500/10 text-red-700 border-red-500/30"}>
                    Quyết định: {delayCase.lecturerOutcome === "EXCUSED" ? "Châm chước" : "Từ chối"}
                  </Badge>
                </div>
              )}

              {delayCase.lecturerComment === null ? (
                <p className="italic text-muted-foreground text-sm mt-2">Nhận xét được giới hạn theo quyền truy cập.</p>
              ) : delayCase.lecturerComment ? (
                <div className="bg-muted/30 p-3 rounded-md whitespace-pre-wrap mt-2">{delayCase.lecturerComment}</div>
              ) : null}
            </div>
          </div>
        )}

        {/* Actions based on permissions */}
        {delayCase.permissions.canExplain && (
          <div className="pt-4 border-t border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold">Gửi giải trình</h4>
              {!isExpired && (
                <div className="text-xs font-mono bg-amber-500/10 text-amber-700 px-2 py-1 rounded-md">
                  Còn lại: {days}d {hours}h {minutes}m
                </div>
              )}
            </div>
            {isExpired ? (
              <div className="bg-red-500/10 text-red-700 p-3 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Đã hết hạn giải trình.
              </div>
            ) : (
              <DelayCaseExplanationForm delayCase={delayCase} />
            )}
          </div>
        )}

        {delayCase.permissions.canLeaderReview && (
          <div className="pt-4 border-t border-border/50">
            <h4 className="text-sm font-semibold mb-4">Xác nhận của Trưởng nhóm</h4>
            <DelayCaseLeaderReviewForm delayCase={delayCase} />
          </div>
        )}

        {delayCase.permissions.canLecturerReview && (
          <div className="pt-4 border-t border-border/50">
            <h4 className="text-sm font-semibold mb-4">Quyết định của Giảng viên</h4>
            <DelayCaseLecturerReviewForm delayCase={delayCase} />
          </div>
        )}

        {delayCase.permissions.canReopen && (
          <div className="pt-4 border-t border-border/50 flex justify-end">
            <ReopenDelayCaseButton delayCase={delayCase} />
          </div>
        )}
      </div>
    </div>
  );
}
