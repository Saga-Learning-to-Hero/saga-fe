import { describe, it, expect } from "vitest";
import {
  isValidInternalActionUrl,
  getNotificationVisualConfig,
  formatRelativeTime,
  formatFullDateTime,
  formatVietnamShortDateTime,
  parseNotificationDate,
} from "./notification-utils";

describe("NotificationUtils", () => {
  describe("isValidInternalActionUrl", () => {
    it("UTCID01 - [N] Normal: URL noi bo hop le tra ve true", () => {
      expect(isValidInternalActionUrl("/student/dashboard")).toBe(true);
      expect(isValidInternalActionUrl("/lecturer/courses/123/dashboard")).toBe(true);
      expect(isValidInternalActionUrl("/admin/notifications")).toBe(true);
    });

    it("UTCID02 - [N] Normal: URL noi bo kem query parameters hop le tra ve true", () => {
      expect(isValidInternalActionUrl("/student/courses?status=active&tab=progress")).toBe(true);
    });

    it("UTCID03 - [A] Abnormal: URL null, undefined hoac chuoi rong tra ve false", () => {
      expect(isValidInternalActionUrl(null)).toBe(false);
      expect(isValidInternalActionUrl(undefined)).toBe(false);
      expect(isValidInternalActionUrl("")).toBe(false);
      expect(isValidInternalActionUrl("   ")).toBe(false);
    });

    it("UTCID04 - [A] Abnormal: URL bat dau bang // (protocol-relative) bi chan", () => {
      expect(isValidInternalActionUrl("//evil.com")).toBe(false);
      expect(isValidInternalActionUrl("//localhost:3000")).toBe(false);
    });

    it("UTCID05 - [A] Abnormal: URL chua protocol tuyet doi bi chan", () => {
      expect(isValidInternalActionUrl("https://example.com/student")).toBe(false);
      expect(isValidInternalActionUrl("http://evil.org")).toBe(false);
      expect(isValidInternalActionUrl("ftp://files.org/doc")).toBe(false);
    });

    it("UTCID06 - [A] Abnormal: URL chua javascript: bi chan", () => {
      expect(isValidInternalActionUrl("javascript:alert(1)")).toBe(false);
      expect(isValidInternalActionUrl("JAVASCRIPT:void(0)")).toBe(false);
    });

    it("UTCID07 - [B] Boundary: Root path / hop le", () => {
      expect(isValidInternalActionUrl("/")).toBe(true);
    });
  });

  describe("getNotificationVisualConfig", () => {
    it("UTCID08 - [N] Normal: Mapping day du 7 loai thong bao chuan", () => {
      const types = ["SYSTEM", "COURSE", "TEAM", "TASK", "ASSESSMENT", "WARNING", "INTEGRATION"] as const;
      for (const t of types) {
        const config = getNotificationVisualConfig(t);
        expect(config).toBeDefined();
        expect(config.icon).toBeDefined();
        expect(config.label).toBeTruthy();
        expect(config.badgeClassName).toBeTruthy();
      }
    });

    it("UTCID09 - [A] Abnormal: Unknown type tra ve visual fallback ma khong bi crash", () => {
      const configUnknown = getNotificationVisualConfig("RANDOM_UNKNOWN_TYPE");
      expect(configUnknown).toBeDefined();
      expect(configUnknown.label).toBe("Thông báo");

      const configEmpty = getNotificationVisualConfig("");
      expect(configEmpty).toBeDefined();
      expect(configEmpty.label).toBe("Thông báo");
    });
  });

  describe("formatRelativeTime & formatFullDateTime & formatVietnamShortDateTime", () => {
    it("UTCID10 - [N] Normal: Format thoi gian tuong doi theo cac moc", () => {
      const now = new Date();
      expect(formatRelativeTime(now.toISOString())).toBe("Vừa xong");

      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      expect(formatRelativeTime(fiveMinutesAgo.toISOString())).toBe("5 phút trước");

      const threeHoursAgo = new Date(now.getTime() - 3 * 3600 * 1000);
      expect(formatRelativeTime(threeHoursAgo.toISOString())).toBe("3 giờ trước");

      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 3600 * 1000);
      expect(formatRelativeTime(twoDaysAgo.toISOString())).toBe("2 ngày trước");
    });

    it("UTCID11 - [B] Boundary: Thoi gian khong hop le hoac trong tuong lai", () => {
      expect(formatRelativeTime("invalid-date")).toBe("Vừa xong");
      const futureDate = new Date(Date.now() + 100000);
      expect(formatRelativeTime(futureDate.toISOString())).toBe("Vừa xong");

      expect(formatFullDateTime("invalid-date")).toBe("");
      expect(formatVietnamShortDateTime("invalid-date")).toBe("");
      expect(parseNotificationDate("invalid-date").getTime()).toBeNaN();
    });

    it("UTCID12 - [N] Normal: Format gio Viet Nam Asia/Ho_Chi_Minh GMT+7 chinh xac", () => {
      // 03:30:00 UTC tuong duong 10:30:00 GMT+7 tai Viet Nam
      expect(formatFullDateTime("2026-09-16T03:30:00Z")).toBe("10:30:00 16/09/2026");
      expect(formatVietnamShortDateTime("2026-09-16T03:30:00Z")).toBe("10:30 16/09/2026");

      // Chuoi ISO co san offset +07:00
      expect(formatFullDateTime("2026-09-16T15:45:00+07:00")).toBe("15:45:00 16/09/2026");
      expect(formatVietnamShortDateTime("2026-09-16T15:45:00+07:00")).toBe("15:45 16/09/2026");
    });
  });
});
