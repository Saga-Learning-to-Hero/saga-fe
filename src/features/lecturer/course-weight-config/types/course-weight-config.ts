export type ContributionCriterion = "CODE" | "TEST" | "DOCUMENT" | "RESEARCH";

export interface ContributionWeights {
  CODE: number;
  TEST: number;
  DOCUMENT: number;
  RESEARCH: number;
}

export type WeightApplicationMode = "CLASS_WIDE" | "PER_TEAM";

export interface TeamWeightConfiguration {
  teamId: string;
  weights: ContributionWeights;
  updatedAt: string;
  updatedBy: string;
}

export interface CourseWeightConfiguration {
  courseId: string;
  applicationMode: WeightApplicationMode;
  classWeights: ContributionWeights;
  teamWeights: Record<string, TeamWeightConfiguration>;
  updatedAt: string;
  updatedBy: string;
}

export function getEffectiveWeights(
  config: CourseWeightConfiguration,
  teamId: string,
): ContributionWeights | undefined {
  if (config.applicationMode === "CLASS_WIDE") {
    return config.classWeights;
  }
  return config.teamWeights[teamId]?.weights;
}
