import type {
  ContributionConfigMode,
  ContributionSliceWeightValues,
} from "../types/contribution";

export type SliceWeightScale = 1 | 100;

export const SLICE_WEIGHT_FIELDS = [
  "codeWeight",
  "testWeight",
  "documentWeight",
  "researchWeight",
] as const;

export type SliceWeightField = (typeof SLICE_WEIGHT_FIELDS)[number];

export const SLICE_WEIGHT_LABELS: Record<SliceWeightField, { title: string; description: string }> = {
  codeWeight: {
    title: "Phát triển",
    description: "Đóng góp mã nguồn và phát triển tính năng",
  },
  testWeight: {
    title: "Kiểm thử",
    description: "Đóng góp kiểm thử và đảm bảo chất lượng",
  },
  documentWeight: {
    title: "Tài liệu",
    description: "Đóng góp tài liệu kỹ thuật và hướng dẫn",
  },
  researchWeight: {
    title: "Nghiên cứu",
    description: "Đóng góp khảo sát, nghiên cứu và thử nghiệm",
  },
};

const PERCENT_SUM = 100;
const RATIO_SUM = 1;
const PERCENT_EPSILON = 0.01;
const RATIO_EPSILON = 0.0001;

export function sumSliceWeights(weights: ContributionSliceWeightValues): number {
  return (
    weights.codeWeight + weights.testWeight + weights.documentWeight + weights.researchWeight
  );
}

export function detectSliceWeightScale(weights: ContributionSliceWeightValues): SliceWeightScale {
  const total = sumSliceWeights(weights);
  if (total > 0 && total <= RATIO_SUM + RATIO_EPSILON) return 1;
  return 100;
}

export function toDisplaySliceWeights(
  weights: ContributionSliceWeightValues,
  scale: SliceWeightScale
): ContributionSliceWeightValues {
  if (scale === 100) return { ...weights };
  return {
    codeWeight: roundDisplay(weights.codeWeight * PERCENT_SUM),
    testWeight: roundDisplay(weights.testWeight * PERCENT_SUM),
    documentWeight: roundDisplay(weights.documentWeight * PERCENT_SUM),
    researchWeight: roundDisplay(weights.researchWeight * PERCENT_SUM),
  };
}

export function toApiSliceWeights(
  displayWeights: ContributionSliceWeightValues,
  scale: SliceWeightScale
): ContributionSliceWeightValues {
  if (scale === 100) {
    return {
      codeWeight: displayWeights.codeWeight,
      testWeight: displayWeights.testWeight,
      documentWeight: displayWeights.documentWeight,
      researchWeight: displayWeights.researchWeight,
    };
  }
  return {
    codeWeight: displayWeights.codeWeight / PERCENT_SUM,
    testWeight: displayWeights.testWeight / PERCENT_SUM,
    documentWeight: displayWeights.documentWeight / PERCENT_SUM,
    researchWeight: displayWeights.researchWeight / PERCENT_SUM,
  };
}

export function isDisplayPercentSumValid(weights: ContributionSliceWeightValues): boolean {
  return Math.abs(sumSliceWeights(weights) - PERCENT_SUM) <= PERCENT_EPSILON;
}

export function areSliceWeightsEqual(
  left: ContributionSliceWeightValues,
  right: ContributionSliceWeightValues
): boolean {
  return SLICE_WEIGHT_FIELDS.every((field) => left[field] === right[field]);
}

export function hasInvalidSliceWeight(weights: ContributionSliceWeightValues): boolean {
  return SLICE_WEIGHT_FIELDS.some((field) => {
    const value = weights[field];
    return !Number.isFinite(value) || value < 0;
  });
}

export function canEditProjectGroupWeights(
  mode: ContributionConfigMode,
  projectId: string | null | undefined
): boolean {
  return mode === "PROJECT_GROUP" && Boolean(projectId && projectId.trim());
}

export function contributionModeLabel(mode: ContributionConfigMode): string {
  return mode === "PROJECT_GROUP" ? "Thiết lập riêng theo từng dự án nhóm" : "Dùng chung cho cả lớp";
}

export function contributionRoleLabel(role: string): string {
  if (role === "LEADER") return "Trưởng nhóm";
  if (role === "MENTOR") return "Cố vấn";
  return "Thành viên";
}

export function formatContributionNumber(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2);
}

export function formatContributionPercent(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${formatContributionNumber(value)}%`;
}

function roundDisplay(value: number): number {
  return Math.round(value * 100) / 100;
}
