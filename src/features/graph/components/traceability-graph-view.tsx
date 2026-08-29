"use client";

import { useState, useMemo } from "react";
import {
  NetworkIcon,
} from "lucide-react";
import { CytoscapeGraphCanvas } from "./cytoscape-graph-canvas";
import { GraphFilterBar } from "./graph-filter-bar";
import { GraphStatsSummary } from "./graph-stats-summary";
import { GraphNodeDetailsModal } from "./graph-node-details-modal";
import { TraceabilityMatrixTable } from "./traceability-matrix-table";
import { getMockTraceabilityGraphData } from "../data/mock-graph-data";
import type { GraphNodeData } from "../types/graph";

export function TraceabilityGraphView() {
  const initialData = useMemo(() => getMockTraceabilityGraphData(), []);

  // Filters State
  const [selectedStudentId, setSelectedStudentId] = useState<string>("ALL");
  const [selectedSprint, setSelectedSprint] = useState<string>("ALL");
  const [filterType, setFilterType] = useState<"ALL" | "ANOMALIES_ONLY" | "TASKS_COMMITS">("ALL");

  // Selected Node for Modal
  const [selectedNode, setSelectedNode] = useState<GraphNodeData | null>(null);

  // Dynamic Graph Filter logic
  const filteredGraphData = useMemo(() => {
    let filteredNodes = [...initialData.nodes];

    // 1. Filter theo sinh viên
    if (selectedStudentId !== "ALL") {
      filteredNodes = filteredNodes.filter((n) => {
        if (n.type === "STUDENT") return n.id === selectedStudentId;
        if (n.type === "TASK" && "assigneeId" in n.data) return n.data.assigneeId === selectedStudentId;
        if (n.type === "COMMIT" && "authorId" in n.data) return n.data.authorId === selectedStudentId;
        return true;
      });
    }

    // 2. Filter theo Sprint
    if (selectedSprint !== "ALL") {
      filteredNodes = filteredNodes.filter((n) => {
        if (n.type === "TASK" && "sprintId" in n.data) return n.data.sprintId === selectedSprint;
        return true;
      });
    }

    // 3. Filter theo Loại bất thường
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
    alert("Dữ liệu đồ thị Traceability đã được xuất thành công dưới định dạng JSON & Canvas PNG!");
  };

  const handleResetFilters = () => {
    setSelectedStudentId("ALL");
    setSelectedSprint("ALL");
    setFilterType("ALL");
  };

  return (
    <div className="space-y-6">
      {/* ── Header & Academic Metadata ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs">
            <NetworkIcon className="w-4 h-4" />
            <span>NEO4J GRAPH DATABASE & XAI TRACEABILITY SYSTEM</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-1">
            Đồ Thị Truy Xuất Nguồn Gốc (Traceability Graph)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-3xl leading-relaxed">
            Hệ thống trực quan hóa minh chứng kỹ thuật thực nghiệm (Empirical Evidence) từ đầu việc Jira đến từng commit Git theo thời gian thực nhằm chứng minh công sức đóng góp của sinh viên
          </p>
        </div>
      </div>

      {/* ── Traceability Graph View ── */}
      <div className="space-y-6 animate-in fade-in-0 duration-200">
        {/* Summary Metric Cards */}
        <GraphStatsSummary
          totalNodes={filteredGraphData.nodes.length}
          totalEdges={filteredGraphData.edges.length}
          traceabilityRate={initialData.summary.traceabilityRate}
          msrCount={initialData.summary.msrAnomaliesCount}
        />

        {/* Filter Bar */}
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
        />

        {/* Cytoscape Canvas */}
        <CytoscapeGraphCanvas
          nodes={filteredGraphData.nodes}
          edges={filteredGraphData.edges}
          onSelectNode={(node) => setSelectedNode(node)}
          layoutName="breadthfirst"
        />

        {/* Academic Traceability Matrix Audit Table */}
        <TraceabilityMatrixTable />
      </div>

      {/* Node Inspector Modal */}
      <GraphNodeDetailsModal nodeData={selectedNode} onClose={() => setSelectedNode(null)} />
    </div>
  );
}
