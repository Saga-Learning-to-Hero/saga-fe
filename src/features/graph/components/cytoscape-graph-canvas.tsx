"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import cytoscape, { Core, EventObject, LayoutOptions, Layouts } from "cytoscape";
import {
  ZoomInIcon,
  ZoomOutIcon,
  Maximize2Icon,
  RotateCcwIcon,
  LayersIcon,
  MousePointerClickIcon,
  EyeIcon,
  TagIcon,
  ChevronUpIcon,
  InfoIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  CytoscapeNodeData,
  CytoscapeEdgeData,
  CanonicalNodeType,
  GraphNode,
  GraphEdge,
} from "../types/graph";

interface CytoscapeGraphCanvasProps {
  nodes: Array<{ data: CytoscapeNodeData }> | GraphNode[];
  edges: Array<{ data: CytoscapeEdgeData }> | GraphEdge[];
  onSelectNode?: (node: CytoscapeNodeData) => void;
  selectedNodeId?: string | null;
  layoutName?: "breadthfirst" | "cose" | "concentric" | "circle";
  isUpdating?: boolean;
}

const NODE_COLORS: Record<CanonicalNodeType, { bg: string; border: string }> = {
  STUDENT: { bg: "#2563eb", border: "#93c5fd" },
  TEAM: { bg: "#4f46e5", border: "#a5b4fc" },
  PROJECT: { bg: "#0891b2", border: "#67e8f9" },
  SPRINT: { bg: "#0d9488", border: "#5eead4" },
  TASK: { bg: "#059669", border: "#6ee7b7" },
  COMMIT: { bg: "#7c3aed", border: "#c4b5fd" },
  CRITERION: { bg: "#d97706", border: "#fde68a" },
  IDENTITY: { bg: "#475569", border: "#cbd5e1" },
};

export function CytoscapeGraphCanvas({
  nodes,
  edges,
  onSelectNode,
  selectedNodeId,
  layoutName = "cose",
  isUpdating = false,
}: CytoscapeGraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const activeLayoutRef = useRef<Layouts | null>(null);
  const onSelectNodeRef = useRef(onSelectNode);
  const prevTopologyRef = useRef<string>("");
  const prevLayoutRef = useRef<string>(layoutName);
  const isInitialRenderRef = useRef<boolean>(true);

  useEffect(() => {
    onSelectNodeRef.current = onSelectNode;
  }, [onSelectNode]);

  const [currentLayout, setCurrentLayout] = useState<string>(layoutName);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const [showEdgeLabels, setShowEdgeLabels] = useState<boolean>(false);
  const [isLegendOpen, setIsLegendOpen] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      if (activeLayoutRef.current) {
        try {
          activeLayoutRef.current.stop();
        } catch { }
        activeLayoutRef.current = null;
      }
      if (cyRef.current) {
        try {
          if (!cyRef.current.destroyed?.()) {
            cyRef.current.stop();
            cyRef.current.removeAllListeners();
            cyRef.current.destroy();
          }
        } catch { }
        cyRef.current = null;
      }
    };
  }, []);

  const normalizedNodes = useMemo<CytoscapeNodeData[]>(() => {
    return nodes.map((n) => ("data" in n ? n.data : (n as unknown as { data: CytoscapeNodeData }).data || n));
  }, [nodes]);

  const normalizedEdges = useMemo<CytoscapeEdgeData[]>(() => {
    return edges.map((e) => ("data" in e ? e.data : (e as unknown as { data: CytoscapeEdgeData }).data || e));
  }, [edges]);

  const currentTopology = useMemo(() => {
    const nodeIds = normalizedNodes.map((n) => n.id).sort().join(",");
    const edgeIds = normalizedEdges.map((e) => `${e.source}->${e.label}->${e.target}`).sort().join(",");
    return `${nodeIds}|${edgeIds}`;
  }, [normalizedNodes, normalizedEdges]);

  const applyLayout = useCallback((cyInstance: Core, layout: string, shouldFit = false) => {
    if (!cyInstance || cyInstance.destroyed?.()) return;

    if (activeLayoutRef.current) {
      try {
        activeLayoutRef.current.stop();
      } catch { }
      activeLayoutRef.current = null;
    }

    let layoutConfig: LayoutOptions = {
      name: "cose",
      animate: false,
      padding: 60,
      nodeOverlap: 40,
      idealEdgeLength: () => 180,
      nodeRepulsion: () => 6500000,
      nodeDimensionsIncludeLabels: true,
      gravity: 0.15,
      edgeElasticity: () => 32,
      fit: shouldFit,
    };

    if (layout === "breadthfirst") {
      const allNodes = cyInstance.nodes();
      const colProject: cytoscape.NodeSingular[] = [];
      const colStudents: cytoscape.NodeSingular[] = [];
      const colSprints: cytoscape.NodeSingular[] = [];
      const colTasks: cytoscape.NodeSingular[] = [];
      const colArtifacts: cytoscape.NodeSingular[] = [];

      allNodes.forEach((node) => {
        const type = node.data("nodeType");
        if (type === "PROJECT" || type === "TEAM") {
          colProject.push(node);
        } else if (type === "STUDENT") {
          colStudents.push(node);
        } else if (type === "SPRINT") {
          colSprints.push(node);
        } else if (type === "TASK") {
          colTasks.push(node);
        } else {
          colArtifacts.push(node);
        }
      });

      colTasks.sort((a, b) => {
        const labelA = (a.data("label") || "") as string;
        const labelB = (b.data("label") || "") as string;
        return labelA.localeCompare(labelB);
      });

      const hasProject = colProject.length > 0;
      const xProject = -520;
      let xStudent = -280;
      let xSprint = -50;
      let xTask = 240;
      let xArtifact = 580;

      if (!hasProject) {
        xStudent = -420;
        xSprint = -160;
        xTask = 150;
        xArtifact = 480;
      }

      const positions: Record<string, { x: number; y: number }> = {};

      const assignColumnY = (nodes: cytoscape.NodeSingular[], x: number, spacingY: number) => {
        const count = nodes.length;
        if (count === 0) return;
        const totalHeight = (count - 1) * spacingY;
        const startY = -totalHeight / 2;
        nodes.forEach((node, i) => {
          positions[node.id()] = {
            x,
            y: startY + i * spacingY,
          };
        });
      };

      assignColumnY(colProject, xProject, 80);
      assignColumnY(colStudents, xStudent, 90);
      assignColumnY(colSprints, xSprint, 80);
      assignColumnY(colTasks, xTask, 55);
      assignColumnY(colArtifacts, xArtifact, 48);

      const layoutConfig: LayoutOptions = {
        name: "preset",
        positions,
        fit: true,
        padding: 60,
        animate: false,
      };

      try {
        const layoutInstance = cyInstance.layout(layoutConfig);
        activeLayoutRef.current = layoutInstance;
        layoutInstance.run();
        cyInstance.fit(undefined, 60);
        cyInstance.center?.();
      } catch { }
      return;
    }
    else if (layout === "concentric") {
      layoutConfig = {
        name: "concentric",
        concentric: (node: cytoscape.NodeSingular) => {
          const type = node.data("nodeType") as CanonicalNodeType;
          if (type === "PROJECT" || type === "TEAM") return 4;
          if (type === "SPRINT" || type === "STUDENT") return 3;
          if (type === "TASK" || type === "CRITERION") return 2;
          return 1;
        },
        levelWidth: () => 1,
        padding: 60,
        minNodeSpacing: 90,
        avoidOverlap: true,
        nodeDimensionsIncludeLabels: true,
        fit: shouldFit,
      };
    } else if (layout === "circle") {
      layoutConfig = {
        name: "circle",
        padding: 60,
        spacingFactor: 1.8,
        avoidOverlap: true,
        nodeDimensionsIncludeLabels: true,
        fit: shouldFit,
      };
    }

    try {
      const layoutInstance = cyInstance.layout(layoutConfig);
      activeLayoutRef.current = layoutInstance;
      layoutInstance.run();
      cyInstance.fit(undefined, 50);
      cyInstance.center?.();
    } catch { }
  }, []);

  const buildElements = useCallback(
    (nodesData: CytoscapeNodeData[], edgesData: CytoscapeEdgeData[]) => {
      const cyNodes = nodesData.map((n) => {
        const isAnomaly = n.isAnomaly === true;
        const color = NODE_COLORS[n.type] || { bg: "#3b82f6", border: "#93c5fd" };

        let shape: cytoscape.Css.NodeShape = "round-rectangle";
        let width = 80;
        let height = 40;

        if (n.type === "STUDENT") {
          shape = "ellipse";
          width = 58;
          height = 58;
        } else if (n.type === "COMMIT") {
          shape = "round-rectangle";
          width = 72;
          height = 36;
        } else if (n.type === "CRITERION") {
          shape = "hexagon";
          width = 80;
          height = 42;
        } else if (n.type === "IDENTITY") {
          shape = "diamond";
          width = 56;
          height = 56;
        } else if (n.type === "PROJECT" || n.type === "TEAM") {
          shape = "round-rectangle";
          width = 90;
          height = 44;
        } else if (n.type === "SPRINT") {
          shape = "round-rectangle";
          width = 86;
          height = 42;
        }

        let displayLabel = n.label;
        let displaySubLabel = n.subLabel;
        if (n.type === "PROJECT") {
          if (n.label.toUpperCase().includes("SAGA")) {
            displayLabel = "SAGA";
            if (!displaySubLabel && n.label !== "SAGA") {
              displaySubLabel = n.label;
            }
          } else if (n.label.includes("–") || n.label.includes("—") || n.label.includes(" - ")) {
            const shortPart = n.label.split(/\s*[-–—:]\s*/)[0].trim();
            if (shortPart) {
              displayLabel = shortPart;
              if (!displaySubLabel) {
                displaySubLabel = n.label;
              }
            }
          }
        }

        return {
          group: "nodes" as const,
          data: {
            id: n.id,
            label: displayLabel,
            subLabel: displaySubLabel,
            nodeType: n.type,
            status: n.status,
            weightType: n.weightType,
            bgColor: isAnomaly ? "#ef4444" : color.bg,
            borderColor: isAnomaly ? "#fca5a5" : color.border,
            borderWidth: isAnomaly ? 4 : 2.5,
            shape,
            width,
            height,
            isAnomaly,
            originalData: n,
          },
        };
      });

      const cyEdges = edgesData.map((e) => {
        const isAnomaly = e.isAnomaly === true;
        let lineColor = "#94a3b8";
        let arrowColor = "#64748b";
        let lineStyle: cytoscape.Css.LineStyle = "solid";
        let edgeWidth = e.weight ? Math.min(Math.max(e.weight * 1.5, 2), 6) : 2.2;

        if (e.label === "MEMBER_OF") {
          lineColor = "#93c5fd";
          arrowColor = "#3b82f6";
        } else if (e.label === "OWNS") {
          lineColor = "#818cf8";
          arrowColor = "#4f46e5";
        } else if (e.label === "HAS_SPRINT") {
          lineColor = "#22d3ee";
          arrowColor = "#0891b2";
        } else if (e.label === "CONTAINS") {
          lineColor = "#2dd4bf";
          arrowColor = "#0d9488";
        } else if (e.label === "ASSIGNED_TO") {
          lineColor = "#34d399";
          arrowColor = "#059669";
          edgeWidth = 2.8;
        } else if (e.label === "EVIDENCED_BY") {
          lineColor = "#a78bfa";
          arrowColor = "#7c3aed";
          edgeWidth = 3;
        } else if (e.label === "CLASSIFIED_AS") {
          lineColor = "#f59e0b";
          arrowColor = "#d97706";
        } else if (e.label === "AUTHORED_BY") {
          lineColor = "#94a3b8";
          arrowColor = "#64748b";
          lineStyle = "dashed";
        } else if (e.label === "MAPS_TO") {
          lineColor = "#60a5fa";
          arrowColor = "#2563eb";
        } else if (e.label === "REVIEWED") {
          lineColor = "#10b981";
          arrowColor = "#047857";
          edgeWidth = e.weight ? Math.min(Math.max(e.weight * 1.2, 2.5), 7) : 3;
        }

        if (isAnomaly) {
          lineColor = "#ef4444";
          arrowColor = "#dc2626";
        }

        return {
          group: "edges" as const,
          data: {
            id: e.id,
            source: e.source,
            target: e.target,
            label: e.label,
            edgeLabel: e.label,
            lineColor,
            arrowColor,
            lineStyle,
            edgeWidth,
            weight: e.weight || 1,
            isAnomaly,
          },
        };
      });

      return [...cyNodes, ...cyEdges];
    },
    []
  );

  const handleLayoutChange = useCallback(
    (newLayout: "breadthfirst" | "cose" | "concentric" | "circle") => {
      setCurrentLayout(newLayout);
      if (cyRef.current && !cyRef.current.destroyed?.()) {
        applyLayout(cyRef.current, newLayout, true);
        cyRef.current.fit(undefined, 50);
        cyRef.current.center?.();
      }
    },
    [applyLayout]
  );

  useEffect(() => {
    if (!containerRef.current || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      if (cyRef.current && !cyRef.current.destroyed?.()) {
        cyRef.current.resize?.();
        cyRef.current.fit(undefined, 50);
        cyRef.current.center?.();
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (cyRef.current && !cyRef.current.destroyed?.()) {
      try {
        cyRef.current
          .style()
          .selector("edge")
          .style("label", showEdgeLabels ? "data(label)" : "")
          .update();
      } catch { }
    }
  }, [showEdgeLabels]);

  useEffect(() => {
    if (!containerRef.current) return;

    const elements = buildElements(normalizedNodes, normalizedEdges);
    const topologyChanged = prevTopologyRef.current !== currentTopology;
    prevTopologyRef.current = currentTopology;
    const layoutChanged = prevLayoutRef.current !== currentLayout;
    prevLayoutRef.current = currentLayout;

    if (cyRef.current) {
      if (cyRef.current.destroyed?.()) {
        cyRef.current = null;
      } else {
        const cy = cyRef.current;
        try {
          cy.batch(() => {
            const newIds = new Set(elements.map((el) => el.data.id));
            const currentElements = cy.elements();

            const toRemove = currentElements.filter((el) => !newIds.has(el.id()));
            if (toRemove.length > 0) {
              cy.remove(toRemove);
            }

            const currentIds = new Set(cy.elements().map((el) => el.id()));
            const toAdd = elements.filter((el) => !currentIds.has(el.data.id));
            if (toAdd.length > 0) {
              cy.add(toAdd);
            }

            const toUpdate = elements.filter((el) => currentIds.has(el.data.id));
            toUpdate.forEach((el) => {
              const item = cy.getElementById(el.data.id);
              if (item.length > 0) {
                item.data(el.data);
              }
            });
          });

          cy.style()
            .selector("edge")
            .style("label", showEdgeLabels ? "data(label)" : "")
            .update();

          if (topologyChanged || layoutChanged) {
            applyLayout(cy, currentLayout, true);
            cy.fit(undefined, 50);
            cy.center?.();
          }

          if (selectedNodeId) {
            const selected = cy.getElementById(selectedNodeId);
            if (selected.length > 0) {
              cy.elements().unselect();
              selected.select();
            }
          }
        } catch { }
        return;
      }
    }

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
            "font-weight": 700,
            color: "#ffffff",
            width: "data(width)",
            height: "data(height)",
            shape: "data(shape)" as unknown as cytoscape.Css.NodeShape,
            "background-color": "data(bgColor)",
            "border-width": "data(borderWidth)",
            "border-color": "data(borderColor)",
            "text-outline-width": 0,
            "transition-property": "background-color, border-color, width, height, opacity",
            "transition-duration": 0.2,
          },
        },
        {
          selector: 'node[nodeType = "STUDENT"]',
          style: {
            "text-valign": "bottom",
            "text-margin-y": 5,
            color: "#1e3a8a",
            "text-background-opacity": 0.9,
            "text-background-color": "#f8fafc",
            "text-background-padding": "3px",
            "text-background-shape": "roundrectangle",
          },
        },
        {
          selector: 'node[nodeType = "COMMIT"]',
          style: {
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
            "border-width": 5,
            "border-color": "#2563eb",
            "underlay-color": "#3b82f6",
            "underlay-padding": 7,
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
            "border-width": 4.5,
            "border-color": "#3b82f6",
          },
        },
        {
          selector: "edge",
          style: {
            width: "data(edgeWidth)",
            "line-color": "data(lineColor)",
            "target-arrow-color": "data(arrowColor)",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            "control-point-step-size": 40,
            "arrow-scale": 1.1,
            opacity: 0.8,
            "line-style": "data(lineStyle)" as unknown as cytoscape.Css.LineStyle,
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
      ],
    });
    cyRef.current = cy;

    applyLayout(cy, currentLayout, true);
    cy.fit(undefined, 50);
    cy.center?.();
    isInitialRenderRef.current = false;

    cy.on("mouseover", "node", (evt: EventObject) => {
      if (cy.destroyed()) return;
      const node = evt.target;
      setHoveredLabel(`${node.data("label")} (${node.data("nodeType")})`);

      const neighborhood = node.neighborhood().add(node);
      cy.elements().addClass("faded");
      neighborhood.removeClass("faded").addClass("highlighted");
    });

    cy.on("mouseout", "node", () => {
      if (cy.destroyed()) return;
      setHoveredLabel(null);
      cy.elements().removeClass("faded").removeClass("highlighted");
    });

    cy.on("mouseover", "edge", (evt: EventObject) => {
      if (cy.destroyed()) return;
      const edge = evt.target;
      const sourceLabel = edge.source().data("label") || edge.data("source");
      const targetLabel = edge.target().data("label") || edge.data("target");
      const edgeLabel = edge.data("label");
      setHoveredLabel(`${sourceLabel} ➔ ${edgeLabel} ➔ ${targetLabel}`);

      cy.elements().addClass("faded");
      edge.removeClass("faded").addClass("highlighted");
      edge.source().removeClass("faded").addClass("highlighted");
      edge.target().removeClass("faded").addClass("highlighted");
    });

    cy.on("mouseout", "edge", () => {
      if (cy.destroyed()) return;
      setHoveredLabel(null);
      cy.elements().removeClass("faded").removeClass("highlighted");
    });

    cy.on("tap", "node", (evt: EventObject) => {
      if (cy.destroyed()) return;
      const target = evt.target;
      const neighborhood = target.neighborhood().add(target);
      cy.elements().addClass("faded");
      neighborhood.removeClass("faded").addClass("highlighted");
      const nodeData = target.data("originalData") as CytoscapeNodeData;
      if (nodeData) {
        onSelectNodeRef.current?.(nodeData);
      }
    });

    cy.on("tap", (evt: EventObject) => {
      if (cy.destroyed()) return;
      if (evt.target === cy) {
        cy.elements().removeClass("faded").removeClass("highlighted");
        setHoveredLabel(null);
      }
    });

    if (selectedNodeId) {
      const selected = cy.getElementById(selectedNodeId);
      if (selected.length > 0) {
        selected.select();
      }
    }
  }, [
    normalizedNodes,
    normalizedEdges,
    currentTopology,
    currentLayout,
    showEdgeLabels,
    selectedNodeId,
    applyLayout,
    buildElements,
  ]);

  const handleZoomIn = () => {
    if (cyRef.current && !cyRef.current.destroyed()) {
      cyRef.current.zoom(cyRef.current.zoom() * 1.25);
    }
  };
  const handleZoomOut = () => {
    if (cyRef.current && !cyRef.current.destroyed?.()) {
      cyRef.current.zoom(cyRef.current.zoom() * 0.8);
    }
  };
  const handleFit = () => {
    if (cyRef.current && !cyRef.current.destroyed?.()) {
      cyRef.current.fit(undefined, 50);
    }
  };
  const handleReset = () => {
    if (cyRef.current && !cyRef.current.destroyed?.()) {
      applyLayout(cyRef.current, currentLayout, true);
    }
  };

  return (
    <div className="relative w-full h-[580px] sm:h-[640px] lg:h-[calc(100vh-230px)] min-h-[540px] max-h-[780px] rounded-3xl border border-border/90 bg-linear-to-b from-card/95 via-card/80 to-card/95 backdrop-blur-md overflow-hidden shadow-md">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {isUpdating && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary/20 text-primary text-[11px] font-bold border border-primary/30 flex items-center gap-1.5 shadow-sm backdrop-blur-sm z-10 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
          <span>Đang cập nhật dữ liệu...</span>
        </div>
      )}

      {isLegendOpen ? (
        <div className="absolute top-4 left-4 p-4 rounded-2xl bg-card/95 backdrop-blur-md border border-border/80 shadow-lg text-xs space-y-2.5 pointer-events-auto max-w-xs z-10 animate-in fade-in-0 duration-200">
          <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-1.5">
            <span className="font-extrabold text-foreground uppercase text-[10px] tracking-wider">
              Chú Giải Đồ Thị Neo4j
            </span>
            <button
              onClick={() => setIsLegendOpen(false)}
              className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              title="Thu gọn chú giải"
            >
              <ChevronUpIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-1.5 font-medium text-[11px]">
            <div className="grid grid-cols-2 gap-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-600 border border-blue-200 shrink-0" />
                <span className="truncate">Student</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-indigo-600 border border-indigo-200 shrink-0" />
                <span className="truncate">Team</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-cyan-600 border border-cyan-200 shrink-0" />
                <span className="truncate">Project</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-teal-600 border border-teal-200 shrink-0" />
                <span className="truncate">Sprint</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-600 border border-emerald-200 shrink-0" />
                <span className="truncate">Task</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-purple-600 border border-purple-200 shrink-0" />
                <span className="truncate">Commit</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rotate-45 bg-amber-600 border border-amber-200 shrink-0" />
                <span className="truncate">Criterion</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rotate-45 bg-slate-600 border border-slate-200 shrink-0" />
                <span className="truncate">Identity</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border/60 space-y-1">
              <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-emerald-500 rounded-full" />
                <span>ASSIGNED_TO</span>
              </div>
              <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-purple-500 rounded-full" />
                <span>EVIDENCED_BY</span>
              </div>
              <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 border-t border-dashed border-slate-400" />
                <span>AUTHORED_BY</span>
              </div>
              <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-blue-500 rounded-full" />
                <span>MAPS_TO</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-border/60 text-red-600 dark:text-red-400 font-bold">
              <span className="w-3 h-3 rounded-full bg-red-600 border border-red-300 animate-pulse shrink-0" />
              <span>Bất thường (Anomaly)</span>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsLegendOpen(true)}
          className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-card/95 backdrop-blur-md border border-border/80 shadow-md text-xs font-bold text-foreground hover:bg-muted cursor-pointer transition-all pointer-events-auto z-10"
          title="Mở chú giải đồ thị"
        >
          <InfoIcon className="w-3.5 h-3.5 text-primary" />
          <span>Chú giải</span>
        </button>
      )}

      <div className="absolute top-4 right-4 flex items-center gap-1.5 p-1.5 rounded-2xl bg-card/95 backdrop-blur-md border border-border/80 shadow-lg pointer-events-auto z-10">
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
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-foreground text-background text-xs font-bold shadow-xl animate-in fade-in-0 zoom-in-95 pointer-events-none flex items-center gap-2 max-w-lg truncate z-20">
          <EyeIcon className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="truncate">{hoveredLabel}</span>
        </div>
      )}

      <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-card/95 backdrop-blur-md border border-border/80 shadow-lg text-xs pointer-events-auto z-10">
        <span className="px-2 text-[11px] font-bold text-muted-foreground flex items-center gap-1">
          <LayersIcon className="w-3.5 h-3.5 text-primary" />
          Bố cục:
        </span>
        {(["breadthfirst", "cose"] as const).map((l) => (
          <button
            key={l}
            onClick={() => handleLayoutChange(l)}
            className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${currentLayout === l
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
          >
            {l === "breadthfirst" ? "Hierarchical (DAG)" : "Force-directed"}
          </button>
        ))}
      </div>

      <div className="hidden sm:flex absolute bottom-4 right-4 items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/90 backdrop-blur-sm border border-border/70 text-[11px] text-muted-foreground shadow-sm z-10">
        <MousePointerClickIcon className="w-3.5 h-3.5 text-primary" />
        <span>Hover để làm nổi bật liên kết · Bấm vào node để xem chi tiết</span>
      </div>
    </div>
  );
}
