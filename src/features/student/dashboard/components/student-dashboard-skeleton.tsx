import { Card, CardContent } from "@/components/ui/card";

export function StudentDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-border/80 bg-card/90 p-4 shadow-xs sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="size-10 shrink-0 rounded-xl bg-muted" />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-5 w-48 rounded-md bg-muted" />
              <div className="h-4 w-20 rounded-md bg-muted" />
              <div className="h-4 w-24 rounded-md bg-muted" />
            </div>
            <div className="h-3 w-64 rounded-md bg-muted" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="h-5 w-32 rounded-md bg-muted" />
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-6 w-28 rounded-md bg-muted" />
            <div className="h-6 w-28 rounded-md bg-muted" />
            <div className="h-4 w-24 rounded-md bg-muted" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="rounded-2xl border border-border/80 shadow-xs">
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-xl bg-muted" />
                  <div className="h-3 w-24 rounded-md bg-muted" />
                </div>
                <div className="h-6 w-20 rounded-md bg-muted" />
                <div className="h-3 w-36 rounded-md bg-muted" />
                <div className="h-1.5 w-full rounded-full bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="h-9 w-full rounded-xl bg-muted/50" />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Card className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-xs lg:col-span-7">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-muted" />
            <div className="space-y-1.5">
              <div className="h-4 w-32 rounded-md bg-muted" />
              <div className="h-3 w-48 rounded-md bg-muted" />
            </div>
          </div>
          <div className="h-60 w-full rounded-xl bg-muted/40" />
        </Card>

        <Card className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-xs lg:col-span-5">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-muted" />
            <div className="space-y-1.5">
              <div className="h-4 w-32 rounded-md bg-muted" />
              <div className="h-3 w-40 rounded-md bg-muted" />
            </div>
          </div>
          <div className="h-60 w-full rounded-xl bg-muted/40" />
        </Card>
      </div>

      <Card className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-xl bg-muted" />
          <div className="space-y-1.5">
            <div className="h-4 w-36 rounded-md bg-muted" />
            <div className="h-3 w-56 rounded-md bg-muted" />
          </div>
        </div>
        <div className="space-y-2 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-border/40 p-3">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-muted" />
                <div className="space-y-1">
                  <div className="h-3.5 w-28 rounded-md bg-muted" />
                  <div className="h-2.5 w-16 rounded-md bg-muted" />
                </div>
              </div>
              <div className="h-4 w-32 rounded-md bg-muted" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
