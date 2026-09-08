import type { RoleInTeam } from "@/types/auth";

export type SemesterStatus = "ACTIVE" | "COMPLETED" | "UPCOMING";

export interface StudentSemester {
  id: string;
  code: string; // VD: FA26, SU26, SP26, FA25, SU25, SP25, FA24...
  name: string; // VD: Fall 2026, Summer 2026, Spring 2026
  status: SemesterStatus;
  totalCourses: number;
}

export type CourseStatus = "IN_PROGRESS" | "COMPLETED" | "UPCOMING" | "ACTIVE";

export interface LecturerInfo {
  id: string;
  fullName: string;
  name?: string;
  email: string;
  avatar?: string;
  title?: string; // VD: TS., ThS.
  lecturerCode?: string;
}

export interface StudentCourse {
  id: string;
  code: string; // VD: SWP490_FA26_SE1701
  subjectCode: string; // VD: SWP490
  subjectName: string; // VD: Đồ án Kỹ thuật phần mềm (Capstone Project)
  semesterCode: string; // VD: FA26
  semesterName: string; // VD: Fall 2026
  adminClassCode: string; // VD: SE1701
  adminClassName: string; // VD: Kỹ thuật phần mềm K17 - Lớp 01
  room?: string; // VD: AL-302
  schedule?: string; // VD: Thứ 2, 4 (Ca 2: 09:00 - 11:15)
  status: CourseStatus;
  lecturer?: LecturerInfo;
  studentsCount: number;
  studentCount?: number; // Tương thích ngược
  myGroup?: {
    id: string;
    name: string; // VD: Nhóm 01 - SAGA Team
    role: RoleInTeam;
    membersCount: number;
  };
  description?: string;
  courseId?: string;
  teamId?: string | null;
  teamNo?: number | null;
  teamName?: string | null;
  projectId?: string | null;
  enrollmentStatus?: string;
}

export interface StudentCourseResponse {
  courseId: string;
  courseCode: string;
  subjectCode: string;
  subjectName: string;
  classCode: string;
  semesterCode: string;
  semesterName: string;
  enrollmentStatus: "ACTIVE" | string;
  teamId: string | null;
  teamNo: number | null;
  teamName: string | null;
  projectId: string | null;
}

export type StudentCourseTeamStatus = "WAITING_TEAM" | "WAITING_PROJECT" | "PROJECT_READY";

export interface StudentTeamMember {
  studentCode: string;
  fullName: string;
  role: "LEADER" | "MEMBER" | string;
}

export interface StudentTeamResponse {
  teamId: string;
  teamNo: number;
  teamName: string;
  myRole: "LEADER" | "MEMBER" | string;
  projectId: string | null;
  members: StudentTeamMember[];
}

export function sortStudentTeamMembers(members: StudentTeamMember[]): StudentTeamMember[] {
  return [...members].sort((a, b) => {
    const roleRank = (role: string) => (role === "LEADER" ? 0 : 1);
    const rankDiff = roleRank(a.role) - roleRank(b.role);
    if (rankDiff !== 0) return rankDiff;
    return a.studentCode.localeCompare(b.studentCode, "vi");
  });
}

export function getStudentCourseTeamStatus(
  course: Pick<StudentCourseResponse, "teamId" | "projectId">
): StudentCourseTeamStatus {
  if (course.teamId === null || course.teamId === undefined) {
    return "WAITING_TEAM";
  }
  if (course.projectId === null || course.projectId === undefined) {
    return "WAITING_PROJECT";
  }
  return "PROJECT_READY";
}

export function mapStudentCourseResponse(course: StudentCourseResponse): StudentCourse {
  return {
    id: course.courseId,
    courseId: course.courseId,
    code: course.courseCode,
    subjectCode: course.subjectCode,
    subjectName: course.subjectName,
    semesterCode: course.semesterCode,
    semesterName: course.semesterName,
    adminClassCode: course.classCode,
    adminClassName: course.classCode,
    status: "ACTIVE",
    studentsCount: 0,
    teamId: course.teamId,
    teamNo: course.teamNo,
    teamName: course.teamName,
    projectId: course.projectId,
    enrollmentStatus: course.enrollmentStatus,
  };
}
