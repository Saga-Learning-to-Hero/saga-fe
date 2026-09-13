"use client";

import { Suspense } from "react";
import { StudentDashboardAnalytics } from "@/features/student/dashboard/components/student-dashboard-analytics";

export default function StudentDashboardPage() {
  return (
    <div className="max-w-[1600px] mx-auto pb-12">
      <Suspense fallback={<div className="min-h-48 animate-pulse rounded-2xl bg-muted" />}>
        <StudentDashboardAnalytics />
      </Suspense>
    </div>
  );
}
