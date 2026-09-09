import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import {
  areSliceWeightsEqual,
  canEditProjectGroupWeights,
  detectSliceWeightScale,
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
      executedDate: "09/09/2026",
      description: "Chi cho phep PUT group-weights khi mode PROJECT_GROUP va co projectId",
    },
    () => {
      expect(canEditProjectGroupWeights("PROJECT_GROUP", "11111111-1111-1111-1111-111111111111")).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "B",
      executedDate: "09/09/2026",
      description: "Khong mo form luu khi mode COURSE hoac thieu projectId",
    },
    () => {
      expect(canEditProjectGroupWeights("COURSE", "11111111-1111-1111-1111-111111111111")).toBe(false);
      expect(canEditProjectGroupWeights("PROJECT_GROUP", null)).toBe(false);
      expect(canEditProjectGroupWeights("PROJECT_GROUP", "")).toBe(false);
    }
  );
});
