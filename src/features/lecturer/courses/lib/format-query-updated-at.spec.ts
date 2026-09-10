import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import { formatQueryUpdatedAt } from "./format-query-updated-at";

describe("formatQueryUpdatedAt", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "10/09/2026",
      description: "Lay moc thoi gian moi nhat de hien thi Cap nhat luc",
    },
    () => {
      const latest = Date.parse("2026-09-10T10:15:00");
      const label = formatQueryUpdatedAt([Date.parse("2026-09-10T09:00:00"), latest]);
      expect(label).toBe(
        new Date(latest).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
      );
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "A",
      executedDate: "10/09/2026",
      description: "Bo qua moc thoi gian rong hoac 0",
    },
    () => {
      expect(formatQueryUpdatedAt([undefined, 0])).toBeNull();
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "B",
      executedDate: "10/09/2026",
      description: "Mang rong khong tao nhan thoi gian",
    },
    () => {
      expect(formatQueryUpdatedAt([])).toBeNull();
    }
  );
});
