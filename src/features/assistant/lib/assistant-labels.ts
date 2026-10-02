import type { AssistantKeySource } from "../types/project-assistant";

export function assistantKeySourceLabel(source: AssistantKeySource): string | null {
  if (source === "COURSE") return "Dùng cấu hình AI của lớp";
  if (source === "PLATFORM") return "Dùng AI của hệ thống";
  if (source === "UNAVAILABLE") return "Tóm tắt tự động";
  return null;
}

export function formatAssistantTime(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });
}

export function formatAssistantQuota(remaining: number | null, limit: number | null): string | null {
  if (remaining == null || limit == null) return null;
  return `${remaining}/${limit} lượt hôm nay`;
}
