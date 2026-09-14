import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import {
  cleanMemberName,
  getMemberDisplayName,
  calculateTotalSliceScore,
  hasPeerReviewAdjustment,
  groupWarningsByMember,
} from "./contribution-view-utils";
import type { ContributionMember } from "../types/contribution";

const mockMember = (overrides: Partial<ContributionMember> = {}): ContributionMember => ({
  studentProfileId: "prof-01",
  fullName: "Lê Hoàng Hải (K18 HCM)",
  studentCode: "SE183904",
  roleInTeam: "LEADER",
  sliceScore: 120.5,
  sliceContributionPercentage: 45.2,
  finalContributionPercentage: 45.2,
  peerReviewScore: 1.0,
  codeContributionPercentage: 50,
  testContributionPercentage: 40,
  documentContributionPercentage: 45,
  researchContributionPercentage: 0,
  taskContributionPercentage: 46,
  sprintBreakdowns: [],
  warnings: [],
  ...overrides,
});

describe("contribution-view-utils", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "14/09/2026",
      description: "cleanMemberName loai bo hau to trong ngoac don thanh cong",
    },
    () => {
      expect(cleanMemberName("Lê Hoàng Hải (K18 HCM)")).toBe("Lê Hoàng Hải");
      expect(cleanMemberName("Bùi Phan Nhật Minh (K17 HCM)")).toBe("Bùi Phan Nhật Minh");
      expect(cleanMemberName("Nguyễn Văn A")).toBe("Nguyễn Văn A");
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "B",
      executedDate: "14/09/2026",
      description: "cleanMemberName xu ly chuoi rong, null hoac undefined",
    },
    () => {
      expect(cleanMemberName("")).toBe("");
      expect(cleanMemberName(null)).toBe("");
      expect(cleanMemberName(undefined)).toBe("");
      expect(cleanMemberName("   (K18 HCM)   ")).toBe("");
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "14/09/2026",
      description: "getMemberDisplayName uu tien ten da lam sach roi fallback ma sinh vien",
    },
    () => {
      expect(getMemberDisplayName({ fullName: "Trần Bình (K18)", studentCode: "SE180001" })).toBe("Trần Bình");
      expect(getMemberDisplayName({ fullName: "", studentCode: "SE180002" })).toBe("SE180002");
      expect(getMemberDisplayName({})).toBe("Thành viên");
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "14/09/2026",
      description: "calculateTotalSliceScore tinh dung tong diem slice cua cac thanh vien",
    },
    () => {
      const members = [
        mockMember({ sliceScore: 100 }),
        mockMember({ sliceScore: 150.25 }),
        mockMember({ sliceScore: 49.75 }),
      ];
      expect(calculateTotalSliceScore(members)).toBe(300);
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "B",
      executedDate: "14/09/2026",
      description: "calculateTotalSliceScore tra ve 0 khi mang rong hoac gia tri null",
    },
    () => {
      expect(calculateTotalSliceScore([])).toBe(0);
      expect(calculateTotalSliceScore([mockMember({ sliceScore: null }), mockMember({ sliceScore: 0 })])).toBe(0);
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "A",
      executedDate: "14/09/2026",
      description: "calculateTotalSliceScore xu ly an toan khi truyen doi tuong khong phai mang",
    },
    () => {
      expect(calculateTotalSliceScore(null as unknown as ContributionMember[])).toBe(0);
      expect(calculateTotalSliceScore(undefined as unknown as ContributionMember[])).toBe(0);
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "N",
      executedDate: "14/09/2026",
      description: "hasPeerReviewAdjustment nhan dien khi co chenh lech peer review hoac ty le truoc sau",
    },
    () => {
      const noAdjust = [mockMember({ peerReviewScore: 1.0, sliceContributionPercentage: 50, finalContributionPercentage: 50 })];
      expect(hasPeerReviewAdjustment(noAdjust)).toBe(false);

      const withScoreAdjust = [mockMember({ peerReviewScore: 1.15, sliceContributionPercentage: 50, finalContributionPercentage: 57.5 })];
      expect(hasPeerReviewAdjustment(withScoreAdjust)).toBe(true);

      const withDiff = [mockMember({ peerReviewScore: 1.0, sliceContributionPercentage: 50, finalContributionPercentage: 48 })];
      expect(hasPeerReviewAdjustment(withDiff)).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "N",
      executedDate: "14/09/2026",
      description: "groupWarningsByMember gom dung danh sach canh bao va tao CTA tuong ung",
    },
    () => {
      const members = [
        mockMember({
          studentCode: "SE183904",
          fullName: "Lê Hoàng Hải (K18 HCM)",
          warnings: ["LOW_PEER_REVIEW_SCORE", "INSUFFICIENT_PEER_REVIEW"],
        }),
        mockMember({
          studentCode: "SE171186",
          fullName: "Bùi Phan Nhật Minh (K17 HCM)",
          warnings: ["NO_EVIDENCE_ATTACHED"],
        }),
        mockMember({
          studentCode: "SE170000",
          fullName: "Nguyễn Văn C",
          warnings: [],
        }),
      ];

      const grouped = groupWarningsByMember(members, "course-123");
      expect(grouped).toHaveLength(2);
      expect(grouped[0].fullName).toBe("Lê Hoàng Hải");
      expect(grouped[0].ctaType).toBe("PEER_REVIEW");
      expect(grouped[0].ctaHref).toBe("/student/assessment?courseId=course-123");

      expect(grouped[1].fullName).toBe("Bùi Phan Nhật Minh");
      expect(grouped[1].ctaType).toBe("TASK_EVIDENCE");
      expect(grouped[1].ctaHref).toBe("/student/sprint-progress?courseId=course-123");
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "B",
      executedDate: "14/09/2026",
      description: "groupWarningsByMember tra ve mang rong khi khong ai co canh bao hoac dau vao null",
    },
    () => {
      expect(groupWarningsByMember([])).toEqual([]);
      expect(groupWarningsByMember(null as unknown as ContributionMember[])).toEqual([]);
      expect(groupWarningsByMember([mockMember({ warnings: [] })])).toEqual([]);
    }
  );
});
