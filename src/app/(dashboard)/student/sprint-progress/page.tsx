"use client";

import { SprintProgressView } from "@/features/student/sprint-progress/components/sprint-progress-view";
import { Suspense } from "react";

export default function StudentSprintProgressPage() {
  return (
    <Suspense fallback={<div className="min-h-48 animate-pulse rounded-2xl bg-muted" />}>
      <SprintProgressView />
    </Suspense>
  );
}
