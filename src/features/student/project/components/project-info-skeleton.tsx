"use client";

import { Card } from "@/components/ui/card";

export function ProjectInfoSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs animate-pulse">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-5">
            <div className="space-y-2">
              <div className="h-6 w-48 rounded-xl bg-muted" />
              <div className="h-3.5 w-72 rounded-lg bg-muted/60" />
            </div>
            <div className="h-9 w-32 rounded-xl bg-muted" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-16 rounded-2xl bg-muted/40" />
            <div className="h-16 rounded-2xl bg-muted/40" />
          </div>

          <div className="h-20 rounded-2xl bg-muted/30" />
        </div>
      </Card>

      <Card className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs animate-pulse">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-5">
            <div className="space-y-2">
              <div className="h-6 w-56 rounded-xl bg-muted" />
              <div className="h-3.5 w-80 rounded-lg bg-muted/60" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-28 rounded-2xl bg-muted/40" />
            <div className="h-28 rounded-2xl bg-muted/40" />
          </div>
        </div>
      </Card>
    </div>
  );
}
