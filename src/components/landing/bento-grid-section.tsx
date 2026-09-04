"use client";

import { useState } from "react";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  DatabaseIcon,
  NetworkIcon,
  PieChartIcon,
  ShieldAlertIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function BentoGridSection() {
  const [graphMode, setGraphMode] = useState<"traceability" | "sna">("traceability");

  return (
    <section id="tinh-nang" className="py-24 border-t border-border/80 bg-muted/20 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-2.5 max-w-xl mx-auto">
          <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 text-xs">
            Trực quan hóa Đồ thị
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Khám phá 2 Mô hình Đồ thị SAGA
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Công nghệ đồ thị Neo4j & Cytoscape biến mọi tương tác học phần thành bằng chứng số liệu minh bạch.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 flex flex-col justify-between hover:border-primary/40 transition-all shadow-xs group">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <NetworkIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                      Graph Visualizer Engine
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono">
                      Neo4j Knowledge Graph Explorer
                    </p>
                  </div>
                </div>

                <div className="inline-flex p-1 rounded-xl bg-muted border border-border text-xs font-mono">
                  <button
                    onClick={() => setGraphMode("traceability")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${graphMode === "traceability"
                      ? "bg-card text-foreground shadow-xs border border-border"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    Traceability Graph
                  </button>
                  <button
                    onClick={() => setGraphMode("sna")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${graphMode === "sna"
                      ? "bg-card text-foreground shadow-xs border border-border"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    SNA Social Graph
                  </button>
                </div>
              </div>

              <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
                {graphMode === "traceability"
                  ? "Ánh xạ chuỗi quan hệ: Sinh viên → Commit GitHub → Task Jira → File mã nguồn. Mọi đóng góp đều có thể theo dõi và chứng minh rõ ràng 100%."
                  : "Phân tích mạng lưới tương tác (SNA) giữa các thành viên qua hoạt động review mã nguồn, phân công nhiệm vụ và phát hiện nguy cơ thành viên bỏ nhóm (Ghosting)."}
              </p>
            </div>

            <div className="relative h-60 w-full rounded-2xl bg-muted/20 border border-border/60 overflow-hidden select-none p-4 flex items-center justify-center">
              {graphMode === "traceability" ? (
                <svg className="w-full h-full" viewBox="0 0 500 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="80" y1="100" x2="210" y2="60" stroke="#94A3B8" strokeWidth="2" strokeDasharray="4 4" />
                  <line x1="80" y1="100" x2="210" y2="140" stroke="#94A3B8" strokeWidth="2" strokeDasharray="4 4" />
                  <line x1="210" y1="60" x2="350" y2="40" stroke="#94A3B8" strokeWidth="2" />
                  <line x1="210" y1="140" x2="350" y2="160" stroke="#94A3B8" strokeWidth="2" />
                  <line x1="350" y1="40" x2="440" y2="100" stroke="#94A3B8" strokeWidth="2" />
                  <line x1="350" y1="160" x2="440" y2="100" stroke="#94A3B8" strokeWidth="2" />

                  <g transform="translate(45, 75)">
                    <circle cx="25" cy="25" r="26" fill="#EEF2FF" stroke="#6366F1" strokeWidth="2.5" />
                    <text x="25" y="29" fill="#4338CA" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">STUDENT</text>
                  </g>

                  <g transform="translate(180, 35)">
                    <circle cx="25" cy="25" r="22" fill="#ECFEFF" stroke="#06B6D4" strokeWidth="2" />
                    <text x="25" y="29" fill="#0E7490" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">COMMIT #1</text>
                  </g>
                  <g transform="translate(180, 115)">
                    <circle cx="25" cy="25" r="22" fill="#ECFEFF" stroke="#06B6D4" strokeWidth="2" />
                    <text x="25" y="29" fill="#0E7490" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">COMMIT #2</text>
                  </g>

                  <g transform="translate(325, 15)">
                    <circle cx="25" cy="25" r="22" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="2" />
                    <text x="25" y="29" fill="#1D4ED8" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">JIRA-12</text>
                  </g>
                  <g transform="translate(325, 135)">
                    <circle cx="25" cy="25" r="22" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="2" />
                    <text x="25" y="29" fill="#1D4ED8" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">JIRA-15</text>
                  </g>

                  <g transform="translate(415, 75)">
                    <circle cx="25" cy="25" r="24" fill="#FAF5FF" stroke="#8B5CF6" strokeWidth="2" />
                    <text x="25" y="29" fill="#6D28D9" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">SLICING PIE</text>
                  </g>

                  <text x="145" y="70" fill="#64748B" fontSize="8" fontFamily="monospace" fontWeight="bold">:AUTHORED</text>
                  <text x="275" y="42" fill="#64748B" fontSize="8" fontFamily="monospace" fontWeight="bold">:RESOLVES</text>
                  <text x="390" y="65" fill="#64748B" fontSize="8" fontFamily="monospace" fontWeight="bold">:CALCULATES</text>
                </svg>
              ) : (
                <svg className="w-full h-full" viewBox="0 0 500 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="120" y1="60" x2="250" y2="40" stroke="#94A3B8" strokeWidth="2.5" />
                  <line x1="250" y1="40" x2="200" y2="150" stroke="#94A3B8" strokeWidth="2.5" />
                  <line x1="120" y1="60" x2="200" y2="150" stroke="#94A3B8" strokeWidth="2.5" />

                  <line x1="250" y1="40" x2="410" y2="100" stroke="#FCA5A5" strokeWidth="1.5" strokeDasharray="5 5" />
                  <line x1="200" y1="150" x2="410" y2="100" stroke="#FCA5A5" strokeWidth="1.5" strokeDasharray="5 5" />

                  <g transform="translate(95, 35)">
                    <circle cx="25" cy="25" r="24" fill="#EEF2FF" stroke="#6366F1" strokeWidth="2" />
                    <text x="25" y="29" fill="#4338CA" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">Leader</text>
                  </g>

                  <g transform="translate(225, 15)">
                    <circle cx="25" cy="25" r="24" fill="#ECFEFF" stroke="#06B6D4" strokeWidth="2" />
                    <text x="25" y="29" fill="#0E7490" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">Dev 1</text>
                  </g>

                  <g transform="translate(175, 125)">
                    <circle cx="25" cy="25" r="24" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="2" />
                    <text x="25" y="29" fill="#1D4ED8" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">Dev 2</text>
                  </g>

                  <g transform="translate(385, 75)">
                    <circle cx="25" cy="25" r="26" fill="#FEF2F2" stroke="#EF4444" strokeWidth="2.5" />
                    <text x="25" y="29" fill="#B91C1C" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">Ghoster</text>
                  </g>

                  <rect x="325" y="145" width="170" height="24" rx="6" fill="#FEF2F2" stroke="#FCA5A5" strokeWidth="1" />
                  <text x="410" y="161" fill="#DC2626" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">⚠ SNA: 12 ngày ngắt kết nối</text>
                </svg>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border/60 text-xs font-mono">
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Student
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Git Commit
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Jira Task
                </span>
              </div>

              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2Icon className="w-3.5 h-3.5" /> Cypher Query Ready
              </span>
            </div>
          </div>

          <div className="md:col-span-4 rounded-3xl border border-border bg-card p-6 sm:p-7 space-y-5 flex flex-col justify-between hover:border-primary/40 transition-all shadow-xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <PieChartIcon className="w-5 h-5" />
                </div>
                <Badge variant="outline" className="font-mono text-[10px]">
                  Sprint Active
                </Badge>
              </div>
              <h3 className="text-lg font-bold text-foreground">
                Slicing Pie Model
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Định lượng công sức theo 4 tiêu chí chuẩn đào tạo SE: Lập trình, Kiểm thử, Tài liệu, Nghiên cứu.
              </p>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-foreground">Lập trình (Code)</span>
                  <span className="text-primary font-bold">40%</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full w-[40%]" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-foreground">Kiểm thử (Test)</span>
                  <span className="text-cyan-500 font-bold">25%</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full w-[25%]" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-foreground">Tài liệu kỹ thuật (Doc)</span>
                  <span className="text-indigo-400 font-bold">20%</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-400 rounded-full w-[20%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 rounded-3xl border border-border bg-card p-6 sm:p-7 space-y-5 flex flex-col justify-between hover:border-destructive/40 transition-all shadow-xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
                  <ShieldAlertIcon className="w-5 h-5" />
                </div>
                <Badge variant="outline" className="font-mono text-[10px] text-destructive border-destructive/30 bg-destructive/5">
                  Anti-Ghosting
                </Badge>
              </div>
              <h3 className="text-lg font-bold text-foreground">
                SNA Interaction Monitor
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Phát hiện sinh viên có dấu hiệu dừng đóng góp hoặc tụt lại phía sau trong nhóm học phần.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-destructive/5 border border-destructive/15 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-destructive flex items-center gap-1.5">
                  <AlertTriangleIcon className="w-3.5 h-3.5" /> Giảm sút hoạt động
                </span>
                <span className="text-[10px] text-muted-foreground">12 ngày</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Không có commit mới và không cập nhật nhiệm vụ dự án trong 12 ngày gần nhất.
              </p>
            </div>
          </div>

          <div className="md:col-span-8 rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-5 flex flex-col justify-between hover:border-primary/40 transition-all shadow-xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <DatabaseIcon className="w-5 h-5" />
                </div>
                <Badge variant="outline" className="font-mono text-[11px]">
                  SE Ecosystem
                </Badge>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                Tích hợp Công cụ Kỹ thuật Phần mềm
              </h3>
              <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
                Đồng bộ tự động dữ liệu mã nguồn và quản lý dự án học phần qua Webhooks với GitHub, Jira, Neo4j và MySQL.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-muted/40 border border-border text-center space-y-1">
                <p className="font-bold text-foreground">GitHub</p>
                <p className="text-[10px] text-muted-foreground">Mã nguồn & PR</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border text-center space-y-1">
                <p className="font-bold text-foreground">Jira Cloud</p>
                <p className="text-[10px] text-muted-foreground">Quản lý Nhiệm vụ</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border text-center space-y-1">
                <p className="font-bold text-foreground">Neo4j</p>
                <p className="text-[10px] text-muted-foreground">Đồ thị Tri thức</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border text-center space-y-1">
                <p className="font-bold text-foreground">MySQL</p>
                <p className="text-[10px] text-muted-foreground">Dữ liệu Học phần</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
