"use client";

import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function PageBreadcrumb({ items, className }: PageBreadcrumbProps) {
  return (
    <nav aria-label="Đường dẫn trang" className={cn("min-w-0", className)}>
      <ol className="flex items-center gap-1 overflow-x-auto text-xs text-muted-foreground [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 shrink-0 items-center gap-1">
              {index > 0 ? (
                <ChevronRightIcon className="size-3 shrink-0 text-muted-foreground/70" aria-hidden />
              ) : null}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  prefetch={true}
                  className="max-w-[10rem] truncate transition-colors hover:text-foreground sm:max-w-xs"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    "max-w-[12rem] truncate sm:max-w-sm",
                    isLast ? "font-semibold text-foreground" : ""
                  )}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
