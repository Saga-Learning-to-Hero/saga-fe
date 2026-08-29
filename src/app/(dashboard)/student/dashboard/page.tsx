"use client";

import { StudentDashboardAnalytics } from "@/features/student/dashboard/components/student-dashboard-analytics";

export default function StudentDashboardPage() {
  return (
    <div className="max-w-[1600px] mx-auto pb-12">
      <StudentDashboardAnalytics initialRole="LEADER" />
    </div>
  );
}
