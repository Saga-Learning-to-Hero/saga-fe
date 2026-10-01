import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import { getStudentNavItems } from "@/components/layout/sidebar/nav-config";

describe("student navigation config", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "01/10/2026",
      description: "Tab Danh gia cheo khong hien badge Sap mo ghi cung",
    },
    () => {
      const assessmentItem = getStudentNavItems().find(
        (item) => item.id === "student-assessment"
      );

      expect(assessmentItem).toMatchObject({
        title: "Đánh giá chéo",
        href: "/student/assessment",
        icon: "UserCheck",
        match: "exact",
      });
      expect(assessmentItem?.badge).toBeUndefined();
    }
  );
});
