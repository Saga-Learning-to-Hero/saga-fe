"use client";

import { useMemo } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/common/custom-select";
import { cn } from "@/lib/utils";

interface TablePaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange?: (newSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
  itemLabel?: string;
}

export function TablePagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  className,
  itemLabel = "mục",
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const startItem = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, totalItems);

  const sizeSelectOptions = useMemo(() => {
    return pageSizeOptions.map((size) => ({
      value: String(size),
      label: `${size} / trang`,
    }));
  }, [pageSizeOptions]);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, safePage - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [safePage, totalPages]);

  if (totalItems === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2.5 bg-card/95 backdrop-blur-xs rounded-2xl border border-border/80 shadow-2xs text-xs text-muted-foreground transition-all",
        className
      )}
    >
      <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
        {onPageSizeChange && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-muted-foreground whitespace-nowrap text-xs font-medium">Hiển thị</span>
            <div className="w-[136px] shrink-0">
              <CustomSelect
                id="pagination-page-size"
                value={String(pageSize)}
                onChange={(val) => {
                  const num = Number(val);
                  if (num > 0) onPageSizeChange(num);
                }}
                options={sizeSelectOptions}
                triggerClassName="h-8 px-2.5 text-xs rounded-lg"
                dropdownClassName="w-36"
              />
            </div>
          </div>
        )}

        <span className="hidden sm:inline-block w-px h-4 bg-border/80 shrink-0" />

        <div className="text-muted-foreground whitespace-nowrap text-xs flex items-center">
          Đang hiển thị <strong className="font-mono font-semibold text-foreground mx-1">{startItem}</strong> -{" "}
          <strong className="font-mono font-semibold text-foreground mx-1">{endItem}</strong> trên{" "}
          <strong className="font-mono font-semibold text-foreground mx-1">{totalItems}</strong> {itemLabel}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          variant="outline"
          size="sm"
          disabled={safePage <= 1}
          onClick={() => onPageChange(1)}
          className="h-8 w-8 p-0 rounded-lg cursor-pointer disabled:opacity-30 transition-opacity"
          title="Trang đầu"
        >
          <ChevronsLeftIcon className="w-3.5 h-3.5" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
          className="h-8 px-2.5 text-xs font-medium rounded-lg gap-1 cursor-pointer disabled:opacity-30 transition-opacity"
          title="Trang trước"
        >
          <ChevronLeftIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Trước</span>
        </Button>

        <div className="flex items-center gap-1 mx-0.5">
          {pageNumbers.map((p) => (
            <Button
              key={p}
              variant={p === safePage ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(p)}
              className={cn(
                "h-8 min-w-[32px] px-2 text-xs font-mono font-semibold rounded-lg cursor-pointer transition-all",
                p === safePage && "pointer-events-none shadow-xs"
              )}
            >
              {p}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
          className="h-8 px-2.5 text-xs font-medium rounded-lg gap-1 cursor-pointer disabled:opacity-30 transition-opacity"
          title="Trang sau"
        >
          <span className="hidden sm:inline">Sau</span>
          <ChevronRightIcon className="w-3.5 h-3.5" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(totalPages)}
          className="h-8 w-8 p-0 rounded-lg cursor-pointer disabled:opacity-30 transition-opacity"
          title="Trang cuối"
        >
          <ChevronsRightIcon className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
