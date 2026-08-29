"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import cytoscape, { Core, EventObject, LayoutOptions } from "cytoscape";
import {
  ZoomInIcon,
  ZoomOutIcon,
  Maximize2Icon,
  RotateCcwIcon,
  LayersIcon,
  MousePointerClickIcon,
  EyeIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GraphNode, GraphEdge, GraphNodeData } from "../types/graph";

interface CytoscapeGraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onSelectNode: (node: GraphNodeData) => void;
  selectedNodeId?: string | null;
  layoutName?: "breadthfirst" | "cose" | "concentric" | "circle";
  highlightMSRAnomaly?: boolean;
}

export function CytoscapeGraphCanvas({
  nodes,
  edges,
  onSelectNode,
  layoutName = "breadthfirst",
  highlightMSRAnomaly = true,
}: CytoscapeGraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [currentLayout, setCurrentLayout] = useState<string>(layoutName);
  const [hoveredNodeLabel, setHoveredNodeLabel] = useState<string | null>(null);

  // Layout helper with optimized node spacing
  const applyLayout = useCallback((cyInstance: Core, layout: string) => {
    let layoutConfig: LayoutOptions = {
      name: "breadthfirst",
      directed: true,
      padding: 60,
      spacingFactor: 1.6,
      avoidOverlap: true,
    };

    if (layout === "cose") {
      layoutConfig = {
        name: "cose",
        animate: true,
        padding: 50,
        nodeOverlap: 40,
        idealEdgeLength: () => 140,
        nodeRepulsion: () => 600000,
        gravity: 0.25,
      };
    } else if (layout === "concentric") {
      layoutConfig = {
        name: "concentric",
        concentric: (node: cytoscape.NodeSingular) => {
          const type = node.data("nodeType");
          return type === "STUDENT" ? 3 : type === "TASK" ? 2 : 1;
        },
        levelWidth: () => 1,
        padding: 50,
        minNodeSpacing: 60,
      };
    } else if (layout === "circle") {
      layoutConfig = {
        name: "circle",
        padding: 50,
        avoidOverlap: true,
      };
    }

    cyInstance.layout(layoutConfig).run();
  }, []);

  // Initialize Cytoscape Instance
  useEffect(() => {
    if (!containerRef.current) return;

    // Transform elements with metadata for cytoscape rendering
    const elements = [
      ...nodes.map((n) => {
        const isAnomaly =
          ("isMSRAnomaly" in n.data && n.data.isMSRAnomaly) ||
          ("isGhosting" in n.data && n.data.isGhosting);

        let bg = "#3b82f6";
        let shape: cytoscape.Css.NodeShape = "ellipse";
        let width = 54;
        let height = 54;

        if (n.type === "STUDENT") {
          bg = "#2563eb";
          shape = "ellipse";
          width = 56;
          height = 56;
        } else if (n.type === "TASK") {
          bg = isAnomaly ? "#dc2626" : "#059669";
          shape = "round-rectangle";
          width = 84;
          height = 42;
        } else if (n.type === "COMMIT") {
          bg = "#7c3aed";
          shape = "diamond";
          width = 46;
          height = 46;
        }

        return {
          data: {
            id: n.id,
            label: n.label,
            subLabel: n.subLabel,
            nodeType: n.type,
            status: n.status,
            bgColor: bg,
            shape: shape,
            width: width,
            height: height,
            isAnomaly: Boolean(isAnomaly),
            originalData: n.data,
          },
        };
      }),
      ...edges.map((e) => ({
        data: {
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label,
          edgeType: e.type,
          weight: e.weight || 1,
        },
      })),
    ];

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      boxSelectionEnabled: false,
      autounselectify: false,
      style: [
        // ── General Node Styles ─────────────────────────────────────────
        {
          selector: "node",
          style: {
            label: "data(label)",
            "text-valign": "bottom",
            "text-halign": "center",
            "font-size": "11px",
            "font-weight": 700,
            "text-margin-y": 8,
            color: "#475569",
            width: "data(width)",
            height: "data(height)",
            "background-color": "data(bgColor)",
            "border-width": 3,
            "border-color": "#ffffff",
            "text-background-opacity": 0.85,
            "text-background-color": "#f8fafc",
            "text-background-padding": "3px",
            "text-background-shape": "roundrectangle",
            "transition-property": "background-color, border-color, width, height, opacity, transform",
            "transition-duration": 0.25,
          },
        },

        // ── STUDENT NODES ───────────────────────────────────────────────
        {
          selector: 'node[nodeType = "STUDENT"]',
          style: {
            "border-width": 3.5,
            "border-color": "#93c5fd",
            color: "#1e3a8a",
          },
        },

        // ── JIRA TASK NODES ─────────────────────────────────────────────
        {
          selector: 'node[nodeType = "TASK"]',
          style: {
            "border-width": 2.5,
            "border-color": "#6ee7b7",
            color: "#064e3b",
          },
        },

        // ── GIT COMMIT NODES ────────────────────────────────────────────
        {
          selector: 'node[nodeType = "COMMIT"]',
          style: {
            "border-width": 2.5,
            "border-color": "#c4b5fd",
            color: "#4c1d95",
            "font-family": "monospace",
          },
        },

        // ── MSR / GHOSTING ANOMALY ALERT ────────────────────────────────
        {
          selector: "node[?isAnomaly]",
          style: {
            "background-color": "#ef4444",
            "border-color": "#fecaca",
            "border-width": 4,
            color: "#991b1b",
          },
        },

        // ── SELECTED / HIGHLIGHTED STATE ────────────────────────────────
        {
          selector: ":selected",
          style: {
            "border-width": 6,
            "border-color": "#2563eb",
            "underlay-color": "#3b82f6",
            "underlay-padding": 8,
            "underlay-opacity": 0.35,
          },
        },

        // ── FADED STATE (Neighborhood Dimming) ──────────────────────────
        {
          selector: ".faded",
          style: {
            opacity: 0.15,
          },
        },
        {
          selector: ".highlighted",
          style: {
            opacity: 1,
            "border-width": 5,
            "border-color": "#3b82f6",
          },
        },

        // ── General Edge Styles ─────────────────────────────────────────
        {
          selector: "edge",
          style: {
            width: 2.5,
            "line-color": "#94a3b8",
            "target-arrow-color": "#64748b",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            "arrow-scale": 1.3,
            opacity: 0.75,
            label: "data(label)",
            "font-size": "9px",
            "font-weight": 600,
            "text-rotation": "autorotate",
            "text-background-opacity": 0.95,
            "text-background-color": "#ffffff",
            "text-background-padding": "3px",
            "text-background-shape": "roundrectangle",
            color: "#475569",
            "transition-property": "line-color, target-arrow-color, width, opacity",
            "transition-duration": 0.25,
          },
        },

        // ── Specific Edge Semantics ─────────────────────────────────────
        {
          selector: 'edge[edgeType = "AUTHORED"]',
          style: {
            "line-color": "#60a5fa",
            "target-arrow-color": "#2563eb",
            "line-style": "dashed",
            width: 2.5,
          },
        },
        {
          selector: 'edge[edgeType = "ASSIGNED_TO"]',
          style: {
            "line-color": "#34d399",
            "target-arrow-color": "#059669",
            width: 2.5,
          },
        },
        {
          selector: 'edge[edgeType = "IMPLEMENTS"]',
          style: {
            "line-color": "#a78bfa",
            "target-arrow-color": "#7c3aed",
            width: 3.5,
          },
        },
        {
          selector: 'edge[edgeType = "REVIEWED"]',
          style: {
            "line-color": "#10b981",
            "target-arrow-color": "#047857",
            width: "mapData(weight, 1, 15, 2.5, 6.5)",
          },
        },
      ],
    });

    // Run Initial Layout
    applyLayout(cy, currentLayout);

    // Interactive Hover: Highlight Connected Neighborhood
    cy.on("mouseover", "node", (evt: EventObject) => {
      const node = evt.target;
      setHoveredNodeLabel(`${node.data("label")} (${node.data("nodeType")})`);

      const neighborhood = node.neighborhood().add(node);
      cy.elements().addClass("faded");
      neighborhood.removeClass("faded").addClass("highlighted");
    });

    cy.on("mouseout", "node", () => {
      setHoveredNodeLabel(null);
      cy.elements().removeClass("faded").removeClass("highlighted");
    });

    // Click Node: Trigger selection
    cy.on("tap", "node", (evt: EventObject) => {
      const nodeData = evt.target.data("originalData");
      if (nodeData) {
        onSelectNode(nodeData);
      }
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [nodes, edges, currentLayout, applyLayout, onSelectNode]);

  // Zoom / Pan Handlers
  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.25);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current?.fit(undefined, 40);
  const handleReset = () => {
    if (cyRef.current) {
      applyLayout(cyRef.current, currentLayout);
      cyRef.current.fit(undefined, 40);
    }
  };

  return (
    <div className="relative w-full h-[600px] sm:h-[680px] rounded-3xl border border-border/90 bg-linear-to-b from-card/90 via-card/70 to-card/90 backdrop-blur-md overflow-hidden shadow-md">
      {/* ── Canvas Element ── */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* ── Top-Left Legend (Academic Notation) ── */}
      <div className="absolute top-4 left-4 p-4 rounded-2xl bg-card/95 backdrop-blur-md border border-border/80 shadow-lg text-xs space-y-2.5 pointer-events-auto max-w-xs">
        <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-1.5">
          <span className="font-extrabold text-foreground uppercase text-[10px] tracking-wider">
            Chú giải Ngữ nghĩa Đồ thị (Neo4j)
          </span>
        </div>
        <div className="flex flex-col gap-2 font-medium text-[11px]">
          <div className="flex items-center gap-2.5">
            <span className="w-4 h-4 rounded-full bg-blue-600 border-2 border-blue-200 shadow-2xs" />
            <span><strong className="text-foreground">(:Student)</strong> Chủ thể thực thi (Actor)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-4 h-3 rounded-xs bg-emerald-600 border-2 border-emerald-200 shadow-2xs" />
            <span><strong className="text-foreground">(:JiraTask)</strong> Đầu việc nghiệp vụ (Task)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-3.5 h-3.5 rotate-45 bg-purple-600 border-2 border-purple-200 shadow-2xs" />
            <span><strong className="text-foreground">(:Commit)</strong> Dấu vết kỹ thuật (Git Code)</span>
          </div>
          {highlightMSRAnomaly && (
            <div className="flex items-center gap-2.5 pt-1.5 border-t border-border/60 text-red-600 dark:text-red-400 font-bold">
              <span className="w-3.5 h-3.5 rounded-full bg-red-600 border-2 border-red-300 animate-pulse" />
              <span>🚨 Bất thường MSR (Thiếu mã nguồn)</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Top-Right Floating Controls ── */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 p-1.5 rounded-2xl bg-card/95 backdrop-blur-md border border-border/80 shadow-lg pointer-events-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomIn}
          className="h-8.5 w-8.5 rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary"
          title="Phóng to (Zoom In)"
        >
          <ZoomInIcon className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomOut}
          className="h-8.5 w-8.5 rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary"
          title="Thu nhỏ (Zoom Out)"
        >
          <ZoomOutIcon className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFit}
          className="h-8.5 w-8.5 rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary"
          title="Căn chỉnh toàn cảnh (Fit to Viewport)"
        >
          <Maximize2Icon className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleReset}
          className="h-8.5 w-8.5 rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary"
          title="Sắp xếp lại bố cục tự động (Reset Layout)"
        >
          <RotateCcwIcon className="w-4 h-4" />
        </Button>
      </div>

      {/* ── Hover Node Tooltip Pill ── */}
      {hoveredNodeLabel && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-foreground text-background text-xs font-bold shadow-xl animate-in fade-in-0 zoom-in-95 pointer-events-none flex items-center gap-2">
          <EyeIcon className="w-3.5 h-3.5 text-primary" />
          <span>{hoveredNodeLabel}</span>
        </div>
      )}

      {/* ── Bottom-Left Layout Switcher ── */}
      <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-card/95 backdrop-blur-md border border-border/80 shadow-lg text-xs pointer-events-auto">
        <span className="px-2 text-[11px] font-bold text-muted-foreground flex items-center gap-1">
          <LayersIcon className="w-3.5 h-3.5 text-primary" />
          Thuật toán Bố cục:
        </span>
        {(["breadthfirst", "cose", "concentric", "circle"] as const).map((l) => (
          <button
            key={l}
            onClick={() => setCurrentLayout(l)}
            className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${currentLayout === l
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
          >
            {l === "breadthfirst"
              ? "Phân cấp Trực giao (Tree)"
              : l === "cose"
                ? "Lực đàn hồi (Force-directed)"
                : l === "concentric"
                  ? "Đồng tâm (Concentric)"
                  : "Vòng tròn (Circular)"}
          </button>
        ))}
      </div>

      {/* ── Bottom-Right Interactive Guide ── */}
      <div className="hidden sm:flex absolute bottom-4 right-4 items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/90 backdrop-blur-sm border border-border/70 text-[11px] text-muted-foreground shadow-sm">
        <MousePointerClickIcon className="w-3.5 h-3.5 text-primary" />
        <span>Di chuột để cô lập mạng lưới liên quan · Bấm vào đỉnh để đối soát chi tiết</span>
      </div>
    </div>
  );
}
