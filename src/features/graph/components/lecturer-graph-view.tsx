"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  FolderKanbanIcon,
  GitGraphIcon,
  ShieldAlertIcon,
  UsersIcon,
  NetworkIcon,
  CalendarIcon,
  AlertCircleIcon,
} from "lucide-react";
import { CustomSelect, type CustomSelectOption } from "@/components/common/custom-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useLecturerTeams } from "@/features/lecturer/teams/hooks/use-lecturer-teams";
import { useProjectSprints } from "@/features/student/sprint-progress/hooks/use-project-sprints";
import { useTaskOptions } from "@/features/student/sprint-progress/hooks/use-project-tasks";
import { scopeSprintsToJiraSource } from "@/features/student/sprint-progress/lib/jira-source-scope";
import { JiraSourceSwitcher } from "@/features/student/project/components/jira-source-switcher";
import { useProjectJiraSourceSelection } from "@/features/student/project/hooks/use-project-jira-source-selection";
import { getApiErrorCode, getApiErrorMessage, getApiErrorStatus } from "@/lib/api-error";
import type { RoleInTeam } from "@/types/auth";
import dynamic from "next/dynamic";
import { Loader2Icon } from "lucide-react";

const CytoscapeGraphCanvas = dynamic(
  () => import("./cytoscape-graph-canvas").then((mod) => mod.CytoscapeGraphCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[580px] sm:h-[640px] lg:h-[calc(100vh-230px)] min-h-[540px] max-h-[780px] rounded-xl border border-border/90 bg-muted/20 flex flex-col items-center justify-center text-muted-foreground gap-3">
        <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
        <span className="text-xs font-medium">Đang xử lý Đồ thị...</span>
      </div>
    )
  }
);
import { GraphStatsSummary } from "./graph-stats-summary";
import { GraphNodeDetailsModal } from "./graph-node-details-modal";
import { Neo4jTabBar } from "./neo4j-tab-bar";
import { useAccumulatedProjectGraph, useProjectGraph } from "../hooks/use-project-graph";
import { buildGraphScopeParams, type GraphScopeMode } from "../lib/graph-scope";
import { describeGraphLoadError } from "../lib/graph-error";
import { useProjectCommits } from "@/features/student/project/hooks/useProjectSync";
import { CommitDetailModal } from "@/features/student/commits/components/commit-detail-modal";
import { usePipelineGraphData } from "../hooks/use-pipeline-graph-data";
import {
  mapStudentNodesToMemberOptions,
  resolveDrillDownStudent,
  STUDENT_ROSTER_SUBGRAPH_PARAMS,
  type GraphDrillDownStudent,
} from "../lib/student-profile-id";
import {
  UNASSIGNED_LANE_ID,
  type PipelineFilterState,
  type PipelineTask,
} from "../types/pipeline";
import type { CytoscapeNodeData, GraphType } from "../types/graph";
import { PipelineEmptyState } from "./pipeline-empty-state";
import { PipelineFlowView } from "./pipeline-flow-view";
import { PipelineMatrixTable } from "./pipeline-matrix-table";
import { PipelineRepositoryFilters } from "./pipeline-repository-filters";
import { PipelineStatsBar } from "./pipeline-stats-bar";
import { PipelineTaskInspector } from "./pipeline-task-inspector";
import { PipelineFilterBar } from "./pipeline-filter-bar";

interface LecturerGraphViewProps {
  courseId?: string;
  initialTeamId?: string;
  initialStudentId?: string;
  initialTaskId?: string;
  initialCommitId?: string;
  initialCommitHash?: string;
  initialViewMode?: "GRAPH" | "PIPELINE";
}

type Neo4jTabMode = "OVERVIEW" | "ACTIVITY" | "ATTRIBUTION";

export function LecturerGraphView({
  courseId,
  initialTeamId,
  initialStudentId,
  initialTaskId,
  initialCommitId,
  initialCommitHash,
  initialViewMode = "GRAPH",
}: LecturerGraphViewProps = {}) {
  const teamsQuery = useLecturerTeams(courseId || "", {
    enabled: Boolean(courseId),
  });

  const teams = useMemo(() => teamsQuery.data?.teams || [], [teamsQuery.data]);

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

  const [mainMode, setMainMode] = useState<"GRAPH" | "PIPELINE">(
    initialTaskId ? "PIPELINE" : initialViewMode
  );
  const [neo4jTab, setNeo4jTab] = useState<Neo4jTabMode>("OVERVIEW");
  const [drillDownStudent, setDrillDownStudent] = useState<GraphDrillDownStudent | null>(() =>
    initialStudentId ? resolveDrillDownStudent(initialStudentId) : null
  );
  const [selectedSprintState, setSelectedSprintState] = useState<string | null>(null);
  const [neo4jFilterType, setNeo4jFilterType] = useState<"ALL" | "ANOMALIES_ONLY">("ALL");
  const [selectedGraphNode, setSelectedGraphNode] = useState<CytoscapeNodeData | null>(null);

  const [scopeMode, setScopeMode] = useState<GraphScopeMode>("COMPACT");
  const [usedCriteriaOnly, setUsedCriteriaOnly] = useState(false);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [focusedNodeLabel, setFocusedNodeLabel] = useState<string | null>(null);

  const [prevProjectId, setPrevProjectId] = useState(projectId);
  if (projectId !== prevProjectId) {
    setPrevProjectId(projectId);
    setDrillDownStudent(null);
    setFocusedNodeId(null);
    setFocusedNodeLabel(null);
  }

  const activeFocusedNodeId = projectId === prevProjectId ? focusedNodeId : null;

  const activeDrillDownStudent = useMemo<GraphDrillDownStudent | null>(() => {
    if (projectId !== prevProjectId || !drillDownStudent) return null;

    const studentProfileId = drillDownStudent.studentProfileId;
    const isRawUuid =
      drillDownStudent.label === studentProfileId ||
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(drillDownStudent.label);

    if (!isRawUuid && drillDownStudent.label) {
      return drillDownStudent;
    }

    const allMembers = teams.flatMap((t) => t.members || []);
    const matchedMember = allMembers.find(
      (m) =>
        m.studentProfileId?.toLowerCase() === studentProfileId.toLowerCase() ||
        m.studentCode?.toLowerCase() === studentProfileId.toLowerCase()
    );

    if (matchedMember) {
      return {
        studentProfileId: matchedMember.studentProfileId || studentProfileId,
        label: matchedMember.studentCode
          ? `${matchedMember.fullName} (${matchedMember.studentCode})`
          : matchedMember.fullName,
      };
    }

    return drillDownStudent;
  }, [drillDownStudent, prevProjectId, projectId, teams]);

  const [pipelineSubView, setPipelineSubView] = useState<"FLOW" | "MATRIX">("FLOW");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(initialTaskId || null);
  const [isMobileInspectorOpen, setIsMobileInspectorOpen] = useState(false);
  const [deepLinkCommitId, setDeepLinkCommitId] = useState<string | null>(initialCommitId || null);
  const [appliedCitationTaskId, setAppliedCitationTaskId] = useState(initialTaskId || "");
  const [appliedCitationCommitId, setAppliedCitationCommitId] = useState(initialCommitId || "");

  const [pipelineFilter, setPipelineFilter] = useState<PipelineFilterState>({
    studentId: initialStudentId || "ALL",
    sprintId: "ALL",
    anomalyType: "ALL",
    searchQuery: "",
    repoId: "ALL",
    branchName: "ALL",
  });

  if (initialTaskId && initialTaskId !== appliedCitationTaskId) {
    setAppliedCitationTaskId(initialTaskId);
    setSelectedTaskId(initialTaskId);
    setMainMode("PIPELINE");
  }
  if (initialCommitId && initialCommitId !== appliedCitationCommitId) {
    setAppliedCitationCommitId(initialCommitId);
    setDeepLinkCommitId(initialCommitId);
  }

  const commitLookup = useProjectCommits(projectId, {
    enabled: Boolean(projectId && initialCommitHash && !initialCommitId && !deepLinkCommitId),
    page: 0,
    size: 100,
  });
  const [mobileCitationApplied, setMobileCitationApplied] = useState(false);
  if (!mobileCitationApplied && initialTaskId) {
    setMobileCitationApplied(true);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsMobileInspectorOpen(true);
    }
  }
  if (!initialCommitId && initialCommitHash && !deepLinkCommitId) {
    const payload = commitLookup.data;
    const items = Array.isArray(payload) ? payload : payload?.items ?? [];
    const hash = initialCommitHash.toLowerCase();
    const matched = items.find(
      (commit) => commit.sha?.toLowerCase() === hash || commit.sha?.toLowerCase().startsWith(hash)
    );
    if (matched?.id) setDeepLinkCommitId(matched.id);
  }

  const [prevInitialStudentId, setPrevInitialStudentId] = useState(initialStudentId);
  if (initialStudentId !== prevInitialStudentId) {
    setPrevInitialStudentId(initialStudentId);
    if (initialStudentId) {
      const resolved = resolveDrillDownStudent(initialStudentId);
      if (resolved) {
        setDrillDownStudent(resolved);
      }
      setPipelineFilter((prev) => ({ ...prev, studentId: initialStudentId }));
    }
  }

  const jiraSource = useProjectJiraSourceSelection(projectId, { readerMode: true });
  const sprintsQuery = useProjectSprints(projectId, jiraSource.effectiveSourceId, {
    enabled: Boolean(projectId),
  });
  const taskOptionsQuery = useTaskOptions(projectId, {
    enabled: Boolean(projectId && jiraSource.effectiveSourceId),
    jiraIntegrationId: jiraSource.effectiveSourceId,
  });
  const sourceSprints = useMemo(
    () =>
      jiraSource.effectiveSourceId
        ? scopeSprintsToJiraSource(
          sprintsQuery.data || [],
          taskOptionsQuery.data?.sprints,
          undefined,
          jiraSource.effectiveSourceId
        )
        : sprintsQuery.data || [],
    [jiraSource.effectiveSourceId, sprintsQuery.data, taskOptionsQuery.data?.sprints]
  );

  const sprintOptions: CustomSelectOption[] = useMemo(() => {
    return sourceSprints.map((s) => ({
      value: s.id,
      label: s.name,
      subLabel: s.state ? `Trạng thái: ${s.state}` : undefined,
    }));
  }, [sourceSprints]);

  const defaultSprintId = useMemo(() => {
    const list = sourceSprints;
    if (list.length === 0) return null;
    const active = list.find((s) => s.state?.toLowerCase() === "active");
    return active ? active.id : list[0].id;
  }, [sourceSprints]);

  const neo4jSprintId = selectedSprintState !== null ? selectedSprintState : (defaultSprintId || "ALL");

  const handleSprintChange = (sprintId: string) => {
    setSelectedSprintState(sprintId);
    setFocusedNodeId(null);
  };

  const effectiveNeo4jSprintId = useMemo(() => {
    if (activeDrillDownStudent) {
      if (selectedSprintState && selectedSprintState !== "ALL") {
        return selectedSprintState;
      }
      return null;
    }
    if (neo4jSprintId && neo4jSprintId !== "ALL") {
      return neo4jSprintId;
    }
    if (neo4jTab === "ACTIVITY") {
      return defaultSprintId;
    }
    return null;
  }, [activeDrillDownStudent, selectedSprintState, neo4jSprintId, neo4jTab, defaultSprintId]);

  const handleTabChange = (tab: Neo4jTabMode) => {
    setNeo4jTab(tab);
    setFocusedNodeId(null);
    if (
      tab === "ACTIVITY" &&
      (neo4jSprintId === "ALL" || !neo4jSprintId) &&
      defaultSprintId
    ) {
      setSelectedSprintState(defaultSprintId);
    }
  };

  const studentRosterQuery = useProjectGraph({
    projectId: projectId || "",
    graphType: "OVERVIEW",
    sprintId: null,
    subgraphParams: STUDENT_ROSTER_SUBGRAPH_PARAMS,
    enabled: mainMode === "GRAPH" && Boolean(projectId),
  });

  const neo4jMemberSelectOptions = useMemo(
    () => mapStudentNodesToMemberOptions(studentRosterQuery.data?.nodes),
    [studentRosterQuery.data]
  );

  const handleSelectDrillDownStudent = (
    input: string | null,
    fallbackLabel?: string | null
  ) => {
    setFocusedNodeId(null);
    setFocusedNodeLabel(null);
    setSelectedSprintState("ALL");
    setDrillDownStudent(
      resolveDrillDownStudent(input, {
        memberOptions: neo4jMemberSelectOptions,
        fallbackLabel,
      })
    );
  };

  const isSprintRequired = neo4jTab === "ACTIVITY" && !activeDrillDownStudent;
  const hasRequiredSprint = Boolean(effectiveNeo4jSprintId);

  const activeGraphType: GraphType = activeDrillDownStudent ? "CONTRIBUTION" : neo4jTab;

  const subgraphParams = useMemo(
    () =>
      buildGraphScopeParams({
        graphType: activeGraphType,
        scopeMode,
        focusNodeId: activeFocusedNodeId,
        anomaliesOnly: neo4jFilterType === "ANOMALIES_ONLY",
        usedCriteriaOnly,
      }),
    [activeGraphType, scopeMode, activeFocusedNodeId, neo4jFilterType, usedCriteriaOnly]
  );

  const isWaitingDefaultSprint = selectedSprintState === null && sprintsQuery.isLoading;

  const graphQuery = useAccumulatedProjectGraph({
    projectId: projectId || "",
    graphType: activeGraphType,
    sprintId: effectiveNeo4jSprintId,
    studentProfileId: activeDrillDownStudent?.studentProfileId || null,
    subgraphParams,
    enabled:
      mainMode === "GRAPH" &&
      Boolean(projectId) &&
      !isWaitingDefaultSprint &&
      (!isSprintRequired || hasRequiredSprint),
  });

  const displayGraphData = useMemo(() => {
    const rawData = graphQuery.data;
    if (!rawData) return { nodes: [], edges: [] };
    return rawData;
  }, [graphQuery.data]);

  const structuralStats = useMemo(() => {
    const nodes = graphQuery.data?.nodes || [];
    const edges = graphQuery.data?.edges || [];
    const anomalyCount = nodes.filter((n) => n.data.isAnomaly === true).length;
    return {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      anomalyCount,
      meta: graphQuery.data?.meta,
    };
  }, [graphQuery.data]);

  const handleSelectTeam = (newTeamId: string) => {
    setSelectedTeamIdState(newTeamId);
    setSelectedTaskId(null);
    setSelectedGraphNode(null);
    setDrillDownStudent(null);
    setFocusedNodeId(null);
    setFocusedNodeLabel(null);
    setSelectedSprintState("ALL");
    setNeo4jTab("OVERVIEW");
    setNeo4jFilterType("ALL");
    setPipelineFilter({
      studentId: "ALL",
      sprintId: "ALL",
      anomalyType: "ALL",
      searchQuery: "",
      repoId: "ALL",
      branchName: "ALL",
    });
  };

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

  const pipeline = usePipelineGraphData({
    enabled: mainMode === "PIPELINE" && Boolean(projectId),
    projectId,
    jiraIntegrationId: jiraSource.effectiveSourceId,
    selectedTaskId,
    teamMembers: teamMembersInput,
    filter: pipelineFilter,
  });

  const focusedTaskDisplay = useMemo(() => {
    if (!activeFocusedNodeId) return null;

    const rawTaskId = activeFocusedNodeId.replace(/^task:/i, "").trim().toLowerCase();

    const matchedPipelineTask = pipeline.tasks?.find(
      (t) => t.id.toLowerCase() === rawTaskId || t.key.toLowerCase() === rawTaskId
    );
    if (matchedPipelineTask) {
      return matchedPipelineTask.key
        ? `${matchedPipelineTask.key} - ${matchedPipelineTask.title}`
        : matchedPipelineTask.title;
    }

    const matchedGraphNode = displayGraphData.nodes?.find(
      (n) =>
        n.data.id.toLowerCase() === activeFocusedNodeId.toLowerCase() ||
        n.data.id.toLowerCase() === `task:${rawTaskId}` ||
        n.data.id.replace(/^task:/i, "").toLowerCase() === rawTaskId
    );
    if (matchedGraphNode) {
      const hasSubLabel =
        matchedGraphNode.data.subLabel &&
        matchedGraphNode.data.subLabel !== matchedGraphNode.data.label;
      return hasSubLabel
        ? `${matchedGraphNode.data.label} - ${matchedGraphNode.data.subLabel}`
        : matchedGraphNode.data.label;
    }

    if (focusedNodeLabel) {
      return focusedNodeLabel;
    }

    return activeFocusedNodeId.replace(/^task:/i, "");
  }, [activeFocusedNodeId, focusedNodeLabel, pipeline.tasks, displayGraphData.nodes]);

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

  const pipelineSprintSelectOptions = useMemo(() => {
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
      { value: "MISSING_COMMIT", label: "Hoàn thành thiếu Commit (MSR Anomaly)" },
      { value: "MISSING_DOCUMENT", label: "Hoàn thành thiếu Tài liệu" },
      { value: "UNLABELED", label: "Hoàn thành thiếu Nhãn đối soát (UNLABELED)" },
      { value: "UNASSIGNED", label: "Chưa phân công người làm" },
    ],
    []
  );

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

  const teamStatusRule = useMemo(() => {
    if (!projectId) {
      return {
        label: "Chưa có Project",
        variant: "muted" as const,
        icon: null,
      };
    }
    if (mainMode === "GRAPH") {
      if (graphQuery.isLoading) {
        return {
          label: "Đang tải...",
          variant: "muted" as const,
          icon: null,
        };
      }
      if (structuralStats.anomalyCount > 0) {
        return {
          label: "Cần đối soát",
          variant: "warning" as const,
          icon: <AlertTriangleIcon className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />,
        };
      }
      const taskCount = (graphQuery.data?.nodes || []).filter((n) => n.data.type === "TASK").length;
      if (taskCount === 0 && (graphQuery.data?.nodes || []).length > 0) {
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
    }
    if (pipeline.stats.doneWithoutLinkedCommits > 0 || pipeline.stats.missingDocumentTasks > 0) {
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
  }, [
    mainMode,
    projectId,
    graphQuery.isLoading,
    graphQuery.data?.nodes,
    structuralStats.anomalyCount,
    pipeline.stats.doneWithoutLinkedCommits,
    pipeline.stats.missingDocumentTasks,
    pipeline.tasks.length,
  ]);

  if (teamsQuery.isLoading) {
    return (
      <div className="space-y-6 animate-pulse" aria-label="Đang tải dữ liệu giám sát">
        <div className="h-24 rounded-xl bg-muted/60 border border-border/80" />
        <div className="h-14 rounded-xl bg-muted/40 border border-border/60" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-96 rounded-xl bg-muted/30 border border-border/60" />
          <div className="lg:col-span-4 h-96 rounded-xl bg-muted/30 border border-border/60" />
        </div>
      </div>
    );
  }

  if (
    teamsQuery.isError &&
    (getApiErrorStatus(teamsQuery.error) === 403 ||
      getApiErrorCode(teamsQuery.error) === "LECTURER_COURSE_FORBIDDEN")
  ) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-destructive/30 bg-destructive/5 space-y-3">
        <div className="flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <ShieldAlertIcon className="size-6" />
        </div>
        <h3 className="text-base font-extrabold text-foreground">Truy cập bị từ chối</h3>
        <p className="text-xs text-muted-foreground max-w-md">
          Bạn không có quyền truy cập hoặc không được phân công giảng dạy lớp học phần này.
        </p>
      </div>
    );
  }

  if (teamsQuery.isError) {
    return (
      <div className="p-8 text-center rounded-xl border border-destructive/30 bg-destructive/5 space-y-3">
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

  if (teams.length === 0) {
    return (
      <PipelineEmptyState
        title="Lớp học phần chưa có nhóm"
        description="Lớp học phần này hiện chưa có nhóm sinh viên nào được phân công. Vui lòng kiểm tra lại danh sách lớp hoặc phân nhóm trước."
        onRetry={() => teamsQuery.refetch()}
      />
    );
  }

  const renderNeo4jView = () => {
    if (!projectId) {
      return (
        <PipelineEmptyState
          title={`Nhóm ${currentTeam?.teamNo || ""} chưa khởi tạo dự án`}
          description="Nhóm này chưa liên kết với không gian làm việc Jira hoặc kho lưu trữ GitHub. Giảng viên vui lòng nhắc nhở nhóm thiết lập dự án để bắt đầu theo dõi đồ thị."
        />
      );
    }

    if (isSprintRequired && !hasRequiredSprint) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border bg-card/50 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">Dự án chưa có Sprint</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            Chế độ {neo4jTab === "ACTIVITY" ? "Tiến độ Sprint" : "Đồ thị"} yêu cầu dự án cần có ít nhất một Sprint từ Jira để phân tích.
          </p>
        </div>
      );
    }

    if ((graphQuery.isLoading && !graphQuery.data) || isWaitingDefaultSprint) {
      return (
        <div className="flex flex-col items-center justify-center h-[640px] w-full rounded-xl border border-border bg-card/60 space-y-3">
          <div className="w-10 h-10 rounded-full border-3 border-primary border-t-transparent animate-spin" />
          <p className="text-xs font-bold text-muted-foreground">Đang tải đồ thị Neo4j của nhóm...</p>
        </div>
      );
    }

    if (
      graphQuery.isError &&
      getApiErrorCode(graphQuery.error) === "PROJECT_NOT_FOUND" &&
      selectedSprintState &&
      selectedSprintState !== "ALL"
    ) {
      setSelectedSprintState("ALL");
    }

    if (graphQuery.isError) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-destructive/20 bg-destructive/5 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
            <AlertCircleIcon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">Không tải được dữ liệu đồ thị</h3>
          <p className="text-xs text-muted-foreground max-w-md">
            {describeGraphLoadError(graphQuery.error)}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void graphQuery.refetch()}
            className="rounded-xl text-xs font-bold cursor-pointer"
          >
            Thử lại
          </Button>
        </div>
      );
    }

    if (!graphQuery.data || graphQuery.data.nodes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border bg-card/50 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
            <NetworkIcon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">Chưa có dữ liệu liên kết</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            Nhóm dự án hiện chưa có đỉnh hoặc cạnh liên kết nào được ghi nhận từ Neo4j.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {activeFocusedNodeId && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs font-bold text-emerald-700 dark:text-emerald-400 shadow-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <span className="truncate">
                Đang tập trung đối chiếu Task:{" "}
                <code className="font-mono text-foreground bg-background/80 px-2 py-0.5 rounded-md border border-border/60 font-bold whitespace-nowrap">
                  {focusedTaskDisplay}
                </code>{" "}
                và các Commit liên kết (EVIDENCED_BY)
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFocusedNodeId(null);
                setFocusedNodeLabel(null);
              }}
              className="h-7 text-xs rounded-xl cursor-pointer bg-background hover:bg-muted shrink-0"
            >
              Quay lại toàn cảnh
            </Button>
          </div>
        )}
        <CytoscapeGraphCanvas
          nodes={displayGraphData.nodes}
          edges={displayGraphData.edges}
          onSelectNode={(node) => setSelectedGraphNode(node)}
          layoutName="breadthfirst"
          isUpdating={(graphQuery.isFetching && !graphQuery.isLoading) || graphQuery.isLoadingMore}
        />
        <GraphStatsSummary
          totalNodes={structuralStats.totalNodes}
          totalEdges={structuralStats.totalEdges}
          anomalyCount={structuralStats.anomalyCount}
          meta={structuralStats.meta}
          canLoadMore={graphQuery.canLoadMore}
          isLoadingMore={graphQuery.isLoadingMore}
          onLoadMore={graphQuery.loadMore}
        />
      </div>
    );
  };

  const renderPipelineView = () => {
    if (!projectId) {
      return (
        <PipelineEmptyState
          title={`Nhóm ${currentTeam?.teamNo || ""} chưa khởi tạo dự án`}
          description="Nhóm này chưa liên kết với không gian làm việc Jira hoặc kho lưu trữ GitHub. Giảng viên vui lòng nhắc nhở nhóm thiết lập dự án để bắt đầu theo dõi dữ liệu đối soát."
        />
      );
    }

    if (pipeline.isLoadingMain) {
      return (
        <div className="space-y-4 animate-pulse">
          <div className="h-16 rounded-xl bg-muted/40 border border-border/60" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 h-80 rounded-xl bg-muted/30 border border-border/60" />
            <div className="lg:col-span-4 h-80 rounded-xl bg-muted/30 border border-border/60" />
          </div>
        </div>
      );
    }

    return (
      <>
        {pipeline.isTaskCommitsError ? (
          <PipelineEmptyState
            title="Không tải được liên kết Task–Commit"
            description={pipeline.taskCommitsErrorMessage || "Vui lòng thử tải lại dữ liệu đối soát."}
            onRetry={() => void pipeline.refetchTaskCommits()}
          />
        ) : null}

        <PipelineStatsBar stats={pipeline.stats} isLoadingCommits={pipeline.isLoadingCommits} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 xl:col-span-8 space-y-4 min-w-0">
            {pipelineSubView === "FLOW" ? (
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

          <div className="hidden lg:block lg:col-span-4 xl:col-span-4 self-start lg:sticky lg:top-28 lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto">
            <PipelineTaskInspector
              selectedTask={selectedTask}
              commits={pipeline.selectedCommits}
              isLoadingCommits={pipeline.isLoadingTaskCommits}
              errorMessage={pipeline.taskCommitsErrorMessage}
              onRetry={pipeline.refetchTaskCommits}
              onClearSelection={() => setSelectedTaskId(null)}
              projectId={projectId}
            />
          </div>
        </div>

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
                projectId={projectId}
                onClearSelection={() => {
                  setSelectedTaskId(null);
                  setIsMobileInspectorOpen(false);
                }}
              />
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  };

  return (
    <div className="space-y-3.5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl border border-border/80 bg-card/90 shadow-xs backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <GitGraphIcon className="size-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                Đồ thị & Đối soát nguồn gốc
              </h1>
              <Badge
                variant="outline"
                className="border-primary/20 bg-primary/10 font-mono text-xs font-bold text-primary"
              >
                Giảng viên
              </Badge>
              <Badge
                className={
                  teamStatusRule.variant === "warning"
                    ? "bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs font-bold gap-1"
                    : teamStatusRule.variant === "success"
                      ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold gap-1"
                      : "bg-muted text-muted-foreground border border-border text-xs"
                }
              >
                {teamStatusRule.icon}
                <span>{teamStatusRule.label}</span>
              </Badge>
            </div>
          </div>

          <div className="w-56 sm:w-64">
            <CustomSelect
              id="team-selector"
              value={selectedTeamId}
              onChange={handleSelectTeam}
              options={teamSelectOptions}
            />
          </div>

          <JiraSourceSwitcher
            compact
            sources={jiraSource.activeSources}
            value={jiraSource.effectiveSourceId}
            className="w-56 sm:w-64"
            onChange={(integrationId) => {
              jiraSource.selectSource(integrationId);
              setSelectedSprintState(null);
              setSelectedTaskId(null);
              setFocusedNodeId(null);
              setFocusedNodeLabel(null);
              setPipelineFilter((current) => ({ ...current, sprintId: "ALL" }));
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {mainMode === "GRAPH" && (
            <>
              <div className="flex items-center gap-1 p-0.5 bg-muted/60 rounded-xl border border-border/60 text-xs">
                <button
                  type="button"
                  onClick={() => setNeo4jFilterType("ALL")}
                  className={`px-3 py-1.5 font-bold rounded-lg cursor-pointer transition-colors ${neo4jFilterType === "ALL"
                    ? "bg-card text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  onClick={() => setNeo4jFilterType("ANOMALIES_ONLY")}
                  className={`px-3 py-1.5 font-bold rounded-lg cursor-pointer transition-colors ${neo4jFilterType === "ANOMALIES_ONLY"
                    ? "border border-destructive/40 bg-destructive/15 text-destructive shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  Cảnh báo ({structuralStats.anomalyCount})
                </button>
              </div>
            </>
          )}

          <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-xl border border-border/60 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setMainMode("GRAPH");
                setSelectedTaskId(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${mainMode === "GRAPH"
                ? "bg-card text-foreground shadow-xs border border-border/80"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <NetworkIcon className="size-3.5 text-primary" />
              <span>Đồ thị Neo4j</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMainMode("PIPELINE");
                setSelectedGraphNode(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${mainMode === "PIPELINE"
                ? "bg-card text-foreground shadow-xs border border-border/80"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <span>Ma trận đối soát</span>
            </button>
          </div>
        </div>
      </div>

      {mainMode === "PIPELINE" && (
        <PipelineFilterBar
          searchQuery={pipelineFilter.searchQuery || ""}
          onSearchQueryChange={(query) => setPipelineFilter((prev) => ({ ...prev, searchQuery: query }))}
          selectedStudentId={pipelineFilter.studentId}
          onSelectStudent={(val) => setPipelineFilter((prev) => ({ ...prev, studentId: val }))}
          selectedSprint={pipelineFilter.sprintId}
          onSelectSprint={(val) => setPipelineFilter((prev) => ({ ...prev, sprintId: val }))}
          anomalyType={pipelineFilter.anomalyType || "ALL"}
          onSelectAnomalyType={(val) => setPipelineFilter((prev) => ({ ...prev, anomalyType: val }))}
          onReset={handleResetFilters}
          memberOptions={memberSelectOptions}
          sprintOptions={pipelineSprintSelectOptions}
          anomalyOptions={anomalySelectOptions}
          viewMode={pipelineSubView}
          onSelectViewMode={setPipelineSubView}
          activeRepositoryFiltersCount={
            (pipeline.sanitizedFilter.repoId !== "ALL" ? 1 : 0) +
            (pipeline.sanitizedFilter.branchName !== "ALL" ? 1 : 0)
          }
          repositoryFiltersNode={
            <PipelineRepositoryFilters
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
          }
        />
      )}

      {mainMode === "GRAPH" && (
        <Neo4jTabBar
          tab={neo4jTab}
          onTabChange={handleTabChange}
          sprintOptions={sprintOptions}
          selectedSprintId={effectiveNeo4jSprintId}
          onSprintChange={handleSprintChange}
          drillDownStudent={activeDrillDownStudent}
          onBackToOverview={() => {
            setDrillDownStudent(null);
            setSelectedSprintState("ALL");
          }}
          selectId="lecturer-neo4j-sprint"
          scopeMode={scopeMode}
          onScopeModeChange={setScopeMode}
          usedCriteriaOnly={usedCriteriaOnly}
          onUsedCriteriaOnlyChange={setUsedCriteriaOnly}
          memberOptions={neo4jMemberSelectOptions}
          selectedStudentId={activeDrillDownStudent?.studentProfileId || "ALL"}
          onStudentChange={handleSelectDrillDownStudent}
        />
      )}

      {mainMode === "GRAPH" ? renderNeo4jView() : renderPipelineView()}

      <CommitDetailModal
        isOpen={Boolean(deepLinkCommitId && projectId)}
        onClose={() => setDeepLinkCommitId(null)}
        projectId={projectId}
        gitCommitId={deepLinkCommitId}
        fallbackShortHash={initialCommitHash?.slice(0, 7)}
      />

      <GraphNodeDetailsModal
        nodeData={selectedGraphNode}
        onClose={() => setSelectedGraphNode(null)}
        onFocusNode={(nodeId, nodeLabel) => {
          setFocusedNodeId(nodeId);
          setFocusedNodeLabel(nodeLabel || null);
        }}
        focusedNodeId={activeFocusedNodeId}
        projectId={projectId}
        onViewContribution={(studentId) => {
          handleSelectDrillDownStudent(studentId, selectedGraphNode?.label);
        }}
      />
    </div>
  );
}

