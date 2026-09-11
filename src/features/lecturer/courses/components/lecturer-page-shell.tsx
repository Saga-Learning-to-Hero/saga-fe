"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import type { BreadcrumbItem } from "@/components/common/page-breadcrumb";
import { buttonVariants } from "@/components/ui/button";
import { CourseQueryError } from "./course-query-error";
import { cn } from "@/lib/utils";

interface LecturerPageShellProps {
  breadcrumbItems?: BreadcrumbItem[];
  backLink?: { href: string; label: string };
  title?: string;
  description?: ReactNode;
  badges?: ReactNode;
  actions?: ReactNode;
  isLoading?: boolean;
  error?: unknown;
  errorTitle?: string;
  onRetry?: () => void;
  children?: ReactNode;
}

export function LecturerPageShell({
  breadcrumbItems,
  backLink,
  title,
  description,
  badges,
  actions,
  isLoading,
  error,
  errorTitle = "Không tải được dữ liệu",
  onRetry,
  children,
}: LecturerPageShellProps) {
  if (error) {
    return (
      <div className="mx-auto w-full max-w-[1600px] space-y-6 pb-12">
        <CourseQueryError title={errorTitle} error={error} onRetry={onRetry} />
      </div>
    );
  }

  const effectiveBackLink =
    backLink ||
    (breadcrumbItems && breadcrumbItems.length >= 3 && breadcrumbItems[breadcrumbItems.length - 2]?.href
      ? {
        href: breadcrumbItems[breadcrumbItems.length - 2].href as string,
        label: breadcrumbItems[breadcrumbItems.length - 2].label,
      }
      : undefined);

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 pb-12">
      {effectiveBackLink && (
        <div className="-mb-2">
          <Link
            href={effectiveBackLink.href}
            prefetch={true}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-8 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer rounded-xl"
            )}
          >
            <ArrowLeftIcon className="size-3.5" />
            <span>Quay lại {effectiveBackLink.label}</span>
          </Link>
        </div>
      )}

      {title || actions ? (
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-border/80 bg-card/90 p-4 shadow-xs backdrop-blur-md sm:flex-row sm:items-center">
          {isLoading && !title ? (
            <div className="animate-pulse space-y-2">
              <div className="h-5 w-40 rounded bg-muted" />
              <div className="h-4 w-64 rounded bg-muted" />
            </div>
          ) : (
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                {title ? (
                  <h1 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                    {title}
                  </h1>
                ) : null}
                {badges}
              </div>
              {description ? (
                <div className="text-xs text-muted-foreground">{description}</div>
              ) : null}
            </div>
          )}
          {actions ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>
          ) : null}
        </div>
      ) : null}

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-24 animate-pulse rounded-2xl bg-muted/60" />
          <div className="h-48 animate-pulse rounded-2xl bg-muted/60" />
        </div>
      ) : (
        children
      )}
    </div>
  );
}
