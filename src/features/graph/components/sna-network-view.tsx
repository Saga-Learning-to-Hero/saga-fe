"use client";

import { useState, useMemo } from "react";
import {
  AlertTriangleIcon,
  CrownIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CytoscapeGraphCanvas } from "./cytoscape-graph-canvas";
import { GraphNodeDetailsModal } from "./graph-node-details-modal";
import { getMockSNAGraphData } from "../data/mock-graph-data";
import type { GraphNodeData } from "../types/graph";

export function SNANetworkView() {
  const snaData = useMemo(() => getMockSNAGraphData(), []);
  const [selectedNode, setSelectedNode] = useState<GraphNodeData | null>(null);

  const ghostingMembers = snaData.metrics.filter((m) => m.isGhosting);
  const keyContributors = snaData.metrics.filter((m) => m.isKeyContributor);

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-300">
      {/* ── Heading & Academic Overview Banner: Tinh gọn ── */}
      <div className="p-3 sm:p-4 rounded-2xl bg-linear-to-r from-purple-500/10 via-card to-blue-500/10 border border-border/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 text-[10px] font-extrabold">
                SNA Graph
              </Badge>
              <h2 className="text-base sm:text-lg font-black text-foreground tracking-tight">
                Mạng Lưới Tương Tác Nhóm & Code Review (SNA)
              </h2>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 max-w-2xl leading-relaxed">
              Phân tích mức độ tương tác qua Pull Request Reviews và Jira Tasks, nhận diện thành viên nòng cốt và cảnh báo cô lập.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {keyContributors.length > 0 && (
              <div className="px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-700 dark:text-purple-400 text-xs font-bold flex items-center gap-2">
                <CrownIcon className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span>{keyContributors.length} Nòng cốt</span>
              </div>
            )}
            {ghostingMembers.length > 0 && (
              <div className="px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-700 dark:text-red-400 text-xs font-bold flex items-center gap-2 animate-pulse">
                <AlertTriangleIcon className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>{ghostingMembers.length} Ít tương tác</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Cytoscape SNA Graph Canvas ── */}
      <CytoscapeGraphCanvas
        nodes={snaData.nodes}
        edges={snaData.edges}
        onSelectNode={(node) => setSelectedNode(node)}
        layoutName="concentric"
      />

      {/* ── Centrality & Interaction Metrics Table ── */}
      <Card className="rounded-3xl border border-border/80 shadow-xs bg-card overflow-hidden">
        <CardHeader className="p-5 border-b border-border/60 bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 text-[10px] font-bold">
                  Network Centrality Metrics
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">Mức độ tương tác & review PR</span>
              </div>
              <CardTitle className="text-base font-extrabold tracking-tight mt-1">
                Bảng Thống Kê Tương Tác Code Review (SNA Matrix)
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Thống kê số lượt review Pull Request đã gửi và nhận, cùng chỉ số mức độ kết nối (Centrality).
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-mono font-bold">
              5 Thành viên
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground font-bold border-b border-border/60 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Thành viên</th>
                  <th className="p-4 text-center">PR Reviews đã gửi</th>
                  <th className="p-4 text-center">PR Reviews được nhận</th>
                  <th className="p-4 text-center">Mức độ kết nối (Centrality)</th>
                  <th className="p-4 text-right">Phân loại thành viên</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {snaData.metrics.map((m) => (
                  <tr key={m.studentId} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8.5 w-8.5 border border-border">
                          <AvatarImage src={m.avatar} alt={m.studentName} />
                          <AvatarFallback>{m.studentName.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-bold text-foreground block leading-tight">{m.studentName}</span>
                          <span className="text-[11px] text-muted-foreground font-mono">{m.studentCode}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {m.reviewsGiven} lượt
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-blue-600 dark:text-blue-400">
                      {m.reviewsReceived} lượt
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/60 border border-border/60">
                        <span className="font-mono font-black text-foreground text-xs">
                          {(m.centralityScore * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      {m.isKeyContributor && (
                        <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 gap-1.5 font-extrabold text-[11px]">
                          <CrownIcon className="w-3.5 h-3.5 text-purple-500" />
                          Key Contributor (Nòng cốt)
                        </Badge>
                      )}
                      {m.isGhosting && (
                        <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 gap-1.5 font-extrabold animate-pulse text-[11px]">
                          <AlertTriangleIcon className="w-3.5 h-3.5 text-red-500" />
                          Cảnh báo ít tương tác (Ghosting)
                        </Badge>
                      )}
                      {!m.isKeyContributor && !m.isGhosting && (
                        <Badge variant="outline" className="text-muted-foreground font-semibold">
                          Tương tác tốt (Balanced)
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Node Detail Modal */}
      <GraphNodeDetailsModal nodeData={selectedNode} onClose={() => setSelectedNode(null)} />
    </div>
  );
}
