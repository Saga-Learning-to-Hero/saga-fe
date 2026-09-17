import {
  BellIcon,
  GraduationCapIcon,
  UsersIcon,
  ListTodoIcon,
  AwardIcon,
  AlertTriangleIcon,
  GitBranchIcon,
  type LucideIcon,
} from "lucide-react";
import type { NotificationType } from "../types/notification";

export function isValidInternalActionUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return false;
  if (trimmed.includes("://") || trimmed.toLowerCase().startsWith("javascript:")) return false;
  return true;
}

export function parseNotificationDate(dateInput: string | Date): Date {
  if (dateInput instanceof Date) return dateInput;
  if (!dateInput || typeof dateInput !== "string") return new Date(NaN);

  let cleanStr = dateInput.trim();
  // Nếu là ISO string có T nhưng không có timezone (Z hoặc offset), tự động thêm Z để coi là UTC
  if (cleanStr.includes("T") && !cleanStr.endsWith("Z") && !/[+-]\d{2}(:\d{2})?$/.test(cleanStr)) {
    cleanStr += "Z";
  }
  return new Date(cleanStr);
}

export function formatVietnamShortDateTime(dateInput: string | Date): string {
  const date = parseNotificationDate(dateInput);
  if (isNaN(date.getTime())) return "";

  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour12: false,
    }).formatToParts(date);

    const map: Record<string, string> = {};
    for (const part of parts) {
      map[part.type] = part.value;
    }

    return `${map.hour}:${map.minute} ${map.day}/${map.month}/${map.year}`;
  } catch {
    return "";
  }
}

export function formatFullDateTime(dateInput: string | Date): string {
  const date = parseNotificationDate(dateInput);
  if (isNaN(date.getTime())) return "";

  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour12: false,
    }).formatToParts(date);

    const map: Record<string, string> = {};
    for (const part of parts) {
      map[part.type] = part.value;
    }

    return `${map.hour}:${map.minute}:${map.second} ${map.day}/${map.month}/${map.year}`;
  } catch {
    return "";
  }
}

export function formatRelativeTime(dateInput: string | Date): string {
  const date = parseNotificationDate(dateInput);
  if (isNaN(date.getTime())) return "Vừa xong";

  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();

  if (isNaN(diffInMs) || diffInMs < 0) {
    return "Vừa xong";
  }

  const diffInSeconds = Math.floor(diffInMs / 1000);
  if (diffInSeconds < 60) {
    return "Vừa xong";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} ngày trước`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} tháng trước`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} năm trước`;
}

export interface NotificationVisualConfig {
  icon: LucideIcon;
  label: string;
  badgeClassName: string;
  iconBgClassName: string;
  iconColorClassName: string;
}

export function getNotificationVisualConfig(type: string): NotificationVisualConfig {
  const upper = (type || "").toUpperCase() as NotificationType;

  switch (upper) {
    case "SYSTEM":
      return {
        icon: BellIcon,
        label: "Hệ thống",
        badgeClassName: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
        iconBgClassName: "bg-blue-500/10 dark:bg-blue-500/20",
        iconColorClassName: "text-blue-600 dark:text-blue-400",
      };
    case "COURSE":
      return {
        icon: GraduationCapIcon,
        label: "Lớp học",
        badgeClassName: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        iconBgClassName: "bg-emerald-500/10 dark:bg-emerald-500/20",
        iconColorClassName: "text-emerald-600 dark:text-emerald-400",
      };
    case "TEAM":
      return {
        icon: UsersIcon,
        label: "Nhóm",
        badgeClassName: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30",
        iconBgClassName: "bg-violet-500/10 dark:bg-violet-500/20",
        iconColorClassName: "text-violet-600 dark:text-violet-400",
      };
    case "TASK":
      return {
        icon: ListTodoIcon,
        label: "Công việc",
        badgeClassName: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
        iconBgClassName: "bg-amber-500/10 dark:bg-amber-500/20",
        iconColorClassName: "text-amber-600 dark:text-amber-400",
      };
    case "ASSESSMENT":
      return {
        icon: AwardIcon,
        label: "Đánh giá",
        badgeClassName: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30",
        iconBgClassName: "bg-sky-500/10 dark:bg-sky-500/20",
        iconColorClassName: "text-sky-600 dark:text-sky-400",
      };
    case "WARNING":
      return {
        icon: AlertTriangleIcon,
        label: "Cảnh báo",
        badgeClassName: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
        iconBgClassName: "bg-red-500/10 dark:bg-red-500/20",
        iconColorClassName: "text-red-600 dark:text-red-400",
      };
    case "INTEGRATION":
      return {
        icon: GitBranchIcon,
        label: "Tích hợp",
        badgeClassName: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
        iconBgClassName: "bg-purple-500/10 dark:bg-purple-500/20",
        iconColorClassName: "text-purple-600 dark:text-purple-400",
      };
    default:
      return {
        icon: BellIcon,
        label: "Thông báo",
        badgeClassName: "bg-muted text-muted-foreground border-border",
        iconBgClassName: "bg-muted",
        iconColorClassName: "text-muted-foreground",
      };
  }
}
