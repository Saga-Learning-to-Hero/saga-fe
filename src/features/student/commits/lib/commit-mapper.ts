import type { TaskLinkedCommitItem } from "@/features/student/project/types/student-project";
import type { CommitItem, Repository, Branch } from "../types/commits";
import { resolveHttpAvatarUrl } from "@/lib/avatar-url";

export interface CommitTeamMember {
  id?: string;
  studentProfileId?: string;
  studentCode?: string;
  fullName?: string;
  name?: string;
  avatar?: string;
  avatarUrl?: string | null;
}

/** Branch first: a tag like [SG-06] in the message is not the linked task when the branch has SAGA-102. */
function firstJiraKey(...texts: Array<string | null | undefined>): string | undefined {
  const pattern = /([A-Z][A-Z0-9]+-\d+)/i;
  for (const text of texts) {
    const match = text?.match(pattern);
    if (match) return match[1].toUpperCase();
  }
  return undefined;
}

/** Git's / GitHub's own merge messages (same rule as the backend's AI review). */
const GIT_MERGE_MESSAGE = /^(Merge pull request #\d+|Merge branch '|Merge remote-tracking branch '|Merge tag '|Merge commit ')/;

/**
 * A known parent count decides; while it is unknown (a push webhook does not carry it) the merge
 * message does, and the backend's own SKIPPED_MERGE review status always wins.
 */
export function isMergeCommit(
  commit: Pick<TaskLinkedCommitItem, "isMerge" | "parentCount" | "message" | "aiReview">
): boolean {
  if (commit.isMerge === true || commit.aiReview?.status === "SKIPPED_MERGE") return true;
  if (commit.parentCount !== null && commit.parentCount !== undefined) return commit.parentCount > 1;
  return Boolean(commit.message && GIT_MERGE_MESSAGE.test(commit.message.trim()));
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
  const authorStudentId = commit.authorStudentId?.trim().toLowerCase();
  const authorExternalId = commit.authorExternalId?.trim().toLowerCase();

  const member = teamMembers.find((m) => {
    const memberId = m.id?.trim().toLowerCase();
    const memberCode = m.studentCode?.trim().toLowerCase();

    if (authorStudentId && (memberId === authorStudentId || memberCode === authorStudentId)) {
      return true;
    }
    if (authorExternalId && memberCode && (authorExternalId === memberCode || authorExternalId.includes(memberCode))) {
      return true;
    }
    return false;
  });

  // The login reads better than a numeric GitHub user id for authors outside the team.
  const login = commit.authorLogin?.trim() || null;
  const authorName = member?.fullName || member?.name || login || commit.authorExternalId || "GitHub Committer";
  const studentCode = member?.studentCode || "";
  const username = login || commit.authorExternalId || "author";
  const avatar =
    resolveHttpAvatarUrl(commit.authorAvatarUrl, member?.avatarUrl, member?.avatar) || "";

  const repoName = commit.repositoryFullName
    ? commit.repositoryFullName.split("/").pop() || commit.repositoryFullName
    : "default-repo";

  const jiraKey = firstJiraKey(commit.headRef, commit.message);

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
      outsideTeam: !member,
    },
    repoName,
    branchName: commit.headRef?.trim() || "Không xác định",
    createdAt: commit.committedAt || commit.createdAt || new Date().toISOString(),
    relativeTime: formatRelativeTime(commit.committedAt || commit.createdAt),
    additions: null,
    deletions: null,
    filesChanged: null,
    jiraKey,
    isSyncedToJira: Boolean(jiraKey),
    commitUrl:
      commit.repositoryFullName && commit.sha
        ? `https://github.com/${commit.repositoryFullName}/commit/${commit.sha}`
        : undefined,
    isMerge: isMergeCommit(commit),
    parentCount: commit.parentCount ?? null,
    aiReview: commit.aiReview ?? null,
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
  const branchMapByRepo = new Map<string, Map<string, Branch>>();

  commits.forEach((commit) => {
    const fullPath = commit.repositoryFullName || "default/project-repo";
    const repoName = fullPath.split("/").pop() || fullPath;
    const branchName = commit.headRef?.trim() || "Không xác định";
    const branchesForRepo = branchMapByRepo.get(repoName) || new Map<string, Branch>();
    const existing = branchesForRepo.get(branchName);

    branchesForRepo.set(branchName, {
      name: branchName,
      isDefault: branchName === "main" || branchName === "master",
      commitCount: (existing?.commitCount || 0) + 1,
      lastCommitDate:
        !existing?.lastCommitDate || (commit.committedAt || "") > existing.lastCommitDate
          ? commit.committedAt || ""
          : existing.lastCommitDate,
    });
    branchMapByRepo.set(repoName, branchesForRepo);
  });

  repositories.forEach((repo) => {
    const repoBranches = Array.from(branchMapByRepo.get(repo.name)?.values() || []);
    branches[repo.name] = repoBranches.sort((a, b) => {
      if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
      return b.commitCount - a.commitCount || a.name.localeCompare(b.name, "vi");
    });
    repo.activeBranchesCount = repoBranches.length;
    repo.defaultBranch = repoBranches.find((branch) => branch.isDefault)?.name || repoBranches[0]?.name || "";
  });

  return { repositories, branches };
}
