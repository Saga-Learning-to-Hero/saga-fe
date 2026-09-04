"use client";

import { useState } from "react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { MOCK_STUDENT_PROJECT } from "../data/mock-student-project";
import type { StudentProjectDetails, ProjectJiraConfig, ProjectGitHubRepo } from "../types/student-project";
import { ProjectBannerHeader } from "./project-banner-header";
import { TeamMembersCard } from "./team-members-card";
import { ProjectDetailsCard } from "./project-details-card";
import { ProjectIntegrationsCard } from "./project-integrations-card";
import { ProjectEditModal } from "./project-edit-modal";

export function ProjectInfoView() {
  const { user } = useAuthStore();
  const [project, setProject] = useState<StudentProjectDetails>(MOCK_STUDENT_PROJECT);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const currentMember = project.members.find(
    (m) => m.studentCode === user?.studentCode || m.email === user?.email
  );
  const isLeader = currentMember ? currentMember.role === "LEADER" : true;

  const handleUpdateProject = (updatedFields: Partial<StudentProjectDetails>) => {
    setProject((prev) => ({
      ...prev,
      ...updatedFields,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleUpdateJira = (config?: ProjectJiraConfig) => {
    setProject((prev) => ({
      ...prev,
      jiraConfig: config,
      jiraProjectKey: config?.projectKey || "",
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleAddRepo = (repo: ProjectGitHubRepo) => {
    setProject((prev) => {
      const currentRepos = prev.githubRepositories || [];
      return {
        ...prev,
        githubRepositories: [...currentRepos, repo],
        githubRepository: prev.githubRepository || repo.repository,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleEditRepo = (repo: ProjectGitHubRepo) => {
    setProject((prev) => {
      const currentRepos = prev.githubRepositories || [];
      const updated = currentRepos.map((r) => (r.id === repo.id ? repo : r));
      return {
        ...prev,
        githubRepositories: updated,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleDeleteRepo = (repoId: string) => {
    setProject((prev) => {
      const currentRepos = prev.githubRepositories || [];
      const remaining = currentRepos.filter((r) => r.id !== repoId);
      return {
        ...prev,
        githubRepositories: remaining,
        githubRepository: remaining[0]?.repository || "",
        updatedAt: new Date().toISOString(),
      };
    });
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      <ProjectBannerHeader project={project} />

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

        <TeamMembersCard project={project} />
      </div>

      <ProjectEditModal
        isOpen={isEditModalOpen}
        project={project}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateProject}
      />
    </div>
  );
}
