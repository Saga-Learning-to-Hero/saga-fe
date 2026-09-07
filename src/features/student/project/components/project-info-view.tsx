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
import { useStudentProject, useStudentTeam } from "../hooks/useStudentProject";
import { Loader2Icon, FolderKanbanIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectBannerHeader } from "./project-banner-header";
import { TeamMembersCard } from "./team-members-card";
import { ProjectDetailsCard } from "./project-details-card";
import { ProjectIntegrationsCard } from "./project-integrations-card";
import { ProjectEditModal } from "./project-edit-modal";

export function ProjectInfoView() {
  const { selectedCourse } = useAuthStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [localOverrides, setLocalOverrides] = useState<Partial<StudentProjectDetails>>({});

  // Gọi API Backend: GET /api/student/courses/{courseId}/project & /team
  const { data: apiProject, isLoading: isProjectLoading } = useStudentProject(selectedCourse?.id);
  const { data: teamData, isLoading: isTeamLoading } = useStudentTeam(selectedCourse?.id);
  const isLoading = isProjectLoading || isTeamLoading;

  // Kiểm tra dự án đã được khởi tạo hay chưa (từ API hoặc từ thay đổi cục bộ sau khi tạo)
  const hasProject = Boolean(
    (apiProject?.projectId && apiProject.projectId.trim() !== "") ||
    (apiProject?.name && apiProject.name.trim() !== "") ||
    (teamData?.projectId && teamData.projectId.trim() !== "") ||
    (localOverrides.projectId && localOverrides.projectId.trim() !== "") ||
    (localOverrides.name && localOverrides.name.trim() !== "")
  );

  const hasTeam = Boolean(
    teamData?.teamId ||
    teamData?.teamName ||
    (teamData?.members && teamData.members.length > 0)
  );

  const teamGroupName = teamData?.teamName
    ? `Nhóm ${teamData.teamNo || 1} - ${teamData.teamName}`
    : "Chưa có nhóm";

  // Tính toán dữ liệu dự án: không dùng dữ liệu thành viên cứng từ mock
  const project: StudentProjectDetails = useMemo(() => {
    const base: StudentProjectDetails = {
      ...MOCK_STUDENT_PROJECT,
      members: [], // Bỏ toàn bộ mock members
      groupName: hasTeam ? teamGroupName : "Chưa có nhóm",
      ...(teamData
        ? {
            teamId: teamData.teamId,
            teamNo: teamData.teamNo,
            teamName: teamData.teamName,
          }
        : {}),
      ...(apiProject
        ? {
            id: apiProject.projectId,
            projectId: apiProject.projectId,
            courseId: apiProject.courseId,
            name: apiProject.name,
            description: apiProject.description,
            teamId: apiProject.teamId || teamData?.teamId,
            teamNo: apiProject.teamNo || teamData?.teamNo,
            teamName: apiProject.teamName || teamData?.teamName,
            groupName: apiProject.teamName
              ? `Nhóm ${apiProject.teamNo || 1} - ${apiProject.teamName}`
              : (hasTeam ? teamGroupName : "Chưa có nhóm"),
            category: (apiProject.projectType?.name as ProjectCategory) || "",
            projectType: apiProject.projectType,
            createdBy: apiProject.createdBy,
            createdAt: apiProject.createdAt,
          }
        : {}),
    };

    return { ...base, ...localOverrides };
  }, [apiProject, teamData, hasTeam, teamGroupName, localOverrides]);

  // Phân quyền: Trưởng nhóm (LEADER) hay Thành viên (MEMBER) từ API team
  const isLeader = Boolean(
    teamData?.myRole?.toUpperCase() === "LEADER" ||
    selectedCourse?.myGroup?.role?.toUpperCase() === "LEADER"
  );

  const handleUpdateProject = (fields: Partial<StudentProjectDetails>) =>
    setLocalOverrides((prev) => ({ ...prev, ...fields, updatedAt: new Date().toISOString() }));

  const handleUpdateJira = (config?: ProjectJiraConfig) =>
    setLocalOverrides((prev) => ({ ...prev, jiraConfig: config, updatedAt: new Date().toISOString() }));

  const handleAddRepo = (repo: ProjectGitHubRepo) =>
    setLocalOverrides((prev) => ({
      ...prev,
      githubRepositories: [...(prev.githubRepositories || project.githubRepositories || []), repo],
      updatedAt: new Date().toISOString(),
    }));

  const handleEditRepo = (repo: ProjectGitHubRepo) =>
    setLocalOverrides((prev) => ({
      ...prev,
      githubRepositories: (prev.githubRepositories || project.githubRepositories || []).map((r) =>
        r.id === repo.id ? repo : r
      ),
      updatedAt: new Date().toISOString(),
    }));

  const handleDeleteRepo = (repoId: string) =>
    setLocalOverrides((prev) => ({
      ...prev,
      githubRepositories: (prev.githubRepositories || project.githubRepositories || []).filter(
        (r) => r.id !== repoId
      ),
      updatedAt: new Date().toISOString(),
    }));

  // Trạng thái 1: Đang tải thông tin từ máy chủ
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center animate-spin">
          <Loader2Icon className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">Đang tải thông tin dự án...</h3>
          <p className="text-xs text-muted-foreground">Đang đồng bộ dữ liệu từ máy chủ SAGA</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      <ProjectBannerHeader
        project={project}
        course={selectedCourse}
        isLeader={isLeader}
        hasTeam={hasTeam}
      />

      <div className="space-y-6">
        {!hasProject ? (
          <div className="p-8 sm:p-10 rounded-3xl border border-dashed border-primary/30 bg-primary/[0.02] text-center space-y-5">
            <div className="relative mx-auto w-16 h-16">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shadow-md">
                <FolderKanbanIcon className="w-8 h-8" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                <PlusIcon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-foreground">Chưa có Dự án Nhóm</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Nhóm của bạn hiện tại chưa có dự án nào được khởi tạo cho môn học này. Hãy khởi tạo đề tài để bắt đầu quản lý tiến độ và tích hợp Jira cùng GitHub.
              </p>
            </div>

            {isLeader ? (
              <div className="flex flex-col items-center gap-2">
                <Button
                  size="lg"
                  onClick={() => setIsEditModalOpen(true)}
                  className="h-10 px-6 text-xs font-bold rounded-xl gap-2 cursor-pointer shadow-md bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <PlusIcon className="w-4 h-4" />
                  Tạo dự án mới
                </Button>
                <p className="text-[11px] text-muted-foreground/80">
                  Dành cho Trưởng nhóm (Team Leader) đăng ký đề tài ban đầu
                </p>
              </div>
            ) : (
              <div className="inline-block px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs text-center max-w-md">
                <span className="font-semibold">Bạn đang tham gia với vai trò Thành viên (Member). </span>
                <span className="text-muted-foreground">Vui lòng chờ Trưởng nhóm khởi tạo đề tài dự án.</span>
              </div>
            )}
          </div>
        ) : (
          <>
            <ProjectDetailsCard
              project={project}
              isLeader={isLeader}
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
          </>
        )}

        <TeamMembersCard
          project={project}
          course={selectedCourse}
          teamData={teamData}
        />
      </div>

      <ProjectEditModal
        key={isEditModalOpen ? "modal-open" : "modal-closed"}
        isOpen={isEditModalOpen}
        project={project}
        courseId={selectedCourse?.id}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateProject}
      />
    </div>
  );
}

