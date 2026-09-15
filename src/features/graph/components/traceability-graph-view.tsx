"use client";

import { useMemo, useState } from "react";
import { GitCommitIcon, NetworkIcon, SparklesIcon, TableIcon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
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
import { PipelineRepositoryFilters } from "./pipeline-repository-filters";
import { PipelineStatsBar } from "./pipeline-stats-bar";
import { PipelineTaskInspector } from "./pipeline-task-inspector";
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
    repoId: "ALL",
    branchName: "ALL",
  });
  const [viewMode, setViewMode] = useState<"FLOW" | "GRAPH">("GRAPH");
  const [pipelineSubView, setPipelineSubView] = useState<"FLOW" | "MATRIX">("FLOW");
  const [isMobileInspectorOpen, setIsMobileInspectorOpen] = useState(false);
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
    setSelectedTaskId((current) => {
      const next = current === taskId ? null : taskId;
      if (next && typeof window !== "undefined" && window.innerWidth < 1024) {
        setIsMobileInspectorOpen(true);
      }
      return next;
    });
  };

  const selectedTask = useMemo(
    () => pipeline.filteredTasks.find((task) => task.id === pipeline.effectiveTaskId) || null,
    [pipeline.filteredTasks, pipeline.effectiveTaskId]
  );

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

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card p-2 shadow-2xs">
          <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-muted/60 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setPipelineSubView("FLOW")}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${pipelineSubView === "FLOW"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <SparklesIcon className="size-3.5 text-primary" />
              <span>Luồng liên kết (Flow)</span>
            </button>
            <button
              type="button"
              onClick={() => setPipelineSubView("MATRIX")}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${pipelineSubView === "MATRIX"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <TableIcon className="size-3.5 text-primary" />
              <span>Ma trận đối soát (Audit matrix)</span>
            </button>
          </div>

          {selectedTask && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMobileInspectorOpen(true)}
              className="h-8 cursor-pointer gap-1.5 rounded-xl text-xs font-bold lg:hidden"
            >
              <GitCommitIcon className="size-3.5 text-primary" />
              <span>Chi tiết Task & Commit ({selectedTask.key})</span>
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1">
            {pipelineSubView === "FLOW" ? (
              <PipelineFlowView
                lanes={pipeline.lanes}
                selectedTaskId={pipeline.effectiveTaskId}
                onSelectTask={handleSelectTask}
              />
            ) : (
              <PipelineMatrixTable
                tasks={pipeline.filteredTasks}
                selectedTaskId={pipeline.effectiveTaskId}
                onSelectTask={handleSelectTask}
              />
            )}
          </div>

          <aside className="hidden w-full shrink-0 self-start lg:sticky lg:top-28 lg:block lg:w-[380px] xl:w-[420px]">
            <PipelineTaskInspector
              selectedTask={selectedTask}
              commits={pipeline.selectedCommits}
              isLoadingCommits={pipeline.isLoadingTaskCommits}
              errorMessage={pipeline.taskCommitsErrorMessage}
              onRetry={() => void pipeline.refetchTaskCommits()}
              onClearSelection={() => setSelectedTaskId(null)}
            />
          </aside>
        </div>

        <Sheet open={Boolean(selectedTask && isMobileInspectorOpen)} onOpenChange={setIsMobileInspectorOpen}>
          <SheetContent side="right" className="w-full sm:max-w-md p-0 overflow-y-auto lg:hidden">
            <div className="p-4">
              <PipelineTaskInspector
                selectedTask={selectedTask}
                commits={pipeline.selectedCommits}
                isLoadingCommits={pipeline.isLoadingTaskCommits}
                errorMessage={pipeline.taskCommitsErrorMessage}
                onRetry={() => void pipeline.refetchTaskCommits()}
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
              setPipelineFilter({
                studentId: "ALL",
                sprintId: "ALL",
                anomaliesOnly: false,
                repoId: "ALL",
                branchName: "ALL",
              });
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
          extraActiveFilters={
            pipelineOpen
              ? [
                  pipeline.sanitizedFilter.repoId !== "ALL"
                    ? {
                        key: "repository",
                        label: `Repository: ${
                          pipeline.repositories.find(
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
