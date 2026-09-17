"use client";

import { StarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { PEER_REVIEW_STAR_MAX, PEER_REVIEW_STAR_MIN } from "../types/peer-review";

interface StarRatingInputProps {
  id: string;
  value: number | null;
  disabled?: boolean;
  onChange: (value: number) => void;
}

const STAR_DESCRIPTIONS: Record<number, string> = {
  1: "Cần cải thiện",
  2: "Chưa đạt kỳ vọng",
  3: "Đạt yêu cầu",
  4: "Làm tốt",
  5: "Xuất sắc",
};

export function StarRatingInput({ id, value, disabled, onChange }: StarRatingInputProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5" role="radiogroup" aria-labelledby={id}>
        {Array.from({ length: PEER_REVIEW_STAR_MAX }, (_, index) => {
          const star = index + PEER_REVIEW_STAR_MIN;
          const selected = value !== null && star <= value;
          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={value === star}
              disabled={disabled}
              onClick={() => onChange(star)}
              className="group cursor-pointer rounded-lg p-1 transition-all duration-150 hover:scale-115 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              title={`${star} sao - ${STAR_DESCRIPTIONS[star]}`}
            >
              <StarIcon
                className={cn(
                  "size-6 transition-colors duration-150",
                  selected
                    ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                    : "text-muted-foreground/30 group-hover:text-amber-300",
                )}
              />
            </button>
          );
        })}
      </div>
      {value ? (
        <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
          {value}/5 · {STAR_DESCRIPTIONS[value]}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground/60">
          (Chọn từ 1 đến 5 sao)
        </span>
      )}
    </div>
  );
}

