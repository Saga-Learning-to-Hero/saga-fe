import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { SagaLogo } from "@/components/common/saga-logo";
import { ThemeToggle } from "@/components/common/theme-toggle";

interface BannerStat {
  value: string;
  label: string;
}

interface AuthSplitLayoutProps {
  children: ReactNode;
  bannerBadge?: ReactNode;
  bannerTitle: string;
  bannerHighlight: string;
  bannerDescription: string;
  bannerStats?: BannerStat[];
}

export function AuthSplitLayout({
  children,
  bannerBadge,
  bannerTitle,
  bannerHighlight,
  bannerDescription,
  bannerStats,
}: AuthSplitLayoutProps) {
  return (
    <div className="min-h-screen grid md:grid-cols-[3fr_2fr] lg:grid-cols-[7fr_5fr]">
      <div
        className="hidden md:flex flex-col justify-between p-10 lg:p-14 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, oklch(from var(--saga-primary) calc(l - 0.15) c h), oklch(from var(--saga-accent) calc(l - 0.1) c h))",
        }}
      >
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: "oklch(1 0 0 / 15%)" }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-10"
          style={{ background: "oklch(1 0 0 / 20%)" }}
        />

        <div className="relative">
          <Link href="/" className="inline-block hover:opacity-95 transition-opacity">
            <SagaLogo
              size="md"
              variant="on-dark"
              showText={true}
              showSubtitle={true}
              subtitleText="Academic Graph Analytics"
            />
          </Link>
        </div>

        <div className="relative space-y-6">
          {bannerBadge && <div>{bannerBadge}</div>}

          <p className="text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            {bannerTitle} <span className="text-white/70">{bannerHighlight}</span>
          </p>
          <p className="text-white/70 text-lg leading-relaxed max-w-md">
            {bannerDescription}
          </p>

          {bannerStats && bannerStats.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-2">
              {bannerStats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white"
                  style={{ background: "oklch(1 0 0 / 12%)" }}
                >
                  <span className="font-bold">{stat.value}</span>
                  <span className="text-white/70">{stat.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-white/40 text-sm relative">© 2026 SAGA — FPT Capstone Project</p>
      </div>

      <div className="flex flex-col justify-center items-center px-6 py-12 lg:px-16 bg-background">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              Quay lại trang chủ
            </Link>
            <ThemeToggle />
          </div>

          <div className="flex md:hidden items-center mb-2">
            <Link href="/" className="inline-block hover:opacity-95 transition-opacity">
              <SagaLogo size="sm" showText={true} showSubtitle={false} />
            </Link>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
