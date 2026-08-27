"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon, CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CustomSelectOption {
  value: string;
  label: string;
  subLabel?: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Chọn một mục...",
  className,
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full h-9 px-3 text-xs rounded-xl bg-background border border-border text-foreground transition-all duration-150 flex items-center justify-between gap-2 outline-none cursor-pointer select-none",
          isOpen ? "border-primary ring-2 ring-primary/15 shadow-xs" : "hover:border-border/80",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.icon && (
            <span className="shrink-0 text-muted-foreground">{selectedOption.icon}</span>
          )}
          <span className={cn("truncate font-medium", !selectedOption && "text-muted-foreground")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDownIcon
          className={cn(
            "w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform duration-200",
            isOpen && "rotate-180 text-primary"
          )}
        />
      </button>

      {/* Dropdown Popup */}
      {isOpen && (
        <div
          className="absolute z-50 left-0 right-0 top-[calc(100%+4px)] max-h-60 overflow-y-auto rounded-xl bg-popover p-1 border border-border shadow-lg animate-in fade-in-0 zoom-in-95 duration-150 scrollbar-thin"
        >
          {options.length === 0 ? (
            <div className="p-2 text-center text-xs text-muted-foreground">
              Không có lựa chọn nào
            </div>
          ) : (
            options.map((option) => {
              const isSelected = option.value === value;
              return (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "relative flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors select-none",
                    isSelected
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-foreground hover:bg-muted/70"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    {option.icon && (
                      <span className={cn("shrink-0", isSelected ? "text-primary" : "text-muted-foreground")}>
                        {option.icon}
                      </span>
                    )}
                    <div className="flex flex-col truncate">
                      <span className="truncate">{option.label}</span>
                      {option.subLabel && (
                        <span className="text-[11px] text-muted-foreground/80 truncate font-normal">
                          {option.subLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <CheckIcon className="w-3.5 h-3.5 text-primary shrink-0 ml-2" />
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
