"use client";

import { useState, useRef, useEffect, useMemo, useId } from "react";
import { TagIcon, XIcon, CheckIcon, ChevronDownIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const DEFAULT_SAGA_LABELS = [
  "saga:code",
  "saga:test",
  "saga:document",
  "saga:research",
] as const;

export interface LabelsMultiSelectProps {
  id?: string;
  value: string[];
  onChange: (labels: string[]) => void;
  availableLabels?: string[];
  disabled?: boolean;
  placeholder?: string;
}

function getLabelBadgeStyle(label: string): string {
  const lower = label.toLowerCase();
  if (lower === "saga:code") {
    return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-mono";
  }
  if (lower === "saga:test") {
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-mono";
  }
  if (lower === "saga:document" || lower === "saga:doc") {
    return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-mono";
  }
  if (lower === "saga:research") {
    return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 font-mono";
  }
  if (lower.startsWith("saga:")) {
    return "bg-primary/10 text-primary border border-primary/30 font-mono";
  }
  return "bg-muted/80 text-foreground border border-border/80";
}

export function LabelsMultiSelect({
  id,
  value = [],
  onChange,
  availableLabels,
  disabled = false,
  placeholder = "Chọn nhãn (saga:code, saga:test...)",
}: LabelsMultiSelectProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Đảm bảo luôn luôn có sẵn 4 label chuẩn, không bao giờ bị rỗng
  const effectiveLabels = useMemo(() => {
    if (availableLabels && availableLabels.length > 0) {
      return availableLabels;
    }
    return DEFAULT_SAGA_LABELS;
  }, [availableLabels]);

  const trimmedInput = inputValue.trim();

  const filteredSuggestions = useMemo(() => {
    if (!trimmedInput) return effectiveLabels;
    return effectiveLabels.filter((l) =>
      l.toLowerCase().includes(trimmedInput.toLowerCase())
    );
  }, [effectiveLabels, trimmedInput]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectLabel = (newLabel: string) => {
    const clean = newLabel.trim();
    if (!clean) return;
    // Chỉ cho chọn duy nhất 1 label (ghi đè nhãn cũ)
    onChange([clean]);
    setInputValue("");
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    if (disabled) return;
    onChange(value.filter((l) => l !== labelToRemove));
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === "Enter") {
      e.preventDefault();
      // Không cho tự tạo nhãn mới, chỉ cho chọn từ danh sách gợi ý
      if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
        handleSelectLabel(filteredSuggestions[highlightedIndex]);
      } else if (filteredSuggestions.length > 0) {
        handleSelectLabel(filteredSuggestions[0]);
      }
      return;
    }

    if (e.key === "Backspace" && !inputValue && value.length > 0) {
      e.preventDefault();
      handleRemoveLabel(value[value.length - 1]);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
      if (filteredSuggestions.length > 0) {
        setHighlightedIndex((prev) => (prev + 1 >= filteredSuggestions.length ? 0 : prev + 1));
      }
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setIsOpen(true);
      if (filteredSuggestions.length > 0) {
        setHighlightedIndex((prev) => (prev <= 0 ? filteredSuggestions.length - 1 : prev - 1));
      }
      return;
    }

    if (e.key === "Escape") {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleOpenDropdown = () => {
    if (!disabled) {
      setIsOpen(true);
      inputRef.current?.focus();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        onClick={handleOpenDropdown}
        className={`min-h-9 w-full flex items-center justify-between gap-1.5 p-1.5 rounded-xl border bg-card text-xs transition-all cursor-pointer ${
          disabled
            ? "opacity-80 cursor-not-allowed border-border/60"
            : isOpen
              ? "ring-2 ring-primary/30 border-primary shadow-xs"
              : "border-border/80 hover:border-border"
        }`}
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
          {value.map((label) => (
            <Badge
              key={label}
              variant="outline"
              className={`h-6 px-2 py-0 text-xs font-medium rounded-lg flex items-center gap-1 shrink-0 ${getLabelBadgeStyle(
                label
              )}`}
            >
              <span>{label}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveLabel(label);
                  }}
                  className="rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/15 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                  aria-label={`Xóa ${label}`}
                >
                  <XIcon className="w-3 h-3" />
                </button>
              )}
            </Badge>
          ))}

          <input
            ref={inputRef}
            id={inputId}
            type="text"
            disabled={disabled}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsOpen(true);
              setHighlightedIndex(-1);
            }}
            onFocus={() => {
              if (!disabled) setIsOpen(true);
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[80px] bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-hidden border-none px-1 py-0.5 disabled:cursor-not-allowed cursor-text"
          />
        </div>

        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) {
              setIsOpen((prev) => !prev);
              inputRef.current?.focus();
            }
          }}
          className="p-1 rounded-lg hover:bg-muted/80 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer transition-colors"
          aria-label={isOpen ? "Đóng danh sách nhãn" : "Mở danh sách nhãn"}
        >
          <ChevronDownIcon
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-primary" : ""
            }`}
          />
        </button>
      </div>

      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-52 overflow-y-auto rounded-xl border border-border/80 bg-popover/95 backdrop-blur-xs p-1 shadow-md text-xs space-y-0.5 animate-in fade-in-0 zoom-in-95 duration-150">
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((suggestion, idx) => {
              const isHighlighted = highlightedIndex === idx;
              const isSelected = value.includes(suggestion);
              return (
                <button
                  key={suggestion}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectLabel(suggestion);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs cursor-pointer transition-colors ${
                    isHighlighted
                      ? "bg-accent text-accent-foreground font-semibold"
                      : isSelected
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-foreground hover:bg-muted/80"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <TagIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate font-mono">{suggestion}</span>
                  </div>
                  {isSelected && (
                    <CheckIcon className="w-3.5 h-3.5 text-primary shrink-0" />
                  )}
                </button>
              );
            })
          ) : (
            <div className="p-2.5 text-center text-xs text-muted-foreground">
              Không tìm thấy nhãn phù hợp. Chỉ hỗ trợ 4 nhãn chuẩn của SAGA.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
