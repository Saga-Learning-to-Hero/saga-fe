"use client";

import type { ReactNode } from "react";
import {
  CircleCheckBigIcon,
  ListFilterIcon,
  MessageSquareTextIcon,
  StarIcon,
  UserRoundXIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatScoreOutOfMax } from "../lib/lecturer-peer-review";
import type { PeerReviewKpis } from "../types/lecturer-peer-review";

interface PeerReviewSummaryStripProps {
  kpis: PeerReviewKpis;
  filters?: ReactNode;
}

export function PeerReviewSummaryStrip({ kpis, filters }: PeerReviewSummaryStripProps) {
  const completionText =
    kpis.completionRate === null
      ? "—"
      : `${kpis.completionRate.toLocaleString("vi-VN", {
          maximumFractionDigits: 0,
        })}%`;
  const completionWidth =
    kpis.completionRate === null
      ? 0
      : Math.min(Math.max(kpis.completionRate, 0), 100);

  return (
    <Card className="relative z-20 overflow-visible rounded-2xl border border-border/80 bg-card shadow-xs">
      <div
        className="grid overflow-hidden rounded-t-2xl sm:grid-cols-2 xl:grid-cols-[1.35fr_1fr_1fr_1fr]"
        data-testid="peer-review-statistics-metrics"
      >
        <section className="border-b border-border/60 bg-primary/5 p-4 sm:col-span-2 xl:col-span-1 xl:border-r xl:border-b-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CircleCheckBigIcon className="size-4.5" aria-hidden />
              </span>
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground">
                  Số lượt đã đánh giá
                </p>
                <p className="font-mono text-lg font-black text-foreground">
                  {kpis.submittedCount}
                  {kpis.expectedCount > 0 ? (
                    <span className="text-xs font-semibold text-muted-foreground">
                      /{kpis.expectedCount}
                    </span>
                  ) : null}
                </p>
              </div>
            </div>
            <span className="font-mono text-sm font-black text-primary">
              {completionText}
            </span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-primary/10">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300"
              style={{ width: `${completionWidth}%` }}
            />
          </div>
        </section>

        <section className="flex items-center gap-2.5 border-b border-border/60 p-4 sm:border-r xl:border-b-0">
          <span className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-300">
            <StarIcon className="size-4 fill-current" aria-hidden />
          </span>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground">
              Điểm trung bình
            </p>
            <p className="font-mono text-base font-black text-foreground">
              {formatScoreOutOfMax(kpis.averageScore, kpis.maxScore)}
            </p>
          </div>
        </section>

        <section className="flex items-center gap-2.5 border-b border-border/60 p-4 xl:border-r xl:border-b-0">
          <span className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300">
            <UserRoundXIcon className="size-4" aria-hidden />
          </span>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground">
              Thành viên chưa đánh giá
            </p>
            <p className="font-mono text-base font-black text-foreground">
              {kpis.membersWithoutReviewCount}
            </p>
          </div>
        </section>

        <section className="flex items-center gap-2.5 p-4 sm:border-l sm:border-border/60 xl:border-l-0">
          <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            <MessageSquareTextIcon className="size-4" aria-hidden />
          </span>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground">
              Đánh giá có nhận xét
            </p>
            <p className="font-mono text-base font-black text-foreground">
              {kpis.commentedCount}
            </p>
          </div>
        </section>
      </div>
      {filters ? (
        <div
          className="relative z-30 flex flex-col gap-3 rounded-b-2xl border-t border-border/60 bg-muted/15 p-4 lg:flex-row lg:items-end lg:justify-between"
          data-testid="peer-review-statistics-filters"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ListFilterIcon className="size-4" aria-hidden />
            </span>
            <div>
              <h2 className="text-sm font-extrabold text-foreground">
                Phạm vi thống kê
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Chọn nhóm và Sprint cần xem kết quả đánh giá chéo.
              </p>
            </div>
          </div>
          <div className="w-full lg:max-w-2xl">{filters}</div>
        </div>
      ) : null}
    </Card>
  );
}
