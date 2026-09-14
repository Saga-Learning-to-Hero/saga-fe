"use client";

import { useState, useRef, useEffect, useMemo, useId } from "react";
import { TagIcon, XIcon, PlusIcon, CheckIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  if (lower.startsWith("saga:")) {
    return "bg-primary/10 text-primary border border-primary/30 font-mono";
  }
  if (lower.includes("bug") || lower.includes("fix") || lower.includes("error")) {
    return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30";
  }
  if (
    lower.includes("front") ||
    lower.includes("back") ||
    lower.includes("api") ||
    lower.includes("db") ||
    lower.includes("database") ||
    lower.includes("ui") ||
    lower.includes("ux")
  ) {
    return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30";
  }
  return "bg-muted/80 text-foreground border border-border/80";
}

export function LabelsMultiSelect({
  id,
  value = [],
  onChange,
  availableLabels = [],
  disabled = false,
  placeholder = "Thêm nhãn (VD: frontend, bugfix...)",
}: LabelsMultiSelectProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmedInput = inputValue.trim();

  const filteredSuggestions = useMemo(() => {
    const activeSet = new Set(value.map((v) => v.toLowerCase()));
    const result = availableLabels.filter(
      (l) => !activeSet.has(l.toLowerCase()) && l.toLowerCase().includes(trimmedInput.toLowerCase())
    );
    return result;
  }, [availableLabels, value, trimmedInput]);

  const canAddNew =
    Boolean(trimmedInput) &&
    !value.some((v) => v.toLowerCase() === trimmedInput.toLowerCase()) &&
    !filteredSuggestions.some((s) => s.toLowerCase() === trimmedInput.toLowerCase());

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

  const handleAddLabel = (newLabel: string) => {
    const clean = newLabel.trim();
    if (!clean) return;
    if (!value.some((v) => v.toLowerCase() === clean.toLowerCase())) {
      onChange([...value, clean]);
    }
    setInputValue("");
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

    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0) {
        if (canAddNew && highlightedIndex === 0) {
          handleAddLabel(trimmedInput);
        } else {
          const suggestionIdx = canAddNew ? highlightedIndex - 1 : highlightedIndex;
          if (filteredSuggestions[suggestionIdx]) {
            handleAddLabel(filteredSuggestions[suggestionIdx]);
          }
        }
      } else if (trimmedInput) {
        handleAddLabel(trimmedInput);
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
      const totalOptions = filteredSuggestions.length + (canAddNew ? 1 : 0);
      if (totalOptions > 0) {
        setIsOpen(true);
        setHighlightedIndex((prev) => (prev + 1 >= totalOptions ? 0 : prev + 1));
      }
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      const totalOptions = filteredSuggestions.length + (canAddNew ? 1 : 0);
      if (totalOptions > 0) {
        setIsOpen(true);
        setHighlightedIndex((prev) => (prev <= 0 ? totalOptions - 1 : prev - 1));
      }
      return;
    }

    if (e.key === "Escape") {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        onClick={() => {
          if (!disabled) {
            inputRef.current?.focus();
            setIsOpen(true);
          }
        }}
        className={`min-h-9 w-full flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl border bg-card text-xs transition-all cursor-text ${disabled
            ? "opacity-80 cursor-not-allowed border-border/60"
            : isOpen
              ? "ring-2 ring-primary/30 border-primary shadow-xs"
              : "border-border/80 hover:border-border"
          }`}
      >
        {value.map((label) => (
          <Badge
            key={label}
            variant="outline"
            className={`h-6 px-2 py-0 text-[11px] font-medium rounded-lg flex items-center gap-1 shrink-0 ${getLabelBadgeStyle(
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
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-hidden border-none px-1 py-0.5 disabled:cursor-not-allowed"
        />
      </div>

      {isOpen && !disabled && (filteredSuggestions.length > 0 || canAddNew) && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-52 overflow-y-auto rounded-xl border border-border/80 bg-popover/95 backdrop-blur-xs p-1 shadow-xl text-xs space-y-0.5">
          {canAddNew && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleAddLabel(trimmedInput);
              }}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs font-semibold cursor-pointer transition-colors ${highlightedIndex === 0
                  ? "bg-primary text-primary-foreground"
                  : "text-primary hover:bg-primary/10"
                }`}
            >
              <PlusIcon className="w-3.5 h-3.5 shrink-0" />
              <span>
                Tạo nhãn mới: <span className="font-bold underline">{trimmedInput}</span>
              </span>
            </button>
          )}

          {filteredSuggestions.map((suggestion, idx) => {
            const itemIdx = canAddNew ? idx + 1 : idx;
            const isHighlighted = highlightedIndex === itemIdx;
            return (
              <button
                key={suggestion}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleAddLabel(suggestion);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs cursor-pointer transition-colors ${isHighlighted
                    ? "bg-accent text-accent-foreground font-semibold"
                    : "text-foreground hover:bg-muted/80"
                  }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <TagIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">{suggestion}</span>
                </div>
                {value.includes(suggestion) && (
                  <CheckIcon className="w-3.5 h-3.5 text-primary shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
