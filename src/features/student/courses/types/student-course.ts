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
  lecturer: LecturerInfo;
  studentsCount: number;
  studentCount?: number; // Tương thích ngược
  myGroup?: {
    id: string;
    name: string; // VD: Nhóm 01 - SAGA Team
    role: RoleInTeam;
    membersCount: number;
  };
  description?: string;
}
