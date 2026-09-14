"use client";

import { Suspense } from "react";
import { StudentDashboardAnalytics } from "@/features/student/dashboard/components/student-dashboard-analytics";
import { StudentDashboardSkeleton } from "@/features/student/dashboard/components/student-dashboard-skeleton";

export default function StudentDashboardPage() {
  return (
    <div className="max-w-[1600px] mx-auto pb-12">
      <Suspense fallback={<StudentDashboardSkeleton />}>
        <StudentDashboardAnalytics />
      </Suspense>
    </div>
  );
}
