export interface FlmMaterial {
  no: number;
  description: string;
  author: string;
  publisher: string;
  publishedDate?: string;
  edition?: string;
  isbn?: string;
  isMain: boolean;
  isHardCopy: boolean;
  isOnline: boolean;
  note?: string;
  url?: string;
}

export interface FlmClo {
  no: number;
  name: string;
  details: string;
}

export interface FlmSession {
  session: number;
  topic: string;
  type: "Offline" | "Online";
  clo: string;
  itu?: string;
  studentMaterials?: string;
  studentTasks?: string;
  urls?: string;
}

export interface FlmAssessment {
  no: number;
  category: string;
  type: string;
  part: number;
  weight: number;
  completionCriteria: string;
  duration: string;
  clo: string;
  questionType?: string;
  noQuestion?: string;
  knowledgeAndSkill?: string;
  gradingGuide?: string;
  note?: string;
}

export interface Subject {
  id: string;
  syllabusId?: string | number;
  syllabusName?: string;
  courseNameEnglish?: string;
  code: string;
  name: string;
  vietnameseName?: string;
  englishName?: string;
  credits: number;
  noCredit?: number;
  department: string;
  description?: string;
  totalCourses: number;
  learningTeachingMethod?: string;
  decisionNo?: string;
  approvedDate?: string;
  degreeLevel?: string;
  timeAllocation?: string;
  preRequisites?: string;
  coRequisites?: string;
  studentTasks?: string;
  tools?: string;
  scoringScale?: number;
  minAvgScore?: number;
  minAvgMarkToPass?: number;
  minFinalScore?: number;
  isApproved?: boolean;
  note?: string;
  materials?: FlmMaterial[];
  clos?: FlmClo[];
  sessions?: FlmSession[];
  assessments?: FlmAssessment[];
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
