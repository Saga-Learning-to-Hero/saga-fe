"use client";

import { ProjectInfoView } from "@/features/student/project/components/project-info-view";
import { Suspense } from "react";

export default function StudentProjectInfoPage() {
  return (
    <Suspense fallback={<div className="min-h-48 animate-pulse rounded-2xl bg-muted" />}>
      <ProjectInfoView />
    </Suspense>
  );
}
