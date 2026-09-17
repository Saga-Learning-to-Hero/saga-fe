"use client";

import { useMemo, useState } from "react";
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
  NetworkIcon,
  CalendarIcon,
  AlertCircleIcon,
} from "lucide-react";
import { toast } from "sonner";
import { CustomSelect, type CustomSelectOption } from "@/components/common/custom-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useLecturerTeams } from "@/features/lecturer/teams/hooks/use-lecturer-teams";
import { useProjectSprints } from "@/features/student/sprint-progress/hooks/use-project-sprints";
import { getApiErrorCode, getApiErrorMessage, getApiErrorStatus } from "@/lib/api-error";
import type { RoleInTeam } from "@/types/auth";
import { CytoscapeGraphCanvas } from "./cytoscape-graph-canvas";
import { GraphStatsSummary } from "./graph-stats-summary";
import { GraphNodeDetailsModal } from "./graph-node-details-modal";
import { Neo4jTabBar } from "./neo4j-tab-bar";
import { useProjectGraph } from "../hooks/use-project-graph";
import { usePipelineGraphData } from "../hooks/use-pipeline-graph-data";
import { buildPipelineTasksCsv, downloadTextFile } from "../lib/pipeline-mapper";
import {
  mapStudentNodesToMemberOptions,
  resolveDrillDownStudent,
  STUDENT_ROSTER_SUBGRAPH_PARAMS,
  type GraphDrillDownStudent,
} from "../lib/student-profile-id";
import {
  UNASSIGNED_LANE_ID,
  type PipelineAnomalyFilterType,
  type PipelineFilterState,
  type PipelineTask,
} from "../types/pipeline";
import type { CytoscapeNodeData, GraphSubgraphFilterParams, GraphType } from "../types/graph";
import { PipelineEmptyState } from "./pipeline-empty-state";
import { PipelineFlowView } from "./pipeline-flow-view";
import { PipelineMatrixTable } from "./pipeline-matrix-table";
import { PipelineRepositoryFilters } from "./pipeline-repository-filters";
import { PipelineStatsBar } from "./pipeline-stats-bar";
import { PipelineTaskInspector } from "./pipeline-task-inspector";

interface LecturerGraphViewProps {
  courseId?: string;
  initialTeamId?: string;
  initialViewMode?: "GRAPH" | "PIPELINE";
}

type Neo4jTabMode = "OVERVIEW" | "ACTIVITY" | "ATTRIBUTION" | "PEER_REVIEW";

export function LecturerGraphView({
  courseId,
  initialTeamId,
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

  const [mainMode, setMainMode] = useState<"GRAPH" | "PIPELINE">(initialViewMode);
  const [neo4jTab, setNeo4jTab] = useState<Neo4jTabMode>("OVERVIEW");
  const [drillDownStudent, setDrillDownStudent] = useState<GraphDrillDownStudent | null>(null);
  const [selectedSprintState, setSelectedSprintState] = useState<string | null>(null);
  const [neo4jFilterType, setNeo4jFilterType] = useState<"ALL" | "ANOMALIES_ONLY">("ALL");
  const [selectedGraphNode, setSelectedGraphNode] = useState<CytoscapeNodeData | null>(null);

  const [scopeMode, setScopeMode] = useState<"COMPACT" | "FULL">("COMPACT");
  const [maxNodes, setMaxNodes] = useState<number | null>(100);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);

  const [prevProjectId, setPrevProjectId] = useState(projectId);
  if (projectId !== prevProjectId) {
    setPrevProjectId(projectId);
    setDrillDownStudent(null);
    setFocusedNodeId(null);
  }

  const activeDrillDownStudent = projectId === prevProjectId ? drillDownStudent : null;
  const activeFocusedNodeId = projectId === prevProjectId ? focusedNodeId : null;

  const [pipelineSubView, setPipelineSubView] = useState<"FLOW" | "MATRIX">("FLOW");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isMobileInspectorOpen, setIsMobileInspectorOpen] = useState(false);

  const [pipelineFilter, setPipelineFilter] = useState<PipelineFilterState>({
    studentId: "ALL",
    sprintId: "ALL",
    anomalyType: "ALL",
    searchQuery: "",
    repoId: "ALL",
    branchName: "ALL",
  });

  const sprintsQuery = useProjectSprints(projectId, { enabled: Boolean(projectId) });

  const sprintOptions: CustomSelectOption[] = useMemo(() => {
    const list = sprintsQuery.data || [];
    return list.map((s) => ({
      value: s.id,
      label: s.name,
      subLabel: s.state ? `Trạng thái: ${s.state}` : undefined,
    }));
  }, [sprintsQuery.data]);

  const defaultSprintId = useMemo(() => {
    const list = sprintsQuery.data || [];
    if (list.length === 0) return null;
    const active = list.find((s) => s.state?.toLowerCase() === "active");
    return active ? active.id : list[0].id;
  }, [sprintsQuery.data]);

  const neo4jSprintId = selectedSprintState !== null ? selectedSprintState : (defaultSprintId || "ALL");

  const handleSprintChange = (sprintId: string) => {
    setSelectedSprintState(sprintId);
    setFocusedNodeId(null);
  };

  const effectiveNeo4jSprintId = useMemo(() => {
    if (neo4jSprintId && neo4jSprintId !== "ALL") {
      return neo4jSprintId;
    }
    if (neo4jTab === "ACTIVITY" || neo4jTab === "PEER_REVIEW") {
      return defaultSprintId;
    }
    return null;
  }, [neo4jSprintId, neo4jTab, defaultSprintId]);

  const handleTabChange = (tab: Neo4jTabMode) => {
    setNeo4jTab(tab);
    setFocusedNodeId(null);
    if (
      (tab === "ACTIVITY" || tab === "PEER_REVIEW") &&
      (neo4jSprintId === "ALL" || !neo4jSprintId) &&
      defaultSprintId
    ) {
      setSelectedSprintState(defaultSprintId);
    }
  };

  const isSprintRequired = (neo4jTab === "ACTIVITY" || neo4jTab === "PEER_REVIEW") && !activeDrillDownStudent;
  const hasRequiredSprint = Boolean(effectiveNeo4jSprintId);

  const activeGraphType: GraphType = activeDrillDownStudent ? "CONTRIBUTION" : neo4jTab;

  const subgraphParams = useMemo<GraphSubgraphFilterParams | null>(() => {
    const params: GraphSubgraphFilterParams = {};
    let hasFilter = false;

    if (activeFocusedNodeId) {
      params.focusNodeId = activeFocusedNodeId;
      params.depth = 1;
      params.includeCommits = true;
      params.nodeTypes = ["TASK", "COMMIT", "STUDENT"];
      params.edgeTypes = ["ASSIGNED_TO", "EVIDENCED_BY"];
      hasFilter = true;
    } else {
      if (scopeMode === "FULL") {
        params.includeCommits = true;
        hasFilter = true;
      } else if (
        scopeMode === "COMPACT" &&
        !activeDrillDownStudent &&
        (neo4jTab === "OVERVIEW" || neo4jTab === "ACTIVITY" || neo4jTab === "ATTRIBUTION")
      ) {
        params.includeCommits = false;
        params.nodeTypes = ["STUDENT", "TEAM", "PROJECT", "SPRINT", "TASK"];
        hasFilter = true;
      }
    }

    if (neo4jFilterType === "ANOMALIES_ONLY") {
      params.anomaliesOnly = true;
      hasFilter = true;
    }

    if (maxNodes) {
      params.maxNodes = maxNodes;
      hasFilter = true;
    }

    return hasFilter ? params : null;
  }, [activeFocusedNodeId, scopeMode, activeDrillDownStudent, neo4jTab, neo4jFilterType, maxNodes]);

  const isWaitingDefaultSprint = selectedSprintState === null && sprintsQuery.isLoading;

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
    setDrillDownStudent(
      resolveDrillDownStudent(input, {
        memberOptions: neo4jMemberSelectOptions,
        fallbackLabel,
      })
    );
  };

  const graphQuery = useProjectGraph({
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
    const enrichedNodes = rawData.nodes.map((node) => {
      const nodeData = node.data;
      if (nodeData.type !== "STUDENT") return node;
      const avatar =
        nodeData.avatar ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(nodeData.subLabel || nodeData.label)}`;
      return {
        ...node,
        data: {
          ...nodeData,
          avatar,
        },
      };
    });
    return {
      ...rawData,
      nodes: enrichedNodes,
    };
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
    selectedTaskId,
    teamMembers: teamMembersInput,
    filter: pipelineFilter,
  });

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
      { value: "DONE_NO_COMMIT", label: "Hoàn thành chưa có Commit (MSR Anomaly)" },
      { value: "UNASSIGNED", label: "Chưa phân công người làm" },
      { value: "MISSING_COMMITS", label: "Chưa có bất kỳ Commit nào liên kết" },
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
  }, [
    mainMode,
    projectId,
    graphQuery.isLoading,
    graphQuery.data?.nodes,
    structuralStats.anomalyCount,
    pipeline.stats.doneWithoutLinkedCommits,
    pipeline.tasks.length,
  ]);

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
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-border bg-card/50 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">Dự án chưa có Sprint</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            Chế độ {neo4jTab === "ACTIVITY" ? "Hoạt động Sprint" : "Mạng đánh giá chéo"} yêu cầu dự án cần có ít nhất một Sprint từ Jira để phân tích.
          </p>
        </div>
      );
    }

    if ((graphQuery.isLoading && !graphQuery.data) || isWaitingDefaultSprint) {
      return (
        <div className="flex flex-col items-center justify-center h-[640px] w-full rounded-3xl border border-border bg-card/60 space-y-3">
          <div className="w-10 h-10 rounded-full border-3 border-primary border-t-transparent animate-spin" />
          <p className="text-xs font-bold text-muted-foreground">Đang tải đồ thị Neo4j của nhóm...</p>
        </div>
      );
    }

    if (graphQuery.isError) {
      const err = graphQuery.error as { status?: number; code?: string; message?: string };
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-destructive/20 bg-destructive/5 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
            <AlertCircleIcon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">Không tải được dữ liệu đồ thị</h3>
          <p className="text-xs text-muted-foreground max-w-md">
            {err?.status === 403
              ? "Bạn không có quyền xem dữ liệu đồ thị của nhóm dự án này."
              : err?.status === 404
                ? "Dữ liệu liên kết của nhóm không còn khả dụng trên hệ thống."
                : err?.message || "Đã xảy ra lỗi khi kết nối máy chủ đồ thị Neo4j."}
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
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-border bg-card/50 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center">
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
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-xs font-bold text-emerald-700 dark:text-emerald-400 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <span>
                Đang tập trung đối chiếu Task: <code className="font-mono text-foreground bg-background/80 px-1.5 py-0.5 rounded-md border border-border/60">{activeFocusedNodeId}</code> và các Commit liên kết (EVIDENCED_BY)
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFocusedNodeId(null)}
              className="h-7 text-xs rounded-xl cursor-pointer bg-background hover:bg-muted"
            >
              Quay lại toàn cảnh
            </Button>
          </div>
        )}
        <CytoscapeGraphCanvas
          nodes={displayGraphData.nodes}
          edges={displayGraphData.edges}
          onSelectNode={(node) => setSelectedGraphNode(node)}
          layoutName={neo4jTab === "PEER_REVIEW" ? "circle" : "breadthfirst"}
          isUpdating={graphQuery.isFetching && !graphQuery.isLoading}
        />
        <GraphStatsSummary
          totalNodes={structuralStats.totalNodes}
          totalEdges={structuralStats.totalEdges}
          anomalyCount={structuralStats.anomalyCount}
          meta={structuralStats.meta}
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
          <div className="h-16 rounded-2xl bg-muted/40 border border-border/60" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 h-80 rounded-3xl bg-muted/30 border border-border/60" />
            <div className="lg:col-span-4 h-80 rounded-3xl bg-muted/30 border border-border/60" />
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl border border-border/80 bg-card/90 shadow-xs backdrop-blur-md">
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
                className="border-primary/20 bg-primary/10 font-mono text-[10px] font-bold text-primary"
              >
                Giảng viên
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
          </div>

          <div className="w-56 sm:w-64">
            <CustomSelect
              id="team-selector"
              value={selectedTeamId}
              onChange={handleSelectTeam}
              options={teamSelectOptions}
            />
          </div>
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

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const json = JSON.stringify(graphQuery.data || { nodes: [], edges: [] }, null, 2);
                  downloadTextFile(`neo4j-lecturer-team-${currentTeam?.teamNo || "team"}.json`, json);
                }}
                disabled={!graphQuery.data?.nodes.length}
                className="h-8.5 gap-1.5 text-xs font-semibold cursor-pointer rounded-xl"
              >
                <DownloadIcon className="size-3.5" />
                Xuất JSON
              </Button>
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
              <span>Neo4j Graph</span>
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
              <span>Pipeline</span>
            </button>
          </div>
        </div>
      </div>

      {mainMode === "PIPELINE" && (
        <div className="space-y-3 rounded-2xl border border-border/80 bg-card/90 p-3.5 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
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

            <div>
              <CustomSelect
                id="assignee-filter"
                value={pipelineFilter.studentId}
                onChange={(val) => setPipelineFilter((prev) => ({ ...prev, studentId: val }))}
                options={memberSelectOptions}
              />
            </div>

            <div>
              <CustomSelect
                id="sprint-filter"
                value={pipelineFilter.sprintId}
                onChange={(val) => setPipelineFilter((prev) => ({ ...prev, sprintId: val }))}
                options={pipelineSprintSelectOptions}
              />
            </div>

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

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/50 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 p-0.5 bg-muted/60 rounded-lg border border-border/60">
                <button
                  type="button"
                  onClick={() => setPipelineSubView("FLOW")}
                  className={`px-2.5 py-1 rounded-md font-bold cursor-pointer transition-colors ${pipelineSubView === "FLOW" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground"
                    }`}
                >
                  Flow
                </button>
                <button
                  type="button"
                  onClick={() => setPipelineSubView("MATRIX")}
                  className={`px-2.5 py-1 rounded-md font-bold cursor-pointer transition-colors ${pipelineSubView === "MATRIX" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground"
                    }`}
                >
                  Audit Matrix
                </button>
              </div>

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
      )}

      {mainMode === "GRAPH" && (
        <Neo4jTabBar
          tab={neo4jTab}
          onTabChange={handleTabChange}
          sprintOptions={sprintOptions}
          selectedSprintId={effectiveNeo4jSprintId}
          onSprintChange={handleSprintChange}
          drillDownStudent={activeDrillDownStudent}
          onBackToOverview={() => setDrillDownStudent(null)}
          selectId="lecturer-neo4j-sprint"
          scopeMode={scopeMode}
          onScopeModeChange={setScopeMode}
          maxNodes={maxNodes}
          onMaxNodesChange={setMaxNodes}
          memberOptions={neo4jMemberSelectOptions}
          selectedStudentId={activeDrillDownStudent?.studentProfileId || "ALL"}
          onStudentChange={handleSelectDrillDownStudent}
        />
      )}

      {mainMode === "GRAPH" ? renderNeo4jView() : renderPipelineView()}

      <GraphNodeDetailsModal
        nodeData={selectedGraphNode}
        onClose={() => setSelectedGraphNode(null)}
        onFocusNode={(nodeId) => setFocusedNodeId(nodeId)}
        projectId={projectId}
        onViewContribution={(studentId) => {
          handleSelectDrillDownStudent(studentId, selectedGraphNode?.label);
        }}
      />
    </div>
  );
}

