import type { RoleInTeam } from "@/types/auth";

export type ProjectStatus = "ACTIVE" | "COMPLETED" | "AT_RISK" | "PLANNED";
export type IntegrationStatus = "CONNECTED" | "DISCONNECTED" | "WARNING";

export interface ProjectMember {
  id: string;
  fullName: string;
  name?: string;
  studentCode: string;
  email: string;
  avatar?: string;
  role?: RoleInTeam;
  isLeader?: boolean;
  commitsCount: number;
  tasksCount: number;
}

export interface ManagedProject {
  id: string;
  groupName: string; // Tên nhóm (VD: Nhóm 01 - SAGA)
  topicCode: string; // Mã đề tài (VD: CAPSTONE_FA26_01)
  topicName: string; // Tên đề tài (VD: Hệ thống đánh giá đóng góp sinh viên theo đồ thị)
  projectName?: string; // Tương thích với các feature khác
  semester: string; // Học kỳ (VD: Fall 2026, Summer 2026)
  semesterCode?: string;
  courseCode: string; // Mã học phần (VD: SWP490_G1, PRM392)
  status: ProjectStatus;

  // Giảng viên hướng dẫn
  mentor: {
    id: string;
    fullName: string;
    name?: string;
    email: string;
    avatar?: string;
  };

  // Trưởng nhóm
  leader: {
    id: string;
    fullName: string;
    name?: string;
    studentCode: string;
    email: string;
    avatar?: string;
  };

  // Danh sách thành viên
  members: ProjectMember[];

  // Tích hợp Jira
  jira: {
    projectKey: string; // VD: SAGA, EDTECH
    status: IntegrationStatus;
    lastSyncedAt?: string;
    totalTasks: number;
  };

  // Tích hợp GitHub
  github: {
    repoUrl: string; // VD: https://github.com/Saga-Learning-to-Hero/saga-fe
    repoName: string; // VD: Saga-Learning-to-Hero/saga-fe
    status: IntegrationStatus;
    lastSyncedAt?: string;
    totalCommits: number;
  };

  createdAt: string;
}
