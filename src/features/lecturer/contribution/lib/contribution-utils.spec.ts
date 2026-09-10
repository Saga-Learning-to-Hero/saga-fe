import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import {
  areSliceWeightsEqual,
  canApplyProjectGroupMode,
  canEditProjectGroupWeights,
  canFetchContributionEvaluation,
  detectSliceWeightScale,
  isGroupWeightsNotConfigured,
  pickDefaultGradesTeamId,
  hasInvalidSliceWeight,
  isDisplayPercentSumValid,
  sumSliceWeights,
  toApiSliceWeights,
  toDisplaySliceWeights,
} from "./contribution-utils";

describe("contribution-utils", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "09/09/2026",
      description: "Tong 100 duoc nhan la don vi phan tram",
    },
    () => {
      const weights = { codeWeight: 40, testWeight: 20, documentWeight: 20, researchWeight: 20 };
      expect(detectSliceWeightScale(weights)).toBe(100);
      expect(isDisplayPercentSumValid(weights)).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "09/09/2026",
      description: "Tong 1.0 duoc nhan la ty le 0-1 va quy doi hien thi 100%",
    },
    () => {
      const weights = { codeWeight: 0.4, testWeight: 0.2, documentWeight: 0.2, researchWeight: 0.2 };
      expect(detectSliceWeightScale(weights)).toBe(1);
      expect(toDisplaySliceWeights(weights, 1)).toEqual({
        codeWeight: 40,
        testWeight: 20,
        documentWeight: 20,
        researchWeight: 20,
      });
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "A",
      executedDate: "09/09/2026",
      description: "Tong khac 100% khong hop le de luu",
    },
    () => {
      const weights = { codeWeight: 40, testWeight: 20, documentWeight: 20, researchWeight: 10 };
      expect(isDisplayPercentSumValid(weights)).toBe(false);
      expect(sumSliceWeights(weights)).toBe(90);
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "A",
      executedDate: "09/09/2026",
      description: "Gia tri am hoac NaN la trong so khong hop le",
    },
    () => {
      expect(
        hasInvalidSliceWeight({
          codeWeight: -1,
          testWeight: 50,
          documentWeight: 50,
          researchWeight: 1,
        })
      ).toBe(true);
      expect(
        hasInvalidSliceWeight({
          codeWeight: Number.NaN,
          testWeight: 25,
          documentWeight: 25,
          researchWeight: 50,
        })
      ).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "B",
      executedDate: "09/09/2026",
      description: "Quy doi nguoc tu hien thi phan tram ve ty le 0-1 khi luu",
    },
    () => {
      const display = { codeWeight: 25, testWeight: 25, documentWeight: 25, researchWeight: 25 };
      expect(toApiSliceWeights(display, 1)).toEqual({
        codeWeight: 0.25,
        testWeight: 0.25,
        documentWeight: 0.25,
        researchWeight: 0.25,
      });
      expect(areSliceWeightsEqual(display, display)).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "B",
      executedDate: "09/09/2026",
      description: "Tong 0 khong suy ra ty le 0-1, giu don vi phan tram",
    },
    () => {
      const weights = { codeWeight: 0, testWeight: 0, documentWeight: 0, researchWeight: 0 };
      expect(detectSliceWeightScale(weights)).toBe(100);
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "N",
      executedDate: "10/09/2026",
      description: "Cho phep luu trong so nhom khi da co projectId, ke ca luc lop dang COURSE",
    },
    () => {
      expect(canEditProjectGroupWeights("11111111-1111-1111-1111-111111111111")).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "B",
      executedDate: "10/09/2026",
      description: "Khong mo form luu khi thieu projectId",
    },
    () => {
      expect(canEditProjectGroupWeights(null)).toBe(false);
      expect(canEditProjectGroupWeights("")).toBe(false);
      expect(canEditProjectGroupWeights("   ")).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "N",
      executedDate: "10/09/2026",
      description: "Mo nut ap dung cau hinh rieng khi moi nhom co du an da configured",
    },
    () => {
      expect(
        canApplyProjectGroupMode([
          { projectId: "p1", configured: true },
          { projectId: "p2", configured: true },
          { projectId: null, configured: false },
        ])
      ).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID10",
      type: "A",
      executedDate: "10/09/2026",
      description: "Khoa ap dung khi con nhom co du an chua cau hinh",
    },
    () => {
      expect(
        canApplyProjectGroupMode([
          { projectId: "p1", configured: true },
          { projectId: "p2", configured: false },
        ])
      ).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID11",
      type: "B",
      executedDate: "10/09/2026",
      description: "Khong ap dung khi chua co nhom nao khoi tao du an",
    },
    () => {
      expect(canApplyProjectGroupMode([{ projectId: null, configured: false }])).toBe(false);
      expect(canApplyProjectGroupMode([])).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID12",
      type: "A",
      executedDate: "10/09/2026",
      description: "Khong goi API danh gia khi teamId khong thuoc danh sach nhom cua lop",
    },
    () => {
      expect(canFetchContributionEvaluation(true, "team-a", [{ teamId: "team-b" }])).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID13",
      type: "N",
      executedDate: "10/09/2026",
      description: "Chi enable evaluation khi teams da tai va tim thay teamId",
    },
    () => {
      expect(canFetchContributionEvaluation(true, "team-a", [{ teamId: "team-a" }])).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID14",
      type: "B",
      executedDate: "10/09/2026",
      description: "Khong enable evaluation khi teams chua tai xong hoac teamId rong",
    },
    () => {
      expect(canFetchContributionEvaluation(false, "team-a", [{ teamId: "team-a" }])).toBe(false);
      expect(canFetchContributionEvaluation(true, "", [{ teamId: "team-a" }])).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID15",
      type: "N",
      executedDate: "10/09/2026",
      description: "Mac dinh chon nhom hop le dau tien theo teamNo",
    },
    () => {
      expect(
        pickDefaultGradesTeamId([
          { teamId: "team-b", teamNo: 2 },
          { teamId: "team-a", teamNo: 1 },
        ])
      ).toBe("team-a");
    }
  );

  fptTest(
    {
      id: "UTCID16",
      type: "B",
      executedDate: "10/09/2026",
      description: "Danh sach nhom rong hoac thieu teamId khong chon mac dinh",
    },
    () => {
      expect(pickDefaultGradesTeamId([])).toBeNull();
      expect(pickDefaultGradesTeamId([{ teamId: "   ", teamNo: 1 }])).toBeNull();
    }
  );

  fptTest(
    {
      id: "UTCID17",
      type: "A",
      executedDate: "10/09/2026",
      description: "GET group-weights 404 duoc hieu la chua cau hinh",
    },
    () => {
      const error = new Error("Not found") as Error & { status?: number };
      error.status = 404;
      expect(isGroupWeightsNotConfigured(error)).toBe(true);
      expect(isGroupWeightsNotConfigured(new Error("Network"))).toBe(false);
    }
  );
});
