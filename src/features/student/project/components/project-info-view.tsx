"use client";

import { useState } from "react";
import { MOCK_STUDENT_PROJECT } from "../data/mock-student-project";
import type { StudentProjectDetails } from "../types/student-project";
import { ProjectBannerHeader } from "./project-banner-header";
import { TeamMembersCard } from "./team-members-card";
import { ProjectDetailsCard } from "./project-details-card";
import { ProjectEditModal } from "./project-edit-modal";

export function ProjectInfoView() {
  const [project, setProject] = useState<StudentProjectDetails>(MOCK_STUDENT_PROJECT);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleUpdateProject = (updatedFields: Partial<StudentProjectDetails>) => {
    setProject((prev) => ({
      ...prev,
      ...updatedFields,
      updatedAt: new Date().toISOString(),
    }));
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Banner Header */}
      <ProjectBannerHeader project={project} />

      {/* Main Grid: Project Details & Team Members */}
      <div className="space-y-6">
        {/* Section 1: Detailed Project Information */}
        <ProjectDetailsCard
          project={project}
          onOpenEditModal={() => setIsEditModalOpen(true)}
        />

        {/* Section 2: Team & Members Info */}
        <TeamMembersCard project={project} />
      </div>

      {/* Edit / Create Modal */}
      <ProjectEditModal
        isOpen={isEditModalOpen}
        project={project}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateProject}
      />
    </div>
  );
}
