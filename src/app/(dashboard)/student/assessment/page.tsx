"use client";

import { PeerAssessmentView } from "@/features/student/assessment/components/peer-assessment-view";
import { Suspense } from "react";

export default function StudentAssessmentPage() {
  return (
    <Suspense fallback={<div className="min-h-48 animate-pulse rounded-2xl bg-muted" />}>
      <PeerAssessmentView />
    </Suspense>
  );
}
