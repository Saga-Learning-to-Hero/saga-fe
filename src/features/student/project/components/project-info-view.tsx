"use client";

import { useState, useMemo } from "react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { MOCK_STUDENT_PROJECT } from "../data/mock-student-project";
import type {
  StudentProjectDetails,
  ProjectJiraConfig,
  ProjectGitHubRepo,
  ProjectCategory,
} from "../types/student-project";
import { useStudentProject } from "../hooks/useStudentProject";
import { Loader2Icon } from "lucide-react";
import { ProjectBannerHeader } from "./project-banner-header";
import { TeamMembersCard } from "./team-members-card";
import { ProjectDetailsCard } from "./project-details-card";
import { ProjectIntegrationsCard } from "./project-integrations-card";
import { ProjectEditModal } from "./project-edit-modal";

export function ProjectInfoView() {
  const { user, selectedCourse } = useAuthStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [localOverrides, setLocalOverrides] = useState<Partial<StudentProjectDetails>>({});

  // Gọi API Backend: GET /api/student/courses/{courseId}/project
  const { data: apiProject, isLoading } = useStudentProject(selectedCourse?.id);

  // Tính toán dữ liệu dự án kết hợp API Backend và các thao tác cập nhật tại client
  const project: StudentProjectDetails = useMemo(() => {
    const base: StudentProjectDetails = {
      ...MOCK_STUDENT_PROJECT,
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

    return {
      ...base,
      ...localOverrides,
    };
  }, [apiProject, localOverrides]);

  const currentMember = (project.members || []).find(
    (m) => m.studentCode === user?.studentCode || m.email === user?.email
  );
  const isLeader = currentMember ? currentMember.role === "LEADER" : true;

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
      const updated = currentRepos.map((r) => (r.id === repo.id ? repo : r));
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
      const remaining = currentRepos.filter((r) => r.id !== repoId);
      return {
        ...prev,
        githubRepositories: remaining,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {isLoading && (
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-primary font-medium animate-pulse">
          <Loader2Icon className="w-4 h-4 animate-spin shrink-0" />
          <span>Đang đồng bộ dữ liệu dự án nhóm từ máy chủ...</span>
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

        <TeamMembersCard project={project} course={selectedCourse} />
      </div>

      <ProjectEditModal
        isOpen={isEditModalOpen}
        project={project}
        courseId={selectedCourse?.id}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateProject}
      />
    </div>
  );
}

