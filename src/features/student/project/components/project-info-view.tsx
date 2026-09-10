"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import type {
  StudentProjectDetails,
  ProjectCategory,
} from "../types/student-project";
import { useStudentProject } from "../hooks/useStudentProject";
import {
  useRefreshStudentCourses,
  useStudentMyTeam,
  useStudentCourses,
} from "@/features/student/courses/hooks/use-student-courses";
import { mapStudentCourseResponse } from "@/features/student/courses/types/student-course";
import { getApiErrorCode } from "@/lib/api-error";
import { Loader2Icon, FolderKanbanIcon, PlusIcon } from "lucide-react";
import type { RoleInTeam } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { ProjectBannerHeader } from "./project-banner-header";
import { TeamMembersCard } from "./team-members-card";
import { ProjectDetailsCard } from "./project-details-card";
import { ProjectIntegrationsCard } from "./project-integrations-card";
import { ProjectSyncStatusCard } from "./project-sync-status-card";
import { ProjectEditModal } from "./project-edit-modal";
import { ProjectInfoSkeleton } from "./project-info-skeleton";

export function ProjectInfoView() {
  const { user, selectedCourse, setSelectedCourse } = useAuthStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [localOverrides, setLocalOverrides] = useState<Partial<StudentProjectDetails>>({});
  const refreshCourses = useRefreshStudentCourses();

  const { data: apiCourses = [], isLoading: isCoursesLoading } = useStudentCourses({
    enabled: user?.role === "STUDENT" && !selectedCourse,
  });

  const effectiveCourse = useMemo(() => {
    if (selectedCourse) return selectedCourse;
    if (apiCourses.length > 0) return mapStudentCourseResponse(apiCourses[0]);
    return null;
  }, [selectedCourse, apiCourses]);

  useEffect(() => {
    if (!selectedCourse && effectiveCourse) setSelectedCourse(effectiveCourse);
  }, [selectedCourse, effectiveCourse, setSelectedCourse]);

  const courseId = effectiveCourse?.courseId || effectiveCourse?.id || "";

  const { data: apiProject, isLoading: isProjectLoading } = useStudentProject(courseId);
  const {
    data: team,
    isLoading: isTeamLoading,
    isError: isTeamError,
    error: teamError,
    refetch: refetchTeam,
  } = useStudentMyTeam(courseId, { enabled: Boolean(courseId) });

  const projectId = apiProject?.projectId || team?.projectId || effectiveCourse?.projectId || "";

  const forbidden = getApiErrorCode(teamError) === "STUDENT_COURSE_FORBIDDEN";
  useEffect(() => { if (forbidden) void refreshCourses(); }, [forbidden, refreshCourses]);

  const hasTeam = Boolean(team?.teamId || team?.teamName || effectiveCourse?.teamId || effectiveCourse?.teamName || (team?.members && team.members.length > 0));

  const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const cleanUserName = norm((user?.fullName || user?.name || "").replace(/\([^)]*\)/g, ""));
  const isLeaderFromMembers = Boolean(
    team?.members?.some((m) => {
      if (m.role?.toUpperCase() !== "LEADER") return false;
      if (user?.studentCode && m.studentCode?.toLowerCase() === user.studentCode.toLowerCase()) return true;
      if (user?.email && m.studentCode && user.email.toLowerCase().includes(m.studentCode.toLowerCase())) return true;
      return cleanUserName.length > 0 && cleanUserName === norm(m.fullName || "");
    })
  );

  const rawRole = team?.myRole || (team as unknown as { role?: string })?.role;
  const effectiveRole = rawRole || effectiveCourse?.myGroup?.role;
  const isLeader = Boolean(effectiveRole?.toUpperCase() === "LEADER" || isLeaderFromMembers);
  const isRoleLoading = isTeamLoading && !effectiveRole && !isLeaderFromMembers;

  useEffect(() => {
    if (!team || !effectiveCourse) return;
    const targetRole = (isLeader ? "LEADER" : (team.myRole || "MEMBER")) as RoleInTeam;
    if (effectiveCourse.myGroup?.role === targetRole && effectiveCourse.projectId === team.projectId) return;
    setSelectedCourse({
      ...effectiveCourse,
      teamId: team.teamId || effectiveCourse.teamId,
      teamNo: team.teamNo ?? effectiveCourse.teamNo,
      teamName: team.teamName || effectiveCourse.teamName,
      projectId: team.projectId || effectiveCourse.projectId,
      myGroup: { id: team.teamId || "", name: team.teamName || "", role: targetRole, membersCount: team.members?.length ?? 0 },
    });
  }, [team, effectiveCourse, isLeader, setSelectedCourse]);

  const hasProject = Boolean(
    apiProject?.projectId?.trim() || apiProject?.name?.trim() || team?.projectId?.trim() ||
    effectiveCourse?.projectId?.trim() || localOverrides.projectId?.trim() || localOverrides.name?.trim()
  );
  const isInitialLoading = (isProjectLoading || isTeamLoading || (isCoursesLoading && !effectiveCourse)) && !apiProject && !team;

  const project: StudentProjectDetails = useMemo(() => {
    const teamName = team?.teamName || apiProject?.teamName || effectiveCourse?.teamName || "";
    const teamNo = team?.teamNo ?? apiProject?.teamNo ?? effectiveCourse?.teamNo ?? 0;
    const roleLabel = isLeader ? "Leader" : (team?.myRole === "MEMBER" ? "Member" : "");

    const base: StudentProjectDetails = {
      id: apiProject?.projectId || team?.projectId || "",
      projectId: apiProject?.projectId || team?.projectId || "",
      courseId: apiProject?.courseId || courseId,
      teamId: team?.teamId || apiProject?.teamId || effectiveCourse?.teamId || "",
      teamNo: teamNo,
      teamName: teamName,
      name: apiProject?.name || "Chưa có dự án",
      description: apiProject?.description || "Dự án nhóm học phần",
      category: (apiProject?.projectType?.name as ProjectCategory) || "",
      projectType: apiProject?.projectType || { id: "", code: "", name: "" },
      createdBy: apiProject?.createdBy || { userId: "", fullName: "" },
      createdAt: apiProject?.createdAt || new Date().toISOString(),
      jiraConfig: undefined,
      githubRepositories: [],
      members: [],
      groupName: teamName ? `Nhóm ${teamNo || 1} · ${teamName}${roleLabel ? ` · ${roleLabel}` : ""}` : (hasTeam ? `Nhóm ${teamNo || 1}` : "Chưa có nhóm"),
    };

    return { ...base, ...localOverrides, members: [] };
  }, [apiProject, courseId, effectiveCourse, hasTeam, isLeader, localOverrides, team]);

  const handleUpdateProject = (fields: Partial<StudentProjectDetails>) =>
    setLocalOverrides((p) => ({ ...p, ...fields, updatedAt: new Date().toISOString() }));

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-12">
      {(isProjectLoading || isTeamLoading) && !isInitialLoading && (
        <div className="flex animate-pulse items-center gap-2.5 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-2.5 text-xs font-medium text-primary">
          <Loader2Icon className="h-4 w-4 shrink-0 animate-spin" />
          <span>Đang đồng bộ thông tin nhóm và dự án từ máy chủ...</span>
        </div>
      )}

      <ProjectBannerHeader
        project={project}
        course={effectiveCourse}
        isLeader={isLeader}
        hasTeam={hasTeam}
        isRoleLoading={isRoleLoading}
      />

      <div className="space-y-6">
        {isInitialLoading ? (
          <ProjectInfoSkeleton />
        ) : !hasProject ? (
          <div className="space-y-5">
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

              {isRoleLoading ? (
                <div className="flex flex-col items-center justify-center gap-2 p-4 text-xs text-muted-foreground animate-pulse">
                  <Loader2Icon className="w-5 h-5 animate-spin text-primary" />
                  <span>Đang đồng bộ và xác thực quyền Trưởng nhóm...</span>
                </div>
              ) : isLeader ? (
                <div className="flex flex-col items-center gap-2">
                  <Button
                    size="lg"
                    onClick={() => setIsEditModalOpen(true)}
                    className="h-10 px-6 text-xs font-bold rounded-xl gap-2 cursor-pointer shadow-md bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Tạo dự án mới
                  </Button>
                  <p className="text-[11px] text-muted-foreground/80">Dành cho Trưởng nhóm (Team Leader) đăng ký đề tài ban đầu</p>
                </div>
              ) : (
                <div className="inline-block px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs text-center max-w-md">
                  <span className="font-semibold">Bạn đang tham gia với vai trò Thành viên (Member). </span>
                  <span className="text-muted-foreground">Vui lòng chờ Trưởng nhóm khởi tạo đề tài dự án.</span>
                </div>
              )}
            </div>

            <TeamMembersCard
              course={effectiveCourse}
              team={team}
              isLoading={isTeamLoading}
              isError={isTeamError}
              error={teamError}
              onRetry={() => void refetchTeam()}
              onForbidden={() => void refreshCourses()}
            />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="lg:col-span-6 space-y-5">
                <ProjectDetailsCard project={project} isLeader={isLeader} />
                <TeamMembersCard
                  course={effectiveCourse}
                  team={team}
                  isLoading={isTeamLoading}
                  isError={isTeamError}
                  error={teamError}
                  onRetry={() => void refetchTeam()}
                  onForbidden={() => void refreshCourses()}
                />
              </div>

              <div className="lg:col-span-6 space-y-5">
                <ProjectIntegrationsCard
                  projectId={projectId || project.projectId || project.id || ""}
                  isLeader={isLeader}
                />
              </div>
            </div>

            <ProjectSyncStatusCard
              projectId={projectId || project.projectId || project.id || ""}
            />
          </div>
        )}
      </div>

      <ProjectEditModal
        key={isEditModalOpen ? "modal-open" : "modal-closed"}
        isOpen={isEditModalOpen}
        project={project}
        courseId={courseId}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateProject}
      />
    </div>
  );
}
