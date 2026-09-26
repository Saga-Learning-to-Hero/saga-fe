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
      const colCriteria: cytoscape.NodeSingular[] = [];
      const colIdentities: cytoscape.NodeSingular[] = [];
      const colCommits: cytoscape.NodeSingular[] = [];
      const colOther: cytoscape.NodeSingular[] = [];

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
        } else if (type === "CRITERION") {
          colCriteria.push(node);
        } else if (type === "IDENTITY") {
          colIdentities.push(node);
        } else if (type === "COMMIT") {
          colCommits.push(node);
        } else {
          colOther.push(node);
        }
      });

      const isAttributionGraph =
        colTasks.length === 0 &&
        (colIdentities.length > 0 || (colCommits.length > 0 && colStudents.length > 0));
      const isPeerReviewGraph =
        allNodes.length > 0 &&
        colStudents.length === allNodes.length &&
        colTasks.length === 0 &&
        colCommits.length === 0;

      const positions: Record<string, { x: number; y: number }> = {};

      if (isAttributionGraph) {
        colStudents.sort((a, b) => {
          const labelA = (a.data("label") || "") as string;
          const labelB = (b.data("label") || "") as string;
          return labelA.localeCompare(labelB, "vi", { sensitivity: "base" });
        });

        const studentYMap = new Map<string, number>();
        const studentIndexMap = new Map<string, number>();
        const sSpacing = Math.max(80, Math.min(130, 600 / Math.max(colStudents.length, 1)));
        const sStartY = -((colStudents.length - 1) * sSpacing) / 2;
        colStudents.forEach((stNode, idx) => {
          const y = sStartY + idx * sSpacing;
          studentYMap.set(stNode.id(), y);
          studentIndexMap.set(stNode.id(), idx);
          positions[stNode.id()] = { x: 360, y };
        });

        const identityToStudentMap = new Map<string, string>();
        const commitToIdentityMap = new Map<string, string>();
        cyInstance.edges().forEach((edge) => {
          const label = edge.data("label");
          const srcId = edge.source().id();
          const tgtId = edge.target().id();
          if (label === "MAPS_TO") {
            identityToStudentMap.set(srcId, tgtId);
          } else if (label === "AUTHORED_BY") {
            commitToIdentityMap.set(srcId, tgtId);
          }
        });

        colIdentities.sort((a, b) => {
          const sIdxA = identityToStudentMap.has(a.id())
            ? studentIndexMap.get(identityToStudentMap.get(a.id())!) ?? 999
            : 1000;
          const sIdxB = identityToStudentMap.has(b.id())
            ? studentIndexMap.get(identityToStudentMap.get(b.id())!) ?? 999
            : 1000;
          if (sIdxA !== sIdxB) return sIdxA - sIdxB;
          const labelA = (a.data("label") || "") as string;
          const labelB = (b.data("label") || "") as string;
          return labelA.localeCompare(labelB, "vi", { sensitivity: "base" });
        });

        const idSpacing = Math.max(60, Math.min(100, 600 / Math.max(colIdentities.length, 1)));
        const idStartY = -((colIdentities.length - 1) * idSpacing) / 2;
        const identityYMap = new Map<string, number>();
        colIdentities.forEach((idNode, idx) => {
          const mappedStudentId = identityToStudentMap.get(idNode.id());
          let targetY = idStartY + idx * idSpacing;
          if (mappedStudentId && studentYMap.has(mappedStudentId)) {
            targetY = studentYMap.get(mappedStudentId)!;
          }
          identityYMap.set(idNode.id(), targetY);
        });

        const minIdGap = 65;
        const idNodesList = [...colIdentities];
        for (let i = 1; i < idNodesList.length; i++) {
          const prevY = identityYMap.get(idNodesList[i - 1].id()) ?? 0;
          const currY = identityYMap.get(idNodesList[i].id()) ?? 0;
          if (currY < prevY + minIdGap) {
            identityYMap.set(idNodesList[i].id(), prevY + minIdGap);
          }
        }
        const firstIdY = identityYMap.get(idNodesList[0]?.id()) ?? 0;
        const lastIdY = identityYMap.get(idNodesList[idNodesList.length - 1]?.id()) ?? 0;
        const idCenter = (firstIdY + lastIdY) / 2;
        colIdentities.forEach((idNode) => {
          const finalY = (identityYMap.get(idNode.id()) ?? 0) - idCenter;
          positions[idNode.id()] = { x: 0, y: finalY };
          identityYMap.set(idNode.id(), finalY);
        });

        const identityIndexMap = new Map<string, number>();
        colIdentities.forEach((n, idx) => identityIndexMap.set(n.id(), idx));

        colCommits.sort((a, b) => {
          const idIdxA = commitToIdentityMap.has(a.id())
            ? identityIndexMap.get(commitToIdentityMap.get(a.id())!) ?? 999
            : 1000;
          const idIdxB = commitToIdentityMap.has(b.id())
            ? identityIndexMap.get(commitToIdentityMap.get(b.id())!) ?? 999
            : 1000;
          if (idIdxA !== idIdxB) return idIdxA - idIdxB;
          const labelA = (a.data("label") || "") as string;
          const labelB = (b.data("label") || "") as string;
          return labelA.localeCompare(labelB, "vi", { sensitivity: "base" });
        });

        const cSpacing = Math.max(42, Math.min(56, 650 / Math.max(colCommits.length, 1)));
        const cStartY = -((colCommits.length - 1) * cSpacing) / 2;
        colCommits.forEach((cNode, idx) => {
          positions[cNode.id()] = { x: -360, y: cStartY + idx * cSpacing };
        });
      } else if (isPeerReviewGraph) {
        colStudents.sort((a, b) => {
          const labelA = (a.data("label") || "") as string;
          const labelB = (b.data("label") || "") as string;
          return labelA.localeCompare(labelB, "vi", { sensitivity: "base" });
        });
        const n = colStudents.length;
        const radiusX = Math.max(220, Math.min(320, 50 * n));
        const radiusY = Math.max(160, Math.min(240, 40 * n));
        colStudents.forEach((studentNode, idx) => {
          const angle = (2 * Math.PI * idx) / Math.max(n, 1) - Math.PI / 2;
          positions[studentNode.id()] = {
            x: Math.round(radiusX * Math.cos(angle)),
            y: Math.round(radiusY * Math.sin(angle)),
          };
        });
      } else {
        colProject.sort((a, b) => {
          const typeA = a.data("nodeType");
          const typeB = b.data("nodeType");
          if (typeA === "PROJECT" && typeB !== "PROJECT") return -1;
          if (typeB === "PROJECT" && typeA !== "PROJECT") return 1;
          return 0;
        });

        colStudents.sort((a, b) => {
          const labelA = (a.data("label") || "") as string;
          const labelB = (b.data("label") || "") as string;
          return labelA.localeCompare(labelB, "vi", { sensitivity: "base" });
        });

        const studentIndexMap = new Map<string, number>();
        colStudents.forEach((studentNode, idx) => {
          studentIndexMap.set(studentNode.id(), idx);
        });

        const taskAssigneeIndexMap = new Map<string, number>();
        const taskConnectedEdges = cyInstance.edges();
        taskConnectedEdges.forEach((edge) => {
          const label = edge.data("label");
          const srcId = edge.source().id();
          const tgtId = edge.target().id();

          if (label === "ASSIGNED_TO") {
            if (studentIndexMap.has(srcId)) {
              taskAssigneeIndexMap.set(tgtId, studentIndexMap.get(srcId)!);
            } else if (studentIndexMap.has(tgtId)) {
              taskAssigneeIndexMap.set(srcId, studentIndexMap.get(tgtId)!);
            }
          }
        });

        colTasks.sort((a, b) => {
          const studentIdxA = taskAssigneeIndexMap.has(a.id())
            ? taskAssigneeIndexMap.get(a.id())!
            : 999;
          const studentIdxB = taskAssigneeIndexMap.has(b.id())
            ? taskAssigneeIndexMap.get(b.id())!
            : 999;

          if (studentIdxA !== studentIdxB) {
            return studentIdxA - studentIdxB;
          }

          const labelA = (a.data("label") || "") as string;
          const labelB = (b.data("label") || "") as string;
          return labelA.localeCompare(labelB, "vi", { numeric: true, sensitivity: "base" });
        });

        const taskIndexMap = new Map<string, number>();
        colTasks.forEach((taskNode, idx) => {
          taskIndexMap.set(taskNode.id(), idx);
        });

        const commitTaskMap = new Map<string, number>();
        taskConnectedEdges.forEach((edge) => {
          const label = edge.data("label");
          const srcId = edge.source().id();
          const tgtId = edge.target().id();

          if (label === "EVIDENCED_BY" || label === "IMPLEMENTS") {
            if (taskIndexMap.has(srcId)) {
              if (!commitTaskMap.has(tgtId) || taskIndexMap.get(srcId)! < commitTaskMap.get(tgtId)!) {
                commitTaskMap.set(tgtId, taskIndexMap.get(srcId)!);
              }
            } else if (taskIndexMap.has(tgtId)) {
              if (!commitTaskMap.has(srcId) || taskIndexMap.get(tgtId)! < commitTaskMap.get(srcId)!) {
                commitTaskMap.set(srcId, taskIndexMap.get(tgtId)!);
              }
            }
          }
        });

        colCommits.sort((a, b) => {
          const taskIdxA = commitTaskMap.has(a.id()) ? commitTaskMap.get(a.id())! : 999;
          const taskIdxB = commitTaskMap.has(b.id()) ? commitTaskMap.get(b.id())! : 999;
          if (taskIdxA !== taskIdxB) {
            return taskIdxA - taskIdxB;
          }
          const labelA = (a.data("label") || "") as string;
          const labelB = (b.data("label") || "") as string;
          return labelA.localeCompare(labelB, "vi", { numeric: true, sensitivity: "base" });
        });

        const identityToStudentMap = new Map<string, string>();
        const identityToCommitsMap = new Map<string, string[]>();
        taskConnectedEdges.forEach((edge) => {
          const label = edge.data("label");
          const srcId = edge.source().id();
          const tgtId = edge.target().id();

          if (label === "MAPS_TO") {
            if (studentIndexMap.has(tgtId)) {
              identityToStudentMap.set(srcId, tgtId);
            } else if (studentIndexMap.has(srcId)) {
              identityToStudentMap.set(tgtId, srcId);
            }
          } else if (label === "AUTHORED_BY") {
            if (colCommits.some((c) => c.id() === srcId)) {
              const list = identityToCommitsMap.get(tgtId) || [];
              list.push(srcId);
              identityToCommitsMap.set(tgtId, list);
            } else if (colCommits.some((c) => c.id() === tgtId)) {
              const list = identityToCommitsMap.get(srcId) || [];
              list.push(tgtId);
              identityToCommitsMap.set(srcId, list);
            }
          }
        });

        colIdentities.sort((a, b) => {
          const studentIdA = identityToStudentMap.get(a.id());
          const studentIdB = identityToStudentMap.get(b.id());
          const sIdxA = studentIdA && studentIndexMap.has(studentIdA) ? studentIndexMap.get(studentIdA)! : 999;
          const sIdxB = studentIdB && studentIndexMap.has(studentIdB) ? studentIndexMap.get(studentIdB)! : 999;
          if (sIdxA !== sIdxB) {
            return sIdxA - sIdxB;
          }
          const labelA = (a.data("label") || "") as string;
          const labelB = (b.data("label") || "") as string;
          return labelA.localeCompare(labelB, "vi", { numeric: true, sensitivity: "base" });
        });

        const critOrder: Record<string, number> = { CODE: 0, TEST: 1, DOCUMENT: 2, RESEARCH: 3 };
        colCriteria.sort((a, b) => {
          const labelA = ((a.data("label") || "") as string).toUpperCase();
          const labelB = ((b.data("label") || "") as string).toUpperCase();
          const ordA = critOrder[labelA] ?? 9;
          const ordB = critOrder[labelB] ?? 9;
          return ordA - ordB;
        });

        const hasProject = colProject.length > 0;
        const hasSprints = colSprints.length > 0;
        const hasCriteria = colCriteria.length > 0;
        const hasCommits = colCommits.length > 0;

        const xProject = -720;
        const xSprint = -480;
        const xStudent = hasSprints || hasProject ? -220 : -260;
        const xTask = 80;
        const xCriteria = 380;
        const xCommit = hasCriteria ? 680 : 440;
        const xIdentity = hasCommits ? (hasCriteria ? 960 : 740) : (hasCriteria ? 680 : 440);

        const taskSpacingY = 56;
        const totalTasksHeight = (colTasks.length - 1) * taskSpacingY;
        const startTaskY = -totalTasksHeight / 2;
        const taskYMap = new Map<string, number>();

        colTasks.forEach((node, i) => {
          const y = startTaskY + i * taskSpacingY;
          positions[node.id()] = { x: xTask, y };
          taskYMap.set(node.id(), y);
        });

        if (colStudents.length > 0) {
          const studentYTargets: number[] = [];

          colStudents.forEach((studentNode, sIdx) => {
            const assignedTasks = colTasks.filter(
              (t) => taskAssigneeIndexMap.get(t.id()) === sIdx
            );

            if (assignedTasks.length > 0) {
              const firstTaskY = taskYMap.get(assignedTasks[0].id()) ?? 0;
              const lastTaskY = taskYMap.get(assignedTasks[assignedTasks.length - 1].id()) ?? 0;
              studentYTargets.push((firstTaskY + lastTaskY) / 2);
            } else {
              const defaultTotalHeight = (colStudents.length - 1) * 110;
              const defaultStartY = -defaultTotalHeight / 2;
              studentYTargets.push(defaultStartY + sIdx * 110);
            }
          });

          const minGap = 105;
          for (let i = 1; i < studentYTargets.length; i++) {
            if (studentYTargets[i] < studentYTargets[i - 1] + minGap) {
              studentYTargets[i] = studentYTargets[i - 1] + minGap;
            }
          }
          const studentCenter =
            (studentYTargets[0] + studentYTargets[studentYTargets.length - 1]) / 2;
          colStudents.forEach((studentNode, i) => {
            positions[studentNode.id()] = {
              x: xStudent,
              y: studentYTargets[i] - studentCenter,
            };
          });
        }

        if (colProject.length > 0) {
          const projCount = colProject.length;
          const projSpacingY = 110;
          const projStartY = -((projCount - 1) * projSpacingY) / 2;
          colProject.forEach((node, i) => {
            positions[node.id()] = {
              x: xProject,
              y: projStartY + i * projSpacingY,
            };
          });
        }

        if (colSprints.length > 0) {
          const sprintCount = colSprints.length;
          const sprintSpacingY = 100;
          const sprintStartY = -((sprintCount - 1) * sprintSpacingY) / 2;
          colSprints.forEach((node, i) => {
            positions[node.id()] = {
              x: xSprint,
              y: sprintStartY + i * sprintSpacingY,
            };
          });
        }

        if (colCriteria.length > 0) {
          const critCount = colCriteria.length;
          const critSpacingY = 95;
          const critStartY = -((critCount - 1) * critSpacingY) / 2;
          colCriteria.forEach((node, i) => {
            positions[node.id()] = {
              x: xCriteria,
              y: critStartY + i * critSpacingY,
            };
          });
        }

        if (colCommits.length > 0) {
          const minCommitGap = 52;
          const commitYTargets: number[] = [];

          colCommits.forEach((cNode, idx) => {
            const linkedTaskIdx = commitTaskMap.get(cNode.id());
            let targetY = 0;
            if (linkedTaskIdx !== undefined && colTasks[linkedTaskIdx]) {
              targetY = taskYMap.get(colTasks[linkedTaskIdx].id()) ?? 0;
            } else {
              const defaultStartY = -((colCommits.length - 1) * minCommitGap) / 2;
              targetY = defaultStartY + idx * minCommitGap;
            }
            commitYTargets.push(targetY);
          });

          for (let i = 1; i < commitYTargets.length; i++) {
            if (commitYTargets[i] < commitYTargets[i - 1] + minCommitGap) {
              commitYTargets[i] = commitYTargets[i - 1] + minCommitGap;
            }
          }

          const commitCenter = (commitYTargets[0] + commitYTargets[commitYTargets.length - 1]) / 2;
          colCommits.forEach((cNode, i) => {
            positions[cNode.id()] = {
              x: xCommit,
              y: commitYTargets[i] - commitCenter,
            };
          });
        }

        if (colIdentities.length > 0) {
          const minIdGap = 68;
          const idYTargets: number[] = [];

          colIdentities.forEach((idNode, idx) => {
            let targetY = 0;
            const mappedStudentId = identityToStudentMap.get(idNode.id());
            if (mappedStudentId && positions[mappedStudentId]) {
              targetY = positions[mappedStudentId].y;
            } else {
              const linkedCommitIds = identityToCommitsMap.get(idNode.id());
              if (linkedCommitIds && linkedCommitIds.length > 0) {
                let sumY = 0;
                let count = 0;
                linkedCommitIds.forEach((cId) => {
                  if (positions[cId]) {
                    sumY += positions[cId].y;
                    count++;
                  }
                });
                targetY = count > 0 ? sumY / count : 0;
              } else {
                const defaultStartY = -((colIdentities.length - 1) * minIdGap) / 2;
                targetY = defaultStartY + idx * minIdGap;
              }
            }
            idYTargets.push(targetY);
          });

          for (let i = 1; i < idYTargets.length; i++) {
            if (idYTargets[i] < idYTargets[i - 1] + minIdGap) {
              idYTargets[i] = idYTargets[i - 1] + minIdGap;
            }
          }

          const idCenter = (idYTargets[0] + idYTargets[idYTargets.length - 1]) / 2;
          colIdentities.forEach((idNode, i) => {
            positions[idNode.id()] = {
              x: xIdentity,
              y: idYTargets[i] - idCenter,
            };
          });
        }

        if (colOther.length > 0) {
          const otherCount = colOther.length;
          const otherSpacingY = 60;
          const otherStartY = -((otherCount - 1) * otherSpacingY) / 2;
          const xOther = (colIdentities.length > 0 ? xIdentity : (colCommits.length > 0 ? xCommit : xTask)) + 240;
          colOther.forEach((node, i) => {
            positions[node.id()] = {
              x: xOther,
              y: otherStartY + i * otherSpacingY,
            };
          });
        }
      }

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

        const avatarUrl = n.avatar?.trim() || undefined;
        const hasImage = Boolean(avatarUrl && avatarUrl.length > 0);

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
            hasImage,
            bgImage: hasImage ? avatarUrl : undefined,
            originalData: { ...n, avatar: avatarUrl || n.avatar },
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

        const displayEdgeLabel =
          e.label === "REVIEWED" && typeof e.weight === "number" && e.weight > 0
            ? `${e.weight} ★`
            : e.label;

        return {
          group: "edges" as const,
          data: {
            id: e.id,
            source: e.source,
            target: e.target,
            label: displayEdgeLabel,
            edgeLabel: displayEdgeLabel,
            edgeType: e.label,
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
        cyRef.current?.batch(() => {
          cyRef.current?.edges?.()?.toggleClass?.("show-label", showEdgeLabels);
        });
      } catch { }
    }
  }, [showEdgeLabels]);

  useEffect(() => {
    const studentImages = normalizedNodes
      .filter((n) => n.avatar && n.avatar.trim().length > 0)
      .map((n) => n.avatar!);

    if (studentImages.length === 0) return;

    let isMounted = true;
    studentImages.forEach((url) => {
      const img = new Image();
      img.onload = () => {
        if (isMounted && cyRef.current && !cyRef.current.destroyed?.()) {
          cyRef.current.style().update();
        }
      };
      img.src = url;
    });

    return () => {
      isMounted = false;
    };
  }, [normalizedNodes]);

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

          cy.edges?.()?.toggleClass?.("show-label", showEdgeLabels);

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
          selector: "node[?hasImage]",
          style: {
            "background-image": "data(bgImage)",
            "background-fit": "cover",
            "background-clip": "node",
            "background-opacity": 1,
            "background-color": "#ffffff",
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
          selector: 'node[nodeType = "IDENTITY"]',
          style: {
            "font-family": "monospace",
            "font-size": "9px",
            "text-max-width": "50px",
            "text-wrap": "ellipsis",
          },
        },
        {
          selector: 'node[nodeType = "SPRINT"]',
          style: {
            "font-size": "11px",
            "font-weight": 800,
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
            "control-point-step-size": 24,
            "arrow-scale": 0.95,
            opacity: 0.7,
            "line-style": "data(lineStyle)" as unknown as cytoscape.Css.LineStyle,
            label: "",
            "font-size": "8px",
            "font-weight": 600,
            "text-rotation": "autorotate",
            "text-background-opacity": 0.85,
            "text-background-color": "#ffffff",
            "text-background-padding": "1.5px",
            "text-background-shape": "roundrectangle",
            color: "#64748b",
            "transition-property": "line-color, target-arrow-color, width, opacity",
            "transition-duration": 0.2,
          },
        },
        {
          selector: "edge.show-label",
          style: {
            label: "data(label)",
          },
        },
        {
          selector: 'edge.show-label[edgeType = "REVIEWED"]',
          style: {
            label: "data(edgeLabel)",
          },
        },
        {
          selector: 'edge[label = "HAS_SPRINT"]',
          style: {
            "curve-style": "unbundled-bezier",
            "control-point-distances": [-90],
            "control-point-weights": [0.5],
            "line-style": "dashed",
            "line-color": "#06b6d4",
            "target-arrow-color": "#0891b2",
          },
        },
        {
          selector: 'edge[edgeType = "REVIEWED"]',
          style: {
            label: "data(edgeLabel)",
            "font-size": "10px",
            "font-weight": 700,
            color: "#047857",
            "text-background-opacity": 0.95,
            "text-background-color": "#ecfdf5",
            "text-background-padding": "2px",
            "text-background-shape": "roundrectangle",
          },
        },
        {
          selector: "edge.highlighted",
          style: {
            opacity: 1,
            width: 3.5,
            label: "data(label)",
            "font-size": "9.5px",
            "font-weight": 700,
            color: "#0f172a",
            "text-background-opacity": 1,
            "text-background-color": "#f8fafc",
            "text-background-padding": "2.5px",
            "text-background-shape": "roundrectangle",
            "z-index": 99,
          },
        },
        {
          selector: 'edge.highlighted[edgeType = "REVIEWED"]',
          style: {
            label: "data(edgeLabel)",
          },
        },
      ],
    });
    cyRef.current = cy;
    cy.edges?.()?.toggleClass?.("show-label", showEdgeLabels);

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
                <span className="truncate">Sinh viên (:Student)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-indigo-600 border border-indigo-200 shrink-0" />
                <span className="truncate">Nhóm (:Team)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-cyan-600 border border-cyan-200 shrink-0" />
                <span className="truncate">Dự án (:Project)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-teal-600 border border-teal-200 shrink-0" />
                <span className="truncate">Sprint (:Sprint)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-600 border border-emerald-200 shrink-0" />
                <span className="truncate">Công việc (:Task)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-purple-600 border border-purple-200 shrink-0" />
                <span className="truncate">Mã nguồn (:Commit)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rotate-45 bg-amber-600 border border-amber-200 shrink-0" />
                <span className="truncate">Tiêu chí (:Criterion)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rotate-45 bg-slate-600 border border-slate-200 shrink-0" />
                <span className="truncate">Định danh (:Identity)</span>
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
        {(["breadthfirst", "cose", "concentric", "circle"] as const).map((l) => (
          <button
            key={l}
            onClick={() => handleLayoutChange(l)}
            className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${currentLayout === l
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
          >
            {l === "breadthfirst" ? "Hierarchical (DAG)" :
              l === "cose" ? "Force-directed" :
                l === "concentric" ? "Concentric" : "Circle"}
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
