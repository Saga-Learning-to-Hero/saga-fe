import type {
  DelayCaseStatus,
  DelayCauseCategory,
  Verification,
  CloseReason,
} from "../types/delay-cases";

export const DELAY_CASE_STATUS_CONFIG: Record<
  DelayCaseStatus,
  { label: string; colorClass: string }
> = {
  OPEN: { label: "Chờ giải trình", colorClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30" },
  AWAITING_LEADER: { label: "Chờ trưởng nhóm xác nhận", colorClass: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30" },
  AWAITING_LECTURER: { label: "Chờ giảng viên duyệt", colorClass: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30" },
  CLOSED_OBJECTIVE: { label: "Khách quan — Không tính trễ", colorClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" },
  CLOSED_SUBJECTIVE: { label: "Chủ quan — Tính trễ", colorClass: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30" },
};

export const DELAY_CAUSE_CATEGORY_CONFIG: Record<
  DelayCauseCategory,
  { label: string; requiresNote: boolean; group: "Khách quan" | "Chủ quan" | "Khác" }
> = {
  BLOCKED_BY_TASK: { label: "Bị Task khác chặn", requiresNote: false, group: "Khách quan" },
  SCOPE_CHANGED: { label: "Yêu cầu bị thay đổi hoặc bổ sung", requiresNote: false, group: "Khách quan" },
  REASSIGNED_LATE: { label: "Được giao sát hạn", requiresNote: false, group: "Khách quan" },
  SCHEDULE_CHANGED: { label: "Lịch hoặc hạn hoàn thành bị thay đổi", requiresNote: false, group: "Khách quan" },
  TECHNICAL_ISSUE: { label: "Sự cố kỹ thuật", requiresNote: true, group: "Khách quan" },
  PERSONAL_EMERGENCY: { label: "Ốm đau hoặc việc cá nhân khẩn cấp", requiresNote: true, group: "Khách quan" },
  STARTED_LATE: { label: "Bắt đầu muộn", requiresNote: false, group: "Chủ quan" },
  UNDERESTIMATED: { label: "Ước lượng sai thời gian", requiresNote: false, group: "Chủ quan" },
  NO_PROGRESS: { label: "Chưa thực hiện", requiresNote: false, group: "Chủ quan" },
  OTHER: { label: "Khác", requiresNote: true, group: "Khác" },
};

export const VERIFICATION_CONFIG: Record<
  Verification,
  { label: string; colorClass: string }
> = {
  CONSISTENT: { label: "Khớp dữ liệu", colorClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  MISMATCH: { label: "Không khớp dữ liệu", colorClass: "bg-red-500/15 text-red-700 dark:text-red-300" },
  UNVERIFIABLE: { label: "Cần người kiểm tra minh chứng", colorClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
};

export const CLOSE_REASON_CONFIG: Record<CloseReason, string> = {
  LEADER_CONFIRMED: "Trưởng nhóm xác nhận",
  LECTURER_DECIDED: "Giảng viên quyết định",
  EXPLANATION_EXPIRED: "Hết hạn giải trình",
};

export function getStatusConfig(status: DelayCaseStatus | string) {
  return DELAY_CASE_STATUS_CONFIG[status as DelayCaseStatus] || { label: status, colorClass: "bg-muted text-muted-foreground" };
}

export function getCategoryConfig(category: DelayCauseCategory | string) {
  return DELAY_CAUSE_CATEGORY_CONFIG[category as DelayCauseCategory] || { label: category, requiresNote: false, group: "Khác" };
}

export function getVerificationConfig(verification: Verification | string) {
  return VERIFICATION_CONFIG[verification as Verification] || { label: verification, colorClass: "bg-muted text-muted-foreground" };
}

export function getCloseReasonLabel(reason: CloseReason | string) {
  return CLOSE_REASON_CONFIG[reason as CloseReason] || reason;
}
