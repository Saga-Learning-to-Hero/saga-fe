import type { ContributionWeights } from "../types/course-weight-config";


export function getTotalWeight(weights: ContributionWeights): number {
  return weights.CODE + weights.TEST + weights.DOCUMENT + weights.RESEARCH;
}

export function isWeightValid(weights: ContributionWeights): boolean {
  return getTotalWeight(weights) === 100 && 
    Object.values(weights).every((v) => !isNaN(v) && v >= 0 && v <= 100);
}
