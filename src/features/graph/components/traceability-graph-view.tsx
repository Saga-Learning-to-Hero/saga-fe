"use client";

import { useState, useMemo } from "react";
import { NetworkIcon } from "lucide-react";
import { CytoscapeGraphCanvas } from "./cytoscape-graph-canvas";
import { TraceabilityFlowCanvas } from "./traceability-flow-canvas";
import { GraphFilterBar } from "./graph-filter-bar";
import { GraphStatsSummary } from "./graph-stats-summary";
import { GraphNodeDetailsModal } from "./graph-node-details-modal";
import { TraceabilityMatrixTable } from "./traceability-matrix-table";
import { getMockTraceabilityGraphData } from "../data/mock-graph-data";
import type { GraphNodeData } from "../types/graph";

export function TraceabilityGraphView() {
  const initialData = useMemo(() => getMockTraceabilityGraphData(), []);

  const [selectedStudentId, setSelectedStudentId] = useState<string>("ALL");
  const [selectedSprint, setSelectedSprint] = useState<string>("ALL");
  const [filterType, setFilterType] = useState<"ALL" | "ANOMALIES_ONLY" | "TASKS_COMMITS">("ALL");
  const [viewMode, setViewMode] = useState<"FLOW" | "GRAPH">("FLOW");
  const [selectedNode, setSelectedNode] = useState<GraphNodeData | null>(null);

  const filteredGraphData = useMemo(() => {
    let filteredNodes = [...initialData.nodes];

    if (selectedStudentId !== "ALL") {
      filteredNodes = filteredNodes.filter((n) => {
        if (n.type === "STUDENT") return n.id === selectedStudentId;
        if (n.type === "TASK" && "assigneeId" in n.data) return n.data.assigneeId === selectedStudentId;
        if (n.type === "COMMIT" && "authorId" in n.data) return n.data.authorId === selectedStudentId;
        return true;
      });
    }

    if (selectedSprint !== "ALL") {
      filteredNodes = filteredNodes.filter((n) => {
        if (n.type === "TASK" && "sprintId" in n.data) return n.data.sprintId === selectedSprint;
        return true;
      });
    }

    if (filterType === "ANOMALIES_ONLY") {
      filteredNodes = filteredNodes.filter((n) => {
        return (
          ("isMSRAnomaly" in n.data && n.data.isMSRAnomaly) ||
          ("isGhosting" in n.data && n.data.isGhosting)
        );
      });
    }

    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    const filteredEdges = initialData.edges.filter(
      (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
    );

    return {
      nodes: filteredNodes,
      edges: filteredEdges,
    };
  }, [initialData, selectedStudentId, selectedSprint, filterType]);

  const handleExport = () => {
    alert("Đã xuất dữ liệu Traceability Graph (JSON & PNG) thành công!");
  };

  const handleResetFilters = () => {
    setSelectedStudentId("ALL");
    setSelectedSprint("ALL");
    setFilterType("ALL");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs">
            <NetworkIcon className="w-4 h-4" />
            <span>TRACEABILITY GRAPH & EVIDENCE ENGINE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-1">
            Đồ thị Traceability (Jira Task & Git Commits)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-3xl leading-relaxed">
            Theo dõi liên kết từ Jira Task đến Git Commit để minh bạch hóa đóng góp thực tế của từng thành viên.
          </p>
        </div>
      </div>

      <div className="space-y-6 animate-in fade-in-0 duration-200">
        <GraphFilterBar
          selectedStudentId={selectedStudentId}
          onSelectStudent={setSelectedStudentId}
          selectedSprint={selectedSprint}
          onSelectSprint={setSelectedSprint}
          filterType={filterType}
          onSelectFilterType={setFilterType}
          onExport={handleExport}
          onReset={handleResetFilters}
          anomaliesCount={initialData.summary.msrAnomaliesCount}
          viewMode={viewMode}
          onSelectViewMode={setViewMode}
        />

        {viewMode === "FLOW" ? (
          <TraceabilityFlowCanvas
            nodes={filteredGraphData.nodes}
            edges={filteredGraphData.edges}
            onSelectNode={(node) => setSelectedNode(node)}
            highlightMSRAnomaly={true}
          />
        ) : (
          <CytoscapeGraphCanvas
            nodes={filteredGraphData.nodes}
            edges={filteredGraphData.edges}
            onSelectNode={(node) => setSelectedNode(node)}
            layoutName="breadthfirst"
          />
        )}

        <GraphStatsSummary
          totalNodes={filteredGraphData.nodes.length}
          totalEdges={filteredGraphData.edges.length}
          traceabilityRate={initialData.summary.traceabilityRate}
          msrCount={initialData.summary.msrAnomaliesCount}
        />

        <TraceabilityMatrixTable />
      </div>

      <GraphNodeDetailsModal nodeData={selectedNode} onClose={() => setSelectedNode(null)} />
    </div>
  );
}
