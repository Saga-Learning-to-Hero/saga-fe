"use client";

import Link from "next/link";
import { ArrowRightIcon, BookOpenIcon, ExternalLinkIcon, ShieldCheckIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SagaLogo } from "@/components/common/saga-logo";
import { Badge } from "@/components/ui/badge";

export function CtaFooterSection() {
  return (
    <>
      {/* ── Call to Action Banner ── */}
      <section className="py-20 md:py-28 border-t border-border/80 relative overflow-hidden bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold">
            <ShieldCheckIcon className="w-3.5 h-3.5" />
            Minh bạch hóa 100% công sức đồ án
          </div>

          <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight leading-tight max-w-2xl mx-auto">
            Sẵn sàng nâng tầm đánh giá học tập cùng{" "}
            <span className="bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
              SAGA
            </span>
          </h2>

          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Hệ thống phân tích đồ thị tự động liên kết mã nguồn GitHub và nhiệm vụ Jira, mang lại công bằng tuyệt đối cho từng thành viên trong nhóm đồ án.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/login"
              className={buttonVariants({
                size: "lg",
                className: "gap-2 font-semibold shadow-lg shadow-primary/20 px-7 h-12 rounded-xl text-base",
              })}
            >
              Truy cập Cổng thông tin
              <ArrowRightIcon className="w-4 h-4" />
            </Link>

            <a
              href="#tinh-nang"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "gap-2 font-semibold px-6 h-12 rounded-xl text-base",
              })}
            >
              <BookOpenIcon className="w-4 h-4" />
              Khám phá tính năng
            </a>
          </div>
        </div>
      </section>

      {/* ── Main Footer ── */}
      <footer className="border-t border-border bg-card/60 backdrop-blur-md pt-16 pb-12">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Cột 1: Thông tin thương hiệu */}
            <div className="lg:col-span-2 space-y-4">
              <Link href="/" className="inline-block hover:opacity-95 transition-opacity">
                <SagaLogo size="md" showText={true} showSubtitle={true} subtitleText="Academic Graph Analytics" />
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                Nền tảng phân tích đồ thị tri thức & đo lường hoạt động học tập liên tục, loại bỏ hoàn toàn hiện tượng ỷ lại (Free-rider) và minh bạch hóa đóng góp cá nhân trong đồ án tốt nghiệp.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Badge variant="outline" className="text-[11px] font-mono border-primary/20 text-primary bg-primary/5">
                  FPT University
                </Badge>
                <Badge variant="secondary" className="text-[11px] font-mono">
                  Capstone Project · 2026
                </Badge>
              </div>
            </div>

            {/* Cột 2: Giải pháp cốt lõi */}
            <div className="space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Giải pháp cốt lõi
              </h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
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
                    SNA Ghosting Detector
                  </a>
                </li>
                <li>
                  <a href="#tinh-nang" className="hover:text-primary transition-colors">
                    Phân tích Sprint Burndown
                  </a>
                </li>
              </ul>
            </div>

            {/* Cột 3: Cổng phân hệ */}
            <div className="space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Cổng phân hệ
              </h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li>
                  <Link href="/courses" className="hover:text-primary transition-colors">
                    Cổng Sinh viên
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-primary transition-colors">
                    Dashboard Đồ án
                  </Link>
                </li>
                <li>
                  <Link href="/admin/projects" className="hover:text-primary transition-colors">
                    Quản lý Đề tài
                  </Link>
                </li>
                <li>
                  <Link href="/admin/audit-log" className="hover:text-primary transition-colors">
                    Nhật ký An ninh
                  </Link>
                </li>
              </ul>
            </div>

            {/* Cột 4: Hạ tầng & Tích hợp */}
            <div className="space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Hạ tầng & Nền tảng
              </h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li>
                  <span className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-default">
                    GitHub Webhooks
                  </span>
                </li>
                <li>
                  <span className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-default">
                    Jira Software API
                  </span>
                </li>
                <li>
                  <span className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-default">
                    Neo4j Graph Database
                  </span>
                </li>
                <li>
                  <span className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-default">
                    Supabase PostgreSQL
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* ── Bottom Bar: Bản quyền & Trạng thái ── */}
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>© 2026 Nhóm SAGA — Khóa luận Tốt nghiệp Kỹ thuật Phần mềm (SE).</p>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Hệ thống Webhooks & Graph API đang hoạt động
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
