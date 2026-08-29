"use client";

import { useState } from "react";
import { CourseDashboardHeader } from "./course-dashboard-header";
import { CourseKpiGrid } from "./course-kpi-grid";
import { ClassProgressChart } from "./class-progress-chart";
import { IntegrationHealthCard } from "./integration-health-card";
import { GroupHealthTable } from "./group-health-table";
import { LecturerAttentionPanel } from "./lecturer-attention-panel";
import { RecentActivityFeed } from "./recent-activity-feed";
import { GroupStatusDonut } from "./group-status-donut";
import { GroupTaskChart } from "./group-task-chart";
import type { CourseDashboardData } from "../types/course-dashboard";

export function LecturerCourseDashboardPage({ initialData }: { initialData: CourseDashboardData }) {
  const data = initialData;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate fetching new data
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6">
      <CourseDashboardHeader course={data.course} onRefresh={handleRefresh} isRefreshing={isRefreshing} />

      <CourseKpiGrid summary={data.summary} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* L/H Col (8/12) */}
        <div className="flex flex-col gap-6 lg:col-span-8">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-saga-xs">
            <ClassProgressChart data={data.weeklyProgress} />
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-saga-xs">
              <GroupTaskChart groups={data.groups} />
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-saga-xs">
              <IntegrationHealthCard integrations={data.integrations} />
            </div>
          </div>

          <GroupHealthTable groups={data.groups} courseId={data.course.id} />
        </div>

        {/* R/H Col: Side Panels (4/12) */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-saga-xs">
            <GroupStatusDonut groups={data.groups} />
          </div>

          <LecturerAttentionPanel alerts={data.alerts} />

          <div className="rounded-2xl border border-border bg-card p-5 shadow-saga-xs">
            <RecentActivityFeed activities={data.recentActivities} />
          </div>
        </div>
      </div>
    </div>
  );
}
