"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon, CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CustomSelectOption {
  value: string;
  label: string;
  subLabel?: string;
  icon?: React.ReactNode;
  tooltip?: string;
  disabled?: boolean;
}

interface CustomSelectOptionItemProps {
  option: CustomSelectOption;
  isSelected: boolean;
  selectedOptionRef?: React.RefObject<HTMLDivElement | null>;
  onSelect: () => void;
  onOptionIntent?: (value: string) => void;
}

function CustomSelectOptionItem({
  option,
  isSelected,
  selectedOptionRef,
  onSelect,
  onOptionIntent,
}: CustomSelectOptionItemProps) {
  const textRef = useRef<HTMLSpanElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{
    x: number;
    y: number;
    placement: "top" | "bottom";
  } | null>(null);

  const fullText = option.tooltip || option.label;
  const isDisabled = option.disabled === true;

  const handlePointerEnter = () => {
    onOptionIntent?.(option.value);
    if (textRef.current) {
      const isTruncated =
        textRef.current.scrollWidth - textRef.current.clientWidth > 1;
      if (isTruncated) {
        const rect = textRef.current.getBoundingClientRect();
        const spaceAbove = rect.top;
        const placement = spaceAbove > 44 ? "top" : "bottom";
        setTooltipPos({
          x: Math.max(12, Math.min(rect.left, window.innerWidth - 320)),
          y: placement === "top" ? rect.top - 6 : rect.bottom + 6,
          placement,
        });
        setShowTooltip(true);
      }
    }
  };

  const handlePointerLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div
      ref={isSelected ? selectedOptionRef : undefined}
      role="option"
      aria-selected={isSelected}
      aria-disabled={isDisabled}
      tabIndex={isDisabled ? -1 : 0}
      onClick={() => {
        if (isDisabled) return;
        setShowTooltip(false);
        onSelect();
      }}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onFocus={() => onOptionIntent?.(option.value)}
      onKeyDown={(event) => {
        if (isDisabled) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setShowTooltip(false);
          onSelect();
        }
      }}
      className={cn(
        "relative flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs transition-colors select-none",
        isDisabled && "cursor-not-allowed opacity-50",
        !isDisabled && "cursor-pointer",
        isSelected
          ? "bg-primary/15 text-primary font-semibold hover:bg-primary/20"
          : "text-foreground hover:bg-muted/70"
      )}
      title={fullText}
    >
      <div className="flex items-center gap-2 truncate min-w-0 flex-1">
        {option.icon && (
          <span
            className={cn(
              "shrink-0",
              isSelected ? "text-primary" : "text-muted-foreground"
            )}
          >
            {option.icon}
          </span>
        )}
        <div className="flex flex-col truncate min-w-0 flex-1">
          <span
            ref={textRef}
            className="truncate"
            onMouseEnter={handlePointerEnter}
          >
            {option.label}
          </span>
          {option.subLabel && (
            <span className="text-xs text-muted-foreground/80 truncate font-normal leading-tight">
              {option.subLabel}
            </span>
          )}
        </div>
      </div>

      {isSelected && (
        <CheckIcon className="w-3.5 h-3.5 text-primary shrink-0 ml-2" />
      )}

      {showTooltip &&
        tooltipPos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="tooltip"
            style={{
              position: "fixed",
              left: tooltipPos.x,
              top: tooltipPos.y,
              transform:
                tooltipPos.placement === "top" ? "translateY(-100%)" : "none",
              zIndex: 10001,
              pointerEvents: "none",
            }}
            className="max-w-xs sm:max-w-md px-2.5 py-1.5 rounded-lg bg-popover text-popover-foreground text-xs font-mono border border-border shadow-xl backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-100 select-none whitespace-normal break-all flex items-center gap-1.5"
          >
            {option.icon && (
              <span className="shrink-0 text-muted-foreground">
                {option.icon}
              </span>
            )}
            <span>{fullText}</span>
          </div>,
          document.body
        )}
    </div>
  );
}

interface CustomSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  className?: string;
  dropdownClassName?: string;
  triggerClassName?: string;
  disabled?: boolean;
  onOptionIntent?: (value: string) => void;
  inlineDropdown?: boolean;
}

export function CustomSelect({
  id,
  value,
  onChange,
  options,
  placeholder = "Chọn một mục...",
  className,
  dropdownClassName,
  triggerClassName,
  disabled = false,
  onOptionIntent,
  inlineDropdown = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const selectedOptionRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const triggerTextRef = useRef<HTMLSpanElement>(null);
  const [showTriggerTooltip, setShowTriggerTooltip] = useState(false);
  const [triggerTooltipPos, setTriggerTooltipPos] = useState<{
    x: number;
    y: number;
    placement: "top" | "bottom";
  } | null>(null);

  const selectedFullText = selectedOption
    ? selectedOption.tooltip || selectedOption.label
    : "";

  useEffect(() => {
    if (isOpen && selectedOptionRef.current) {
      selectedOptionRef.current.scrollIntoView?.({ block: "nearest" });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const inContainer = containerRef.current?.contains(target) ?? false;
      const inDropdown = dropdownRef.current?.contains(target) ?? false;
      if (!inContainer && !inDropdown) {
        setIsOpen(false);
        setShowTriggerTooltip(false);
      }
    };
    const handleScrollOrResize = (event: Event) => {
      if (event.type === "scroll") {
        const target = event.target as Node;
        if (
          dropdownRef.current &&
          (target === dropdownRef.current || dropdownRef.current.contains(target))
        ) {
          return;
        }
      }
      setIsOpen(false);
      setShowTriggerTooltip(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScrollOrResize, true);
      window.addEventListener("resize", handleScrollOrResize);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setShowTriggerTooltip(false);
  };

  const handleToggle = () => {
    if (disabled) return;
    setShowTriggerTooltip(false);
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const dropdownHeight = 240;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

      if (openUpward) {
        setDropdownStyle({
          position: "fixed",
          left: rect.left,
          bottom: window.innerHeight - rect.top + 4,
          width: rect.width,
          zIndex: 9999,
        });
      } else {
        setDropdownStyle({
          position: "fixed",
          left: rect.left,
          top: rect.bottom + 4,
          width: rect.width,
          zIndex: 9999,
        });
      }
    }
    setIsOpen(!isOpen);
  };

  const handleTriggerPointerEnter = () => {
    if (isOpen) return;
    if (triggerTextRef.current && selectedOption) {
      const isTruncated =
        triggerTextRef.current.scrollWidth - triggerTextRef.current.clientWidth > 1;
      if (isTruncated) {
        const rect = triggerTextRef.current.getBoundingClientRect();
        const spaceAbove = rect.top;
        const placement = spaceAbove > 44 ? "top" : "bottom";
        setTriggerTooltipPos({
          x: Math.max(12, Math.min(rect.left, window.innerWidth - 320)),
          y: placement === "top" ? rect.top - 6 : rect.bottom + 6,
          placement,
        });
        setShowTriggerTooltip(true);
      }
    }
  };

  const handleTriggerPointerLeave = () => {
    setShowTriggerTooltip(false);
  };

  const optionList =
    options.length === 0 ? (
      <div className="p-2 text-center text-xs text-muted-foreground">
        Không có lựa chọn nào
      </div>
    ) : (
      options.map((option) => {
        const isSelected = option.value === value;
        return (
          <CustomSelectOptionItem
            key={option.value}
            option={option}
            isSelected={isSelected}
            selectedOptionRef={isSelected ? selectedOptionRef : undefined}
            onSelect={() => handleSelect(option.value)}
            onOptionIntent={onOptionIntent}
          />
        );
      })
    );

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full",
        isOpen && inlineDropdown && "space-y-1",
        className
      )}
    >
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        onPointerEnter={handleTriggerPointerEnter}
        onPointerLeave={handleTriggerPointerLeave}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={cn(
          "w-full h-9 px-3 text-xs rounded-xl bg-background border border-border text-foreground transition-all duration-150 flex items-center justify-between gap-2 outline-none cursor-pointer select-none",
          isOpen
            ? "border-primary ring-2 ring-primary/15 shadow-xs"
            : "hover:border-border/80",
          disabled && "opacity-50 cursor-not-allowed",
          triggerClassName
        )}
        title={selectedFullText || undefined}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.icon && (
            <span className="shrink-0 text-muted-foreground">
              {selectedOption.icon}
            </span>
          )}
          <span
            ref={triggerTextRef}
            className={cn(
              "truncate font-medium",
              !selectedOption && "text-muted-foreground"
            )}
            onMouseEnter={handleTriggerPointerEnter}
          >
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

      {!isOpen &&
        showTriggerTooltip &&
        triggerTooltipPos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="tooltip"
            style={{
              position: "fixed",
              left: triggerTooltipPos.x,
              top: triggerTooltipPos.y,
              transform:
                triggerTooltipPos.placement === "top"
                  ? "translateY(-100%)"
                  : "none",
              zIndex: 10001,
              pointerEvents: "none",
            }}
            className="max-w-xs sm:max-w-md px-2.5 py-1.5 rounded-lg bg-popover text-popover-foreground text-xs font-mono border border-border shadow-xl backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-100 select-none whitespace-normal break-all flex items-center gap-1.5"
          >
            {selectedOption?.icon && (
              <span className="shrink-0 text-muted-foreground">
                {selectedOption.icon}
              </span>
            )}
            <span>{selectedFullText}</span>
          </div>,
          document.body
        )}

      {isOpen &&
        (inlineDropdown ? (
          <div
            role="listbox"
            className={cn(
              "relative z-50 max-h-60 overflow-y-auto rounded-xl bg-popover p-1 border border-border shadow-lg animate-in fade-in-0 zoom-in-95 duration-150 custom-scrollbar overscroll-contain",
              dropdownClassName
            )}
          >
            {optionList}
          </div>
        ) : (
          createPortal(
            <div
              ref={dropdownRef}
              role="listbox"
              style={dropdownStyle}
              className={cn(
                "max-h-60 overflow-y-auto rounded-xl bg-popover p-1 border border-border shadow-xl animate-in fade-in-0 zoom-in-95 duration-150 custom-scrollbar overscroll-contain",
                dropdownClassName
              )}
            >
              {optionList}
            </div>,
            document.body
          )
        ))}
    </div>
  );
}
