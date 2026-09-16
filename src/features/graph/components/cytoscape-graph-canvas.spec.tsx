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
});
