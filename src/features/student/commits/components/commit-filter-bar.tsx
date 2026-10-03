"use client";

import {
  FolderGit2Icon,
  GitBranchIcon,
  SearchIcon,
  XIcon,
  GitCommitIcon,
  GitMergeIcon,
  GitPullRequestIcon,
  UsersIcon,
  LayersIcon,
  KanbanIcon,
} from "lucide-react";
import type { Repository, Branch } from "../types/commits";
import type { CommitTeamMember } from "../lib/commit-mapper";
import type { JiraSourceSummary } from "@/features/student/project/types/jira-sources";
import type { ProjectSprintResponse } from "@/features/student/sprint-progress/types/jira-task-types";
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/common/custom-select";
import { isStudentProfileUuid } from "@/features/graph/lib/student-profile-id";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { resolveHttpAvatarUrl } from "@/lib/avatar-url";
import { getAssigneeAvatarClass, getAssigneeInitials } from "@/features/student/sprint-progress/lib/assignee-avatar";

export type CommitMergeFilter = "all" | "exclude_merge" | "only_merge";

interface CommitFilterBarProps {
  repositories: Repository[];
  selectedRepoId: string;
  onSelectRepo: (repoId: string) => void;
  branches: Branch[];
  selectedBranchName: string;
  onSelectBranch: (branchName: string) => void;
  jiraSources?: JiraSourceSummary[];
  selectedJiraIntegrationId?: string;
  onSelectJiraIntegration?: (sourceId: string) => void;
  sprints?: ProjectSprintResponse[];
  selectedSprintId?: string;
  onSelectSprint?: (sprintId: string) => void;
  members?: CommitTeamMember[];
  selectedAuthorId?: string;
  onSelectAuthor?: (authorId: string) => void;
  mergeFilter?: CommitMergeFilter;
  onMergeFilterChange?: (filter: CommitMergeFilter) => void;
  mergeCount?: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function CommitFilterBar({
  repositories,
  selectedRepoId,
  onSelectRepo,
  branches,
  selectedBranchName,
  onSelectBranch,
  jiraSources = [],
  selectedJiraIntegrationId = "all",
  onSelectJiraIntegration,
  sprints = [],
  selectedSprintId = "all",
  onSelectSprint,
  members = [],
  selectedAuthorId = "all",
  onSelectAuthor,
  mergeFilter = "all",
  onMergeFilterChange,
  mergeCount = 0,
  searchQuery,
  onSearchChange,
}: CommitFilterBarProps) {
  const hasJiraRow = Boolean(onSelectJiraIntegration || onSelectSprint || onSelectAuthor);

  return (
    <div className="relative z-30 p-3 rounded-xl bg-card/60 border border-border/70 backdrop-blur-xs shadow-2xs space-y-2.5">
      {/* Hàng 1: Bộ lọc nghiệp vụ Jira & Thành viên (Site, Sprint, Thành viên) */}
      {hasJiraRow && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          {onSelectJiraIntegration && (
            <div className="relative z-40 w-full sm:w-56 md:w-60">
              <CustomSelect
                id="commits-site-filter"
                value={selectedJiraIntegrationId || "all"}
                onChange={onSelectJiraIntegration}
                options={[
                  {
                    value: "all",
                    label: "Tất cả Site Jira",
                    subLabel:
                      jiraSources && jiraSources.length > 0
                        ? `(${jiraSources.length} nguồn)`
                        : undefined,
                    icon: <LayersIcon className="w-3.5 h-3.5 text-blue-500" />,
                  },
                  ...(jiraSources || []).map((source) => ({
                    value:
                      source.integrationId ||
                      (source as unknown as { jiraIntegrationId?: string }).jiraIntegrationId ||
                      "",
                    label: `${source.projectKey || "JIRA"} · ${source.siteName}`,
                    subLabel: source.boardId ? `Board: ${source.boardId}` : "Board mặc định",
                    icon: <LayersIcon className="w-3.5 h-3.5 text-blue-500" />,
                  })),
                ]}
              />
            </div>
          )}

          {onSelectSprint && (
            <div className="relative z-40 w-full sm:w-56 md:w-60">
              <CustomSelect
                id="commits-sprint-filter"
                value={selectedSprintId || "all"}
                onChange={onSelectSprint}
                options={[
                  {
                    value: "all",
                    label: "Tất cả Sprint",
                    subLabel:
                      sprints && sprints.length > 0 ? `(${sprints.length} sprint)` : undefined,
                    icon: <KanbanIcon className="w-3.5 h-3.5 text-amber-500" />,
                  },
                  ...(sprints || []).map((sp) => {
                    const isActive = sp.state?.toLowerCase() === "active";
                    const stateLabel = isActive
                      ? "Đang diễn ra"
                      : sp.state?.toLowerCase() === "closed"
                        ? "Đã đóng"
                        : "Dự kiến";
                    return {
                      value: sp.id,
                      label: sp.name,
                      subLabel: stateLabel,
                      icon: (
                        <KanbanIcon
                          className={`w-3.5 h-3.5 ${
                            isActive ? "text-emerald-500" : "text-amber-500"
                          }`}
                        />
                      ),
                    };
                  }),
                ]}
              />
            </div>
          )}

          {onSelectAuthor && (
            <div className="relative z-40 w-full sm:w-56 md:w-60">
              <CustomSelect
                id="commits-author-filter"
                value={selectedAuthorId || "all"}
                onChange={onSelectAuthor}
                options={[
                  {
                    value: "all",
                    label: "Tất cả thành viên",
                    subLabel: members && members.length > 0 ? `(${members.length} người)` : undefined,
                    icon: <UsersIcon className="w-3.5 h-3.5 text-blue-500" />,
                  },
                  ...members.map((m) => {
                    const displayName = m.fullName || m.name || m.studentCode || "Thành viên";
                    const code = m.studentCode ? ` (${m.studentCode})` : "";
                    const memberValue =
                      (m.studentProfileId && isStudentProfileUuid(m.studentProfileId)
                        ? m.studentProfileId
                        : null) ||
                      (m.id && isStudentProfileUuid(m.id) ? m.id : null) ||
                      `unlinked:${m.studentCode || displayName}`;
                    const avatarSrc = resolveHttpAvatarUrl(m.avatarUrl, m.avatar);
                    const initials = getAssigneeInitials(displayName);
                    const avatarColorClass = getAssigneeAvatarClass(
                      m.studentProfileId || m.studentCode || m.id
                    );

                    return {
                      value: memberValue,
                      label: `${displayName}${code}`,
                      subLabel: m.studentCode ? `MSSV: ${m.studentCode}` : undefined,
                      icon: (
                        <Avatar className="w-4.5 h-4.5 border border-border/80 shrink-0">
                          {avatarSrc && (
                            <AvatarImage
                              src={avatarSrc}
                              alt={displayName}
                              className="object-cover"
                            />
                          )}
                          <AvatarFallback
                            className={`text-[8px] font-bold ${avatarColorClass}`}
                          >
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                      ),
                    };
                  }),
                ]}
              />
            </div>
          )}
        </div>
      )}

      {/* Hàng 2: Bộ lọc kỹ thuật Git (Repo, Nhánh, Merge Filter, Search) */}
      <div className="flex flex-col md:flex-row md:items-center gap-2.5">
        <div className="relative z-40 w-full md:w-56">
          <CustomSelect
            value={selectedRepoId}
            onChange={onSelectRepo}
            options={repositories.map((repo) => {
              const isDisconnected =
                repo.connectionStatus && repo.connectionStatus !== "ACTIVE";
              const fullText = isDisconnected
                ? `${repo.fullPath} (đã ngắt kết nối)`
                : repo.fullPath;
              return {
                value: repo.id,
                label: fullText,
                tooltip: fullText,
                icon: <FolderGit2Icon className="w-3.5 h-3.5 text-blue-500" />,
              };
            })}
          />
        </div>

        <div className="relative z-40 w-full md:w-52">
          <CustomSelect
            value={selectedBranchName}
            onChange={onSelectBranch}
            options={[
              {
                value: "all",
                label: "Tất cả các nhánh",
                subLabel: branches.length > 0 ? `(${branches.length} nhánh)` : undefined,
                icon: <GitBranchIcon className="w-3.5 h-3.5 text-muted-foreground" />,
              },
              ...branches.map((b) => ({
                value: b.name,
                label: b.name,
                subLabel: b.isDefault ? "(mặc định)" : undefined,
                icon: <GitBranchIcon className="w-3.5 h-3.5 text-purple-500" />,
              })),
            ]}
          />
        </div>

        {onMergeFilterChange && (
          <div className="relative z-40 w-full md:w-48">
            <CustomSelect
              value={mergeFilter}
              onChange={(val) => onMergeFilterChange(val as CommitMergeFilter)}
              options={[
                {
                  value: "all",
                  label: "Tất cả commit",
                  subLabel: mergeCount > 0 ? `(${mergeCount} merge)` : undefined,
                  icon: <GitCommitIcon className="w-3.5 h-3.5 text-blue-500" />,
                },
                {
                  value: "exclude_merge",
                  label: "Loại bỏ commit Merge",
                  subLabel: "Chỉ commit code",
                  icon: <GitPullRequestIcon className="w-3.5 h-3.5 text-emerald-500" />,
                },
                {
                  value: "only_merge",
                  label: "Chỉ commit Merge",
                  subLabel: "Gộp nhánh PR",
                  icon: <GitMergeIcon className="w-3.5 h-3.5 text-purple-500" />,
                },
              ]}
            />
          </div>
        )}

        <div className="relative flex-1 min-w-[200px]">
          <SearchIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm Jira key (SAGA-xx), commit hash, message, tác giả..."
            className="pl-8.5 pr-8 h-9 text-xs rounded-xl bg-card border-border/80 font-sans"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <XIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

