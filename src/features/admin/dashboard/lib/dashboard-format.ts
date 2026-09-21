import type {
  AdminDashboardMissingService,
  SemesterPeriodStatus,
} from "../types/dashboard";

const DATE_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDashboardPercent(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "Chưa có dữ liệu";
  return `${new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 1,
  }).format(value)}%`;
}

export function formatDashboardDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : DATE_FORMATTER.format(date);
}

export function formatDashboardDateTime(value: string | null): string {
  if (!value) return "Chưa ghi nhận";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : DATE_TIME_FORMATTER.format(date);
}

export function getSemesterStatusLabel(status: SemesterPeriodStatus): string {
  switch (status) {
    case "IN_PROGRESS":
      return "Đang diễn ra";
    case "COMPLETED":
      return "Đã kết thúc";
    case "UPCOMING":
      return "Sắp diễn ra";
  }
}

export function getMissingServiceLabel(
  service: AdminDashboardMissingService
): string {
  switch (service) {
    case "PROJECT":
      return "Chưa tạo dự án";
    case "JIRA":
      return "Thiếu Jira";
    case "GITHUB":
      return "Thiếu GitHub";
    case "BOTH":
      return "Thiếu Jira & GitHub";
  }
}
