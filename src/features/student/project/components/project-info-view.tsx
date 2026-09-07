"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { MOCK_STUDENT_PROJECT } from "../data/mock-student-project";
import type {
  StudentProjectDetails,
  ProjectJiraConfig,
  ProjectGitHubRepo,
  ProjectCategory,
} from "../types/student-project";
import { useStudentProject } from "../hooks/useStudentProject";
import { useRefreshStudentCourses, useStudentMyTeam } from "@/features/student/courses/hooks/use-student-courses";
import { getApiErrorCode } from "@/lib/api-error";
import { Loader2Icon } from "lucide-react";
import { ProjectBannerHeader } from "./project-banner-header";
import { TeamMembersCard } from "./team-members-card";
import { ProjectDetailsCard } from "./project-details-card";
import { ProjectIntegrationsCard } from "./project-integrations-card";
import { ProjectEditModal } from "./project-edit-modal";

export function ProjectInfoView() {
  const { selectedCourse } = useAuthStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [localOverrides, setLocalOverrides] = useState<Partial<StudentProjectDetails>>({});
  const refreshCourses = useRefreshStudentCourses();

  const courseId = selectedCourse?.courseId || selectedCourse?.id || "";

  const { data: apiProject, isLoading: isProjectLoading } = useStudentProject(courseId);

  const {
    data: team,
    isLoading: isTeamLoading,
    isError: isTeamError,
    error: teamError,
    refetch: refetchTeam,
  } = useStudentMyTeam(courseId, { enabled: Boolean(courseId) });

  const forbidden = getApiErrorCode(teamError) === "STUDENT_COURSE_FORBIDDEN";

  useEffect(() => {
    if (forbidden) {
      void refreshCourses();
    }
  }, [forbidden, refreshCourses]);

  const project: StudentProjectDetails = useMemo(() => {
    const teamName = team?.teamName || apiProject?.teamName || "";
    const teamNo = team?.teamNo ?? apiProject?.teamNo ?? 0;

    const base: StudentProjectDetails = {
      ...MOCK_STUDENT_PROJECT,
      members: [],
      groupName: "",
      teamId: "",
      teamNo: 0,
      teamName: "",
      ...(apiProject
        ? {
            id: apiProject.projectId,
            projectId: apiProject.projectId,
            courseId: apiProject.courseId,
            name: apiProject.name,
            description: apiProject.description,
            teamId: apiProject.teamId,
            teamNo: apiProject.teamNo,
            teamName: apiProject.teamName,
            groupName: apiProject.teamName
              ? `Nhóm ${apiProject.teamNo || 1} - ${apiProject.teamName}`
              : "",
            category: (apiProject.projectType?.name as ProjectCategory) || "",
            projectType: apiProject.projectType,
            createdBy: apiProject.createdBy,
            createdAt: apiProject.createdAt,
          }
        : {}),
    };

    if (team) {
      base.teamId = team.teamId;
      base.teamNo = teamNo;
      base.teamName = teamName;
      base.groupName = teamName
        ? `Nhóm ${teamNo} · ${teamName}${team.myRole ? ` · ${team.myRole === "LEADER" ? "Leader" : "Member"}` : ""}`
        : "";
      if (team.projectId) {
        base.projectId = team.projectId;
        base.id = team.projectId;
      }
    }

    return {
      ...base,
      ...localOverrides,
      members: [],
    };
  }, [apiProject, localOverrides, team]);

  const isLeader = team?.myRole === "LEADER";

  const handleUpdateProject = (updatedFields: Partial<StudentProjectDetails>) => {
    setLocalOverrides((prev) => ({
      ...prev,
      ...updatedFields,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleUpdateJira = (config?: ProjectJiraConfig) => {
    setLocalOverrides((prev) => ({
      ...prev,
      jiraConfig: config,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleAddRepo = (repo: ProjectGitHubRepo) => {
    setLocalOverrides((prev) => {
      const currentRepos = prev.githubRepositories || project.githubRepositories || [];
      return {
        ...prev,
        githubRepositories: [...currentRepos, repo],
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleEditRepo = (repo: ProjectGitHubRepo) => {
    setLocalOverrides((prev) => {
      const currentRepos = prev.githubRepositories || project.githubRepositories || [];
      const updated = currentRepos.map((item) => (item.id === repo.id ? repo : item));
      return {
        ...prev,
        githubRepositories: updated,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleDeleteRepo = (repoId: string) => {
    setLocalOverrides((prev) => {
      const currentRepos = prev.githubRepositories || project.githubRepositories || [];
      const remaining = currentRepos.filter((item) => item.id !== repoId);
      return {
        ...prev,
        githubRepositories: remaining,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-12">
      {(isProjectLoading || isTeamLoading) && (
        <div className="flex animate-pulse items-center gap-2.5 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-2.5 text-xs font-medium text-primary">
          <Loader2Icon className="h-4 w-4 shrink-0 animate-spin" />
          <span>Đang đồng bộ thông tin nhóm và dự án từ máy chủ...</span>
        </div>
      )}

      <ProjectBannerHeader project={project} course={selectedCourse} />

      <div className="space-y-6">
        <ProjectDetailsCard
          project={project}
          onOpenEditModal={() => setIsEditModalOpen(true)}
        />

        <ProjectIntegrationsCard
          project={project}
          isLeader={isLeader}
          onUpdateJira={handleUpdateJira}
          onAddRepo={handleAddRepo}
          onEditRepo={handleEditRepo}
          onDeleteRepo={handleDeleteRepo}
        />

        <TeamMembersCard
          course={selectedCourse}
          team={team}
          isLoading={isTeamLoading}
          isError={isTeamError}
          error={teamError}
          onRetry={() => void refetchTeam()}
          onForbidden={() => void refreshCourses()}
        />
      </div>

      <ProjectEditModal
        isOpen={isEditModalOpen}
        project={project}
        courseId={courseId}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateProject}
      />
    </div>
  );
}
