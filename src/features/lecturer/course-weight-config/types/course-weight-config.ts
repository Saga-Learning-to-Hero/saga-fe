export type ContributionCriterion = "CODE" | "TEST" | "DOCUMENT" | "RESEARCH";

export interface ContributionWeights {
  CODE: number;
  TEST: number;
  DOCUMENT: number;
  RESEARCH: number;
}

export interface TeamWeightConfiguration {
  teamId: string;
  weights: ContributionWeights;
  updatedAt: string;
  updatedBy: string;
}

export interface CourseWeightConfiguration {
  courseId: string;
  classWeights: ContributionWeights;
  teamOverrides: Record<string, TeamWeightConfiguration>;
  updatedAt: string;
  updatedBy: string;
}

export function getEffectiveWeights(
  config: CourseWeightConfiguration,
  teamId: string,
): ContributionWeights {
  return config.teamOverrides[teamId]?.weights ?? config.classWeights;
}

