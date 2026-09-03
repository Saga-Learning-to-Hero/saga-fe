"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import cytoscape, { Core, EventObject, LayoutOptions } from "cytoscape";
import {
  ZoomInIcon,
  ZoomOutIcon,
  Maximize2Icon,
  RotateCcwIcon,
  LayersIcon,
  MousePointerClickIcon,
  EyeIcon,
  TagIcon,
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
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const [showEdgeLabels, setShowEdgeLabels] = useState<boolean>(false);

  const applyLayout = useCallback((cyInstance: Core, layout: string) => {
    if (layout === "breadthfirst") {
      const studentNodes = cyInstance.nodes('[nodeType = "STUDENT"]');
      const taskNodes = cyInstance.nodes('[nodeType = "TASK"]');
      const isTraceability = studentNodes.length > 0 && taskNodes.length > 0;

      if (isTraceability) {
        let currentY = 70;
        const positions: Record<string, { x: number; y: number }> = {};
        const placedCommits = new Set<string>();

        studentNodes.forEach((student) => {
          const studentId = student.id();
          const studentTasks = cyInstance
            .elements(`edge[source = "${studentId}"][edgeType = "ASSIGNED_TO"]`)
            .targets();

          const startGroupY = currentY;

          if (studentTasks.length === 0) {
            positions[studentId] = { x: 120, y: currentY + 30 };
            currentY += 100;
            return;
          }

          studentTasks.forEach((task) => {
            const taskId = task.id();
            const taskCommits = cyInstance
              .elements(`edge[target = "${taskId}"][edgeType = "IMPLEMENTS"]`)
              .sources();

            const taskCommitCount = taskCommits.length;
            const requiredHeight = Math.max(70, taskCommitCount * 58);
            const taskY = currentY + requiredHeight / 2;
            positions[taskId] = { x: 480, y: taskY };

            let commitY = taskY - ((taskCommitCount - 1) * 58) / 2;
            taskCommits.forEach((commit) => {
              const commitId = commit.id();
              positions[commitId] = { x: 860, y: commitY };
              placedCommits.add(commitId);
              commitY += 58;
            });

            currentY += requiredHeight + 35;
          });

          const groupHeight = currentY - startGroupY;
          positions[studentId] = { x: 120, y: startGroupY + groupHeight / 2 - 15 };
          currentY += 40;
        });

        const unplacedCommits = cyInstance
          .nodes('[nodeType = "COMMIT"]')
          .filter((c) => !placedCommits.has(c.id()));

        let unplacedY = currentY;
        unplacedCommits.forEach((c) => {
          positions[c.id()] = { x: 860, y: unplacedY };
          unplacedY += 65;
        });

        cyInstance
          .layout({
            name: "preset",
            positions,
            fit: true,
            padding: 60,
          })
          .run();
        return;
      }

      cyInstance
        .layout({
          name: "breadthfirst",
          directed: true,
          padding: 70,
          spacingFactor: 1.8,
          avoidOverlap: true,
          nodeDimensionsIncludeLabels: true,
        })
        .run();
      return;
    }

    let layoutConfig: LayoutOptions = {
      name: "breadthfirst",
      directed: true,
      padding: 70,
      spacingFactor: 1.8,
      avoidOverlap: true,
      nodeDimensionsIncludeLabels: true,
    };

    if (layout === "cose") {
      layoutConfig = {
        name: "cose",
        animate: false,
        padding: 70,
        nodeOverlap: 10,
        idealEdgeLength: () => 180,
        nodeRepulsion: () => 5000000,
        nodeDimensionsIncludeLabels: true,
        gravity: 0.15,
        edgeElasticity: () => 32,
      };
    } else if (layout === "concentric") {
      layoutConfig = {
        name: "concentric",
        concentric: (node: cytoscape.NodeSingular) => {
          const type = node.data("nodeType");
          return type === "STUDENT" ? 3 : type === "TASK" ? 2 : 1;
        },
        levelWidth: () => 1,
        padding: 70,
        minNodeSpacing: 110,
        avoidOverlap: true,
        nodeDimensionsIncludeLabels: true,
      };
    } else if (layout === "circle") {
      layoutConfig = {
        name: "circle",
        padding: 70,
        spacingFactor: 1.9,
        avoidOverlap: true,
        nodeDimensionsIncludeLabels: true,
      };
    }

    cyInstance.layout(layoutConfig).run();
  }, []);

  const isSNAGraph = useMemo(
    () =>
      (nodes.length > 0 && nodes.every((n) => n.type === "STUDENT")) ||
      edges.some((e) => e.type === "REVIEWED" || e.type === "COMMENTED_ON"),
    [nodes, edges]
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const elements = [
      ...nodes.map((n) => {
        const isAnomaly =
          ("isMSRAnomaly" in n.data && n.data.isMSRAnomaly) ||
          ("isGhosting" in n.data && n.data.isGhosting);
        const isKey = "isKeyContributor" in n.data && Boolean(n.data.isKeyContributor);

        let bg = "#3b82f6";
        let shape: cytoscape.Css.NodeShape = "ellipse";
        let width = 58;
        let height = 58;

        if (n.type === "STUDENT") {
          bg = isAnomaly ? "#dc2626" : isKey ? "#2563eb" : "#2563eb";
          shape = "ellipse";
          width = isKey ? 68 : 62;
          height = isKey ? 68 : 62;
        } else if (n.type === "TASK") {
          bg = isAnomaly ? "#dc2626" : "#059669";
          shape = "round-rectangle";
          width = 96;
          height = 46;
        } else if (n.type === "COMMIT") {
          bg = "#7c3aed";
          shape = "round-rectangle";
          width = 72;
          height = 36;
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
            isKey: Boolean(isKey),
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
        {
          selector: "node",
          style: {
            label: "data(label)",
            "text-valign": "center",
            "text-halign": "center",
            "font-size": "11px",
            "font-weight": 800,
            color: "#ffffff",
            width: "data(width)",
            height: "data(height)",
            shape: "data(shape)" as unknown as cytoscape.Css.NodeShape,
            "background-color": "data(bgColor)",
            "border-width": 3,
            "border-color": "#ffffff",
            "text-outline-width": 0,
            "transition-property": "background-color, border-color, width, height, opacity",
            "transition-duration": 0.2,
          },
        },
        {
          selector: 'node[nodeType = "STUDENT"]',
          style: {
            "border-width": 3.5,
            "border-color": "#93c5fd",
            "text-valign": "bottom",
            "text-margin-y": 6,
            color: "#1e3a8a",
            "text-background-opacity": 0.9,
            "text-background-color": "#f8fafc",
            "text-background-padding": "3px",
            "text-background-shape": "roundrectangle",
          },
        },
        {
          selector: 'node[nodeType = "TASK"]',
          style: {
            "border-width": 2.5,
            "border-color": "#6ee7b7",
            "font-size": "11px",
          },
        },
        {
          selector: 'node[nodeType = "COMMIT"]',
          style: {
            "border-width": 2.5,
            "border-color": "#c4b5fd",
            "font-family": "monospace",
            "font-size": "10px",
          },
        },
        {
          selector: "node[?isAnomaly]",
          style: {
            "background-color": "#ef4444",
            "border-color": "#fecaca",
            "border-width": 4,
          },
        },
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
        {
          selector: "edge",
          style: {
            width: 2,
            "line-color": "#94a3b8",
            "target-arrow-color": "#64748b",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            "control-point-step-size": 45,
            "arrow-scale": 1.1,
            opacity: 0.7,
            label: showEdgeLabels ? "data(label)" : "",
            "font-size": "9px",
            "font-weight": 700,
            "text-rotation": "autorotate",
            "text-background-opacity": 0.95,
            "text-background-color": "#ffffff",
            "text-background-padding": "2px",
            "text-background-shape": "roundrectangle",
            color: "#475569",
            "transition-property": "line-color, target-arrow-color, width, opacity",
            "transition-duration": 0.2,
          },
        },
        {
          selector: 'edge[edgeType = "AUTHORED"]',
          style: {
            "line-color": "#93c5fd",
            "target-arrow-color": "#3b82f6",
            "line-style": "dashed",
            width: 1.8,
            opacity: 0.4,
          },
        },
        {
          selector: 'edge[edgeType = "ASSIGNED_TO"]',
          style: {
            "line-color": "#34d399",
            "target-arrow-color": "#059669",
            width: 2.8,
            opacity: 0.85,
          },
        },
        {
          selector: 'edge[edgeType = "IMPLEMENTS"]',
          style: {
            "line-color": "#a78bfa",
            "target-arrow-color": "#7c3aed",
            width: 3,
            opacity: 0.85,
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
        {
          selector: 'edge[edgeType = "COMMENTED_ON"]',
          style: {
            "line-color": "#94a3b8",
            "target-arrow-color": "#64748b",
            "line-style": "dotted",
            width: 2.2,
            opacity: 0.8,
          },
        },
      ],
    });

    applyLayout(cy, currentLayout);

    cy.on("mouseover", "node", (evt: EventObject) => {
      const node = evt.target;
      setHoveredLabel(`${node.data("label")} (${node.data("nodeType")})`);

      const neighborhood = node.neighborhood().add(node);
      cy.elements().addClass("faded");
      neighborhood.removeClass("faded").addClass("highlighted");
    });

    cy.on("mouseout", "node", () => {
      setHoveredLabel(null);
      cy.elements().removeClass("faded").removeClass("highlighted");
    });

    cy.on("mouseover", "edge", (evt: EventObject) => {
      const edge = evt.target;
      const sourceLabel = edge.source().data("label");
      const targetLabel = edge.target().data("label");
      const edgeLabel = edge.data("label");
      setHoveredLabel(`${sourceLabel} ➔ ${edgeLabel} ➔ ${targetLabel}`);

      cy.elements().addClass("faded");
      edge.removeClass("faded").addClass("highlighted");
      edge.source().removeClass("faded").addClass("highlighted");
      edge.target().removeClass("faded").addClass("highlighted");
    });

    cy.on("mouseout", "edge", () => {
      setHoveredLabel(null);
      cy.elements().removeClass("faded").removeClass("highlighted");
    });

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
  }, [nodes, edges, currentLayout, showEdgeLabels, applyLayout, onSelectNode]);

  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.25);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current?.fit(undefined, 50);
  const handleReset = () => {
    if (cyRef.current) {
      applyLayout(cyRef.current, currentLayout);
      cyRef.current.fit(undefined, 50);
    }
  };

  return (
    <div className="relative w-full h-[620px] sm:h-[700px] rounded-3xl border border-border/90 bg-linear-to-b from-card/95 via-card/80 to-card/95 backdrop-blur-md overflow-hidden shadow-md">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      <div className="absolute top-4 left-4 p-4 rounded-2xl bg-card/95 backdrop-blur-md border border-border/80 shadow-lg text-xs space-y-2.5 pointer-events-auto max-w-xs">
        <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-1.5">
          <span className="font-extrabold text-foreground uppercase text-[10px] tracking-wider">
            {isSNAGraph ? "Chú Giải Mạng Lưới SNA" : "Chú Giải Đồ Thị Neo4j"}
          </span>
        </div>

        {isSNAGraph ? (
          <div className="flex flex-col gap-1.5 font-medium text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-blue-600 border border-blue-200 shrink-0" />
              <span><strong className="text-foreground font-mono">(:Student)</strong> Thành viên</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-purple-500 shrink-0 shadow-2xs" />
              <span><strong className="text-foreground font-mono">Key Contributor</strong> (Nòng cốt)</span>
            </div>
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold">
              <span className="w-3.5 h-3.5 rounded-full bg-red-600 border border-red-300 animate-pulse shrink-0" />
              <span>Ghosting Alert (Cô lập)</span>
            </div>
            <div className="pt-1.5 border-t border-border/60 space-y-1">
              <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-emerald-500 rounded-full" />
                <span><strong className="text-foreground">[:REVIEWED]</strong> Đánh giá PR</span>
              </div>
              <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 border-t border-dotted border-slate-400" />
                <span><strong className="text-foreground">[:COMMENTED_ON]</strong> Thảo luận</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 font-medium text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-blue-600 border border-blue-200 shrink-0" />
              <span><strong className="text-foreground font-mono">(:Student)</strong> Chủ thể</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3 rounded-xs bg-emerald-600 border border-emerald-200 shrink-0" />
              <span><strong className="text-foreground font-mono">(:JiraTask)</strong> Đầu việc</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-2.5 rounded-xs bg-purple-600 border border-purple-200 shrink-0" />
              <span><strong className="text-foreground font-mono">(:Commit)</strong> Mã nguồn</span>
            </div>
            <div className="pt-1.5 border-t border-border/60 space-y-1">
              <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-emerald-500 rounded-full" />
                <span><strong className="text-foreground">[:ASSIGNED_TO]</strong></span>
              </div>
              <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-purple-500 rounded-full" />
                <span><strong className="text-foreground">[:IMPLEMENTS]</strong></span>
              </div>
              <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 border-t border-dashed border-blue-400" />
                <span><strong className="text-foreground">[:AUTHORED]</strong></span>
              </div>
            </div>
            {highlightMSRAnomaly && (
              <div className="flex items-center gap-2 pt-1 border-t border-border/60 text-red-600 dark:text-red-400 font-bold">
                <span className="w-3 h-3 rounded-full bg-red-600 border border-red-300 animate-pulse shrink-0" />
                <span>MSR Anomaly (0 Commit)</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="absolute top-4 right-4 flex items-center gap-1.5 p-1.5 rounded-2xl bg-card/95 backdrop-blur-md border border-border/80 shadow-lg pointer-events-auto">
        <Button
          variant={showEdgeLabels ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setShowEdgeLabels(!showEdgeLabels)}
          className="h-8.5 rounded-xl text-xs font-bold gap-1 px-2.5 cursor-pointer"
          title="Bật/Tắt nhãn văn bản trên cạnh"
        >
          <TagIcon className="w-3.5 h-3.5 text-primary" />
          <span className="hidden sm:inline">{showEdgeLabels ? "Ẩn nhãn cạnh" : "Hiện nhãn cạnh"}</span>
        </Button>
        <div className="w-px h-5 bg-border/80" />
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
          title="Căn chỉnh toàn cảnh (Fit)"
        >
          <Maximize2Icon className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleReset}
          className="h-8.5 w-8.5 rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary"
          title="Sắp xếp lại bố cục (Reset Layout)"
        >
          <RotateCcwIcon className="w-4 h-4" />
        </Button>
      </div>

      {hoveredLabel && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-foreground text-background text-xs font-bold shadow-xl animate-in fade-in-0 zoom-in-95 pointer-events-none flex items-center gap-2 max-w-lg truncate">
          <EyeIcon className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="truncate">{hoveredLabel}</span>
        </div>
      )}

      <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-card/95 backdrop-blur-md border border-border/80 shadow-lg text-xs pointer-events-auto">
        <span className="px-2 text-[11px] font-bold text-muted-foreground flex items-center gap-1">
          <LayersIcon className="w-3.5 h-3.5 text-primary" />
          Bố cục:
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
              ? "Tree (DAG)"
              : l === "cose"
                ? "Force-directed"
                : l === "concentric"
                  ? "Concentric"
                  : "Circular"}
          </button>
        ))}
      </div>

      <div className="hidden sm:flex absolute bottom-4 right-4 items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/90 backdrop-blur-sm border border-border/70 text-[11px] text-muted-foreground shadow-sm">
        <MousePointerClickIcon className="w-3.5 h-3.5 text-primary" />
        <span>Di chuột để cô lập mạng lưới · Bấm vào đỉnh để đối soát chi tiết</span>
      </div>
    </div>
  );
}
