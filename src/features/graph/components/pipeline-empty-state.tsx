"use client";

import Link from "next/link";
import { FolderKanbanIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PipelineEmptyStateProps {
  title: string;
  description: string;
  href?: string;
  action?: string;
  onRetry?: () => void;
}

export function PipelineEmptyState({
  title,
  description,
  href,
  action,
  onRetry,
}: PipelineEmptyStateProps) {
  return (
    <Card className="rounded-2xl border border-dashed border-border/80 p-8 text-center shadow-xs">
      <CardContent className="space-y-3 p-0">
        <FolderKanbanIcon className="mx-auto size-8 text-muted-foreground/50" />
        <h2 className="text-base font-bold">{title}</h2>
        <p className="text-xs text-muted-foreground">{description}</p>
        {href && action ? (
          <Link href={href} prefetch={true} className={cn(buttonVariants({ size: "sm" }), "text-xs")}>
            {action}
          </Link>
        ) : null}
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className={cn(buttonVariants({ size: "sm", variant: "outline" }), "cursor-pointer text-xs")}
          >
            Thử lại
          </button>
        ) : null}
      </CardContent>
    </Card>
  );
}
