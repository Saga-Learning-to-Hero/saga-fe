import type { TaskLinkedCommitItem } from "@/features/student/project/types/student-project";
import type { CommitItem, Repository, Branch } from "../types/commits";

export interface CommitTeamMember {
  id?: string;
  studentCode?: string;
  fullName?: string;
  name?: string;
  avatar?: string;
}

export function formatRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return "Gần đây";
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return "Vừa xong";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 30) return `${diffDays} ngày trước`;
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths} tháng trước`;
  } catch {
    return "Gần đây";
  }
}

export function mapProjectCommitToCommitItem(
  commit: TaskLinkedCommitItem,
  teamMembers: CommitTeamMember[] = []
): CommitItem {
  const member = teamMembers.find(
    (m) =>
      (commit.authorStudentId && (m.id === commit.authorStudentId || m.studentCode === commit.authorStudentId)) ||
      (commit.authorExternalId && m.studentCode && commit.authorExternalId.toLowerCase().includes(m.studentCode.toLowerCase()))
  );

  const authorName = member?.fullName || member?.name || commit.authorExternalId || "GitHub Committer";
  const studentCode = member?.studentCode || "";
  const username = commit.authorExternalId || "author";
  const avatar = member?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;

  const repoName = commit.repositoryFullName
    ? commit.repositoryFullName.split("/").pop() || commit.repositoryFullName
    : "default-repo";

  const jiraMatch = commit.message ? commit.message.match(/\[?([A-Z][A-Z0-9]+-\d+)\]?/i) : null;
  const jiraKey = jiraMatch ? jiraMatch[1].toUpperCase() : undefined;

  const shortHash = commit.sha ? commit.sha.slice(0, 7) : commit.id.slice(0, 7);

  return {
    id: commit.id,
    hash: commit.sha || commit.id,
    shortHash,
    message: commit.message || "Commit không có thông điệp",
    author: {
      name: authorName,
      studentCode,
      username,
      avatar,
    },
    repoName,
    branchName: "main",
    createdAt: commit.committedAt || commit.createdAt || new Date().toISOString(),
    relativeTime: formatRelativeTime(commit.committedAt || commit.createdAt),
    additions: 0,
    deletions: 0,
    filesChanged: 1,
    jiraKey,
    isSyncedToJira: Boolean(jiraKey),
    commitUrl: commit.repositoryFullName && commit.sha
      ? `https://github.com/${commit.repositoryFullName}/commit/${commit.sha}`
      : "#",
  };
}

export function extractReposAndBranches(
  commits: TaskLinkedCommitItem[]
): {
  repositories: Repository[];
  branches: Record<string, Branch[]>;
} {
  const repoMap = new Map<string, Repository>();

  commits.forEach((c) => {
    const fullPath = c.repositoryFullName || "default/project-repo";
    const name = fullPath.split("/").pop() || fullPath;
    const repoId = c.repoId || fullPath;

    if (!repoMap.has(repoId)) {
      repoMap.set(repoId, {
        id: repoId,
        name,
        fullPath,
        isDefault: repoMap.size === 0,
        totalCommits: 0,
        activeBranchesCount: 1,
        defaultBranch: "main",
      });
    }

    const r = repoMap.get(repoId)!;
    r.totalCommits += 1;
  });

  const repositories = Array.from(repoMap.values());
  const branches: Record<string, Branch[]> = {};

  repositories.forEach((repo) => {
    branches[repo.name] = [
      {
        name: "main",
        isDefault: true,
        commitCount: repo.totalCommits,
        lastCommitDate: new Date().toISOString(),
      },
    ];
  });

  return { repositories, branches };
}
