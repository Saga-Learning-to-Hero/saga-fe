import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import { getSprintOverlapErrorMessage } from "@/features/student/sprint-progress/lib/sprint-error";

describe("sprint-error helper", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "30/09/2026",
      description: "Tra ve thong bao chi tiet khi gap loi SPRINT_PERIOD_OVERLAP co conflicting details",
    },
    () => {
      const error = {
        response: {
          status: 409,
          data: {
            code: "SPRINT_PERIOD_OVERLAP",
            details: {
              conflictingSprintName: "Sprint 1 - SRS & Architecture",
              conflictingSiteName: "jira-dev",
              conflictingStartDate: "2026-09-01",
              conflictingEndDate: "2026-09-14",
            },
          },
        },
      };

      const result = getSprintOverlapErrorMessage(error);
      expect(result).toBe(
        "Trùng thời gian với sprint Sprint 1 - SRS & Architecture của site jira-dev (từ 2026-09-01 tới 2026-09-14). Hãy chọn ngày bắt đầu từ ngày sprint đó kết thúc trở đi."
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
      expect(result).toBe(
        "Trùng thời gian với một sprint khác trong dự án. Hãy chọn ngày bắt đầu từ ngày sprint đó kết thúc trở đi."
      );
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
