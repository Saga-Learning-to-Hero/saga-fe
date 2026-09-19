import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { CytoscapeGraphCanvas } from "./cytoscape-graph-canvas";
import cytoscape from "cytoscape";
import type { CytoscapeNodeData, CytoscapeEdgeData } from "../types/graph";

const mockElements = {
  remove: vi.fn(),
  filter: vi.fn(() => []),
  unselect: vi.fn(),
};

const mockLayoutRun = vi.fn();
const mockLayout = vi.fn(() => ({ run: mockLayoutRun }));

const mockCy = {
  destroy: vi.fn(),
  destroyed: vi.fn(() => false),
  elements: vi.fn(() => ({
    ...mockElements,
    map: vi.fn(() => []),
  })),
  nodes: vi.fn(() => []),
  edges: vi.fn(() => []),
  batch: vi.fn((fn: () => void) => fn()),
  add: vi.fn(),
  remove: vi.fn(),
  getElementById: vi.fn(() => ({
    length: 1,
    data: vi.fn(),
    select: vi.fn(),
  })),
  layout: mockLayout,
  on: vi.fn(),
  zoom: vi.fn(() => 1),
  fit: vi.fn(),
  center: vi.fn(),
  resize: vi.fn(),
};

vi.mock("cytoscape", () => {
  const cytoscapeFn = vi.fn(() => mockCy);
  return {
    default: cytoscapeFn,
    __esModule: true,
  };
});

describe("CytoscapeGraphCanvas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("UTCID01 - [N] Normal: Render canvas va khoi tao Cytoscape instance voi du 8 node types va 10 edge labels", () => {
    const nodes: Array<{ data: CytoscapeNodeData }> = [
      { data: { id: "n-stu", label: "Student A", type: "STUDENT" } },
      { data: { id: "n-team", label: "Team 1", type: "TEAM" } },
      { data: { id: "n-proj", label: "Project Alpha", type: "PROJECT" } },
      { data: { id: "n-spr", label: "Sprint 1", type: "SPRINT" } },
      {
        data: {
          id: "n-task",
          label: "Task 1",
          type: "TASK",
          status: "BLOCKED",
          weightType: "DOCUMENT",
        },
      },
      { data: { id: "n-commit", label: "abc1234", type: "COMMIT" } },
      { data: { id: "n-crit", label: "Code Quality", type: "CRITERION" } },
      { data: { id: "n-id", label: "dev@fpt.edu.vn", type: "IDENTITY" } },
    ];

    const edges: Array<{ data: CytoscapeEdgeData }> = [
      { data: { id: "e-1", source: "n-stu", target: "n-team", label: "MEMBER_OF" } },
      { data: { id: "e-2", source: "n-team", target: "n-proj", label: "OWNS" } },
      { data: { id: "e-3", source: "n-proj", target: "n-spr", label: "HAS_SPRINT" } },
      { data: { id: "e-4", source: "n-spr", target: "n-task", label: "CONTAINS" } },
      { data: { id: "e-5", source: "n-stu", target: "n-task", label: "ASSIGNED_TO" } },
      { data: { id: "e-6", source: "n-task", target: "n-commit", label: "EVIDENCED_BY" } },
      { data: { id: "e-7", source: "n-task", target: "n-crit", label: "CLASSIFIED_AS" } },
      { data: { id: "e-8", source: "n-commit", target: "n-id", label: "AUTHORED_BY" } },
      { data: { id: "e-9", source: "n-id", target: "n-stu", label: "MAPS_TO" } },
      { data: { id: "e-10", source: "n-stu", target: "n-stu", label: "REVIEWED", weight: 3 } },
    ];

    render(<CytoscapeGraphCanvas nodes={nodes} edges={edges} />);

    expect(cytoscape).toHaveBeenCalledTimes(1);
    const passedConfig = vi.mocked(cytoscape).mock.calls[0][0] as cytoscape.CytoscapeOptions;
    expect(passedConfig?.elements).toHaveLength(18);

    const taskElement = (passedConfig?.elements as Array<{ data: Record<string, unknown> }>).find(
      (el) => el.data.id === "n-task"
    );
    expect(taskElement?.data.status).toBe("BLOCKED");
    expect(taskElement?.data.weightType).toBe("DOCUMENT");
    expect(taskElement?.data.isAnomaly).toBe(false);
  });

  it("UTCID02 - [N] Normal: Element co isAnomaly === true duoc danh dau mau do bat thuong", () => {
    const nodes: Array<{ data: CytoscapeNodeData }> = [
      { data: { id: "n-task-anom", label: "Ghost Task", type: "TASK", isAnomaly: true } },
    ];
    const edges: Array<{ data: CytoscapeEdgeData }> = [];

    render(<CytoscapeGraphCanvas nodes={nodes} edges={edges} />);

    const passedConfig = vi.mocked(cytoscape).mock.calls[0][0] as cytoscape.CytoscapeOptions;
    const nodeElement = (passedConfig?.elements as Array<{ data: Record<string, unknown> }>)[0];
    expect(nodeElement.data.bgColor).toBe("#ef4444");
    expect(nodeElement.data.isAnomaly).toBe(true);
  });

  it("UTCID03 - [B] Boundary: isAnomaly bi omit khong duoc coi la anomaly", () => {
    const nodes: Array<{ data: CytoscapeNodeData }> = [
      { data: { id: "n-normal", label: "Normal Task", type: "TASK" } },
    ];

    render(<CytoscapeGraphCanvas nodes={nodes} edges={[]} />);

    const passedConfig = vi.mocked(cytoscape).mock.calls[0][0] as cytoscape.CytoscapeOptions;
    const nodeElement = (passedConfig?.elements as Array<{ data: Record<string, unknown> }>)[0];
    expect(nodeElement.data.isAnomaly).toBe(false);
  });

  it("UTCID04 - [N] Normal: Khi data thay doi ma giu nguyen topology, dung cy.batch de cap nhat va khong khoi tao lai cy", () => {
    const initialNodes: Array<{ data: CytoscapeNodeData }> = [
      { data: { id: "n-1", label: "Task Old", type: "TASK", status: "TODO" } },
    ];

    const { rerender } = render(<CytoscapeGraphCanvas nodes={initialNodes} edges={[]} />);
    expect(cytoscape).toHaveBeenCalledTimes(1);

    const updatedNodes: Array<{ data: CytoscapeNodeData }> = [
      { data: { id: "n-1", label: "Task New Label", type: "TASK", status: "DONE" } },
    ];

    rerender(<CytoscapeGraphCanvas nodes={updatedNodes} edges={[]} />);

    expect(cytoscape).toHaveBeenCalledTimes(1);
    expect(mockCy.batch).toHaveBeenCalled();
  });

  it("UTCID05 - [N] Normal: Nhan nut ZoomIn, ZoomOut, Fit va Reset Layout", () => {
    render(<CytoscapeGraphCanvas nodes={[]} edges={[]} />);

    const zoomInBtn = screen.getByTitle("Phóng to (Zoom In)");
    fireEvent.click(zoomInBtn);
    expect(mockCy.zoom).toHaveBeenCalled();

    const fitBtn = screen.getByTitle("Căn chỉnh toàn cảnh (Fit)");
    fireEvent.click(fitBtn);
    expect(mockCy.fit).toHaveBeenCalled();
  });

  it("UTCID06 - [B] Boundary: Dong mo legend chu giai do thi", () => {
    render(<CytoscapeGraphCanvas nodes={[]} edges={[]} />);

    const openLegendBtn = screen.getByTitle("Mở chú giải đồ thị");
    fireEvent.click(openLegendBtn);

    expect(screen.getByText("Chú Giải Đồ Thị Neo4j")).toBeDefined();

    const closeLegendBtn = screen.getByTitle("Thu gọn chú giải");
    fireEvent.click(closeLegendBtn);

    expect(screen.queryByText("Chú Giải Đồ Thị Neo4j")).toBeNull();
  });

  it("UTCID07 - [N] Normal: Node co avatar se co hasImage = true va bgImage hop le", () => {
    const nodes: Array<{ data: CytoscapeNodeData }> = [
      {
        data: {
          id: "n-stu-avatar",
          label: "Le Hoang Hai",
          type: "STUDENT",
          avatar: "https://example.com/avatar.jpg",
        },
      },
    ];

    render(<CytoscapeGraphCanvas nodes={nodes} edges={[]} />);

    const passedConfig = vi.mocked(cytoscape).mock.calls[0][0] as cytoscape.CytoscapeOptions;
    const nodeElement = (passedConfig?.elements as Array<{ data: Record<string, unknown> }>)[0];
    expect(nodeElement.data.hasImage).toBe(true);
    expect(nodeElement.data.bgImage).toBe("https://example.com/avatar.jpg");
  });

  it("UTCID08 - [N] Normal: Tinh toan toa do da cot cho full graph voi Sprint, Task, Criteria va Commit khong trung lap hoanh do X", () => {
    const mockNodeInstances = [
      { id: () => "spr-1", data: (k?: string) => (k === "nodeType" ? "SPRINT" : "Sprint 4") },
      { id: () => "stu-1", data: (k?: string) => (k === "nodeType" ? "STUDENT" : "Student A") },
      { id: () => "task-1", data: (k?: string) => (k === "nodeType" ? "TASK" : "SAGA-71") },
      { id: () => "crit-1", data: (k?: string) => (k === "nodeType" ? "CRITERION" : "CODE") },
      { id: () => "com-1", data: (k?: string) => (k === "nodeType" ? "COMMIT" : "ce2b3e2") },
    ];
    const mockEdgeInstances = [
      { source: () => ({ id: () => "stu-1" }), target: () => ({ id: () => "task-1" }), data: (k?: string) => (k === "label" ? "ASSIGNED_TO" : "") },
      { source: () => ({ id: () => "task-1" }), target: () => ({ id: () => "com-1" }), data: (k?: string) => (k === "label" ? "EVIDENCED_BY" : "") },
      { source: () => ({ id: () => "task-1" }), target: () => ({ id: () => "crit-1" }), data: (k?: string) => (k === "label" ? "CLASSIFIED_AS" : "") },
    ];

    (mockCy.nodes as unknown as { mockReturnValueOnce: (val: unknown) => void }).mockReturnValueOnce(mockNodeInstances);
    (mockCy.edges as unknown as { mockReturnValue: (val: unknown) => void }).mockReturnValue(mockEdgeInstances);

    const nodes: Array<{ data: CytoscapeNodeData }> = [
      { data: { id: "spr-1", label: "Sprint 4", type: "SPRINT" } },
      { data: { id: "stu-1", label: "Student A", type: "STUDENT" } },
      { data: { id: "task-1", label: "SAGA-71", type: "TASK" } },
      { data: { id: "crit-1", label: "CODE", type: "CRITERION" } },
      { data: { id: "com-1", label: "ce2b3e2", type: "COMMIT" } },
    ];

    render(<CytoscapeGraphCanvas nodes={nodes} edges={[]} layoutName="breadthfirst" />);

    expect(mockCy.layout).toHaveBeenCalled();
    const calls = mockCy.layout.mock.calls as unknown[][];
    const lastLayoutConfig = calls[calls.length - 1]?.[0] as {
      name: string;
      positions: Record<string, { x: number; y: number }>;
    };
    expect(lastLayoutConfig.name).toBe("preset");
    expect(lastLayoutConfig.positions["spr-1"].x).toBe(-480);
    expect(lastLayoutConfig.positions["stu-1"].x).toBe(-220);
    expect(lastLayoutConfig.positions["task-1"].x).toBe(80);
    expect(lastLayoutConfig.positions["crit-1"].x).toBe(380);
    expect(lastLayoutConfig.positions["com-1"].x).toBe(680);
  });

  it("UTCID09 - [B] Boundary: Chong de toa do Y giua cac node Identity va Commit dam bao khoang cach toi thieu", () => {
    const mockNodeInstances = [
      { id: () => "task-1", data: (k?: string) => (k === "nodeType" ? "TASK" : "SAGA-71") },
      { id: () => "com-1", data: (k?: string) => (k === "nodeType" ? "COMMIT" : "c1") },
      { id: () => "com-2", data: (k?: string) => (k === "nodeType" ? "COMMIT" : "c2") },
      { id: () => "id-1", data: (k?: string) => (k === "nodeType" ? "IDENTITY" : "id1") },
      { id: () => "id-2", data: (k?: string) => (k === "nodeType" ? "IDENTITY" : "id2") },
    ];
    const mockEdgeInstances = [
      { source: () => ({ id: () => "task-1" }), target: () => ({ id: () => "com-1" }), data: (k?: string) => (k === "label" ? "EVIDENCED_BY" : "") },
      { source: () => ({ id: () => "task-1" }), target: () => ({ id: () => "com-2" }), data: (k?: string) => (k === "label" ? "EVIDENCED_BY" : "") },
      { source: () => ({ id: () => "com-1" }), target: () => ({ id: () => "id-1" }), data: (k?: string) => (k === "label" ? "AUTHORED_BY" : "") },
      { source: () => ({ id: () => "com-2" }), target: () => ({ id: () => "id-2" }), data: (k?: string) => (k === "label" ? "AUTHORED_BY" : "") },
    ];

    (mockCy.nodes as unknown as { mockReturnValueOnce: (val: unknown) => void }).mockReturnValueOnce(mockNodeInstances);
    (mockCy.edges as unknown as { mockReturnValue: (val: unknown) => void }).mockReturnValue(mockEdgeInstances);

    const nodes: Array<{ data: CytoscapeNodeData }> = [
      { data: { id: "task-1", label: "SAGA-71", type: "TASK" } },
      { data: { id: "com-1", label: "c1", type: "COMMIT" } },
      { data: { id: "com-2", label: "c2", type: "COMMIT" } },
      { data: { id: "id-1", label: "id1", type: "IDENTITY" } },
      { data: { id: "id-2", label: "id2", type: "IDENTITY" } },
    ];

    render(<CytoscapeGraphCanvas nodes={nodes} edges={[]} layoutName="breadthfirst" />);

    const calls = mockCy.layout.mock.calls as unknown[][];
    const lastLayoutConfig = calls[calls.length - 1]?.[0] as {
      positions: Record<string, { x: number; y: number }>;
    };
    const diffCommitY = Math.abs(lastLayoutConfig.positions["com-1"].y - lastLayoutConfig.positions["com-2"].y);
    expect(diffCommitY).toBeGreaterThanOrEqual(52);

    const diffIdY = Math.abs(lastLayoutConfig.positions["id-1"].y - lastLayoutConfig.positions["id-2"].y);
    expect(diffIdY).toBeGreaterThanOrEqual(68);
    expect(lastLayoutConfig.positions["id-1"].x).toBe(740);
  });
});
