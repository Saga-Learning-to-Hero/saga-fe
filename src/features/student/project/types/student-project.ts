export type ProjectCategory =
  | "Web Application / EdTech"
  | "Mobile Application"
  | "AI & Machine Learning"
  | "Cloud & DevOps"
  | "Blockchain & Fintech"
  | "IoT & Embedded Systems";

export interface ProjectTeamMember {
  id: string;
  studentCode: string;
  name: string;
  role: "LEADER" | "MEMBER";
  email: string;
  avatar?: string;
  tasksAssigned: number;
  tasksCompleted: number;
  traceabilityScore: number;
}

export interface StudentProjectDetails {
  id: string;
  name: string; // Tên dự án
  category: ProjectCategory; // Loại dự án
  description: string; // Mô tả dự án
  status: "ACTIVE" | "COMPLETED" | "DRAFT";
  courseCode: string; // VD: SWP490_FA26_SE1701
  courseName: string; // VD: Đồ án Kỹ thuật phần mềm (Capstone Project)
  semesterCode: string; // VD: FA26
  adminClassCode: string; // VD: SE1701
  groupName: string; // VD: Nhóm 01 - SAGA Team
  lecturer: {
    name: string;
    email: string;
    avatar?: string;
  };
  members: ProjectTeamMember[];
  techStack: string[]; // VD: ["Next.js", "React", "TypeScript", "TailwindCSS", "NestJS", "Cytoscape.js"]
  jiraProjectKey?: string;
  githubRepository?: string;
  createdAt: string;
  updatedAt: string;
}
