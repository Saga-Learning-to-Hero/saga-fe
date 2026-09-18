"use client";

import { useMemo, useState } from "react";
import { NetworkIcon, CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { type CustomSelectOption } from "@/components/common/custom-select";
import { useStudentCourseContext } from "@/features/student/courses/hooks/use-student-course-context";
import { useStudentMyTeam } from "@/features/student/courses/hooks/use-student-courses";
import { useProjectSprints } from "@/features/student/sprint-progress/hooks/use-project-sprints";
import { getApiErrorMessage } from "@/lib/api-error";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { CytoscapeGraphCanvas } from "./cytoscape-graph-canvas";
import { GraphFilterBar, type GraphFilterType } from "./graph-filter-bar";
import { GraphStatsSummary } from "./graph-stats-summary";
import { GraphNodeDetailsModal } from "./graph-node-details-modal";
import { Neo4jTabBar, type Neo4jTabMode } from "./neo4j-tab-bar";
import { PipelineEmptyState } from "./pipeline-empty-state";
import { PipelineRepositoryFilters } from "./pipeline-repository-filters";
import { PipelineStatsBar } from "./pipeline-stats-bar";
import { PipelineWorkspace } from "./pipeline-workspace";
import { usePipelineGraphData } from "../hooks/use-pipeline-graph-data";
import { useProjectGraph } from "../hooks/use-project-graph";
import { buildPipelineTasksCsv, downloadTextFile } from "../lib/pipeline-mapper";
import {
  mapStudentNodesToMemberOptions,
  resolveDrillDownStudent,
  STUDENT_ROSTER_SUBGRAPH_PARAMS,
  type GraphDrillDownStudent,
} from "../lib/student-profile-id";
import { UNASSIGNED_LANE_ID, type PipelineFilterState } from "../types/pipeline";
import type { CytoscapeNodeData, GraphSubgraphFilterParams, GraphType } from "../types/graph";
import { Button } from "@/components/ui/button";

export function TraceabilityGraphView() {
  const { course, courseId, isLoading: isCoursesLoading, isInvalidCourse } = useStudentCourseContext();
  const currentUser = useAuthStore((state) => state.user);
  const teamQuery = useStudentMyTeam(courseId, { enabled: Boolean(courseId) });
  const projectId = teamQuery.data?.projectId || null;

  const sprintsQuery = useProjectSprints(projectId, { enabled: Boolean(projectId) });

  const [viewMode, setViewMode] = useState<"FLOW" | "GRAPH">("GRAPH");
  const [neo4jTab, setNeo4jTab] = useState<Neo4jTabMode>("OVERVIEW");
  const [drillDownStudent, setDrillDownStudent] = useState<GraphDrillDownStudent | null>(null);
  const [selectedSprintState, setSelectedSprintState] = useState<string | null>(null);
  const [neo4jFilterType, setNeo4jFilterType] = useState<GraphFilterType>("ALL");
  const [selectedNode, setSelectedNode] = useState<CytoscapeNodeData | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const [scopeMode, setScopeMode] = useState<"COMPACT" | "FULL">("COMPACT");
  const [maxNodes, setMaxNodes] = useState<number | null>(100);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);

  const [pipelineFilter, setPipelineFilter] = useState<PipelineFilterState>({
    studentId: "ALL",
    sprintId: "ALL",
    anomaliesOnly: false,
    repoId: "ALL",
    branchName: "ALL",
  });

  const graphIdentityKey = `${courseId || ""}:${projectId || ""}`;
  const [prevGraphIdentityKey, setPrevGraphIdentityKey] = useState(graphIdentityKey);
  if (graphIdentityKey !== prevGraphIdentityKey) {
    setPrevGraphIdentityKey(graphIdentityKey);
    setDrillDownStudent(null);
    setFocusedNodeId(null);
  }

  const activeDrillDownStudent =
    graphIdentityKey === prevGraphIdentityKey ? drillDownStudent : null;
  const activeFocusedNodeId =
    graphIdentityKey === prevGraphIdentityKey ? focusedNodeId : null;

  const pipelineOpen = viewMode === "FLOW";
  const pipeline = usePipelineGraphData({
    enabled: pipelineOpen,
    projectId,
    selectedTaskId,
    teamMembers: teamQuery.data?.members || [],
    filter: pipelineFilter,
  });

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

  const effectiveSprintId = useMemo(() => {
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
  const hasRequiredSprint = Boolean(effectiveSprintId);

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
    enabled: viewMode === "GRAPH" && Boolean(projectId),
  });

  const neo4jMemberOptions = useMemo(
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
        memberOptions: neo4jMemberOptions,
        fallbackLabel,
      })
    );
  };

  const graphQuery = useProjectGraph({
    projectId: projectId || "",
    graphType: activeGraphType,
    sprintId: effectiveSprintId,
    studentProfileId: activeDrillDownStudent?.studentProfileId || null,
    subgraphParams,
    enabled:
      viewMode === "GRAPH" &&
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

      let avatar = nodeData.avatar;
      const norm = (s?: string | null) => (s || "").toLowerCase().trim();
      const nodeCode = norm(nodeData.subLabel);
      const nodeName = norm(nodeData.label);
      const userCode = norm(currentUser?.studentCode);
      const userName = norm(currentUser?.fullName || currentUser?.name);

      const isCurrentUser =
        (nodeCode && userCode && nodeCode === userCode) ||
        (nodeName && userName && (nodeName.includes(userName) || userName.includes(nodeName)));

      if (!avatar && isCurrentUser && currentUser?.avatar) {
        avatar = currentUser.avatar;
      }

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
  }, [graphQuery.data, currentUser]);

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

  const pipelineMemberOptions = useMemo(
    () => [
      ...pipeline.members.map((member) => ({
        value: member.studentId,
        label: member.fullName,
        subLabel: `${member.studentCode} (${member.teamRole})`,
      })),
      pipeline.tasks.some((task) => !task.assigneeStudentId)
        ? { value: UNASSIGNED_LANE_ID, label: "Chưa phân công" }
        : null,
    ].filter((item): item is { value: string; label: string; subLabel?: string } => Boolean(item)),
    [pipeline.members, pipeline.tasks]
  );

  const pipelineSprintOptions = useMemo(
    () =>
      pipeline.sprints.map((sprint) => ({
        value: sprint.id,
        label: sprint.name,
        subLabel: sprint.state === "backlog" ? "Chưa vào Sprint" : undefined,
      })),
    [pipeline.sprints]
  );

  const handleExport = () => {
    if (viewMode === "GRAPH") {
      const exportJson = JSON.stringify(graphQuery.data || { nodes: [], edges: [] }, null, 2);
      downloadTextFile(`neo4j-graph-${activeGraphType.toLowerCase()}.json`, exportJson);
      return;
    }
    downloadTextFile("pipeline-tasks.csv", buildPipelineTasksCsv(pipeline.filteredTasks));
  };

  const teamLabel = teamQuery.data
    ? `Nhóm ${teamQuery.data.teamNo}${teamQuery.data.teamName ? ` - ${teamQuery.data.teamName}` : ""}`
    : "Chưa có nhóm";

  const projectInfoNode = (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="border-border/80 bg-muted/40 px-2.5 py-1 text-xs font-bold text-foreground">
        {teamLabel}
      </Badge>
    </div>
  );

  const renderNeo4jBody = () => {
    if (isCoursesLoading || (Boolean(courseId) && teamQuery.isLoading && !teamQuery.data)) {
      return <div className="h-[640px] w-full animate-pulse rounded-3xl bg-muted" />;
    }
    if (isInvalidCourse || !courseId || !course) {
      return (
        <PipelineEmptyState
          title="Chưa chọn lớp học phần"
          description="Hãy chọn lớp đang học để xem đồ thị quan hệ Neo4j."
          href="/student/courses"
          action="Chọn lớp học phần"
        />
      );
    }
    if (teamQuery.isWaitingForTeam) {
      return (
        <PipelineEmptyState
          title="Đang chờ phân nhóm"
          description="Bạn chưa được gán vào nhóm dự án nên chưa có đồ thị liên kết."
        />
      );
    }
    if (teamQuery.isError) {
      return (
        <PipelineEmptyState
          title="Không tải được thông tin nhóm"
          description={getApiErrorMessage(teamQuery.error, "Vui lòng thử lại.")}
          onRetry={() => void teamQuery.refetch()}
        />
      );
    }
    if (!projectId) {
      return (
        <PipelineEmptyState
          title="Nhóm chưa có dự án"
          description="Đồ thị Neo4j chỉ hiển thị khi nhóm đã được gán projectId."
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
          <p className="text-xs font-bold text-muted-foreground">Đang tải dữ liệu đồ thị...</p>
        </div>
      );
    }

    if (graphQuery.isError) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-destructive/20 bg-destructive/5 space-y-3">
          <h3 className="text-base font-bold text-destructive">Không tải được đồ thị Neo4j</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            {getApiErrorMessage(graphQuery.error, "Vui lòng kiểm tra lại kết nối.")}
          </p>
          <button
            type="button"
            onClick={() => void graphQuery.refetch()}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold cursor-pointer"
          >
            Thử lại
          </button>
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
          onSelectNode={(node) => setSelectedNode(node)}
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

  const renderPipelineBody = () => {
    if (isCoursesLoading || (Boolean(courseId) && teamQuery.isLoading && !teamQuery.data)) {
      return <div className="min-h-64 animate-pulse rounded-2xl bg-muted" />;
    }
    if (isInvalidCourse) {
      return (
        <PipelineEmptyState
          title="Lớp học phần không còn khả dụng"
          description="Hãy chọn lại lớp học phần trước khi xem Pipeline."
          href="/student/courses"
          action="Chọn lớp học phần"
        />
      );
    }
    if (!courseId || !course) {
      return (
        <PipelineEmptyState
          title="Chưa chọn lớp học phần"
          description="Hãy chọn lớp đang học để xem luồng Task và Commit."
          href="/student/courses"
          action="Chọn lớp học phần"
        />
      );
    }
    if (teamQuery.isWaitingForTeam) {
      return (
        <PipelineEmptyState
          title="Đang chờ giảng viên phân nhóm"
          description="Bạn đã ghi danh nhưng chưa được gán nhóm nên chưa có Pipeline."
        />
      );
    }
    if (teamQuery.isError) {
      return (
        <PipelineEmptyState
          title="Không tải được thông tin nhóm"
          description={getApiErrorMessage(teamQuery.error, "Vui lòng thử lại.")}
          onRetry={() => void teamQuery.refetch()}
        />
      );
    }
    if (!projectId) {
      return (
        <PipelineEmptyState
          title="Nhóm chưa có dự án"
          description="Pipeline chỉ hiện khi nhóm đã được gắn projectId."
        />
      );
    }
    const projectConfigHref = courseId
      ? `/student/project-info?courseId=${encodeURIComponent(courseId)}`
      : "/student/project-info";

    if (pipeline.isLoadingMain) {
      return <div className="min-h-64 animate-pulse rounded-2xl bg-muted" />;
    }
    if (pipeline.isBothMissing) {
      return (
        <PipelineEmptyState
          title="Chưa cấu hình Jira & GitHub cho dự án"
          description="Dự án cần liên kết Jira Workspace và GitHub Repository để tải Task và Commit đối soát."
          href={projectConfigHref}
          action="Cấu hình dự án"
        />
      );
    }
    if (pipeline.isJiraMissingOnly) {
      return (
        <PipelineEmptyState
          title="Chưa cấu hình Jira Software"
          description="Dự án đã có GitHub nhưng chưa liên kết Jira Workspace để tải danh sách Task đối soát trong Pipeline."
          href={projectConfigHref}
          action="Cấu hình Jira"
        />
      );
    }
    if (pipeline.isGithubMissingOnly) {
      return (
        <PipelineEmptyState
          title="Chưa cấu hình GitHub Repository"
          description="Dự án đã có Jira nhưng chưa liên kết Repository để đối soát mã nguồn Commit."
          href={projectConfigHref}
          action="Cấu hình GitHub"
        />
      );
    }
    if (pipeline.isIntegrationsConnectedButUnsynced) {
      return (
        <PipelineEmptyState
          title="Dự án chưa có dữ liệu đồng bộ"
          description="Jira và GitHub đã kết nối thành công nhưng chưa có Task hoặc Commit. Vui lòng bấm đồng bộ để nạp dữ liệu."
          href={projectConfigHref}
          action="Đến trang đồng bộ"
        />
      );
    }
    if (pipeline.integrationsUnsynced) {
      return (
        <PipelineEmptyState
          title="Jira/GitHub chưa có dữ liệu đồng bộ"
          description="Hãy liên kết Jira và GitHub, rồi đồng bộ dự án trước khi xem Pipeline."
          href={projectConfigHref}
          action="Cấu hình dự án"
        />
      );
    }
    if (pipeline.isTasksError && pipeline.tasks.length === 0) {
      return (
        <PipelineEmptyState
          title="Không tải được danh sách Task"
          description={pipeline.tasksErrorMessage || "Vui lòng thử lại."}
          onRetry={() => void pipeline.refetchTasks()}
        />
      );
    }
    if (pipeline.tasks.length === 0) {
      return (
        <PipelineEmptyState
          title="Chưa có Task"
          description="Dự án đã sẵn sàng nhưng Jira chưa có Task để đối soát Commit."
        />
      );
    }

    return (
      <>
        {pipeline.isTasksError ? (
          <PipelineEmptyState
            title="Không làm mới được Task"
            description={pipeline.tasksErrorMessage || "Dữ liệu Task trước đó vẫn được giữ lại."}
            onRetry={() => void pipeline.refetchTasks()}
          />
        ) : null}
        {pipeline.isCommitsError ? (
          <PipelineEmptyState
            title="Không tải được tổng số Commit"
            description={pipeline.commitsErrorMessage || "Các lane Task vẫn hiển thị bình thường."}
            onRetry={() => void pipeline.refetchCommits()}
          />
        ) : null}
        {pipeline.isTaskCommitsError ? (
          <PipelineEmptyState
            title="Không tải được liên kết Task–Commit"
            description={pipeline.taskCommitsErrorMessage || "Vui lòng thử tải lại dữ liệu đối soát."}
            onRetry={() => void pipeline.refetchTaskCommits()}
          />
        ) : null}
        <PipelineStatsBar stats={pipeline.stats} isLoadingCommits={pipeline.isLoadingCommits} />

        <PipelineWorkspace
          lanes={pipeline.lanes}
          filteredTasks={pipeline.filteredTasks}
          selectedTaskId={selectedTaskId}
          onSelectTask={setSelectedTaskId}
          selectedCommits={pipeline.selectedCommits}
          isLoadingCommits={pipeline.isLoadingTaskCommits}
          errorMessage={pipeline.taskCommitsErrorMessage}
          onRetryCommits={() => void pipeline.refetchTaskCommits()}
          projectId={projectId}
        />
      </>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 border-b border-border/40 pb-1 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
            <NetworkIcon className="size-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                Traceability Graph & Evidence Engine
              </span>
            </div>
            <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
              Đồ thị Traceability (Jira Task & Git Commits)
            </h1>
          </div>
        </div>
      </div>

      <div className="animate-in fade-in-0 space-y-4 duration-200">
        <GraphFilterBar
          groupSelector={projectInfoNode}
          hideCollapsibleFilter={!pipelineOpen}
          selectedStudentId={
            pipelineOpen
              ? pipeline.sanitizedFilter.studentId
              : activeDrillDownStudent?.studentProfileId || "ALL"
          }
          onSelectStudent={(studentId) => {
            if (pipelineOpen) {
              setPipelineFilter((prev) => ({ ...prev, studentId }));
              return;
            }
            handleSelectDrillDownStudent(studentId);
          }}
          selectedSprint={pipelineOpen ? pipeline.sanitizedFilter.sprintId : (neo4jSprintId || "ALL")}
          onSelectSprint={(sprintId) => {
            if (pipelineOpen) {
              setPipelineFilter((prev) => ({ ...prev, sprintId }));
            } else {
              setSelectedSprintState(sprintId);
            }
          }}
          filterType={
            pipelineOpen
              ? pipeline.sanitizedFilter.anomaliesOnly
                ? "ANOMALIES_ONLY"
                : "ALL"
              : neo4jFilterType
          }
          onSelectFilterType={(type) => {
            if (pipelineOpen) {
              setPipelineFilter((prev) => ({ ...prev, anomaliesOnly: type === "ANOMALIES_ONLY" }));
              return;
            }
            setNeo4jFilterType(type);
          }}
          onExport={handleExport}
          onReset={() => {
            if (pipelineOpen) {
              setPipelineFilter({
                studentId: "ALL",
                sprintId: "ALL",
                anomaliesOnly: false,
                repoId: "ALL",
                branchName: "ALL",
              });
              return;
            }
            setSelectedSprintState("ALL");
            setNeo4jFilterType("ALL");
            setDrillDownStudent(null);
            setFocusedNodeId(null);
            setScopeMode("COMPACT");
            setMaxNodes(100);
          }}
          anomaliesCount={
            pipelineOpen ? pipeline.stats.doneWithoutLinkedCommits : structuralStats.anomalyCount
          }
          anomalyLabel={pipelineOpen ? "Task hoàn thành chưa có Commit" : "Node bất thường"}
          memberOptions={pipelineOpen ? pipelineMemberOptions : neo4jMemberOptions}
          sprintOptions={pipelineOpen ? pipelineSprintOptions : sprintOptions}
          viewMode={viewMode}
          onSelectViewMode={(mode) => {
            setViewMode(mode);
            setSelectedNode(null);
          }}
          extraActiveFilters={
            pipelineOpen
              ? [
                pipeline.sanitizedFilter.repoId !== "ALL"
                  ? {
                    key: "repository",
                    label: `Repository: ${pipeline.repositories.find(
                      (repository) => repository.id === pipeline.sanitizedFilter.repoId
                    )?.fullName || pipeline.sanitizedFilter.repoId
                      }`,
                    onClear: () => {
                      setSelectedTaskId(null);
                      setPipelineFilter((current) => ({
                        ...current,
                        repoId: "ALL",
                        branchName: "ALL",
                      }));
                    },
                  }
                  : null,
                pipeline.sanitizedFilter.branchName !== "ALL"
                  ? {
                    key: "branch",
                    label: `Branch: ${pipeline.sanitizedFilter.branchName}`,
                    onClear: () => {
                      setSelectedTaskId(null);
                      setPipelineFilter((current) => ({ ...current, branchName: "ALL" }));
                    },
                  }
                  : null,
              ].filter(
                (filter): filter is { key: string; label: string; onClear: () => void } =>
                  filter !== null
              )
              : []
          }
          extraCollapsibleContent={
            pipelineOpen ? (
              <PipelineRepositoryFilters
                embedded
                idPrefix="student-pipeline"
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
            ) : null
          }
        />

        {!pipelineOpen && (
          <Neo4jTabBar
            tab={neo4jTab}
            onTabChange={handleTabChange}
            sprintOptions={sprintOptions}
            selectedSprintId={effectiveSprintId}
            onSprintChange={handleSprintChange}
            drillDownStudent={activeDrillDownStudent}
            onBackToOverview={() => setDrillDownStudent(null)}
            scopeMode={scopeMode}
            onScopeModeChange={setScopeMode}
            maxNodes={maxNodes}
            onMaxNodesChange={setMaxNodes}
            memberOptions={neo4jMemberOptions}
            selectedStudentId={activeDrillDownStudent?.studentProfileId || "ALL"}
            onStudentChange={handleSelectDrillDownStudent}
          />
        )}

        {pipelineOpen ? renderPipelineBody() : renderNeo4jBody()}
      </div>

      <GraphNodeDetailsModal
        nodeData={selectedNode}
        onClose={() => setSelectedNode(null)}
        onFocusNode={(nodeId) => setFocusedNodeId(nodeId)}
        projectId={projectId}
        onViewContribution={(studentId) => {
          handleSelectDrillDownStudent(studentId, selectedNode?.label);
        }}
      />
    </div>
  );
}
