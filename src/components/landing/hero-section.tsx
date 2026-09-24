"use client";

import Link from "next/link";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  NetworkIcon,
  ShieldCheckIcon,
  SparklesIcon,
  BotIcon,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { getRoleHomePath } from "@/features/auth/lib/role-routes";

export function HeroSection() {
  const { user } = useAuthStore();
  const targetPath = user ? getRoleHomePath(user.role) : "/login";

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
            Nền tảng Quản trị & Đánh giá Đồ án Kỹ thuật Phần mềm (SE) · FPT University
          </div>

          <div className="space-y-3.5">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.12]">
              Minh bạch Công sức qua{" "}
              <span className="bg-gradient-to-r from-primary via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                Đồ thị Truy xuất
              </span>{" "}
              & AI Hub
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Giải pháp toàn diện loại bỏ vấn nạn báo cáo khống và tự do hưởng lợi (Free-rider). Đối soát tự động chuỗi minh chứng kỹ thuật giữa Sinh viên, Task Jira và Git Commit bằng đồ thị tri thức Neo4j và trí tuệ nhân tạo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <Link
              href={targetPath}
              className={buttonVariants({
                size: "lg",
                className: "gap-2.5 font-bold px-8 py-3.5 h-12 rounded-xl shadow-lg shadow-primary/25 text-base transition-all hover:scale-[1.02]",
              })}
            >
              {user ? "Vào không gian làm việc" : "Bắt đầu ngay"}
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
              Khám phá tính năng
            </a>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-5 border-t border-border/80 font-mono">
            <div className="space-y-0.5">
              <span className="font-extrabold text-foreground text-xl sm:text-2xl">100%</span>
              <p className="text-xs text-muted-foreground font-sans font-medium">Đối soát Minh chứng</p>
            </div>
            <div className="space-y-0.5">
              <span className="font-extrabold text-foreground text-xl sm:text-2xl">Neo4j</span>
              <p className="text-xs text-muted-foreground font-sans font-medium">Traceability Graph</p>
            </div>
            <div className="space-y-0.5">
              <span className="font-extrabold text-foreground text-xl sm:text-2xl">Slicing Pie</span>
              <p className="text-xs text-muted-foreground font-sans font-medium">Cổ phần Đóng góp</p>
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
                    Live Traceability Graph
                  </span>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Neo4j AuraDB · Cytoscape Engine · XAI Anomaly
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 px-2.5 py-1">
                Verified Trail
              </Badge>
            </div>

            <div className="relative h-[360px] sm:h-[390px] w-full rounded-2xl bg-muted/20 border border-border/60 overflow-hidden select-none flex items-center justify-center p-3">
              <svg className="w-full h-full" viewBox="0 0 520 350" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="90" y1="175" x2="250" y2="90" stroke="#94A3B8" strokeWidth="2" strokeDasharray="5 5" className="animate-pulse" />
                <line x1="90" y1="175" x2="250" y2="250" stroke="#94A3B8" strokeWidth="2" strokeDasharray="5 5" />
                <line x1="420" y1="90" x2="250" y2="90" stroke="#8B5CF6" strokeWidth="2.5" />
                <line x1="420" y1="250" x2="250" y2="250" stroke="#EF4444" strokeWidth="2" strokeDasharray="4 4" />

                <circle cx="170" cy="132" r="3.5" fill="#6366F1" className="animate-ping" />
                <circle cx="335" cy="90" r="3.5" fill="#8B5CF6" className="animate-ping" />

                <rect x="125" y="112" width="90" height="20" rx="6" fill="var(--card)" stroke="#CBD5E1" strokeWidth="1" />
                <text x="170" y="126" fill="#4F46E5" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">:ASSIGNED_TO</text>

                <rect x="290" y="78" width="86" height="20" rx="6" fill="var(--card)" stroke="#CBD5E1" strokeWidth="1" />
                <text x="333" y="92" fill="#7C3AED" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">:IMPLEMENTS</text>

                <g transform="translate(48, 133)">
                  <circle cx="42" cy="42" r="40" fill="#EEF2FF" stroke="#6366F1" strokeWidth="2.5" />
                  <text x="42" y="38" fill="#4338CA" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">STUDENT</text>
                  <text x="42" y="52" fill="#6366F1" fontSize="10" fontFamily="monospace" fontWeight="semibold" textAnchor="middle">SE170504</text>
                </g>

                <g transform="translate(210, 50)">
                  <circle cx="40" cy="40" r="36" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="2.5" />
                  <text x="40" y="36" fill="#1D4ED8" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">JIRA TASK</text>
                  <text x="40" y="50" fill="#2563EB" fontSize="10" fontFamily="monospace" fontWeight="semibold" textAnchor="middle">SAGA-15</text>
                </g>

                <g transform="translate(380, 50)">
                  <circle cx="40" cy="40" r="36" fill="#F5F3FF" stroke="#8B5CF6" strokeWidth="2.5" />
                  <text x="40" y="36" fill="#6D28D9" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">COMMIT</text>
                  <text x="40" y="50" fill="#7C3AED" fontSize="9" fontFamily="monospace" fontWeight="semibold" textAnchor="middle">#9dd83fc</text>
                </g>

                <g transform="translate(210, 210)">
                  <circle cx="40" cy="40" r="36" fill="#FEF2F2" stroke="#EF4444" strokeWidth="2.5" />
                  <text x="40" y="35" fill="#B91C1C" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">JIRA TASK</text>
                  <text x="40" y="49" fill="#DC2626" fontSize="10" fontFamily="monospace" fontWeight="semibold" textAnchor="middle">SAGA-88</text>
                </g>

                <g transform="translate(375, 222)">
                  <rect x="0" y="0" width="105" height="36" rx="8" fill="#FEF2F2" stroke="#EF4444" strokeWidth="1.5" />
                  <text x="52" y="16" fill="#B91C1C" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">MSR ANOMALY</text>
                  <text x="52" y="28" fill="#DC2626" fontSize="8" fontFamily="monospace" textAnchor="middle">0 commits linked</text>
                </g>
              </svg>

              <div className="absolute bottom-3 left-4 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-border text-[10px] font-mono text-muted-foreground shadow-xs">
                <span className="text-primary font-bold">(:Student)</span>-[:ASSIGNED_TO]&gt;<span className="text-blue-600 font-bold">(:JiraTask)</span>&lt;[:IMPLEMENTS]-<span className="text-purple-600 font-bold">(:Commit)</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-2.5">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="font-extrabold text-foreground flex items-center gap-2">
                  <ShieldCheckIcon className="w-4 h-4 text-primary shrink-0" />
                  Tỷ lệ Đóng góp Cổ phần Động (Slicing Pie)
                </span>
                <span className="font-mono font-black text-primary text-base shrink-0 whitespace-nowrap">
                  31.4%
                </span>
              </div>
              <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary via-indigo-500 to-cyan-500 rounded-full w-[88%]" />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground font-mono pt-0.5">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <BotIcon className="w-3.5 h-3.5 text-primary" /> AI Verified: 98.5% Độ tin cậy
                </span>
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

