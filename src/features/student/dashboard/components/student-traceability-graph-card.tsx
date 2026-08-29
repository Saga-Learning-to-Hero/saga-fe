"use client";

import { useState } from "react";
import {
  GitGraphIcon,
  InfoIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CytoscapeGraphCanvas } from "@/features/graph/components/cytoscape-graph-canvas";
import { getMockTraceabilityGraphData } from "@/features/graph/data/mock-graph-data";
import type { GraphNodeData } from "@/features/graph/types/graph";

export function StudentTraceabilityGraphCard() {
  const graphData = getMockTraceabilityGraphData();
  const [selectedNode, setSelectedNode] = useState<GraphNodeData | null>(null);

  return (
    <Card className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden">
      {/* Card Header */}
      <CardHeader className="p-5 border-b border-border/60 bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <GitGraphIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-foreground">
                  Đồ thị Truy xuất Liên kết thời gian thực (Traceability Graph)
                </CardTitle>
                <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 font-bold text-[10px]">
                  CYTOSCAPE.JS LIVE
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Trực quan hóa ma trận ma vết 1-1 giữa Sinh viên ➔ Task Jira ➔ Commit GitHub
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Graph Canvas Container */}
      <CardContent className="p-4 space-y-3">
        {/* Quick Legend Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-muted/40 p-2.5 rounded-xl border border-border/60">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-[11px] font-semibold text-muted-foreground">Chú giải nút:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-[11px] font-medium text-foreground">Sinh viên</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-medium text-foreground">Task Jira</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span className="text-[11px] font-medium text-foreground">Commit GitHub</span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-muted-foreground font-semibold">
            Tỷ lệ ma vết: <strong className="text-emerald-600 font-bold">94.5%</strong>
          </div>
        </div>

        {/* Cytoscape Canvas */}
        <div className="relative rounded-xl border border-border/70 overflow-hidden bg-slate-950/5 dark:bg-slate-950/40 h-[380px]">
          <CytoscapeGraphCanvas
            nodes={graphData.nodes}
            edges={graphData.edges}
            onSelectNode={(nodeData) => setSelectedNode(nodeData)}
            layoutName="breadthfirst"
          />
        </div>

        {/* Node detail snippet if selected */}
        {selectedNode && (
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs flex items-center justify-between animate-in fade-in-0">
            <div className="flex items-center gap-2">
              <InfoIcon className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>
                Đang xem chi tiết nút: <strong>{"name" in selectedNode ? selectedNode.name : "summary" in selectedNode ? selectedNode.summary : selectedNode.message}</strong>
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedNode(null)}
              className="h-6 text-[11px] px-2"
            >
              Đóng
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
