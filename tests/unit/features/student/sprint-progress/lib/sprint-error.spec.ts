import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import { getSprintOverlapErrorMessage } from "@/features/student/sprint-progress/lib/sprint-error";

describe("sprint-error helper", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "30/09/2026",
      description: "Tra ve thong bao chi tiet khi gap loi SPRINT_PERIOD_OVERLAP co details",
    },
    () => {
      const error = {
        response: {
          status: 409,
          data: {
            code: "SPRINT_PERIOD_OVERLAP",
            details: {
              overlappingSprintName: "Sprint 1 - SRS & Architecture",
              siteName: "jira-dev",
              startDate: "2026-09-01",
              endDate: "2026-09-14",
            },
          },
        },
      };

      const result = getSprintOverlapErrorMessage(error);
      expect(result).toBe(
        'Không thể thực hiện: Thời gian Sprint bị trùng lặp với "Sprint 1 - SRS & Architecture" tại workspace/site "jira-dev" (từ 2026-09-01 đến 2026-09-14). Mỗi giai đoạn dự án chỉ được phép có duy nhất một Sprint hoạt động.'
      );
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "30/09/2026",
      description: "Tra ve message tu backend khi khong co details",
    },
    () => {
      const error = {
        response: {
          status: 409,
          data: {
            code: "SPRINT_PERIOD_OVERLAP",
            message: "Sprint period overlaps with existing sprint.",
          },
        },
      };

      const result = getSprintOverlapErrorMessage(error);
      expect(result).toBe("Sprint period overlaps with existing sprint.");
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "B",
      executedDate: "30/09/2026",
      description: "Tra ve fallback message khi gap status 409 khong co data message",
    },
    () => {
      const error = {
        response: {
          status: 409,
          data: {},
        },
      };

      const result = getSprintOverlapErrorMessage(error);
      expect(result).toContain("Mỗi giai đoạn chỉ được phép có duy nhất một Sprint hoạt động.");
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "A",
      executedDate: "30/09/2026",
      description: "Tra ve null khi khong phai loi SPRINT_PERIOD_OVERLAP",
    },
    () => {
      const error = {
        response: {
          status: 500,
          data: {
            code: "INTERNAL_ERROR",
          },
        },
      };

      expect(getSprintOverlapErrorMessage(error)).toBeNull();
      expect(getSprintOverlapErrorMessage(null)).toBeNull();
      expect(getSprintOverlapErrorMessage(undefined)).toBeNull();
    }
  );
});
