"use client";

import { useState, useMemo } from "react";
import {
  UsersIcon,
  GitGraphIcon,
  BookOpenIcon,
  FolderKanbanIcon,
  GraduationCapIcon,
} from "lucide-react";
import { CustomSelect } from "@/components/common/custom-select";
import { Badge } from "@/components/ui/badge";
import { CytoscapeGraphCanvas } from "./cytoscape-graph-canvas";
import { GraphFilterBar } from "./graph-filter-bar";
import { GraphStatsSummary } from "./graph-stats-summary";
import { GraphNodeDetailsModal } from "./graph-node-details-modal";
import { TraceabilityMatrixTable } from "./traceability-matrix-table";
import { SNANetworkView } from "./sna-network-view";
import { getMockTraceabilityGraphData } from "../data/mock-graph-data";
import type { GraphNodeData } from "../types/graph";

// Mock Danh sách Lớp học và Nhóm đồ án của Giảng viên
const MOCK_LECTURER_COURSES = [
  { value: "prn212-01", label: "PRN212 - Lập trình .NET (FA26 · BE-204)", subLabel: "8 Nhóm · 42 Sinh viên" },
  { value: "swp391-03", label: "SWP391 - Dự án phần mềm (FA26 · AI Lab)", subLabel: "6 Nhóm · 28 Sinh viên" },
  { value: "swd392-02", label: "SWD392 - Kiến trúc phần mềm (FA26 · DE-308)", subLabel: "7 Nhóm · 36 Sinh viên" },
];

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
  const [selectedCourseId, setSelectedCourseId] = useState<string>("prn212-01");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("g1");
  const [activeTab, setActiveTab] = useState<"TRACEABILITY" | "SNA">("TRACEABILITY");

  // Filters State cho Đồ thị của Nhóm đang chọn
  const [selectedStudentId, setSelectedStudentId] = useState<string>("ALL");
  const [selectedSprint, setSelectedSprint] = useState<string>("ALL");
  const [filterType, setFilterType] = useState<"ALL" | "ANOMALIES_ONLY" | "TASKS_COMMITS">("ALL");

  // Selected Node for Modal
  const [selectedNode, setSelectedNode] = useState<GraphNodeData | null>(null);

  const currentGroup = useMemo(
    () => MOCK_LECTURER_GROUPS.find((g) => g.id === selectedGroupId) || MOCK_LECTURER_GROUPS[0],
    [selectedGroupId]
  );

  const initialData = useMemo(() => getMockTraceabilityGraphData(), []);

  // Filtered Graph Data
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
    subLabel: `Độ tin cậy: ${g.traceabilityRate}% · ${g.msrCount} MSR · ${g.ghostingCount} Ghosting`,
  }));

  return (
    <div className="space-y-6">
      {/* ── Page Header: Lecturer Multi-Group Monitor Hub ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs">
            <GraduationCapIcon className="w-4 h-4" />
            <span>KHÔNG GIAN GIẢNG VIÊN · GIÁM SÁT ĐỐI SOÁT TOÀN BỘ NHÓM ĐỒ ÁN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-1">
            Trung Tâm Giám Sát Đồ Thị & Ma Trận Đóng Góp Lớp Học
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-3xl leading-relaxed">
            Giảng viên có toàn quyền chuyển đổi qua lại giữa tất cả các nhóm trong khóa học, kiểm tra đối soát lỗi MSR Anomaly, theo dõi mạng lưới tương tác SNA và can thiệp ghi đè điểm số (Human-in-the-loop).
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1.5 bg-muted/60 rounded-2xl border border-border/60 self-start lg:self-auto shrink-0 shadow-2xs">
          <button
            onClick={() => setActiveTab("TRACEABILITY")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${activeTab === "TRACEABILITY"
                ? "bg-card text-foreground shadow-xs border border-border/80"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <GitGraphIcon className="w-4 h-4 text-blue-500" />
            <span>Traceability Graph (Đối Soát Code)</span>
          </button>
          <button
            onClick={() => setActiveTab("SNA")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${activeTab === "SNA"
                ? "bg-card text-foreground shadow-xs border border-border/80"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <UsersIcon className="w-4 h-4 text-purple-500" />
            <span>SNA Matrix (Phát Hiện Ghosting)</span>
          </button>
        </div>
      </div>

      {/* ── Course & Project Group Master Selector Bar ── */}
      <div className="p-5 rounded-3xl bg-linear-to-r from-blue-500/10 via-card to-purple-500/10 border border-border/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Selector 1: Course */}
            <div className="space-y-1 min-w-[280px]">
              <label className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
                <BookOpenIcon className="w-3.5 h-3.5 text-primary" />
                Khóa học & Lớp giảng dạy:
              </label>
              <CustomSelect
                value={selectedCourseId}
                onChange={setSelectedCourseId}
                options={MOCK_LECTURER_COURSES}
              />
            </div>

            {/* Selector 2: Group Switcher */}
            <div className="space-y-1 min-w-[320px]">
              <label className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
                <FolderKanbanIcon className="w-3.5 h-3.5 text-blue-500" />
                Chọn Nhóm Đồ Án Cần Giám Sát:
              </label>
              <CustomSelect
                value={selectedGroupId}
                onChange={setSelectedGroupId}
                options={groupSelectOptions}
              />
            </div>
          </div>

          {/* Current Selected Group Status Badge */}
          <div className="flex items-center gap-3 shrink-0 p-3 rounded-2xl bg-card border border-border/80 shadow-2xs">
            <div>
              <span className="text-[10px] text-muted-foreground font-bold uppercase block">Trạng thái Nhóm:</span>
              <span className="font-black text-sm text-foreground">{currentGroup.name}</span>
            </div>
            <Badge
              className={
                currentGroup.status === "CRITICAL"
                  ? "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 text-xs font-bold animate-pulse"
                  : currentGroup.status === "WARNING"
                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold"
                    : "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 text-xs font-bold"
              }
            >
              {currentGroup.status === "CRITICAL"
                ? "🚨 Nguy Cơ Cao"
                : currentGroup.status === "WARNING"
                  ? "⚠️ Cần Chú Ý"
                  : " Tốt"}
            </Badge>
          </div>
        </div>

        {/* Quick Group Switcher Pills */}
        <div className="pt-3 border-t border-border/60 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-muted-foreground shrink-0">Chuyển nhanh nhóm:</span>
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
      </div>

      {/* ── Active Tab View ── */}
      {activeTab === "TRACEABILITY" ? (
        <div className="space-y-6 animate-in fade-in-0 duration-200">
          {/* Stats Summary for this selected group */}
          <GraphStatsSummary
            totalNodes={filteredGraphData.nodes.length}
            totalEdges={filteredGraphData.edges.length}
            traceabilityRate={currentGroup.traceabilityRate}
            msrCount={currentGroup.msrCount}
          />

          {/* Filter Bar within Group */}
          <GraphFilterBar
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
      ) : (
        /* ── SNA Tab ── */
        <SNANetworkView />
      )}

      {/* Node Inspector Modal */}
      <GraphNodeDetailsModal nodeData={selectedNode} onClose={() => setSelectedNode(null)} />
    </div>
  );
}
