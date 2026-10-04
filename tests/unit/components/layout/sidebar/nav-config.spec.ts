import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import { getStudentNavItems, getLecturerNavItems } from "@/components/layout/sidebar/nav-config";

describe("navigation config", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "01/10/2026",
      description: "Tab Danh gia cheo cua sinh vien khong hien badge Sap mo ghi cung",
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

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "04/10/2026",
      description: "getLecturerNavItems bao gom tab Danh gia cheo (course-peer-reviews)",
    },
    () => {
      const items = getLecturerNavItems("course-123");
      const peerReviewItem = items.find((item) => item.id === "course-peer-reviews");

      expect(peerReviewItem).toBeDefined();
      expect(peerReviewItem).toMatchObject({
        id: "course-peer-reviews",
        title: "Đánh giá chéo",
        href: "/lecturer/courses/course-123/peer-reviews",
        icon: "UserCheck",
        match: "prefix",
      });
    }
  );
});
