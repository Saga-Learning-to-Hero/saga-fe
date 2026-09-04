"use client";

import { useState, useMemo } from "react";
import {
  UsersIcon,
  GitGraphIcon,
  FolderKanbanIcon,
  GraduationCapIcon,
  AlertTriangleIcon,
  ShieldAlertIcon,
  CheckCircle2Icon,
} from "lucide-react";
import { CustomSelect } from "@/components/common/custom-select";
import { Badge } from "@/components/ui/badge";
import { CytoscapeGraphCanvas } from "./cytoscape-graph-canvas";
import { TraceabilityFlowCanvas } from "./traceability-flow-canvas";
import { GraphFilterBar } from "./graph-filter-bar";
import { GraphStatsSummary } from "./graph-stats-summary";
import { GraphNodeDetailsModal } from "./graph-node-details-modal";
import { TraceabilityMatrixTable } from "./traceability-matrix-table";
import { SNANetworkView } from "./sna-network-view";
import { getMockTraceabilityGraphData } from "../data/mock-graph-data";
import type { GraphNodeData } from "../types/graph";

const MOCK_LECTURER_GROUPS = [
  {
    id: "g1",
    name: "Nhóm 01 - SAGA Capstone Project",
    projectTopic: "Hệ thống Phân tích Đóng góp Đồ án bằng Neo4j & Slicing Pie",
    memberCount: 5,
    traceabilityRate: 94.5,
    msrCount: 1,
    ghostingCount: 1,
    status: "WARNING",
  },
  {
    id: "g2",
    name: "Nhóm 02 - EduBridge Learning Portal",
    projectTopic: "Nền tảng Quản lý Học tập & Lớp học Trực tuyến",
    memberCount: 4,
    traceabilityRate: 98.2,
    msrCount: 0,
    ghostingCount: 0,
    status: "HEALTHY",
  },
  {
    id: "g3",
    name: "Nhóm 03 - MediCare AI Clinic",
    projectTopic: "Ứng dụng Đặt lịch Khám & Chẩn đoán Bệnh bằng AI",
    memberCount: 5,
    traceabilityRate: 81.0,
    msrCount: 3,
    ghostingCount: 1,
    status: "WARNING",
  },
  {
    id: "g4",
    name: "Nhóm 04 - SmartFarm IoT Network",
    projectTopic: "Hệ thống Giám sát Nông nghiệp Thông minh qua Cảm biến",
    memberCount: 4,
    traceabilityRate: 92.0,
    msrCount: 0,
    ghostingCount: 0,
    status: "HEALTHY",
  },
  {
    id: "g5",
    name: "Nhóm 05 - AutoCare Logistics",
    projectTopic: "Quản lý Đội xe Vận tải & Tối ưu Lộ trình",
    memberCount: 5,
    traceabilityRate: 46.0,
    msrCount: 5,
    ghostingCount: 2,
    status: "CRITICAL",
  },
];

export function LecturerGraphView() {
  const [selectedGroupId, setSelectedGroupId] = useState<string>("g1");
  const [activeTab, setActiveTab] = useState<"TRACEABILITY" | "SNA">("TRACEABILITY");
  const [viewMode, setViewMode] = useState<"FLOW" | "GRAPH">("GRAPH");

  const [selectedStudentId, setSelectedStudentId] = useState<string>("ALL");
  const [selectedSprint, setSelectedSprint] = useState<string>("ALL");
  const [filterType, setFilterType] = useState<"ALL" | "ANOMALIES_ONLY" | "TASKS_COMMITS">("ALL");

  const [selectedNode, setSelectedNode] = useState<GraphNodeData | null>(null);

  const currentGroup = useMemo(
    () => MOCK_LECTURER_GROUPS.find((g) => g.id === selectedGroupId) || MOCK_LECTURER_GROUPS[0],
    [selectedGroupId]
  );

  const initialData = useMemo(() => getMockTraceabilityGraphData(), []);

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

  const groupSelectOptions = MOCK_LECTURER_GROUPS.map((g) => ({
    value: g.id,
    label: g.name,
    subLabel: `Độ tin cậy: ${g.traceabilityRate}% · ${g.msrCount} Task thiếu commit · ${g.ghostingCount} Ghosting`,
  }));

  // Khối chọn nhóm tinh gọn lồng vào thanh công cụ
  const groupSelectorNode = (
    <div className="flex items-center gap-2 w-full">
      <div className="w-full max-w-[260px] sm:max-w-[300px]">
        <CustomSelect
          value={selectedGroupId}
          onChange={setSelectedGroupId}
          options={groupSelectOptions}
        />
      </div>
      <Badge
        className={
          currentGroup.status === "CRITICAL"
            ? "bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/40 text-xs font-black gap-1 shrink-0 animate-pulse"
            : currentGroup.status === "WARNING"
              ? "bg-amber-500/20 text-amber-950 dark:text-amber-200 border border-amber-500/50 text-xs font-black gap-1 shrink-0"
              : "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40 text-xs font-black gap-1 shrink-0"
        }
      >
        {currentGroup.status === "CRITICAL" ? (
          <>
            <ShieldAlertIcon className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
            <span className="hidden sm:inline">Nguy cơ cao</span>
          </>
        ) : currentGroup.status === "WARNING" ? (
          <>
            <AlertTriangleIcon className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
            <span className="hidden sm:inline">Cần chú ý</span>
          </>
        ) : (
          <>
            <CheckCircle2Icon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">Hoạt động tốt</span>
          </>
        )}
      </Badge>
    </div>
  );

  // Khối chọn nhanh nhóm nằm trong ngăn kéo bộ lọc thu gọn
  const extraCollapsibleNode = (
    <div className="pt-2 border-t border-border/60 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
      <span className="text-[11px] font-bold text-muted-foreground shrink-0 flex items-center gap-1">
        <FolderKanbanIcon className="w-3.5 h-3.5 text-blue-500" />
        Chọn nhanh nhóm:
      </span>
      {MOCK_LECTURER_GROUPS.map((g) => (
        <button
          key={g.id}
          onClick={() => setSelectedGroupId(g.id)}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${selectedGroupId === g.id
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
        >
          <span>{g.name.split(" - ")[0]}</span>
          {g.msrCount > 0 && <span className="w-2 h-2 rounded-full bg-red-400" />}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* ── Tiêu đề & Điều hướng Tab tinh gọn ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <GraduationCapIcon className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                Giám sát Đa nhóm
              </span>
              <span className="text-muted-foreground/40">•</span>
              <span className="text-[10px] font-mono text-muted-foreground">Traceability & SNA</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Giám sát Đồ thị Traceability & Mạng lưới SNA
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-2xl border border-border/60 self-start sm:self-auto shrink-0 shadow-2xs">
          <button
            onClick={() => setActiveTab("TRACEABILITY")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${activeTab === "TRACEABILITY"
                ? "bg-card text-foreground shadow-xs border border-border/80"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <GitGraphIcon className="w-3.5 h-3.5 text-blue-500" />
            <span>Traceability Graph</span>
          </button>
          <button
            onClick={() => setActiveTab("SNA")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${activeTab === "SNA"
                ? "bg-card text-foreground shadow-xs border border-border/80"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <UsersIcon className="w-3.5 h-3.5 text-purple-500" />
            <span>Mạng lưới SNA</span>
          </button>
        </div>
      </div>

      {activeTab === "TRACEABILITY" ? (
        <div className="space-y-4 animate-in fade-in-0 duration-200">
          {/* ── 1. Thanh điều khiển tinh gọn 1 hàng tích hợp bộ lọc thu gọn ── */}
          <GraphFilterBar
            groupSelector={groupSelectorNode}
            extraCollapsibleContent={extraCollapsibleNode}
            selectedStudentId={selectedStudentId}
            onSelectStudent={setSelectedStudentId}
            selectedSprint={selectedSprint}
            onSelectSprint={setSelectedSprint}
            filterType={filterType}
            onSelectFilterType={setFilterType}
            onExport={() => alert("Đã xuất dữ liệu giám sát của nhóm thành công!")}
            onReset={() => {
              setSelectedStudentId("ALL");
              setSelectedSprint("ALL");
              setFilterType("ALL");
            }}
            anomaliesCount={currentGroup.msrCount}
            viewMode={viewMode}
            onSelectViewMode={setViewMode}
          />

          {/* ── 2. ĐỒ THỊ TRUNG TÂM (Centerpiece Canvas - Hiển thị ngay đầu tiên) ── */}
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

          {/* ── 3. Thống kê & Bảng ma trận đối soát nguồn gốc ── */}
          <GraphStatsSummary
            totalNodes={filteredGraphData.nodes.length}
            totalEdges={filteredGraphData.edges.length}
            traceabilityRate={currentGroup.traceabilityRate}
            msrCount={currentGroup.msrCount}
          />

          <TraceabilityMatrixTable />
        </div>
      ) : (
        <SNANetworkView />
      )}

      <GraphNodeDetailsModal nodeData={selectedNode} onClose={() => setSelectedNode(null)} />
    </div>
  );
}
