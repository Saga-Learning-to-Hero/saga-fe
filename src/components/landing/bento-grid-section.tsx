"use client";

import { useState } from "react";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  DatabaseIcon,
  NetworkIcon,
  PieChartIcon,
  ShieldAlertIcon,
  BotIcon,
  LayersIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function BentoGridSection() {
  const [graphMode, setGraphMode] = useState<"traceability" | "sna">("traceability");

  return (
    <section id="tinh-nang" className="py-24 border-t border-border/80 bg-muted/20 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-2.5 max-w-xl mx-auto">
          <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 text-xs font-semibold">
            Trực quan hóa Đồ thị & AI Hub
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Trụ Cột Công Nghệ Cốt Lõi SAGA
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Kết hợp cơ sở dữ liệu đồ thị Neo4j AuraDB, thuật toán XAI Anomaly và trung tâm AI Hub để lượng hóa công sức học tập chuẩn xác.
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
                      Neo4j Knowledge Graph & Cytoscape Canvas
                    </p>
                  </div>
                </div>

                <div className="inline-flex p-1 rounded-xl bg-muted border border-border text-xs font-mono">
                  <button
                    onClick={() => setGraphMode("traceability")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      graphMode === "traceability"
                        ? "bg-card text-foreground shadow-xs border border-border"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Traceability Graph
                  </button>
                  <button
                    onClick={() => setGraphMode("sna")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      graphMode === "sna"
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
                  ? "Ánh xạ chuỗi minh chứng 3 tầng: Sinh viên → Jira Task → Git Commit. Hỗ trợ hiệu ứng Neighborhood Dimming làm sáng đường đi công sức cá nhân khi rê chuột bảo vệ trước Hội đồng."
                  : "Phân tích mạng lưới tương tác qua mức độ trao đổi, review pull request và đo lường Hệ số Trung tâm Bậc (Degree Centrality) để nhận diện Key Contributor và cảnh báo Ghosting."}
              </p>
            </div>

            <div className="relative h-60 w-full rounded-2xl bg-muted/20 border border-border/60 overflow-hidden select-none p-4 flex items-center justify-center">
              {graphMode === "traceability" ? (
                <svg className="w-full h-full" viewBox="0 0 500 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="80" y1="100" x2="210" y2="60" stroke="#94A3B8" strokeWidth="2" strokeDasharray="4 4" />
                  <line x1="80" y1="100" x2="210" y2="140" stroke="#94A3B8" strokeWidth="2" strokeDasharray="4 4" />
                  <line x1="210" y1="60" x2="350" y2="40" stroke="#8B5CF6" strokeWidth="2" />
                  <line x1="210" y1="140" x2="350" y2="160" stroke="#8B5CF6" strokeWidth="2" />
                  <line x1="350" y1="40" x2="440" y2="100" stroke="#94A3B8" strokeWidth="2" />
                  <line x1="350" y1="160" x2="440" y2="100" stroke="#EF4444" strokeWidth="2" strokeDasharray="3 3" />

                  <g transform="translate(45, 75)">
                    <circle cx="25" cy="25" r="26" fill="#EEF2FF" stroke="#6366F1" strokeWidth="2.5" />
                    <text x="25" y="29" fill="#4338CA" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">STUDENT</text>
                  </g>

                  <g transform="translate(180, 35)">
                    <circle cx="25" cy="25" r="22" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="2" />
                    <text x="25" y="29" fill="#1D4ED8" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">TASK #1</text>
                  </g>
                  <g transform="translate(180, 115)">
                    <circle cx="25" cy="25" r="22" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="2" />
                    <text x="25" y="29" fill="#1D4ED8" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">TASK #2</text>
                  </g>

                  <g transform="translate(325, 15)">
                    <circle cx="25" cy="25" r="20" fill="#F5F3FF" stroke="#8B5CF6" strokeWidth="2" />
                    <text x="25" y="29" fill="#6D28D9" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">COMMIT</text>
                  </g>
                  <g transform="translate(325, 135)">
                    <circle cx="25" cy="25" r="20" fill="#FEF2F2" stroke="#EF4444" strokeWidth="2" />
                    <text x="25" y="28" fill="#B91C1C" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">0 COMMIT</text>
                  </g>

                  <g transform="translate(415, 75)">
                    <circle cx="25" cy="25" r="24" fill="#F0FDF4" stroke="#10B981" strokeWidth="2" />
                    <text x="25" y="29" fill="#047857" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">VERIFIED</text>
                  </g>
                </svg>
              ) : (
                <svg className="w-full h-full" viewBox="0 0 500 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="120" y1="100" x2="250" y2="50" stroke="#6366F1" strokeWidth="3" />
                  <line x1="120" y1="100" x2="250" y2="150" stroke="#6366F1" strokeWidth="3" />
                  <line x1="250" y1="50" x2="250" y2="150" stroke="#CBD5E1" strokeWidth="1.5" />
                  <line x1="250" y1="50" x2="410" y2="100" stroke="#EF4444" strokeWidth="1" strokeDasharray="4 4" />

                  <g transform="translate(90, 70)">
                    <circle cx="30" cy="30" r="28" fill="#EEF2FF" stroke="#6366F1" strokeWidth="3" />
                    <text x="30" y="31" fill="#4338CA" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">LEADER</text>
                    <text x="30" y="43" fill="#6366F1" fontSize="8" fontFamily="monospace" textAnchor="middle">88% SNA</text>
                  </g>

                  <g transform="translate(225, 20)">
                    <circle cx="25" cy="25" r="24" fill="#ECFEFF" stroke="#06B6D4" strokeWidth="2" />
                    <text x="25" y="27" fill="#0E7490" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">MEMBER 1</text>
                    <text x="25" y="38" fill="#0891B2" fontSize="7" fontFamily="monospace" textAnchor="middle">Active</text>
                  </g>

                  <g transform="translate(225, 125)">
                    <circle cx="25" cy="25" r="24" fill="#ECFEFF" stroke="#06B6D4" strokeWidth="2" />
                    <text x="25" y="27" fill="#0E7490" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">MEMBER 2</text>
                    <text x="25" y="38" fill="#0891B2" fontSize="7" fontFamily="monospace" textAnchor="middle">Active</text>
                  </g>

                  <g transform="translate(385, 75)">
                    <circle cx="25" cy="25" r="24" fill="#FEF2F2" stroke="#EF4444" strokeWidth="2.5" strokeDasharray="3 3" />
                    <text x="25" y="26" fill="#B91C1C" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">GHOST</text>
                    <text x="25" y="38" fill="#DC2626" fontSize="7" fontFamily="monospace" textAnchor="middle">0% SNA</text>
                  </g>

                  <rect x="325" y="145" width="170" height="24" rx="6" fill="#FEF2F2" stroke="#FCA5A5" strokeWidth="1" />
                  <text x="410" y="161" fill="#DC2626" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">⚠ SNA: Cảnh báo cô lập</text>
                </svg>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border/60 text-xs font-mono">
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Sinh viên (:Student)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Nhiệm vụ (:JiraTask)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Commit (:Commit)
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
                Mô hình Cổ phần Động Slicing Pie
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Định lượng đóng góp theo 4 tiêu chí chuẩn đào tạo Kỹ thuật Phần mềm kết hợp đánh giá đồng đẳng (Peer Review).
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
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-foreground">Nghiên cứu (Research)</span>
                  <span className="text-purple-400 font-bold">15%</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-purple-400 rounded-full w-[15%]" />
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
                  XAI Detection
                </Badge>
              </div>
              <h3 className="text-lg font-bold text-foreground">
                Nhận diện Bất thường XAI
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tự động phát hiện bất thường khai phá kho lưu trữ mã nguồn (MSR Anomaly) và thành viên mất tương tác.
              </p>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/15 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-destructive flex items-center gap-1.5">
                    <AlertTriangleIcon className="w-3.5 h-3.5" /> MSR Anomaly
                  </span>
                  <span className="text-[10px] text-muted-foreground">Nghi vấn khống</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  Task Jira chuyển trạng thái DONE nhưng ghi nhận 0 commit mã nguồn liên kết.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <AlertTriangleIcon className="w-3.5 h-3.5" /> Ghosting Alert
                  </span>
                  <span className="text-[10px] text-muted-foreground">Degree ≈ 0</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  Thành viên không có hoạt động commit, review PR hoặc trao đổi trong Sprint.
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 rounded-3xl border border-border bg-card p-6 sm:p-7 space-y-5 flex flex-col justify-between hover:border-primary/40 transition-all shadow-xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <BotIcon className="w-5 h-5" />
                </div>
                <Badge variant="outline" className="font-mono text-[10px] text-primary border-primary/25 bg-primary/5">
                  BYOK Secured
                </Badge>
              </div>
              <h3 className="text-lg font-bold text-foreground">
                SAGA AI Hub & Chuẩn CLO
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Đánh giá tiến độ thông minh theo 3 cấp độ (Khóa học, Nhóm, Cá nhân) và tự động đối soát Chuẩn đầu ra môn học (CLO).
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/15 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-primary flex items-center gap-1.5">
                  <LayersIcon className="w-3.5 h-3.5" /> Đề cương FLM & CLOs
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Đối soát 100%</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Phân tích code diff, commit log, phát hiện rủi ro chậm Sprint và gợi ý phân loại sản phẩm bàn giao theo Syllabus.
              </p>
            </div>
          </div>

          <div className="md:col-span-4 rounded-3xl border border-border bg-card p-6 sm:p-7 space-y-5 flex flex-col justify-between hover:border-primary/40 transition-all shadow-xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <DatabaseIcon className="w-5 h-5" />
                </div>
                <Badge variant="outline" className="font-mono text-[10px]">
                  Polyglot Architecture
                </Badge>
              </div>
              <h3 className="text-lg font-bold text-foreground">
                Hạ Tầng Dữ Liệu Bền Vững
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Kiến trúc đa cơ sở dữ liệu phân tán đảm bảo tốc độ cao, khả năng chịu tải và tính bất biến của nhật ký kiểm toán.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border text-center space-y-0.5">
                <p className="font-bold text-foreground text-[11px]">PostgreSQL</p>
                <p className="text-[10px] text-muted-foreground font-sans">Học phần & Điểm</p>
              </div>
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border text-center space-y-0.5">
                <p className="font-bold text-foreground text-[11px]">Neo4j AuraDB</p>
                <p className="text-[10px] text-muted-foreground font-sans">Đồ thị Tri thức</p>
              </div>
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border text-center space-y-0.5">
                <p className="font-bold text-foreground text-[11px]">MongoDB</p>
                <p className="text-[10px] text-muted-foreground font-sans">Audit Trail Bất biến</p>
              </div>
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border text-center space-y-0.5">
                <p className="font-bold text-foreground text-[11px]">Redis Cache</p>
                <p className="text-[10px] text-muted-foreground font-sans">Session & Realtime</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
