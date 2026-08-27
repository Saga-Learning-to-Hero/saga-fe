"use client";

import { cn } from "@/lib/utils";

interface SagaLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  showSubtitle?: boolean;
  subtitleText?: string;
  variant?: "default" | "on-dark" | "monochrome";
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

export function SagaLogo({
  size = "md",
  showText = true,
  showSubtitle = false,
  subtitleText = "Academic Graph Analytics",
  variant = "default",
  className,
  iconClassName,
  textClassName,
}: SagaLogoProps) {
  const iconDimensions = {
    xs: { box: 26, icon: 20, text: "text-base", sub: "text-[9px]" },
    sm: { box: 34, icon: 26, text: "text-lg", sub: "text-[10px]" },
    md: { box: 42, icon: 32, text: "text-xl", sub: "text-[11px]" },
    lg: { box: 50, icon: 40, text: "text-2xl", sub: "text-xs" },
    xl: { box: 64, icon: 52, text: "text-4xl", sub: "text-sm" },
  }[size];

  const isOnDark = variant === "on-dark";

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      {/* ── Vector Icon: S-Graph Nexus ── */}
      <div
        className={cn(
          "relative flex items-center justify-center shrink-0 rounded-xl transition-transform",
          isOnDark
            ? "bg-white text-primary shadow-md shadow-black/10"
            : "bg-gradient-to-br from-[#4F46E5] to-[#4338CA] text-white shadow-md shadow-indigo-500/25",
          iconClassName
        )}
        style={{
          width: iconDimensions.box,
          height: iconDimensions.box,
        }}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            width: iconDimensions.icon,
            height: iconDimensions.icon,
          }}
          className="overflow-visible"
        >
          <defs>
            <linearGradient id="sLogoGrad" x1="8" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={isOnDark ? "#4F46E5" : "#A5B4FC"} />
              <stop offset="50%" stopColor={isOnDark ? "#6366F1" : "#FFFFFF"} />
              <stop offset="100%" stopColor={isOnDark ? "#06B6D4" : "#22D3EE"} />
            </linearGradient>
          </defs>

          {/* Đường liên kết phụ mờ */}
          <path
            d="M12 12L28 28"
            stroke={isOnDark ? "#818CF8" : "#FFFFFF"}
            strokeOpacity="0.35"
            strokeWidth="1.8"
            strokeDasharray="2.5 2.5"
          />

          {/* Đường chữ S chính */}
          <path
            d="M28 11C28 8 25 6 20 6C14 6 11 9 11 14C11 21 29 19 29 26C29 31 26 34 20 34C14 34 11 31 11 28"
            stroke="url(#sLogoGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Node 1: Đỉnh trên */}
          <circle cx="28" cy="11" r="3.8" fill={isOnDark ? "#06B6D4" : "#22D3EE"} />
          <circle cx="28" cy="11" r="1.5" fill="#FFFFFF" />

          {/* Node 2: Trung tâm */}
          <circle cx="20" cy="20" r="3" fill={isOnDark ? "#4F46E5" : "#FFFFFF"} />

          {/* Node 3: Đích dưới */}
          <circle cx="11" cy="28" r="3.8" fill={isOnDark ? "#4F46E5" : "#818CF8"} />
          <circle cx="11" cy="28" r="1.5" fill="#FFFFFF" />
        </svg>
      </div>

      {/* ── Brand Typography: SAGA (Gradient Tím - Cyan rực rỡ, không bao giờ bị mờ) ── */}
      {showText && (
        <div className="flex flex-col min-w-0 leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "font-[family-name:var(--font-outfit)] font-black tracking-tight leading-none select-none",
                iconDimensions.text,
                isOnDark
                  ? "text-white"
                  : "bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#06B6D4] bg-clip-text text-transparent",
                textClassName
              )}
            >
              SAGA
            </span>
          </div>

          {showSubtitle && (
            <span
              className={cn(
                "font-bold tracking-wider uppercase mt-1 leading-none",
                iconDimensions.sub,
                isOnDark ? "text-white/80" : "text-slate-500 font-semibold"
              )}
            >
              {subtitleText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
