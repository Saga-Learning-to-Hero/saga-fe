"use client";

import {
  GitGraphIcon,
  AlertTriangleIcon,
  LayersIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GraphStatsSummaryProps {
  totalNodes: number;
  totalEdges: number;
  traceabilityRate: number;
  msrCount: number;
}

export function GraphStatsSummary({
  totalNodes,
  totalEdges,
  traceabilityRate,
  msrCount,
}: GraphStatsSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric 1: Deterministic Traceability Rate */}
      <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:border-primary/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Tỷ Lệ Truy Xuất Nguồn Gốc
          </span>
          <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
            <ShieldCheckIcon className="w-5 h-5" />
          </div>
        </div>
        <div className="my-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-foreground tracking-tight font-mono">
              {traceabilityRate}%
            </span>
            <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold py-0.5">
              Chuẩn XAI
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Tỷ lệ đầu việc Jira có mã nguồn Git đối soát hợp lệ
          </p>
        </div>
        <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${traceabilityRate}%` }}
          />
        </div>
      </div>

      {/* Metric 2: Đỉnh Đồ thị Mạng lưới (Graph Vertices) */}
      <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:border-primary/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Tổng Số Đỉnh (Vertices)
          </span>
          <div className="w-9 h-9 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
            <LayersIcon className="w-5 h-5" />
          </div>
        </div>
        <div className="my-3">
          <span className="text-3xl sm:text-4xl font-black text-foreground tracking-tight font-mono">
            {totalNodes} <span className="text-sm font-semibold text-muted-foreground">Đỉnh</span>
          </span>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            5 Chủ thể (:Student) · 8 Đầu việc (:JiraTask) · 7 Mã nguồn (:Commit)
          </p>
        </div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/50">
          <span>Hệ quản trị Đồ thị</span>
          <Badge variant="outline" className="text-[10px] py-0 font-mono font-bold">
            Neo4j AuraDB
          </Badge>
        </div>
      </div>

      {/* Metric 3: Cạnh Quan hệ Ngữ nghĩa (Semantic Edges) */}
      <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:border-primary/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Cạnh Quan Hệ (Edges)
          </span>
          <div className="w-9 h-9 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-xs">
            <GitGraphIcon className="w-5 h-5" />
          </div>
        </div>
        <div className="my-3">
          <span className="text-3xl sm:text-4xl font-black text-foreground tracking-tight font-mono">
            {totalEdges} <span className="text-sm font-semibold text-muted-foreground">Liên kết</span>
          </span>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            [:AUTHORED] · [:IMPLEMENTS] · [:ASSIGNED_TO]
          </p>
        </div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/50">
          <span>Khớp nối tất định</span>
          <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-0 text-[10px] py-0 font-mono font-bold">
            Regex Deterministic
          </Badge>
        </div>
      </div>

      {/* Metric 4: Cảnh báo Bất thường MSR Anomaly */}
      <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:border-primary/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Bất Thường MSR (Mining Anomaly)
          </span>
          <div
            className={`w-9 h-9 rounded-2xl flex items-center justify-center shadow-xs ${msrCount > 0
                ? "bg-red-500/15 text-red-600 dark:text-red-400"
                : "bg-emerald-500/10 text-emerald-600"
              }`}
          >
            <AlertTriangleIcon className="w-5 h-5" />
          </div>
        </div>
        <div className="my-3">
          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl sm:text-4xl font-black tracking-tight font-mono ${msrCount > 0 ? "text-red-600 dark:text-red-400" : "text-foreground"
                }`}
            >
              {msrCount}
            </span>
            <span className="text-sm font-semibold text-muted-foreground">Phát hiện</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {msrCount > 0
              ? "Task báo DONE nhưng thiếu mã nguồn đối soát (SAGA-24)"
              : "Không có sai lệch giữa báo cáo Jira và GitHub"}
          </p>
        </div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/50">
          <span>Giám sát Human-in-the-loop</span>
          <Badge
            className={
              msrCount > 0
                ? "bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30 text-[10px] py-0 font-bold animate-pulse"
                : "bg-emerald-500/10 text-emerald-600 text-[10px] py-0 font-bold"
            }
          >
            {msrCount > 0 ? "Cần Đối Soát" : "Nhất Quán 100%"}
          </Badge>
        </div>
      </div>
    </div>
  );
}
