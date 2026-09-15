import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ContributionViewSkeleton() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 animate-pulse">
      <div className="space-y-4 pb-2 border-b border-border/70">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-muted shrink-0 shadow-xs" />
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-7 w-72 sm:w-96 rounded-lg" />
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-36 rounded-md" />
              </div>
              <Skeleton className="h-3.5 w-80 max-w-full rounded-md" />
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <Skeleton className="h-7 w-36 rounded-full" />
            <Skeleton className="h-7 w-44 rounded-full" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <Skeleton className="h-4 w-48 rounded-md" />
          <Skeleton className="h-3 w-64 rounded-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="rounded-2xl border border-border/80 p-5 shadow-xs">
              <CardContent className="p-0 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-28 rounded-md" />
                    <Skeleton className="h-3 w-20 rounded-md" />
                  </div>
                  <Skeleton className="size-8 rounded-xl" />
                </div>
                <Skeleton className="h-8 w-24 rounded-lg" />
                <Skeleton className="h-3 w-full rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-3 w-72 rounded-md" />
      </div>

      <Card className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-xl bg-amber-500/15 shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-64 rounded-md bg-amber-500/20" />
              <Skeleton className="h-4 w-20 rounded-full bg-amber-500/20" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-amber-500/20 bg-card p-3 space-y-2">
                <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
                  <Skeleton className="h-3.5 w-28 rounded-md" />
                  <Skeleton className="h-3 w-16 rounded-md" />
                </div>
                <Skeleton className="h-3 w-48 rounded-md" />
                <Skeleton className="h-3 w-40 rounded-md" />
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-card p-3 space-y-2">
                <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
                  <Skeleton className="h-3.5 w-28 rounded-md" />
                  <Skeleton className="h-3 w-16 rounded-md" />
                </div>
                <Skeleton className="h-3 w-48 rounded-md" />
                <Skeleton className="h-3 w-40 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl border border-border/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-4 w-44 rounded-md" />
              <Skeleton className="h-3 w-60 rounded-md" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="h-64 flex items-center justify-center">
            <Skeleton className="size-48 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
            <div className="space-y-1">
              <Skeleton className="h-3 w-24 rounded-md" />
              <Skeleton className="h-5 w-28 rounded-md" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-28 rounded-md" />
              <Skeleton className="h-5 w-20 rounded-md" />
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-border/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-4 w-52 rounded-md" />
              <Skeleton className="h-3 w-64 rounded-md" />
            </div>
            <Skeleton className="h-5 w-32 rounded-full" />
          </div>
          <div className="h-64 flex flex-col justify-center gap-3">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
            <div className="space-y-1">
              <Skeleton className="h-3 w-28 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-32 rounded-md" />
              <Skeleton className="h-5 w-20 rounded-md" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="rounded-2xl border border-border/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <Skeleton className="h-5 w-48 rounded-md" />
            <Skeleton className="h-3 w-72 rounded-md" />
          </div>
          <Skeleton className="h-8 w-32 rounded-xl" />
        </div>
        <div className="space-y-2 pt-2">
          <div className="h-10 w-full rounded-xl bg-muted/60" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-border/40">
              <div className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32 rounded-md" />
                  <Skeleton className="h-3 w-20 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-4 w-16 rounded-md" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
