import type { ContributionWeights } from "../types/course-weight-config";

export interface WeightPreset {
  id: string;
  name: string;
  description: string;
  weights: ContributionWeights;
}

export const WEIGHT_PRESETS: WeightPreset[] = [
  {
    id: "balanced",
    name: "Cân bằng",
    description: "Chia đều cho 4 tiêu chí",
    weights: {
      CODE: 25,
      TEST: 25,
      DOCUMENT: 25,
      RESEARCH: 25,
    },
  },
  {
    id: "dev-heavy",
    name: "Thiên về code",
    description: "Phù hợp cho dự án nhiều tính năng kỹ thuật",
    weights: {
      CODE: 45,
      TEST: 25,
      DOCUMENT: 20,
      RESEARCH: 10,
    },
  },
  {
    id: "research-heavy",
    name: "Thiên về nghiên cứu",
    description: "Dành cho dự án cần phân tích, thiết kế, tìm hiểu công nghệ mới",
    weights: {
      CODE: 25,
      TEST: 15,
      DOCUMENT: 20,
      RESEARCH: 40,
    },
  },
  {
    id: "quality-focused",
    name: "Thiên về chất lượng",
    description: "Tập trung đảm bảo chất lượng, nhiều test case và QA",
    weights: {
      CODE: 30,
      TEST: 40,
      DOCUMENT: 20,
      RESEARCH: 10,
    },
  },
];
