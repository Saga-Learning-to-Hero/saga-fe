"use client";

import { SearchIcon, UsersIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatScoreOutOfMax } from "../lib/lecturer-peer-review";
import type { RevieweeSummary } from "../types/lecturer-peer-review";

interface PeerReviewRevieweeListProps {
  summaries: RevieweeSummary[];
  selectedRevieweeId: string;
  keyword: string;
  maxScore: number;
  onKeywordChange: (value: string) => void;
  onSelectReviewee: (revieweeId: string) => void;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "SV";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function PeerReviewRevieweeList({
  summaries,
  selectedRevieweeId,
  keyword,
  maxScore,
  onKeywordChange,
  onSelectReviewee,
}: PeerReviewRevieweeListProps) {
  return (
    <aside className="flex w-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs lg:max-h-[calc(100dvh-8rem)]">
      <div className="border-b border-border/60 p-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-extrabold text-foreground">
              Thành viên nhóm
            </p>
            <p className="text-[11px] text-muted-foreground">
              Chọn một sinh viên để xem chi tiết
            </p>
          </div>
          <span className="rounded-lg bg-primary/10 px-2 py-1 font-mono text-xs font-bold text-primary">
            {summaries.length}
          </span>
        </div>
        <label className="relative mt-3 block" htmlFor="peer-review-member-search">
          <span className="sr-only">Tìm thành viên</span>
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="peer-review-member-search"
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
            placeholder="Tìm theo tên hoặc mã sinh viên"
            className="h-9 rounded-xl pl-9 text-xs"
          />
        </label>
      </div>

      <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto p-2">
        <button
          type="button"
          aria-pressed={!selectedRevieweeId}
          data-testid="peer-review-reviewee-item"
          data-reviewee-id=""
          className={cn(
            "flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
            !selectedRevieweeId
              ? "border-primary/25 bg-primary/10 text-primary"
              : "border-transparent hover:border-border/70 hover:bg-muted/50"
          )}
          onClick={() => onSelectReviewee("")}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UsersIcon className="size-4" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold">Tổng quan nhóm</span>
            <span className="block text-[11px] text-muted-foreground">
              Xem tất cả lượt đánh giá
            </span>
          </span>
        </button>

        {summaries.length === 0 ? (
          <p className="px-3 py-5 text-center text-xs text-muted-foreground">
            Không có thành viên khớp từ khóa.
          </p>
        ) : (
          summaries.map((item) => {
            const selected = selectedRevieweeId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected}
                data-testid="peer-review-reviewee-item"
                data-reviewee-id={item.id}
                className={cn(
                  "w-full cursor-pointer rounded-xl border p-3 text-left transition-colors",
                  selected
                    ? "border-primary/25 bg-primary/8 shadow-xs"
                    : "border-transparent hover:border-border/70 hover:bg-muted/50"
                )}
                onClick={() => onSelectReviewee(item.id)}
              >
                <span className="flex items-start gap-2.5">
                  <Avatar className="size-9 shrink-0 border border-border/70">
                    <AvatarFallback
                      className={cn(
                        "text-[11px] font-extrabold",
                        selected
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {getInitials(item.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block break-words text-xs leading-4 font-extrabold",
                        selected ? "text-primary" : "text-foreground"
                      )}
                    >
                      {item.name}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                      {item.studentCode ? (
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono font-bold text-primary">
                          {item.studentCode}
                        </span>
                      ) : null}
                      <span>{item.receivedCount} lượt nhận</span>
                      <span>
                        TB {formatScoreOutOfMax(item.averageScore, maxScore)}
                      </span>
                    </span>
                  </span>
                </span>
                <span
                  className={cn(
                    "mt-2 inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold",
                    item.hasEnoughReviews
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                  )}
                >
                  {item.hasEnoughReviews ? "Đủ đánh giá" : "Chưa đủ đánh giá"}
                </span>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
