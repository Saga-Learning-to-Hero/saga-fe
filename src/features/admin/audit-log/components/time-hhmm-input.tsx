"use client";

import { useState } from "react";
import { ClockIcon, CheckIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TimeHhMmInputProps {
  value: string; // Định dạng HH:mm (ví dụ "08:30" hoặc "00:00")
  onChange: (val: string) => void;
  className?: string;
  placeholder?: string;
  title?: string;
  id?: string;
  disabled?: boolean;
}

/** Kiểm tra chuỗi có đúng định dạng giờ phút hợp lệ HH:mm (00:00 - 23:59) */
export function isValidHhMm(val: string): boolean {
  if (!val) return false;
  const parts = val.trim().split(":");
  if (parts.length !== 2) return false;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  return !isNaN(h) && !isNaN(m) && h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

/** Tự động masking khi người dùng gõ giờ phút */
export function formatTimeInputMask(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length <= 2) {
    const h = parseInt(digits, 10);
    if (h > 23) return "23";
    return digits;
  }
  const hStr = digits.slice(0, 2);
  const mStr = digits.slice(2, 4);
  const h = Math.min(parseInt(hStr, 10), 23);
  const m = Math.min(parseInt(mStr, 10), 59);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(mStr.length, "0")}`;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = [
  "00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55", "59"
];

const PRESETS = [
  { label: "Đầu ngày", value: "00:00" },
  { label: "Sáng", value: "08:00" },
  { label: "Trưa", value: "12:00" },
  { label: "Chiều", value: "18:00" },
  { label: "Cuối ngày", value: "23:59" },
];

export function TimeHhMmInput({
  value,
  onChange,
  className,
  placeholder = "HH:mm",
  title = "Định dạng giờ: HH:mm (24h)",
  id,
  disabled = false,
}: TimeHhMmInputProps) {
  const [prevValue, setPrevValue] = useState(value);
  const [displayText, setDisplayText] = useState(value || "");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  if (prevValue !== value) {
    setPrevValue(value);
    setDisplayText(value || "");
  }

  const currentHour = value && value.includes(":") ? value.split(":")[0] : "00";
  const currentMinute = value && value.includes(":") ? value.split(":")[1] : "00";

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (!raw.trim()) {
      setDisplayText("");
      onChange("");
      return;
    }

    const masked = formatTimeInputMask(raw);
    setDisplayText(masked);

    if (isValidHhMm(masked)) {
      onChange(masked);
    }
  };

  const handleBlur = () => {
    if (!displayText.trim()) {
      setDisplayText("");
      onChange("");
      return;
    }

    if (isValidHhMm(displayText)) {
      onChange(displayText);
    } else {
      setDisplayText(value || "");
    }
  };

  const handleSelectHour = (hour: string) => {
    const newTime = `${hour}:${currentMinute}`;
    onChange(newTime);
    setDisplayText(newTime);
  };

  const handleSelectMinute = (minute: string) => {
    const newTime = `${currentHour}:${minute}`;
    onChange(newTime);
    setDisplayText(newTime);
  };

  const handleSelectPreset = (presetVal: string) => {
    onChange(presetVal);
    setDisplayText(presetVal);
    setIsPopoverOpen(false);
  };

  const handleSelectCurrentTime = () => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    const newTime = `${h}:${m}`;
    onChange(newTime);
    setDisplayText(newTime);
    setIsPopoverOpen(false);
  };

  return (
    <div className="relative w-24 shrink-0 group">
      <Input
        id={id}
        type="text"
        placeholder={placeholder}
        value={displayText}
        onChange={handleTextChange}
        onBlur={handleBlur}
        disabled={disabled}
        maxLength={5}
        className={cn(
          "h-9 text-xs rounded-xl font-mono text-center pr-6 pl-2 transition-colors",
          className
        )}
        title={title}
      />

      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger
          disabled={disabled}
          className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground cursor-pointer rounded-md hover:bg-muted/50 transition-colors disabled:cursor-not-allowed disabled:opacity-50 outline-none"
          title="Chọn mốc giờ"
          tabIndex={-1}
        >
          <ClockIcon className="size-3" />
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-[260px] p-3 rounded-2xl border border-border shadow-2xl bg-card text-card-foreground select-none"
        >
          {/* Header chọn giờ */}
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-border/60">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <ClockIcon className="size-3.5 text-primary" />
              <span>Chọn giờ (24h)</span>
            </div>

            <div className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
              {currentHour}:{currentMinute}
            </div>
          </div>

          {/* Mốc chọn nhanh Presets */}
          <div className="grid grid-cols-5 gap-1 mb-3">
            {PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => handleSelectPreset(p.value)}
                className={cn(
                  "py-1 rounded-md text-[10px] font-mono font-medium transition-colors border cursor-pointer text-center",
                  value === p.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border/60 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
                title={p.label}
              >
                {p.value}
              </button>
            ))}
          </div>

          {/* 2 Cột cuộn: Giờ & Phút */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Cột Giờ */}
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1 text-center">
                Giờ
              </div>
              <div className="max-h-36 overflow-y-auto space-y-0.5 pr-1 border border-border/60 rounded-xl p-1 bg-muted/20">
                {HOURS.map((h) => {
                  const isSelected = currentHour === h;
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => handleSelectHour(h)}
                      className={cn(
                        "w-full py-1 rounded-md font-mono text-center transition-colors cursor-pointer text-xs",
                        isSelected
                          ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      {h}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cột Phút */}
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1 text-center">
                Phút
              </div>
              <div className="max-h-36 overflow-y-auto space-y-0.5 pr-1 border border-border/60 rounded-xl p-1 bg-muted/20">
                {MINUTES.map((m) => {
                  const isSelected = currentMinute === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleSelectMinute(m)}
                      className={cn(
                        "w-full py-1 rounded-md font-mono text-center transition-colors cursor-pointer text-xs",
                        isSelected
                          ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer: Nút Giờ hiện tại & Nút Xong */}
          <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSelectCurrentTime}
              className="h-6.5 px-2 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Hiện tại
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPopoverOpen(false)}
              className="h-6.5 px-2.5 text-[11px] font-semibold border-primary/30 text-primary hover:bg-primary/10 cursor-pointer"
            >
              <CheckIcon className="size-3 mr-1" />
              Xong
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

