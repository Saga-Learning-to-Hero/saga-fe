"use client";

import { useState, useMemo } from "react";
import { NetworkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  const [viewMode, setViewMode] = useState<"FLOW" | "GRAPH">("GRAPH");
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

  const projectInfoNode = (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="px-2.5 py-1 text-xs font-bold bg-muted/40 border-border/80 text-foreground">
        Nhóm 01 - SAGA Capstone Project
      </Badge>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* ── Tiêu đề tinh gọn ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <NetworkIcon className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                Traceability Graph & Evidence Engine
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Đồ thị Traceability (Jira Task & Git Commits)
            </h1>
          </div>
        </div>
      </div>

      <div className="space-y-4 animate-in fade-in-0 duration-200">
        {/* ── Thanh điều khiển tinh gọn 1 hàng tích hợp bộ lọc thu gọn ── */}
        <GraphFilterBar
          groupSelector={projectInfoNode}
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

        {/* ── Đồ thị hiển thị ngay đầu tiên làm trung tâm ── */}
        {viewMode === "GRAPH" ? (
          <CytoscapeGraphCanvas
            nodes={filteredGraphData.nodes}
            edges={filteredGraphData.edges}
            onSelectNode={(node) => setSelectedNode(node)}
            layoutName="breadthfirst"
          />
        ) : (
          <TraceabilityFlowCanvas
            nodes={filteredGraphData.nodes}
            edges={filteredGraphData.edges}
            onSelectNode={(node) => setSelectedNode(node)}
            highlightMSRAnomaly={true}
          />
        )}

        {/* ── Bảng tóm tắt & Ma trận đối soát phía dưới ── */}
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
