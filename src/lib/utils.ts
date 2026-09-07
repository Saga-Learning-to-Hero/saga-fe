import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Định dạng thời gian chuẩn múi giờ Việt Nam (UTC+7, Asia/Ho_Chi_Minh)
 * Tự động đảm bảo +7 tiếng ngay cả khi chuỗi ISO từ backend thiếu hậu tố 'Z'
 * Kết quả: HH:mm:ss dd/MM/yyyy
 */
export function formatVietnamDateTime(isoString?: string | null): string {
  if (!isoString) return "Chưa có";
  try {
    let cleanStr = isoString.trim();
    // Nếu chuỗi thời gian chưa có timezone offset (Z hoặc +07:00), coi là UTC và gán Z
    if (cleanStr.includes("T") && !cleanStr.endsWith("Z") && !/[+-]\d{2}(:\d{2})?$/.test(cleanStr)) {
      cleanStr += "Z";
    }

    const date = new Date(cleanStr);
    if (isNaN(date.getTime())) return "Chưa có";

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
    return "Chưa có";
  }
}

/**
 * Định dạng ngày theo định dạng dd/MM/yyyy chuẩn Việt Nam (UTC+7)
 */
export function formatVietnamDate(isoString?: string | null): string {
  if (!isoString) return "Chưa có";
  try {
    let cleanStr = isoString.trim();
    if (cleanStr.includes("T") && !cleanStr.endsWith("Z") && !/[+-]\d{2}(:\d{2})?$/.test(cleanStr)) {
      cleanStr += "Z";
    }

    const date = new Date(cleanStr);
    if (isNaN(date.getTime())) return "Chưa có";

    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Ho_Chi_Minh",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).formatToParts(date);

    const map: Record<string, string> = {};
    for (const part of parts) {
      map[part.type] = part.value;
    }

    return `${map.day}/${map.month}/${map.year}`;
  } catch {
    return "Chưa có";
  }
}
