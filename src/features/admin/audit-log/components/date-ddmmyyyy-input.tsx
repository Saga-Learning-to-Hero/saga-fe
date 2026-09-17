"use client";

import { useState } from "react";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  RotateCcwIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateDdMmYyyyInputProps {
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
  className?: string;
  title?: string;
  id?: string;
}

export function toDdMmYyyy(isoDate: string): string {
  if (!isoDate || !isoDate.includes("-")) return "";
  const parts = isoDate.split("-");
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
  }
  return "";
}

export function toYyyyMmDd(dateStr: string): string {
  if (!dateStr) return "";
  const cleaned = dateStr.trim();

  // Trường hợp dd/mm/yyyy hoặc d/m/yyyy
  if (cleaned.includes("/")) {
    const parts = cleaned.split("/");
    if (parts.length === 3) {
      const [d, m, y] = parts;
      if (d && m && y && y.length === 4) {
        const day = parseInt(d, 10);
        const month = parseInt(m, 10);
        const year = parseInt(y, 10);
        if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
          return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        }
      }
    }
  }

  // Trường hợp nhập liên tục 8 chữ số: ddmmyyyy (vd: 14092026)
  if (/^\d{8}$/.test(cleaned)) {
    const d = cleaned.slice(0, 2);
    const m = cleaned.slice(2, 4);
    const y = cleaned.slice(4, 8);
    const day = parseInt(d, 10);
    const month = parseInt(m, 10);
    const year = parseInt(y, 10);
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }

  return "";
}

/** Tự động định dạng masking dd/mm/yyyy khi người dùng gõ */
function formatInputMask(rawValue: string): string {
  const digitsOnly = rawValue.replace(/\D/g, "");
  if (!digitsOnly) return "";
  if (digitsOnly.length <= 2) {
    return digitsOnly;
  }
  if (digitsOnly.length <= 4) {
    return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
  }
  return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}/${digitsOnly.slice(4, 8)}`;
}

/** Sinh ma trận ngày cho tháng và năm */
function getMonthCalendarDays(year: number, month: number) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = (new Date(year, month - 1, 1).getDay() + 6) % 7; // T2=0, CN=6
  const prevMonthDays = new Date(year, month - 1, 0).getDate();

  const days: { day: number; isCurrentMonth: boolean; dateStr: string }[] = [];

  // Các ngày cuối của tháng trước
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const m = month === 1 ? 12 : month - 1;
    const y = month === 1 ? year - 1 : year;
    days.push({
      day: d,
      isCurrentMonth: false,
      dateStr: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    });
  }

  // Toàn bộ ngày trong tháng hiện tại
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({
      day: d,
      isCurrentMonth: true,
      dateStr: `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    });
  }

  // Các ngày đầu của tháng kế tiếp để tròn tuần
  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      const m = month === 12 ? 1 : month + 1;
      const y = month === 12 ? year + 1 : year;
      days.push({
        day: d,
        isCurrentMonth: false,
        dateStr: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      });
    }
  }

  return days;
}

const WEEK_DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export function DateDdMmYyyyInput({
  value,
  onChange,
  className,
  title,
  id,
}: DateDdMmYyyyInputProps) {
  const [prevValue, setPrevValue] = useState(value);
  const [displayText, setDisplayText] = useState(() => toDdMmYyyy(value));
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Năm và tháng hiển thị trên Calendar
  const initialDate = value && value.includes("-") ? new Date(value) : new Date();
  const [viewYear, setViewYear] = useState(() =>
    isNaN(initialDate.getFullYear()) ? new Date().getFullYear() : initialDate.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(() =>
    isNaN(initialDate.getMonth()) ? new Date().getMonth() + 1 : initialDate.getMonth() + 1
  );

  if (prevValue !== value) {
    setPrevValue(value);
    setDisplayText(toDdMmYyyy(value));
    if (value && value.includes("-")) {
      const [y, m] = value.split("-");
      if (y && m) {
        setViewYear(parseInt(y, 10));
        setViewMonth(parseInt(m, 10));
      }
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    if (!inputVal.trim()) {
      setDisplayText("");
      onChange("");
      return;
    }

    const masked = formatInputMask(inputVal);
    setDisplayText(masked);

    const parsed = toYyyyMmDd(masked);
    if (parsed) {
      onChange(parsed);
      const [y, m] = parsed.split("-");
      setViewYear(parseInt(y, 10));
      setViewMonth(parseInt(m, 10));
    }
  };

  const handleBlur = () => {
    if (!displayText.trim()) {
      onChange("");
      setDisplayText("");
      return;
    }

    const parsed = toYyyyMmDd(displayText);
    if (parsed) {
      onChange(parsed);
      setDisplayText(toDdMmYyyy(parsed));
    } else {
      setDisplayText(toDdMmYyyy(value));
    }
  };

  const handleSelectDay = (dateStr: string) => {
    onChange(dateStr);
    setDisplayText(toDdMmYyyy(dateStr));
    setIsPopoverOpen(false);
  };

  const handleSelectToday = () => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    handleSelectDay(todayStr);
  };

  const handleClearDate = () => {
    onChange("");
    setDisplayText("");
    setIsPopoverOpen(false);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const calendarDays = getMonthCalendarDays(viewYear, viewMonth);
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div className="relative flex-1 group">
      <Input
        id={id}
        type="text"
        placeholder="dd/mm/yyyy"
        value={displayText}
        onChange={handleTextChange}
        onBlur={handleBlur}
        className={cn(
          "h-9 text-xs rounded-xl font-mono pr-8 transition-colors",
          className
        )}
        title={title || "Định dạng ngày: dd/mm/yyyy"}
        maxLength={10}
      />

      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger
          className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg hover:bg-muted/50 transition-colors outline-none"
          title="Chọn ngày từ lịch SAGA"
          tabIndex={-1}
        >
          <CalendarIcon className="size-3.5" />
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-[280px] p-3 rounded-2xl border border-border shadow-2xl bg-card text-card-foreground select-none"
        >
          {/* Header Tháng & Năm */}
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-border/60">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Tháng trước"
            >
              <ChevronLeftIcon className="size-4" />
            </button>

            <span className="text-xs font-bold text-foreground tracking-tight">
              Tháng {String(viewMonth).padStart(2, "0")}, {viewYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Tháng sau"
            >
              <ChevronRightIcon className="size-4" />
            </button>
          </div>

          {/* Tiêu đề các thứ trong tuần */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {WEEK_DAYS.map((w) => (
              <span
                key={w}
                className="text-[10px] font-bold text-muted-foreground/80 py-0.5"
              >
                {w}
              </span>
            ))}
          </div>

          {/* Lưới các ngày */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((item, idx) => {
              const isSelected = value === item.dateStr;
              const isToday = todayStr === item.dateStr;

              return (
                <button
                  key={`${item.dateStr}-${idx}`}
                  type="button"
                  onClick={() => handleSelectDay(item.dateStr)}
                  className={cn(
                    "size-8 rounded-lg text-xs flex items-center justify-center transition-all cursor-pointer font-mono",
                    item.isCurrentMonth
                      ? "text-foreground hover:bg-muted"
                      : "text-muted-foreground/30 hover:bg-muted/40",
                    isToday && !isSelected && "border border-primary/50 text-primary font-bold",
                    isSelected &&
                      "bg-primary text-primary-foreground font-bold shadow-xs hover:bg-primary"
                  )}
                  title={item.dateStr}
                >
                  {item.day}
                </button>
              );
            })}
          </div>

          {/* Footer nút Hôm nay & Xóa ngày */}
          <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearDate}
              className="h-6.5 px-2 text-[11px] text-destructive hover:bg-destructive/10 cursor-pointer"
            >
              <RotateCcwIcon className="size-3 mr-1" />
              Xóa ngày
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectToday}
              className="h-6.5 px-2.5 text-[11px] font-semibold border-primary/30 text-primary hover:bg-primary/10 cursor-pointer"
            >
              Hôm nay
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}


