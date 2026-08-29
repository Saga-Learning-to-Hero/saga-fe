export interface TeamMember {
  id: string;
  studentId: string; // MSSV
  fullName: string;
  email: string;
  role: "Leader" | "Member";
  groupId: string | null;
  groupName: string | null;
  status: "Active" | "Inactive";
}

export interface TeamProjectInfo {
  id: string; // teamId
  teamName: string;
  projectName: string;
  description: string;
  leaderId: string | null;
  members: TeamMember[];
  githubRepo: string | null;
  jiraProjectKey: string | null;
  currentSprint: string | null;
  startDate: string;
  deadline: string;
  status: "Đang thực hiện" | "Chưa bắt đầu" | "Hoàn thành";
  lastSyncAt: string | null;
}

export interface CommitActivity {
  id: string;
  authorId: string;
  authorName: string;
  message: string;
  shortSha: string;
  fullSha: string;
  branch: string;
  createdAt: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  jiraIssueKey: string | null;
}

export interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  type: "Story" | "Task" | "Bug";
  priority: "High" | "Medium" | "Low" | "Highest" | "Lowest";
  assigneeId: string | null;
  storyPoint: number;
  labels: string[];
  dueDate: string | null;
  status: "TO DO" | "IN PROGRESS" | "IN REVIEW" | "BLOCKED" | "DONE";
}

export interface SprintProgress {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  totalPoints: number;
  completedPoints: number;
}
