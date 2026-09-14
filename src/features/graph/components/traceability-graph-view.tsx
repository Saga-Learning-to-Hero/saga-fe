"use client";

import { useMemo, useState } from "react";
import { NetworkIcon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useStudentCourseContext } from "@/features/student/courses/hooks/use-student-course-context";
import { useStudentMyTeam } from "@/features/student/courses/hooks/use-student-courses";
import { getApiErrorMessage } from "@/lib/api-error";
import { CytoscapeGraphCanvas } from "./cytoscape-graph-canvas";
import { GraphFilterBar, type GraphFilterType } from "./graph-filter-bar";
import { GraphStatsSummary } from "./graph-stats-summary";
import { GraphNodeDetailsModal } from "./graph-node-details-modal";
import { TraceabilityMatrixTable } from "./traceability-matrix-table";
import { PipelineEmptyState } from "./pipeline-empty-state";
import { PipelineFlowView } from "./pipeline-flow-view";
import { PipelineMatrixTable } from "./pipeline-matrix-table";
import { PipelineStatsBar } from "./pipeline-stats-bar";
import { getMockTraceabilityGraphData, MOCK_GRAPH_STUDENTS } from "../data/mock-graph-data";
import { usePipelineGraphData } from "../hooks/use-pipeline-graph-data";
import { buildPipelineTasksCsv, downloadTextFile } from "../lib/pipeline-mapper";
import { UNASSIGNED_LANE_ID, type PipelineFilterState } from "../types/pipeline";
import type { GraphNodeData } from "../types/graph";

const NEO4J_DEMO_LABEL = "Dữ liệu minh họa — chưa kết nối API Neo4j";

const NEO4J_MEMBER_OPTIONS = MOCK_GRAPH_STUDENTS.map((student) => ({
  value: student.id,
  label: student.name,
  subLabel: `${student.studentCode} (${student.role})`,
}));

const NEO4J_SPRINT_OPTIONS = [
  { value: "sprint-01", label: "Sprint 1 - Foundation & Integration", subLabel: "Đã hoàn thành" },
  { value: "sprint-02", label: "Sprint 2 - Slicing Pie & Traceability", subLabel: "Đang diễn ra" },
];

export function TraceabilityGraphView() {
  const initialData = useMemo(() => getMockTraceabilityGraphData(), []);
  const { course, courseId, isLoading: isCoursesLoading, isInvalidCourse } = useStudentCourseContext();
  const teamQuery = useStudentMyTeam(courseId, { enabled: Boolean(courseId) });
  const projectId = teamQuery.data?.projectId || null;

  const [neo4jStudentId, setNeo4jStudentId] = useState("ALL");
  const [neo4jSprintId, setNeo4jSprintId] = useState("ALL");
  const [neo4jFilterType, setNeo4jFilterType] = useState<GraphFilterType>("ALL");
  const [pipelineFilter, setPipelineFilter] = useState<PipelineFilterState>({
    studentId: "ALL",
    sprintId: "ALL",
    anomaliesOnly: false,
  });
  const [viewMode, setViewMode] = useState<"FLOW" | "GRAPH">("GRAPH");
  const [selectedNode, setSelectedNode] = useState<GraphNodeData | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const pipelineOpen = viewMode === "FLOW";
  const pipeline = usePipelineGraphData({
    enabled: pipelineOpen,
    projectId,
    selectedTaskId,
    teamMembers: teamQuery.data?.members || [],
    filter: pipelineFilter,
  });

  const filteredGraphData = useMemo(() => {
    let filteredNodes = [...initialData.nodes];

    if (neo4jStudentId !== "ALL") {
      filteredNodes = filteredNodes.filter((n) => {
        if (n.type === "STUDENT") return n.id === neo4jStudentId;
        if (n.type === "TASK" && "assigneeId" in n.data) return n.data.assigneeId === neo4jStudentId;
        if (n.type === "COMMIT" && "authorId" in n.data) return n.data.authorId === neo4jStudentId;
        return true;
      });
    }

    if (neo4jSprintId !== "ALL") {
      filteredNodes = filteredNodes.filter((n) => {
        if (n.type === "TASK" && "sprintId" in n.data) return n.data.sprintId === neo4jSprintId;
        return true;
      });
    }

    if (neo4jFilterType === "ANOMALIES_ONLY") {
      filteredNodes = filteredNodes.filter((n) => {
        return (
          ("isMSRAnomaly" in n.data && n.data.isMSRAnomaly) ||
          ("isGhosting" in n.data && n.data.isGhosting)
        );
      });
    }

    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    return {
      nodes: filteredNodes,
      edges: initialData.edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target)),
    };
  }, [initialData, neo4jFilterType, neo4jSprintId, neo4jStudentId]);

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

  const handleSelectTask = (taskId: string) => {
    setSelectedTaskId((current) => (current === taskId ? null : taskId));
  };

  const handleExport = () => {
    if (viewMode === "GRAPH") {
      toast.info("Tab Neo4j đang dùng dữ liệu minh họa nên chưa xuất được từ API.");
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
      {viewMode === "GRAPH" ? (
        <Badge
          variant="outline"
          className="border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-800 dark:text-amber-200"
        >
          {NEO4J_DEMO_LABEL}
        </Badge>
      ) : null}
    </div>
  );

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
    if (pipeline.isLoadingMain) {
      return <div className="min-h-64 animate-pulse rounded-2xl bg-muted" />;
    }
    if (pipeline.integrationsUnsynced) {
      return (
        <PipelineEmptyState
          title="Jira/GitHub chưa có dữ liệu đồng bộ"
          description="Hãy liên kết Jira và GitHub, rồi đồng bộ dự án trước khi xem Pipeline."
          href="/student/integrations"
          action="Mở tích hợp"
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
        <PipelineStatsBar stats={pipeline.stats} isLoadingCommits={pipeline.isLoadingCommits} />
        <PipelineFlowView
          lanes={pipeline.lanes}
          selectedTaskId={pipeline.effectiveTaskId}
          selectedCommits={pipeline.selectedCommits}
          isLoadingTaskCommits={pipeline.isLoadingTaskCommits}
          taskCommitsErrorMessage={pipeline.taskCommitsErrorMessage}
          onSelectTask={handleSelectTask}
          onRetryTaskCommits={() => void pipeline.refetchTaskCommits()}
        />
        <PipelineMatrixTable
          tasks={pipeline.filteredTasks}
          selectedTaskId={pipeline.effectiveTaskId}
          selectedCommits={pipeline.selectedCommits}
          isLoadingTaskCommits={pipeline.isLoadingTaskCommits}
          onSelectTask={handleSelectTask}
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
          selectedStudentId={pipelineOpen ? pipeline.sanitizedFilter.studentId : neo4jStudentId}
          onSelectStudent={
            pipelineOpen
              ? (studentId) => setPipelineFilter((prev) => ({ ...prev, studentId }))
              : setNeo4jStudentId
          }
          selectedSprint={pipelineOpen ? pipeline.sanitizedFilter.sprintId : neo4jSprintId}
          onSelectSprint={
            pipelineOpen
              ? (sprintId) => setPipelineFilter((prev) => ({ ...prev, sprintId }))
              : setNeo4jSprintId
          }
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
              setPipelineFilter({ studentId: "ALL", sprintId: "ALL", anomaliesOnly: false });
              return;
            }
            setNeo4jStudentId("ALL");
            setNeo4jSprintId("ALL");
            setNeo4jFilterType("ALL");
          }}
          anomaliesCount={
            pipelineOpen ? pipeline.stats.doneWithoutLinkedCommits : initialData.summary.msrAnomaliesCount
          }
          anomalyLabel={pipelineOpen ? "Task hoàn thành chưa có Commit" : "Chỉ cảnh báo"}
          memberOptions={pipelineOpen ? pipelineMemberOptions : NEO4J_MEMBER_OPTIONS}
          sprintOptions={pipelineOpen ? pipelineSprintOptions : NEO4J_SPRINT_OPTIONS}
          viewMode={viewMode}
          onSelectViewMode={setViewMode}
        />

        {pipelineOpen ? (
          renderPipelineBody()
        ) : (
          <>
            <CytoscapeGraphCanvas
              nodes={filteredGraphData.nodes}
              edges={filteredGraphData.edges}
              onSelectNode={(node) => setSelectedNode(node)}
              layoutName="breadthfirst"
            />
            <GraphStatsSummary
              totalNodes={filteredGraphData.nodes.length}
              totalEdges={filteredGraphData.edges.length}
              traceabilityRate={initialData.summary.traceabilityRate}
              msrCount={initialData.summary.msrAnomaliesCount}
              demoNotice={NEO4J_DEMO_LABEL}
            />
            <TraceabilityMatrixTable />
          </>
        )}
      </div>

      <GraphNodeDetailsModal nodeData={selectedNode} onClose={() => setSelectedNode(null)} />
    </div>
  );
}
