"use client";

import type { ReactNode } from "react";
import { PageBreadcrumb, type BreadcrumbItem } from "@/components/common/page-breadcrumb";
import { CourseQueryError } from "./course-query-error";

interface LecturerPageShellProps {
  breadcrumbItems: BreadcrumbItem[];
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
        <PageBreadcrumb items={breadcrumbItems} />
        <CourseQueryError title={errorTitle} error={error} onRetry={onRetry} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 pb-12">
      <PageBreadcrumb items={breadcrumbItems} />

      {title || actions ? (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6">
          {isLoading && !title ? (
            <div className="animate-pulse space-y-3">
              <div className="h-5 w-40 rounded bg-muted" />
              <div className="h-7 w-72 rounded bg-muted" />
              <div className="h-4 w-56 rounded bg-muted" />
            </div>
          ) : (
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 space-y-2">
                {badges ? <div className="flex flex-wrap items-center gap-2">{badges}</div> : null}
                {title ? (
                  <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">{title}</h1>
                ) : null}
                {description ? (
                  <div className="max-w-3xl text-sm text-muted-foreground">{description}</div>
                ) : null}
              </div>
              {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
            </div>
          )}
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
