"use client";

import { useMemo, useState } from "react";
import { formatVietnamDateTime, formatDateOnly, getCountdownParts, parseVietnamDateTime } from "../lib/time-utils";
import {
  getStatusConfig,
  getCategoryConfig,
  getVerificationConfig,
  getCloseReasonLabel,
} from "../lib/delay-case-constants";
import type { DelayCaseResponse } from "../types/delay-cases";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, ExternalLink, ShieldAlert, CheckCircle2, XCircle, User, Activity, XIcon } from "lucide-react";
import { DelayCaseExplanationForm } from "./delay-case-explanation-form";
import { DelayCaseLeaderReviewForm } from "./delay-case-leader-review-form";
import { DelayCaseLecturerReviewForm } from "./delay-case-lecturer-review-form";
import { ReopenDelayCaseButton } from "./reopen-delay-case-button";

interface DelayCaseDetailModalProps {
  delayCase: DelayCaseResponse;
  isOpen: boolean;
  onClose: () => void;
}

export function DelayCaseDetailModal({ delayCase, isOpen, onClose }: DelayCaseDetailModalProps) {
  const statusConfig = getStatusConfig(delayCase.status);

  const { isExpired, days, hours, minutes } = useMemo(() => {
    if (!delayCase.explanationDueAt) return { isExpired: true, days: 0, hours: 0, minutes: 0 };
    return getCountdownParts(parseVietnamDateTime(delayCase.explanationDueAt));
  }, [delayCase.explanationDueAt]);

  const [showExplainForm, setShowExplainForm] = useState(false);
  const [showLeaderForm, setShowLeaderForm] = useState(false);
  const [showLecturerForm, setShowLecturerForm] = useState(false);

  if (!isOpen) return null;


  const hasActions = delayCase.permissions.canExplain || delayCase.permissions.canLeaderReview || delayCase.permissions.canLecturerReview || delayCase.permissions.canReopen;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-card border border-border/80 rounded-2xl w-full max-w-5xl flex flex-col shadow-2xl relative my-auto">

        <div className="p-4 sm:p-5 border-b border-border/60 flex items-center justify-between shrink-0 bg-muted/20 rounded-t-2xl sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap pr-10">
            <Badge variant="secondary" className="font-mono bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 border border-blue-500/20 rounded-md shrink-0">
              {delayCase.task?.externalKey}
            </Badge>
            <h3 className="text-sm sm:text-base font-extrabold text-foreground truncate max-w-[200px] sm:max-w-md">
              {delayCase.task?.title}
            </h3>
            <Badge variant="outline" className={`shrink-0 text-xs px-2 py-0.5 shadow-sm ${statusConfig.colorClass}`}>
              {statusConfig.label}
            </Badge>
          </div>
          <button onClick={onClose} className="absolute right-4 top-4 rounded-xl p-1.5 hover:bg-muted cursor-pointer transition-colors">
            <XIcon className="w-5 h-5 text-muted-foreground hover:text-foreground" />
          </button>
        </div>


        <div className="p-0 flex-1 flex flex-col md:flex-row max-h-[80vh] overflow-y-auto">

          <div className="w-full md:w-1/3 bg-muted/10 border-b md:border-b-0 md:border-r border-border/50 p-5 sm:p-6 space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-muted-foreground" />
                Thông tin cơ bản
              </h4>
              <div className="space-y-3 text-sm text-muted-foreground bg-card p-3 rounded-xl border border-border/40 shadow-sm">
                <div className="flex flex-col">
                  <span className="text-xs">Người chịu trách nhiệm</span>
                  <span className="font-medium text-foreground">{delayCase.student?.fullName} <span className="font-mono text-xs">({delayCase.student?.studentCode})</span></span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs">Hạn chót hoàn thành</span>
                  <span className="font-medium text-foreground">{formatDateOnly(delayCase.dueDate)}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                <ShieldAlert className="w-4 h-4 text-muted-foreground" />
                Dấu hiệu hệ thống
              </h4>
              <div className="space-y-2 text-sm bg-card p-4 rounded-xl border border-border/40 shadow-sm">
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
                  <div className="flex flex-col mt-2 pt-2 border-t border-border/40">
                    <span className="text-muted-foreground text-xs">Bắt đầu lúc:</span>
                    <span className="font-mono text-xs">{formatVietnamDateTime(delayCase.signals.firstWorkAt)}</span>
                  </div>
                )}
                {delayCase.signals.lastWorkAt && (
                  <div className="flex flex-col mt-1">
                    <span className="text-muted-foreground text-xs">Hoạt động cuối:</span>
                    <span className="font-mono text-xs">{formatVietnamDateTime(delayCase.signals.lastWorkAt)}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-3">
                {delayCase.signals.currentlyBlocked && (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">Đang bị chặn</Badge>
                )}
                {delayCase.signals.dueDateChanged && (
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]">Hạn đã thay đổi</Badge>
                )}
                {delayCase.signals.storyPointIncreased && (
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]">SP đã tăng</Badge>
                )}
                {delayCase.signals.reassignedNearDue && (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">Giao sát hạn</Badge>
                )}
                {delayCase.signals.otherOpenTasksNearDue > 0 && (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">
                    +{delayCase.signals.otherOpenTasksNearDue} Task gần hạn
                  </Badge>
                )}
              </div>
            </div>

            {delayCase.verification && (
              <div>
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  Hệ thống phân tích
                </h4>
                <div className="space-y-2 bg-card p-3 rounded-xl border border-border/40 shadow-sm">
                  <Badge variant="outline" className={getVerificationConfig(delayCase.verification).colorClass}>
                    {getVerificationConfig(delayCase.verification).label}
                  </Badge>
                  {delayCase.verificationNote && (
                    <p className="text-xs text-muted-foreground leading-relaxed">{delayCase.verificationNote}</p>
                  )}
                </div>
              </div>
            )}
          </div>


          <div className="w-full md:w-2/3 p-5 sm:p-6 flex flex-col gap-6">

            <div className="space-y-3 relative pl-4 border-l-2 border-muted">
              <div className="absolute w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center text-xs font-bold border-2 border-background -left-[13px] top-0">1</div>
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                Giải trình của sinh viên
              </h4>
              {delayCase.explainedAt === null ? (
                <div className="text-sm text-muted-foreground italic flex items-center gap-2 p-3 bg-muted/20 rounded-lg">
                  <Clock className="w-4 h-4" /> Chưa gửi giải trình
                </div>
              ) : (
                <div className="bg-card border border-border/40 rounded-xl p-4 space-y-3 shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-muted-foreground block text-xs mb-1">Thời gian gửi</span>
                      <span className="font-mono text-xs">{formatVietnamDateTime(delayCase.explainedAt || "")}</span>
                    </div>
                    {delayCase.category && (
                      <div>
                        <span className="text-muted-foreground block text-xs mb-1">Nguyên nhân</span>
                        <span className="font-medium text-sm">{getCategoryConfig(delayCase.category).label}</span>
                      </div>
                    )}
                    {delayCase.blockingTask?.externalKey && (
                      <div>
                        <span className="text-muted-foreground block text-xs mb-1">Task chặn</span>
                        <span className="font-mono font-medium text-sm text-blue-600 dark:text-blue-400">{delayCase.blockingTask?.externalKey}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs mb-1">Nội dung giải trình</span>
                    {delayCase.explanationNote === null ? (
                      <span className="italic text-muted-foreground text-sm">Nội dung được giới hạn theo quyền.</span>
                    ) : (
                      <div className="bg-muted/30 p-3 rounded-lg text-sm whitespace-pre-wrap">
                        {delayCase.explanationNote || <span className="italic text-muted-foreground">Không có ghi chú</span>}
                      </div>
                    )}
                  </div>
                  {delayCase.evidenceUrl !== undefined && (
                    <div>
                      <span className="text-muted-foreground block text-xs mb-1">Minh chứng</span>
                      {delayCase.evidenceUrl === null ? (
                        <span className="italic text-muted-foreground text-sm">Đường dẫn được giới hạn theo quyền.</span>
                      ) : delayCase.evidenceUrl ? (
                        <a href={delayCase.evidenceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline flex items-center gap-1 w-fit">
                          <ExternalLink className="w-3.5 h-3.5" /> Xem minh chứng
                        </a>
                      ) : (
                        <span className="italic text-muted-foreground text-sm">Không có minh chứng</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>


            {(delayCase.leaderReviewedAt || delayCase.permissions.canLeaderReview || delayCase.closedAt || delayCase.lecturerReviewedAt || delayCase.permissions.canLecturerReview) && (
              <div className="space-y-3 relative pl-4 border-l-2 border-muted">
                <div className="absolute w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center text-xs font-bold border-2 border-background -left-[13px] top-0">2</div>
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  Ý kiến trưởng nhóm
                </h4>
                {delayCase.leaderReviewedAt ? (
                  <div className="bg-card border border-border/40 rounded-xl p-4 space-y-3 shadow-sm">
                    <div className="flex items-center gap-2 text-sm">
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
                      <div className="bg-muted/30 p-3 rounded-lg text-sm whitespace-pre-wrap">{delayCase.leaderComment}</div>
                    ) : null}
                  </div>
                ) : delayCase.status === "OPEN" || delayCase.status === "AWAITING_LEADER" ? (
                  <div className="text-sm text-muted-foreground italic flex items-center gap-2 p-3 bg-muted/20 rounded-lg">
                    <Clock className="w-4 h-4" /> Đang chờ duyệt
                  </div>
                ) : (
                  <div className="text-sm text-emerald-600 dark:text-emerald-400 italic flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                    <CheckCircle2 className="w-4 h-4" /> Không yêu cầu duyệt (Do Assignee là Trưởng nhóm)
                  </div>
                )}
              </div>
            )}


            {(delayCase.closedAt || delayCase.lecturerReviewedAt || delayCase.permissions.canLecturerReview) && (
              <div className="space-y-3 relative pl-4 border-l-2 border-transparent">
                <div className="absolute w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center text-xs font-bold border-2 border-background -left-[13px] top-0">3</div>
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  Quyết định cuối cùng
                </h4>
                {delayCase.closedAt || delayCase.lecturerReviewedAt ? (
                  <div className="bg-card border border-border/40 rounded-xl p-4 space-y-3 shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      {delayCase.closedAt && (
                        <>
                          <div>
                            <span className="text-muted-foreground block text-xs">Lý do đóng</span>
                            <span className="font-medium">{getCloseReasonLabel(delayCase.closeReason || "")}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-xs">Thời gian đóng</span>
                            <span className="font-mono text-xs">{formatVietnamDateTime(delayCase.closedAt)}</span>
                          </div>
                        </>
                      )}
                    </div>
                    {delayCase.lecturerOutcome && (
                      <div className="mt-2 text-sm flex items-center gap-2">
                        <span className="text-muted-foreground">Phán quyết:</span>
                        <Badge variant="outline" className={delayCase.lecturerOutcome === "OBJECTIVE" ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30" : "bg-red-500/10 text-red-700 border-red-500/30"}>
                          {delayCase.lecturerOutcome === "OBJECTIVE" ? "Chấp nhận (Lý do khách quan)" : "Từ chối (Lý do chủ quan)"}
                        </Badge>
                      </div>
                    )}
                    {delayCase.lecturerComment === null ? (
                      <p className="italic text-muted-foreground text-sm mt-2">Nhận xét được giới hạn theo quyền truy cập.</p>
                    ) : delayCase.lecturerComment ? (
                      <div className="bg-muted/30 p-3 rounded-lg text-sm whitespace-pre-wrap mt-2">{delayCase.lecturerComment}</div>
                    ) : null}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic flex items-center gap-2 p-3 bg-muted/20 rounded-lg">
                    <Clock className="w-4 h-4" /> Đang chờ phán quyết
                  </div>
                )}
              </div>
            )}


            {hasActions && (
              <div className="mt-4 pt-4 border-t border-border/60">
                {delayCase.permissions.canExplain && (
                  <div className="space-y-4 mb-4">
                    {isExpired ? (
                      <div className="bg-red-500/10 text-red-700 p-3 rounded-lg text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Đã hết hạn giải trình.
                      </div>
                    ) : showExplainForm ? (
                      <div className="bg-card border border-blue-500/30 rounded-xl p-5 shadow-md shadow-blue-500/10 relative">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            Vui lòng nhập giải trình
                          </h4>
                          <div className="text-xs font-mono bg-amber-500/10 text-amber-700 px-2 py-1 rounded-md">
                            Còn lại: {days}d {hours}h {minutes}m
                          </div>
                        </div>
                        <DelayCaseExplanationForm delayCase={delayCase} onSuccess={onClose} />
                        <button onClick={() => setShowExplainForm(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setShowExplainForm(true)} className="w-full py-3 rounded-xl border border-dashed border-blue-500/50 text-blue-600 hover:bg-blue-500/5 transition-colors font-medium text-sm flex items-center justify-center gap-2">
                        <ShieldAlert className="w-4 h-4" />
                        Viết giải trình cho hồ sơ này
                      </button>
                    )}
                  </div>
                )}

                {delayCase.permissions.canLeaderReview && (
                  <div className="space-y-4 mb-4">
                    {showLeaderForm ? (
                      <div className="bg-card border border-emerald-500/30 rounded-xl p-5 shadow-md shadow-emerald-500/10 relative">
                        <h4 className="text-sm font-semibold flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-4">
                          Xác nhận của Trưởng nhóm
                        </h4>
                        <DelayCaseLeaderReviewForm delayCase={delayCase} onSuccess={onClose} />
                        <button onClick={() => setShowLeaderForm(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setShowLeaderForm(true)} className="w-full py-3 rounded-xl border border-dashed border-emerald-500/50 text-emerald-600 hover:bg-emerald-500/5 transition-colors font-medium text-sm flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Duyệt hồ sơ (Vai trò Trưởng nhóm)
                      </button>
                    )}
                  </div>
                )}

                {delayCase.permissions.canLecturerReview && (
                  <div className="space-y-4 mb-4">
                    {showLecturerForm ? (
                      <div className="bg-card border border-purple-500/30 rounded-xl p-5 shadow-md shadow-purple-500/10 relative">
                        <h4 className="text-sm font-semibold flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-4">
                          Phán quyết của Giảng viên
                        </h4>
                        <DelayCaseLecturerReviewForm delayCase={delayCase} onSuccess={onClose} />
                        <button onClick={() => setShowLecturerForm(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setShowLecturerForm(true)} className="w-full py-3 rounded-xl border border-dashed border-purple-500/50 text-purple-600 hover:bg-purple-500/5 transition-colors font-medium text-sm flex items-center justify-center gap-2">
                        <Activity className="w-4 h-4" />
                        Đưa ra phán quyết (Vai trò Giảng viên)
                      </button>
                    )}
                  </div>
                )}

                {delayCase.permissions.canReopen && (
                  <div className="flex justify-end mt-4">
                    <ReopenDelayCaseButton delayCase={delayCase} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
