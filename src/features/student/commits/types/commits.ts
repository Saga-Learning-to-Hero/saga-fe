export interface Repository {
  id: string;
  name: string; // VD: saga-fe
  fullPath: string; // VD: Saga-Learning-to-Hero/saga-fe
  isDefault: boolean;
  totalCommits: number;
  activeBranchesCount: number;
  defaultBranch: string;
}

export interface Branch {
  name: string; // VD: main, develop, feature/sprint-3-jira-board
  isDefault: boolean;
  commitCount: number;
  lastCommitDate: string;
}

export interface CommitItem {
  id: string;
  hash: string; // Full 40-char SHA
  shortHash: string; // 7-char short SHA (e.g. 7a9f8b1)
  message: string;
  author: {
    name: string;
    studentCode: string;
    username: string; // GitHub username
    avatar: string;
  };
  repoName: string;
  branchName: string;
  createdAt: string; // ISO String
  relativeTime: string; // VD: "2 giờ trước"
  additions: number;
  deletions: number;
  filesChanged: number;
  jiraKey?: string; // VD: SAGA-105
  isSyncedToJira: boolean;
  commitUrl: string;
}

export interface CommitStats {
  totalCommits: number;
  totalAdditions: number;
  totalDeletions: number;
  netLines: number;
  activeBranches: number;
  lastSyncedAt: string;
}
