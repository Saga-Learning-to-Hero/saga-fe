"use client";

import { useState } from "react";
import { CopyIcon, CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ExpandableIdProps {
  id: string;
  prefix?: string;
  className?: string;
  badge?: boolean;
}

export function ExpandableId({ id, prefix, className, badge }: ExpandableIdProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (!id) return null;

  const isLong = id.length > 10;
  const shortPart = isLong ? id.slice(0, 8) : id;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(id);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1600);
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  if (!isLong) {
    return (
      <span className={cn("font-mono text-foreground font-medium", className)}>
        {prefix}
        {id}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-mono transition-colors",
        badge
          ? "border border-border/80 bg-muted/40 hover:bg-muted/70 px-2 py-0.5 rounded-lg text-[10px]"
          : "hover:bg-muted/50 px-1.5 py-0.5 rounded-md text-[11px]",
        className
      )}
    >
      {prefix && (
        <span className="text-muted-foreground font-sans select-none text-[10px]">
          {prefix}
        </span>
      )}
      <button
        type="button"
        onClick={handleToggle}
        title={isExpanded ? "Nhấn để thu gọn" : "Nhấn để xem đầy đủ ID"}
        className="text-foreground hover:text-primary transition-colors cursor-pointer text-left break-all inline-flex items-center gap-0.5 group/btn"
      >
        <span>{isExpanded ? id : shortPart}</span>
        {!isExpanded && (
          <span className="text-primary font-bold px-1 py-0.2 rounded bg-primary/15 group-hover/btn:bg-primary/25 text-[10px] tracking-widest leading-none">
            ...
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={handleCopy}
        title={isCopied ? "Đã sao chép" : "Sao chép ID"}
        className="p-0.5 text-muted-foreground hover:text-primary transition-opacity cursor-pointer opacity-60 hover:opacity-100 shrink-0 ml-0.5"
      >
        {isCopied ? (
          <CheckIcon className="size-3 text-success animate-in zoom-in-50 duration-150" />
        ) : (
          <CopyIcon className="size-3" />
        )}
      </button>
    </span>
  );
}
