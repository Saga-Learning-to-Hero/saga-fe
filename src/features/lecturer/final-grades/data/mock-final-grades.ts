import type { FinalGradebook } from "../types/final-grades";
import type { LecturerCourse } from "../../courses/types/course";

export function createMockGradebook(course: LecturerCourse): FinalGradebook {
  return {
    courseId: course.id,
    status: "DRAFT",
    version: 1,
    updatedAt: new Date(Date.now() - 5 * 60000).toISOString(),
  updatedBy: "Nguyễn Mạnh Cường",
  components: [
    { id: "process", name: "Quá trình", shortName: "QT", weight: 20, source: "MANUAL", editable: true, minScore: 0, maxScore: 10, order: 1 },
    { id: "sprint", name: "Điểm Sprint", shortName: "SP", weight: 20, source: "SYSTEM", editable: false, minScore: 0, maxScore: 10, order: 2 },
    { id: "project", name: "Đồ án nhóm", shortName: "ĐA", weight: 30, source: "MANUAL", editable: true, minScore: 0, maxScore: 10, order: 3 },
    { id: "contribution", name: "Đóng góp", shortName: "ĐG", weight: 15, source: "SYSTEM", editable: false, minScore: 0, maxScore: 10, order: 4 },
    { id: "defense", name: "Bảo vệ", shortName: "BV", weight: 15, source: "MANUAL", editable: true, minScore: 0, maxScore: 10, order: 5 },
  ],
  summary: {
    averageScore: 7.63,
    passCount: 9,
    failCount: 2,
    missingGradesCount: 1,
    totalStudents: 12,
  },
  students: [
    {
      studentId: "u_2",
      studentCode: "HE170504",
      fullName: "Đinh Công Tú",
      email: "tudche170504@fpt.edu.vn",
      groupId: "g_1",
      groupName: "Nhóm 01",
      componentScores: [
        { componentId: "process", score: 8.0 },
        { componentId: "sprint", score: 8.5 },
        { componentId: "project", score: 8.2 },
        { componentId: "contribution", score: 9.0 },
        { componentId: "defense", score: 8.0 },
      ],
      calculatedScore: 8.31,
      finalScore: 8.31,
      status: "COMPLETE",
    },
    {
      studentId: "u_3",
      studentCode: "HE170505",
      fullName: "Trần Thị B",
      email: "tb@fpt.edu.vn",
      groupId: "g_1",
      groupName: "Nhóm 01",
      componentScores: [
        { componentId: "process", score: 7.0 },
        { componentId: "sprint", score: 7.5 },
        { componentId: "project", score: 8.2 },
        { componentId: "contribution", score: null }, // Missing contribution
        { componentId: "defense", score: 7.5 },
      ],
      calculatedScore: null,
      finalScore: null,
      status: "INCOMPLETE",
    },
    {
      studentId: "u_4",
      studentCode: "HE170506",
      fullName: "Nguyễn Văn C",
      email: "vc@fpt.edu.vn",
      groupId: "g_2",
      groupName: "Nhóm 02",
      componentScores: [
        { componentId: "process", score: 4.0 },
        { componentId: "sprint", score: 5.0 },
        { componentId: "project", score: 5.5 },
        { componentId: "contribution", score: 4.5 },
        { componentId: "defense", score: 4.0 },
      ],
      calculatedScore: 4.73,
      finalScore: 4.73,
      status: "FAILED",
    },
    {
      studentId: "u_5",
      studentCode: "HE170507",
      fullName: "Lê Hoàng D",
      email: "ld@fpt.edu.vn",
      groupId: "g_2",
      groupName: "Nhóm 02",
      componentScores: [
        { componentId: "process", score: 9.0 },
        { componentId: "sprint", score: 8.0 },
        { componentId: "project", score: 8.5 },
        { componentId: "contribution", score: 8.0 },
        { componentId: "defense", score: 8.5 },
      ],
      calculatedScore: 8.43,
      finalScore: 8.5, // Manually adjusted
      status: "MANUALLY_ADJUSTED",
    },
    {
      studentId: "u_6",
      studentCode: "HE170508",
      fullName: "Phạm Hữu E",
      email: "pe@fpt.edu.vn",
      groupId: null, // No group
      groupName: null,
      componentScores: [
        { componentId: "process", score: 6.0 },
        { componentId: "sprint", score: 0 },
        { componentId: "project", score: 0 },
        { componentId: "contribution", score: 0 },
        { componentId: "defense", score: 0 },
      ],
      calculatedScore: 1.2,
      finalScore: 1.2,
      status: "FAILED",
    }
  ],
  };
}
