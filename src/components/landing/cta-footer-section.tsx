"use client";

import Link from "next/link";
import { ArrowRightIcon, BookOpenIcon, ShieldCheckIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SagaLogo } from "@/components/common/saga-logo";
import { Badge } from "@/components/ui/badge";

export function CtaFooterSection() {
  const handleScrollToFeatures = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const elem = document.getElementById("tinh-nang");
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <section className="py-20 md:py-24 border-t border-border/80 relative overflow-hidden bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold">
            <ShieldCheckIcon className="w-3.5 h-3.5" />
            Minh bạch hóa 100% hoạt động học tập
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight max-w-2xl mx-auto">
            Nâng tầm Đánh giá Liên tục ngành SE cùng{" "}
            <span className="bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
              SAGA
            </span>
          </h2>

          <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Hệ thống phân tích đồ thị tự động giúp giảng viên và sinh viên theo sát toàn bộ hành trình học tập và dự án phần mềm theo thời gian thực.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <Link
              href="/login"
              className={buttonVariants({
                size: "lg",
                className: "gap-2.5 font-bold shadow-lg shadow-primary/20 px-8 py-3.5 h-12 rounded-xl text-base transition-all hover:scale-[1.02]",
              })}
            >
              Vào hệ thống ngay
              <ArrowRightIcon className="w-4 h-4" />
            </Link>

            <a
              href="#tinh-nang"
              onClick={handleScrollToFeatures}
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "gap-2.5 font-semibold px-7 py-3.5 h-12 rounded-xl text-base hover:bg-muted/70 cursor-pointer",
              })}
            >
              <BookOpenIcon className="w-4 h-4" />
              Khám phá tính năng
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card/60 backdrop-blur-md pt-14 pb-10">
        <div className="max-w-6xl mx-auto px-6 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-3.5">
              <Link href="/" className="inline-block hover:opacity-95 transition-opacity">
                <SagaLogo size="md" showText={true} showSubtitle={true} subtitleText="Academic Graph Analytics" />
              </Link>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                Nền tảng phân tích đồ thị tri thức và đánh giá liên tục hoạt động học tập, đảm bảo tính công bằng và minh bạch cho sinh viên chuyên ngành Kỹ thuật Phần mềm.
              </p>
              <div className="flex items-center gap-2 pt-0.5">
                <Badge variant="outline" className="text-[10px] font-mono border-primary/20 text-primary bg-primary/5">
                  FPT University
                </Badge>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  Software Engineering (SE)
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Tính năng
              </h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>
                  <a href="#tinh-nang" className="hover:text-primary transition-colors">
                    Traceability Graph
                  </a>
                </li>
                <li>
                  <a href="#tinh-nang" className="hover:text-primary transition-colors">
                    Slicing Pie Contribution
                  </a>
                </li>
                <li>
                  <a href="#tinh-nang" className="hover:text-primary transition-colors">
                    SNA Interaction Monitor
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Hệ thống
              </h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>
                  <Link href="/login" className="hover:text-primary transition-colors">
                    Đăng nhập hệ thống
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-primary transition-colors">
                    Dashboard Quản trị
                  </Link>
                </li>
                <li>
                  <Link href="/admin/audit-log" className="hover:text-primary transition-colors">
                    Nhật ký An ninh
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Công cụ Tích hợp
              </h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>GitHub Webhooks</li>
                <li>Jira Cloud API</li>
                <li>Neo4j Graph DB</li>
                <li>MySQL Database</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>© 2026 Nhóm SAGA — Hệ thống Đánh giá Liên tục Chuyên ngành Kỹ thuật Phần mềm (SE).</p>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Webhooks & Graph API đang hoạt động
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
