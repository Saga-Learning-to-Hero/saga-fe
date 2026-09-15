import type { ProjectSprintResponse } from "@/features/student/sprint-progress/types/jira-task-types";

export const PEER_REVIEW_WINDOW_MS = 48 * 60 * 60 * 1000;

function asTime(value?: string | null): number | null {
  if (!value || !value.trim()) return null;
  const time = Date.parse(value);
  return Number.isNaN(time) ? null : time;
}

export function isSprintClosed(sprint: Pick<ProjectSprintResponse, "state">): boolean {
  return (sprint.state || "").trim().toLowerCase() === "closed";
}

/** Mốc mở form: 48 giờ trước endDate. Thiếu/sai endDate thì không có mốc. */
export function getPeerReviewWindowStart(sprint: Pick<ProjectSprintResponse, "endDate">): number | null {
  const end = asTime(sprint.endDate);
  if (end === null) return null;
  return end - PEER_REVIEW_WINDOW_MS;
}

/**
 * Sprint được chấm khi đã closed, hoặc từ mốc endDate - 48h trở đi.
 * Giữ mở sau endDate nếu Jira chưa kịp chuyển sang closed.
 * Không có endDate hợp lệ thì chỉ closed mới mở.
 */
export function isPeerReviewWindowOpen(
  sprint: Pick<ProjectSprintResponse, "state" | "endDate">,
  now = Date.now()
): boolean {
  if (isSprintClosed(sprint)) return true;
  const start = getPeerReviewWindowStart(sprint);
  if (start === null) return false;
  return now >= start;
}

export function pickDefaultPeerReviewSprintId(
  sprints: ProjectSprintResponse[],
  now = Date.now()
): string | null {
  const eligible = sprints.filter((sprint) => isPeerReviewWindowOpen(sprint, now));
  const active = eligible.filter((sprint) => (sprint.state || "").trim().toLowerCase() === "active");
  if (active.length > 0) {
    return [...active].sort((a, b) => (asTime(b.endDate) || 0) - (asTime(a.endDate) || 0))[0]?.id || null;
  }
  const closed = eligible.filter(isSprintClosed);
  if (closed.length > 0) {
    return [...closed].sort((a, b) => {
      const timeA = asTime(a.completeDate) || asTime(a.endDate) || 0;
      const timeB = asTime(b.completeDate) || asTime(b.endDate) || 0;
      return timeB - timeA;
    })[0]?.id || null;
  }
  return eligible[0]?.id || null;
}

export function formatSprintStateLabel(state?: string | null): string {
  const value = (state || "").trim().toLowerCase();
  if (value === "closed") return "Đã đóng";
  if (value === "active") return "Đang diễn ra";
  if (value === "future") return "Kế hoạch";
  return state?.trim() || "Không rõ";
}

export function formatPeerReviewOpenAt(sprint: Pick<ProjectSprintResponse, "endDate">): string | null {
  const start = getPeerReviewWindowStart(sprint);
  if (start === null) return null;
  return new Date(start).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
