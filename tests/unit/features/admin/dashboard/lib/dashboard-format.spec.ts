import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import {
  formatDashboardDate,
  formatDashboardDateTime,
  formatDashboardPercent,
  getMissingServiceLabel,
  getSemesterStatusLabel,
} from "@/features/admin/dashboard/lib/dashboard-format";

describe("Admin dashboard formatting", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "20/09/2026",
      description: "Định dạng tỷ lệ phần trăm với tối đa một chữ số thập phân",
    },
    () => {
      expect(formatDashboardPercent(83.333)).toBe("83,3%");
      expect(formatDashboardPercent(100)).toBe("100%");
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "B",
      executedDate: "20/09/2026",
      description: "Hiển thị trạng thái rõ ràng khi tỷ lệ nullable chưa có dữ liệu",
    },
    () => {
      expect(formatDashboardPercent(null)).toBe("Chưa có dữ liệu");
      expect(formatDashboardPercent(Number.NaN)).toBe("Chưa có dữ liệu");
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "20/09/2026",
      description: "Định dạng date-only của học kỳ theo locale Việt Nam",
    },
    () => {
      expect(formatDashboardDate("2026-09-20")).toBe("20/09/2026");
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "B",
      executedDate: "20/09/2026",
      description: "Không crash khi timestamp pulse chưa được ghi nhận",
    },
    () => {
      expect(formatDashboardDateTime(null)).toBe("Chưa ghi nhận");
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "N",
      executedDate: "20/09/2026",
      description: "Ánh xạ đầy đủ ba period status của học kỳ",
    },
    () => {
      expect(getSemesterStatusLabel("UPCOMING")).toBe("Sắp diễn ra");
      expect(getSemesterStatusLabel("IN_PROGRESS")).toBe("Đang diễn ra");
      expect(getSemesterStatusLabel("COMPLETED")).toBe("Đã kết thúc");
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "N",
      executedDate: "20/09/2026",
      description: "Ánh xạ đầy đủ cảnh báo PROJECT, JIRA, GITHUB và BOTH",
    },
    () => {
      expect(getMissingServiceLabel("PROJECT")).toBe("Chưa tạo dự án");
      expect(getMissingServiceLabel("JIRA")).toBe("Thiếu Jira");
      expect(getMissingServiceLabel("GITHUB")).toBe("Thiếu GitHub");
      expect(getMissingServiceLabel("BOTH")).toBe("Thiếu Jira & GitHub");
    }
  );
});
