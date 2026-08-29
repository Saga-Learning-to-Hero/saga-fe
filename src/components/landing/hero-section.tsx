"use client";

import Link from "next/link";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  NetworkIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-8 pb-20 lg:pt-12 lg:pb-24">
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 15%, oklch(from var(--saga-primary) l c h / 14%), transparent)",
        }}
      />

      <div className="max-w-6xl mx-auto px-6 w-full grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/25 bg-primary/10 text-primary text-xs font-bold tracking-wide">
            <SparklesIcon className="w-3.5 h-3.5" />
            Chuyên ngành Kỹ thuật Phần mềm (SE) · FPT University
          </div>

          <div className="space-y-3.5">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.12]">
              Đánh giá Liên tục qua{" "}
              <span className="bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#06B6D4] bg-clip-text text-transparent">
                Đồ thị Hoạt động
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Định lượng và minh bạch hóa năng lực thực tế của sinh viên chuyên ngành Kỹ thuật Phần mềm theo thời gian thực. Toàn bộ hoạt động học tập, bài tập nhóm và dự án được kiểm chứng tự động từ Git và Jira.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <Link
              href="/login"
              className={buttonVariants({
                size: "lg",
                className: "gap-2.5 font-bold px-8 py-3.5 h-12 rounded-xl shadow-lg shadow-primary/25 text-base transition-all hover:scale-[1.02]",
              })}
            >
              Bắt đầu ngay
              <ArrowRightIcon className="w-4 h-4" />
            </Link>

            <a
              href="#tinh-nang"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "gap-2.5 font-semibold px-7 py-3.5 h-12 rounded-xl text-base hover:bg-muted/70",
              })}
            >
              Khám phá đồ thị
            </a>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-5 border-t border-border/80 font-mono">
            <div className="space-y-0.5">
              <span className="font-extrabold text-foreground text-xl sm:text-2xl">100%</span>
              <p className="text-xs text-muted-foreground font-sans font-medium">Minh chứng kỹ thuật</p>
            </div>
            <div className="space-y-0.5">
              <span className="font-extrabold text-foreground text-xl sm:text-2xl">Realtime</span>
              <p className="text-xs text-muted-foreground font-sans font-medium">Đánh giá liên tục</p>
            </div>
            <div className="space-y-0.5">
              <span className="font-extrabold text-foreground text-xl sm:text-2xl">Neo4j</span>
              <p className="text-xs text-muted-foreground font-sans font-medium">Đồ thị tri thức</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 relative [perspective:1200px]">
          <div className="relative rounded-3xl border border-border/80 bg-card/90 backdrop-blur-2xl p-6 sm:p-7 shadow-2xl space-y-6 transition-all duration-500 hover:border-primary/50 hover:shadow-primary/20">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <span className="text-sm font-mono font-extrabold text-foreground flex items-center gap-2">
                    <NetworkIcon className="w-4 h-4 text-primary" />
                    Live Academic Graph
                  </span>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Neo4j AuraDB · Cytoscape Runtime
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs font-mono bg-primary/10 text-primary border-primary/25 px-2.5 py-1">
                Realtime Stream
              </Badge>
            </div>

            <div className="relative h-[360px] sm:h-[390px] w-full rounded-2xl bg-muted/20 border border-border/60 overflow-hidden select-none flex items-center justify-center p-3">
              <svg className="w-full h-full" viewBox="0 0 520 350" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="100" y1="175" x2="230" y2="105" stroke="#94A3B8" strokeWidth="2" strokeDasharray="5 5" className="animate-pulse" />
                <line x1="230" y1="105" x2="400" y2="75" stroke="#94A3B8" strokeWidth="2" />
                <line x1="230" y1="105" x2="275" y2="265" stroke="#94A3B8" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="400" y1="75" x2="410" y2="245" stroke="#94A3B8" strokeWidth="2" />
                <line x1="275" y1="265" x2="410" y2="245" stroke="#94A3B8" strokeWidth="2" strokeDasharray="3 3" />

                <circle cx="165" cy="140" r="3.5" fill="#6366F1" className="animate-ping" />
                <circle cx="315" cy="90" r="3.5" fill="#0EA5E9" className="animate-ping" />

                <rect x="135" y="118" width="72" height="18" rx="4" fill="var(--card)" stroke="#CBD5E1" strokeWidth="1" />
                <text x="171" y="131" fill="#64748B" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">:AUTHORED</text>

                <rect x="290" y="70" width="70" height="18" rx="4" fill="var(--card)" stroke="#CBD5E1" strokeWidth="1" />
                <text x="325" y="83" fill="#64748B" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">:RESOLVES</text>

                <rect x="220" y="180" width="68" height="18" rx="4" fill="var(--card)" stroke="#CBD5E1" strokeWidth="1" />
                <text x="254" y="193" fill="#64748B" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">:MODIFIES</text>

                <rect x="373" y="155" width="78" height="18" rx="4" fill="var(--card)" stroke="#CBD5E1" strokeWidth="1" />
                <text x="412" y="168" fill="#64748B" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">:CALCULATES</text>

                <g transform="translate(58, 133)">
                  <circle cx="42" cy="42" r="40" fill="#EEF2FF" stroke="#6366F1" strokeWidth="2.5" />
                  <text x="42" y="38" fill="#4338CA" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">STUDENT</text>
                  <text x="42" y="52" fill="#6366F1" fontSize="10" fontFamily="monospace" fontWeight="semibold" textAnchor="middle">SE170123</text>
                </g>

                <g transform="translate(195, 70)">
                  <circle cx="35" cy="35" r="34" fill="#ECFEFF" stroke="#06B6D4" strokeWidth="2.5" />
                  <text x="35" y="32" fill="#0E7490" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">COMMIT</text>
                  <text x="35" y="46" fill="#0891B2" fontSize="9" fontFamily="monospace" fontWeight="semibold" textAnchor="middle">#7f3ffcd</text>
                </g>

                <g transform="translate(365, 40)">
                  <circle cx="35" cy="35" r="34" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="2.5" />
                  <text x="35" y="32" fill="#1D4ED8" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">JIRA TASK</text>
                  <text x="35" y="46" fill="#2563EB" fontSize="9" fontFamily="monospace" fontWeight="semibold" textAnchor="middle">SAGA-25</text>
                </g>

                <g transform="translate(240, 230)">
                  <circle cx="35" cy="35" r="32" fill="#F0FDF4" stroke="#10B981" strokeWidth="2.5" />
                  <text x="35" y="32" fill="#047857" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">FILE</text>
                  <text x="35" y="46" fill="#059669" fontSize="9" fontFamily="monospace" fontWeight="semibold" textAnchor="middle">page.tsx</text>
                </g>

                <g transform="translate(372, 210)">
                  <circle cx="38" cy="38" r="36" fill="#FAF5FF" stroke="#8B5CF6" strokeWidth="2.5" />
                  <text x="38" y="33" fill="#6D28D9" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">SLICING PIE</text>
                  <text x="38" y="49" fill="#7C3AED" fontSize="12" fontFamily="monospace" fontWeight="black" textAnchor="middle">28.5%</text>
                </g>
              </svg>

              <div className="absolute bottom-3 left-4 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-border text-[10px] font-mono text-muted-foreground shadow-xs">
                <span className="text-indigo-600 font-bold">(:Student)</span>-[:COMMITTED]&gt;<span className="text-cyan-600 font-bold">(:Commit)</span>-[:RESOLVES]&gt;<span className="text-blue-600 font-bold">(:JiraTask)</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-2.5">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="font-extrabold text-foreground flex items-center gap-2">
                  <ShieldCheckIcon className="w-4 h-4 text-primary shrink-0" />
                  Tỷ lệ Đóng góp Thực tế (Slicing Pie)
                </span>
                <span className="font-mono font-black text-primary text-base shrink-0 whitespace-nowrap">
                  28.5%
                </span>
              </div>
              <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary via-indigo-500 to-cyan-500 rounded-full w-[85%]" />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground font-mono pt-0.5">
                <span className="font-semibold text-foreground">Traceability Rate: 98.6%</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2Icon className="w-3.5 h-3.5 shrink-0" /> Chuỗi minh chứng kỹ thuật hợp lệ
                </span>
              </div>
            </div>
          </div>

          <div
            className="absolute -bottom-8 -right-8 w-56 h-56 rounded-full -z-10 blur-3xl opacity-45 pointer-events-none"
            style={{ background: "var(--saga-accent)" }}
          />
          <div
            className="absolute -top-8 -left-8 w-56 h-56 rounded-full -z-10 blur-3xl opacity-35 pointer-events-none"
            style={{ background: "var(--saga-primary)" }}
          />
        </div>
      </div>
    </section>
  );
}
