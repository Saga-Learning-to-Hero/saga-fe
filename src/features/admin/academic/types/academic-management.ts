export interface AssessmentItem {
  id: string;
  category: "PE" | "FE" | "Assignment" | "Quiz" | "Project" | "Presentation" | "Other";
  name: string;
  weight: number; // e.g. 20 for 20%
  description?: string;
}

export interface Subject {
  id: string;
  code: string; // VD: SWP490, PRM392
  name: string; // VD: Đồ án Kỹ thuật phần mềm (Capstone)
  credits: number; // VD: 3, 4, 10
  department: string; // VD: Kỹ thuật phần mềm, Trí tuệ nhân tạo
  description?: string;
  totalCourses: number;
  // FLM Specific Fields
  degreeLevel?: "University" | "College" | "Master";
  timeAllocation?: string; // VD: "30 slots (45h)"
  preRequisites?: string; // VD: "PRJ301, DBI202"
  studentTasks?: string;
  tools?: string;
  scoringScale?: number; // Mặc định 10
  isApproved?: boolean;
  note?: string;
  assessmentScheme?: AssessmentItem[];
}

export type SemesterStatus = "ACTIVE" | "UPCOMING" | "CLOSED";

export interface Semester {
  id: string;
  code: string; // VD: FA26, SU26, SP26
  name: string; // VD: Fall 2026, Summer 2026
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: SemesterStatus;
  totalCourses: number;
}

export type CourseStatus = "IN_PROGRESS" | "UPCOMING" | "COMPLETED";

// Khóa học / Học phần - TRUNG TÂM đồ án
export interface Course {
  id: string;
  code: string; // VD: SWP490_FA26
  name: string; // VD: Đồ án tốt nghiệp KTPM - Fall 2026
  subjectCode: string; // SWP490
  subjectName: string;
  semesterCode: string; // FA26
  semesterName: string;
  adminClassCode?: string; // VD: SE1701
  status: CourseStatus;
  lecturer: {
    id: string;
    fullName: string;
    email: string;
    avatar?: string;
  };
  studentsCount: number;
  groupsCount: number;
  createdAt: string;
}

// Lớp hành chính (Administrative Class) - Quản lý sinh viên theo niên khóa
export interface AdminClass {
  id: string;
  code: string; // VD: SE1701, SE1702, AI1701
  name: string; // VD: Kỹ thuật phần mềm K17 - Lớp 01
  department: string; // Kỹ thuật phần mềm, Trí tuệ nhân tạo, An toàn thông tin
  academicYear: string; // K17 (2021 - 2025)
  createdAt: string;
}

export interface CourseStudent {
  id: string;
  studentCode: string; // MSSV (HE170504)
  fullName: string;
  email: string;
  adminClass?: string; // Lớp hành chính (VD: SE1701)
  groupName?: string; // Nhóm 01 - SAGA
  status: "ACTIVE" | "PENDING" | "BANNED";
  enrolledAt: string;
}

export interface ImportedStudentPreview {
  studentCode: string;
  fullName: string;
  email: string;
  groupName?: string;
  isValid: boolean;
  errorMessage?: string;
}
