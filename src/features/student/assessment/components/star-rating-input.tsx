"use client";

import { StarIcon } from "lucide-react";
import { PEER_REVIEW_STAR_MAX, PEER_REVIEW_STAR_MIN } from "../types/peer-review";

interface StarRatingInputProps {
  id: string;
  value: number | null;
  disabled?: boolean;
  onChange: (value: number) => void;
}

export function StarRatingInput({ id, value, disabled, onChange }: StarRatingInputProps) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-labelledby={id}>
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
            className="cursor-pointer rounded-md p-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            title={`${star} sao`}
          >
            <StarIcon
              className={`size-5 ${selected ? "fill-primary text-primary" : "text-muted-foreground"}`}
            />
          </button>
        );
      })}
    </div>
  );
}
