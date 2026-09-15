"use client";

import { useState, useMemo } from "react";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  DownloadIcon,
  FolderKanbanIcon,
  GitGraphIcon,
  RotateCcwIcon,
  SearchIcon,
  ShieldAlertIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";
import { CustomSelect, type CustomSelectOption } from "@/components/common/custom-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useLecturerTeams } from "@/features/lecturer/teams/hooks/use-lecturer-teams";
import { getApiErrorCode, getApiErrorMessage, getApiErrorStatus } from "@/lib/api-error";
import type { RoleInTeam } from "@/types/auth";
import { usePipelineGraphData } from "../hooks/use-pipeline-graph-data";
import {
  buildPipelineTasksCsv,
  downloadTextFile,
} from "../lib/pipeline-mapper";
import {
  UNASSIGNED_LANE_ID,
  type PipelineAnomalyFilterType,
  type PipelineFilterState,
  type PipelineTask,
} from "../types/pipeline";
import { PipelineEmptyState } from "./pipeline-empty-state";
import { PipelineFlowView } from "./pipeline-flow-view";
import { PipelineMatrixTable } from "./pipeline-matrix-table";
import { PipelineRepositoryFilters } from "./pipeline-repository-filters";
import { PipelineStatsBar } from "./pipeline-stats-bar";
import { PipelineTaskInspector } from "./pipeline-task-inspector";

interface LecturerGraphViewProps {
  courseId?: string;
  initialTeamId?: string;
}

export function LecturerGraphView({ courseId, initialTeamId }: LecturerGraphViewProps = {}) {
  const teamsQuery = useLecturerTeams(courseId || "", {
    enabled: Boolean(courseId),
  });

  const teams = useMemo(() => teamsQuery.data?.teams || [], [teamsQuery.data]);

  // Tìm nhóm mặc định: ưu tiên nhóm đầu tiên đã có projectId
  const defaultTeam = useMemo(
    () => teams.find((t) => Boolean(t.projectId)) || teams[0] || null,
    [teams]
  );

  const [selectedTeamIdState, setSelectedTeamIdState] = useState<string>("");

  const selectedTeamId = useMemo(() => {
    if (selectedTeamIdState && teams.some((t) => t.teamId === selectedTeamIdState)) {
      return selectedTeamIdState;
    }
    if (initialTeamId && teams.some((t) => t.teamId === initialTeamId)) {
      return initialTeamId;
    }
    return defaultTeam?.teamId || "";
  }, [defaultTeam, initialTeamId, selectedTeamIdState, teams]);

  const currentTeam = useMemo(
    () => teams.find((t) => t.teamId === selectedTeamId) || defaultTeam,
    [defaultTeam, selectedTeamId, teams]
  );

  const projectId = currentTeam?.projectId || null;

  // Mode: FLOW vs MATRIX
  const [viewMode, setViewMode] = useState<"FLOW" | "MATRIX">("FLOW");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isMobileInspectorOpen, setIsMobileInspectorOpen] = useState(false);

  // Filters
  const [pipelineFilter, setPipelineFilter] = useState<PipelineFilterState>({
    studentId: "ALL",
    sprintId: "ALL",
    anomalyType: "ALL",
    searchQuery: "",
    repoId: "ALL",
    branchName: "ALL",
  });

  // Khi đổi team, reset selection và filter
  const handleSelectTeam = (newTeamId: string) => {
    setSelectedTeamIdState(newTeamId);
    setSelectedTaskId(null);
    setPipelineFilter({
      studentId: "ALL",
      sprintId: "ALL",
      anomalyType: "ALL",
      searchQuery: "",
      repoId: "ALL",
      branchName: "ALL",
    });
  };

  // Convert members sang định dạng StudentTeamMember cho hook
  const teamMembersInput = useMemo(
    () =>
      (currentTeam?.members || []).map((m) => ({
        studentCode: m.studentCode,
        fullName: m.fullName,
        role: (m.role as RoleInTeam) || "MEMBER",
        email: m.email,
      })),
    [currentTeam]
  );

  // Gọi hook pipeline chỉ khi có projectId hợp lệ
  const pipeline = usePipelineGraphData({
    enabled: Boolean(projectId),
    projectId,
    selectedTaskId,
    teamMembers: teamMembersInput,
    filter: pipelineFilter,
  });

  // Repository & branch filter nếu có repo
  // Options bộ lọc
  const teamSelectOptions = useMemo(
    () =>
      teams.map((t) => ({
        value: t.teamId,
        label: t.teamName ? `Nhóm ${t.teamNo} - ${t.teamName}` : `Nhóm ${t.teamNo}`,
        subLabel: t.projectId
          ? `${t.members?.length || 0} thành viên`
          : "Chưa khởi tạo dự án",
        icon: <FolderKanbanIcon className="size-4 text-primary shrink-0" />,
      })),
    [teams]
  );

  const memberSelectOptions = useMemo<CustomSelectOption[]>(() => {
    const opts: CustomSelectOption[] = pipeline.members.map((member) => ({
      value: member.studentId,
      label: member.fullName,
      subLabel: `${member.studentCode} (${member.teamRole})`,
      icon: <UsersIcon className="size-4 text-muted-foreground shrink-0" />,
    }));
    if (pipeline.tasks.some((t) => !t.assigneeStudentId && !t.assigneeDisplayName)) {
      opts.push({
        value: UNASSIGNED_LANE_ID,
        label: "Chưa phân công",
        subLabel: "Task không có người nhận",
      });
    }
    return [{ value: "ALL", label: "Tất cả thành viên" }, ...opts];
  }, [pipeline.members, pipeline.tasks]);

  const sprintSelectOptions = useMemo(() => {
    const opts = pipeline.sprints.map((sprint) => ({
      value: sprint.id,
      label: sprint.name,
      subLabel: sprint.state === "backlog" ? "Chưa vào Sprint" : undefined,
    }));
    return [{ value: "ALL", label: "Tất cả Sprint" }, ...opts];
  }, [pipeline.sprints]);

  const anomalySelectOptions = useMemo(
    () => [
      { value: "ALL", label: "Tất cả Task" },
      { value: "DONE_NO_COMMIT", label: "Hoàn thành chưa có Commit (MSR Anomaly)" },
      { value: "UNASSIGNED", label: "Chưa phân công người làm" },
      { value: "MISSING_COMMITS", label: "Chưa có bất kỳ Commit nào liên kết" },
    ],
    []
  );

  // Click task handler
  const handleSelectTask = (taskId: string) => {
    setSelectedTaskId((current) => {
      const next = current === taskId ? null : taskId;
      if (next && typeof window !== "undefined" && window.innerWidth < 1024) {
        setIsMobileInspectorOpen(true);
      }
      return next;
    });
  };

  const selectedTask = useMemo<PipelineTask | null>(
    () => pipeline.filteredTasks.find((task) => task.id === pipeline.effectiveTaskId) || null,
    [pipeline.effectiveTaskId, pipeline.filteredTasks]
  );

  const hasActiveFilters = Boolean(
    pipelineFilter.studentId !== "ALL" ||
    pipelineFilter.sprintId !== "ALL" ||
    (pipelineFilter.anomalyType && pipelineFilter.anomalyType !== "ALL") ||
    pipelineFilter.searchQuery ||
    (pipelineFilter.repoId && pipelineFilter.repoId !== "ALL") ||
    (pipelineFilter.branchName && pipelineFilter.branchName !== "ALL")
  );

  const handleResetFilters = () => {
    setPipelineFilter({
      studentId: "ALL",
      sprintId: "ALL",
      anomalyType: "ALL",
      searchQuery: "",
      repoId: "ALL",
      branchName: "ALL",
    });
  };

  const handleExportCsv = () => {
    if (!pipeline.filteredTasks.length) {
      toast.error("Không có Task nào để xuất file.");
      return;
    }
    const csv = buildPipelineTasksCsv(pipeline.filteredTasks);
    const filename = `SAGA_Traceability_Nhom_${currentTeam?.teamNo || "team"}.csv`;
    downloadTextFile(filename, csv);
    toast.success(`Đã xuất báo cáo ${pipeline.filteredTasks.length} Task thành công!`);
  };

  // Rule trạng thái đối soát dựa trên dữ liệu thật
  const teamStatusRule = useMemo(() => {
    if (!projectId) {
      return {
        label: "Chưa có Project",
        variant: "muted" as const,
        icon: null,
      };
    }
    if (pipeline.stats.doneWithoutLinkedCommits > 0) {
      return {
        label: "Cần đối soát",
        variant: "warning" as const,
        icon: <AlertTriangleIcon className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />,
      };
    }
    if (pipeline.tasks.length === 0) {
      return {
        label: "Chưa có Task",
        variant: "muted" as const,
        icon: null,
      };
    }
    return {
      label: "Hoạt động tốt",
      variant: "success" as const,
      icon: <CheckCircle2Icon className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />,
    };
  }, [pipeline.stats.doneWithoutLinkedCommits, pipeline.tasks.length, projectId]);

  // Loading lần đầu
  if (teamsQuery.isLoading) {
    return (
      <div className="space-y-6 animate-pulse" aria-label="Đang tải dữ liệu giám sát">
        <div className="h-24 rounded-2xl bg-muted/60 border border-border/80" />
        <div className="h-14 rounded-2xl bg-muted/40 border border-border/60" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-96 rounded-3xl bg-muted/30 border border-border/60" />
          <div className="lg:col-span-4 h-96 rounded-3xl bg-muted/30 border border-border/60" />
        </div>
      </div>
    );
  }

  // Error phân quyền 403
  if (
    teamsQuery.isError &&
    (getApiErrorStatus(teamsQuery.error) === 403 ||
      getApiErrorCode(teamsQuery.error) === "LECTURER_COURSE_FORBIDDEN")
  ) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-destructive/30 bg-destructive/5 space-y-3">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldAlertIcon className="size-6" />
        </div>
        <h3 className="text-base font-extrabold text-foreground">Truy cập bị từ chối</h3>
        <p className="text-xs text-muted-foreground max-w-md">
          Bạn không có quyền truy cập hoặc không được phân công giảng dạy lớp học phần này.
        </p>
      </div>
    );
  }

  // Error chung khi tải teams
  if (teamsQuery.isError) {
    return (
      <div className="p-8 text-center rounded-3xl border border-destructive/30 bg-destructive/5 space-y-3">
        <p className="text-sm font-semibold text-destructive">
          {getApiErrorMessage(teamsQuery.error, "Không thể tải danh sách nhóm của lớp học phần.")}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => teamsQuery.refetch()}
          className="text-xs cursor-pointer"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  // Lớp chưa có nhóm
  if (teams.length === 0) {
    return (
      <PipelineEmptyState
        title="Lớp học phần chưa có nhóm"
        description="Lớp học phần này hiện chưa có nhóm sinh viên nào được phân công. Vui lòng kiểm tra lại danh sách lớp hoặc phân nhóm trước."
        onRetry={() => teamsQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & KPI Thật */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-border/80 bg-card/90 shadow-xs backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="size-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <GitGraphIcon className="size-5.5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                Đồ thị & Đối soát nguồn gốc
              </h1>
              <Badge
                variant="outline"
                className="border-primary/20 bg-primary/10 font-mono text-[10px] font-bold text-primary"
              >
                Traceability Pipeline
              </Badge>
              <Badge
                className={
                  teamStatusRule.variant === "warning"
                    ? "bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-[10px] font-bold gap-1"
                    : teamStatusRule.variant === "success"
                      ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-bold gap-1"
                      : "bg-muted text-muted-foreground border border-border text-[10px]"
                }
              >
                {teamStatusRule.icon}
                <span>{teamStatusRule.label}</span>
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Đối soát liên kết giữa công việc Jira, Git commit và tiến độ thực hiện của các thành viên trong nhóm.
            </p>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl border border-border/60 self-start sm:self-auto shrink-0 shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode("FLOW")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              viewMode === "FLOW"
                ? "bg-card text-foreground shadow-xs border border-border/80"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>⊞ Pipeline Flow</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("MATRIX")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              viewMode === "MATRIX"
                ? "bg-card text-foreground shadow-xs border border-border/80"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>▦ Bảng đối soát Matrix</span>
          </button>
        </div>
      </div>

      {/* 2. Toolbar Bộ Lọc & Team Selector */}
      <div className="space-y-3 rounded-2xl border border-border/80 bg-card/90 p-3.5 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Team Selector */}
          <div className="col-span-1 sm:col-span-2 md:col-span-1 lg:col-span-2">
            <CustomSelect
              id="team-selector"
              value={selectedTeamId}
              onChange={handleSelectTeam}
              options={teamSelectOptions}
            />
          </div>

          {/* Search Input */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              value={pipelineFilter.searchQuery || ""}
              onChange={(e) =>
                setPipelineFilter((prev) => ({ ...prev, searchQuery: e.target.value }))
              }
              placeholder="Tìm Task key, title..."
              className="h-10 pl-8 text-xs rounded-xl bg-card border-border/80"
            />
            {pipelineFilter.searchQuery && (
              <button
                type="button"
                onClick={() => setPipelineFilter((prev) => ({ ...prev, searchQuery: "" }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <XIcon className="size-3" />
              </button>
            )}
          </div>

          {/* Assignee Filter */}
          <div>
            <CustomSelect
              id="assignee-filter"
              value={pipelineFilter.studentId}
              onChange={(val) => setPipelineFilter((prev) => ({ ...prev, studentId: val }))}
              options={memberSelectOptions}
            />
          </div>

          {/* Sprint Filter */}
          <div>
            <CustomSelect
              id="sprint-filter"
              value={pipelineFilter.sprintId}
              onChange={(val) => setPipelineFilter((prev) => ({ ...prev, sprintId: val }))}
              options={sprintSelectOptions}
            />
          </div>

          {/* Anomaly Filter */}
          <div>
            <CustomSelect
              id="anomaly-filter"
              value={pipelineFilter.anomalyType || "ALL"}
              onChange={(val) =>
                setPipelineFilter((prev) => ({
                  ...prev,
                  anomalyType: val as PipelineAnomalyFilterType,
                }))
              }
              options={anomalySelectOptions}
            />
          </div>
        </div>

        {/* Dòng bổ sung: Repository, Branch và thao tác */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/50 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <PipelineRepositoryFilters
              compact
              repositories={pipeline.repositories}
              branches={pipeline.branches}
              selectedRepoId={pipeline.sanitizedFilter.repoId || "ALL"}
              selectedBranchName={pipeline.sanitizedFilter.branchName || "ALL"}
              onSelectRepository={(repoId) => {
                setSelectedTaskId(null);
                setPipelineFilter((current) => ({
                  ...current,
                  repoId,
                  branchName: "ALL",
                }));
              }}
              onSelectBranch={(branchName) => {
                setSelectedTaskId(null);
                setPipelineFilter((current) => ({ ...current, branchName }));
              }}
              isLoadingBranches={pipeline.isLoadingBranches}
              canonicalFilter={pipeline.taskCommitLinksFilter}
            />
            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <RotateCcwIcon className="size-3" />
                Đặt lại bộ lọc
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={!pipeline.filteredTasks.length}
              className="h-8 gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <DownloadIcon className="size-3.5" />
              Xuất CSV
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Trường hợp nhóm chưa khởi tạo dự án */}
      {!projectId ? (
        <PipelineEmptyState
          title={`Nhóm ${currentTeam?.teamNo || ""} chưa khởi tạo dự án`}
          description="Nhóm này chưa liên kết với không gian làm việc Jira hoặc kho lưu trữ GitHub. Giảng viên vui lòng nhắc nhở nhóm thiết lập dự án để bắt đầu theo dõi dữ liệu đối soát."
        />
      ) : pipeline.isLoadingMain ? (
        /* Loading nội dung khi đổi nhóm */
        <div className="space-y-4 animate-pulse">
          <div className="h-16 rounded-2xl bg-muted/40 border border-border/60" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 h-80 rounded-3xl bg-muted/30 border border-border/60" />
            <div className="lg:col-span-4 h-80 rounded-3xl bg-muted/30 border border-border/60" />
          </div>
        </div>
      ) : (
        <>
          {pipeline.isTaskCommitsError ? (
            <PipelineEmptyState
              title="Không tải được liên kết Task–Commit"
              description={pipeline.taskCommitsErrorMessage || "Vui lòng thử tải lại dữ liệu đối soát."}
              onRetry={() => void pipeline.refetchTaskCommits()}
            />
          ) : null}
          {/* KPI Stats Bar Thật */}
          <PipelineStatsBar
            stats={pipeline.stats}
            isLoadingCommits={pipeline.isLoadingCommits}
          />

          {/* 4. Nội dung chính: 2 Cột Desktop (65-70% / 30-35%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Cột Trái: Pipeline Flow HOẶC Audit Matrix */}
            <div className="lg:col-span-8 xl:col-span-8 space-y-4 min-w-0">
              {viewMode === "FLOW" ? (
                <PipelineFlowView
                  lanes={pipeline.lanes}
                  selectedTaskId={selectedTaskId}
                  onSelectTask={handleSelectTask}
                />
              ) : (
                <PipelineMatrixTable
                  tasks={pipeline.filteredTasks}
                  selectedTaskId={selectedTaskId}
                  onSelectTask={handleSelectTask}
                />
              )}
            </div>

            {/* Cột Phải: Task Inspector Desktop (Sticky) */}
            <div className="hidden lg:block lg:col-span-4 xl:col-span-4 self-start lg:sticky lg:top-28 lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto">
              <PipelineTaskInspector
                selectedTask={selectedTask}
                commits={pipeline.selectedCommits}
                isLoadingCommits={pipeline.isLoadingTaskCommits}
                errorMessage={pipeline.taskCommitsErrorMessage}
                onRetry={pipeline.refetchTaskCommits}
                onClearSelection={() => setSelectedTaskId(null)}
              />
            </div>
          </div>

          {/* Mobile / Tablet Sheet Drawer chứa Task Inspector (< lg) */}
          <Sheet open={isMobileInspectorOpen} onOpenChange={setIsMobileInspectorOpen}>
            <SheetContent
              side="right"
              className="w-full sm:max-w-md p-0 overflow-hidden border-l border-border"
            >
              <div className="h-full overflow-y-auto p-4">
                <PipelineTaskInspector
                  selectedTask={selectedTask}
                  commits={pipeline.selectedCommits}
                  isLoadingCommits={pipeline.isLoadingTaskCommits}
                  errorMessage={pipeline.taskCommitsErrorMessage}
                  onRetry={pipeline.refetchTaskCommits}
                  onClearSelection={() => {
                    setSelectedTaskId(null);
                    setIsMobileInspectorOpen(false);
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>
        </>
      )}
    </div>
  );
}
