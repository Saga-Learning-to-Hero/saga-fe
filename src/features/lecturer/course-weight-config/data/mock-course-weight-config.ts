import type { CourseWeightConfiguration } from "../types/course-weight-config";

export interface TeamMock {
  id: string;
  name: string;
  projectName: string;
  memberCount: number;
}

export const MOCK_TEAMS: TeamMock[] = [
  { id: "g1", name: "Nhóm 01", projectName: "Hệ thống quản lý thư viện", memberCount: 5 },
  { id: "g2", name: "Nhóm 02", projectName: "Mobile Banking App", memberCount: 4 },
  { id: "g3", name: "Nhóm 03", projectName: "E-Commerce Platform", memberCount: 6 },
  { id: "g4", name: "Nhóm 04", projectName: "AI Face Recognition", memberCount: 4 },
  { id: "g5", name: "Nhóm 05", projectName: "IoT Smart Home", memberCount: 5 },
  { id: "g6", name: "Nhóm 06", projectName: "Blockchain Voting", memberCount: 4 },
  { id: "g7", name: "Nhóm 07", projectName: "Healthcare Portal", memberCount: 5 },
  { id: "g8", name: "Nhóm 08", projectName: "EduTech Platform", memberCount: 5 },
];
export function getMockTeamsByCourseId(courseId: string): TeamMock[] {
  if (courseId === "prn212-01") {
    return MOCK_TEAMS;
  }
  
  // Generate random number of teams between 5 and 9 based on courseId string
  const charCodeSum = courseId.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const teamCount = (charCodeSum % 5) + 5; 
  
  return Array.from({ length: teamCount }).map((_, i) => ({
    id: `c_${courseId}_t${i + 1}`,
    name: `Nhóm 0${i + 1}`,
    projectName: `Project ${courseId.toUpperCase()} ${i + 1}`,
    memberCount: (charCodeSum % 3) + 4,
  }));
}

export const MOCK_COURSE_WEIGHT_CONFIG: CourseWeightConfiguration = {
  courseId: "prn212-01",
  classWeights: {
    CODE: 40,
    TEST: 20,
    DOCUMENT: 20,
    RESEARCH: 20,
  },
  teamOverrides: {
    g2: {
      teamId: "g2",
      weights: {
        CODE: 50,
        TEST: 25,
        DOCUMENT: 15,
        RESEARCH: 10,
      },
      updatedAt: "2026-08-29T10:00:00.000Z",
      updatedBy: "Nguyễn Mạnh Cường",
    },
    g5: {
      teamId: "g5",
      weights: {
        CODE: 30,
        TEST: 30,
        DOCUMENT: 15,
        RESEARCH: 25,
      },
      updatedAt: "2026-08-29T11:30:00.000Z",
      updatedBy: "Nguyễn Mạnh Cường",
    },
  },
  updatedAt: "2026-08-28T08:00:00.000Z",
  updatedBy: "Hệ thống",
};

export function createMockCourseWeightConfig(courseId: string): CourseWeightConfiguration {
  if (courseId !== "prn212-01") {
    return {
      courseId,
      classWeights: {
        CODE: 25,
        TEST: 25,
        DOCUMENT: 25,
        RESEARCH: 25,
      },
      teamOverrides: {},
      updatedAt: new Date().toISOString(),
      updatedBy: "Hệ thống",
    };
  }
  return MOCK_COURSE_WEIGHT_CONFIG;
}
