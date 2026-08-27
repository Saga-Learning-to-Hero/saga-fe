"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboardIcon,
  RefreshCwIcon,
  UserCheckIcon,
  ShieldCheckIcon,
  BookOpenIcon,
  ArrowLeftRightIcon,
  GitGraphIcon,
  CheckSquareIcon,
  GraduationCapIcon,
  SparklesIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomSelect } from "@/components/common/custom-select";
import { DashboardKPIsSection } from "@/features/admin/dashboard/components/dashboard-kpis";
import { DashboardChartsSection } from "@/features/admin/dashboard/components/dashboard-charts";
import { WebhookIntegrationSection } from "@/features/admin/dashboard/components/webhook-integration-card";
import { RecentAuditAndQuickActionsSection } from "@/features/admin/dashboard/components/recent-audit-stream";
import { MOCK_DASHBOARD_DATA } from "@/features/admin/dashboard/data/mock-dashboard";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { MOCK_STUDENT_COURSES } from "@/features/student/courses/data/mock-student-courses";
import { StudentDashboardAnalytics } from "@/features/student/dashboard/components/student-dashboard-analytics";

export default function DashboardPage() {
  const router = useRouter();
  const { user, selectedCourse, switchRole } = useAuthStore();
  const [selectedSemester, setSelectedSemester] = useState<string>("FA26");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isStudent = !user?.role || user.role === "STUDENT";
  const activeCourse = selectedCourse || MOCK_STUDENT_COURSES[0];

  const currentData = MOCK_DASHBOARD_DATA[selectedSemester] || MOCK_DASHBOARD_DATA.FA26;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  // ── Render Dashboard Sinh viên với Hệ thống Chart & Analytics ──────────────
  if (isStudent) {
    return (
      <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto pb-12">
        {/* ── Active Course Header Bar ───────────────────────────────── */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start md:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <BookOpenIcon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="font-mono font-bold text-xs bg-primary/10 text-primary border-primary/20">
                  {activeCourse.subjectCode}
                </Badge>
                <Badge variant="secondary" className="font-mono text-xs">
                  Lớp {activeCourse.adminClassCode}
                </Badge>
                <Badge variant="outline" className="font-mono text-xs">
                  Kỳ {activeCourse.semesterCode}
                </Badge>
                {activeCourse.status === "IN_PROGRESS" && (
                  <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-0 text-[10px]">
                    Đang diễn ra
                  </Badge>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                {activeCourse.subjectName}
              </h1>
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <span>Giảng viên hướng dẫn: <strong>{activeCourse.lecturer.fullName}</strong> ({activeCourse.lecturer.email})</span>
              </p>
            </div>
          </div>

          {/* Actions: Change Course & Switch to Admin Demo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/courses")}
              className="h-9 text-xs font-semibold rounded-xl gap-1.5 border-primary/30 text-primary hover:bg-primary/10 cursor-pointer"
            >
              <ArrowLeftRightIcon className="w-3.5 h-3.5" />
              Đổi khóa học
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => switchRole("ADMIN")}
              className="h-9 text-xs text-muted-foreground hover:text-foreground rounded-xl gap-1"
            >
              <ShieldCheckIcon className="w-3.5 h-3.5" />
              Admin View
            </Button>
          </div>
        </div>

        {/* ── Student Analytics Dashboard (KPIs, Charts & Role Controls) ──── */}
        <StudentDashboardAnalytics initialRole="LEADER" />

        {/* ── Quick Links ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <Link href="/graph">
            <div className="p-4 rounded-2xl bg-card border border-border/70 hover:border-primary/40 transition-all cursor-pointer space-y-2 group shadow-xs">
              <GitGraphIcon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-sm text-foreground">Đồ thị truy xuất SAGA</h4>
              <p className="text-xs text-muted-foreground">Xem cây truy xuất công việc, commit và yêu cầu.</p>
            </div>
          </Link>

          <Link href="/tasks">
            <div className="p-4 rounded-2xl bg-card border border-border/70 hover:border-blue-500/40 transition-all cursor-pointer space-y-2 group shadow-xs">
              <CheckSquareIcon className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-sm text-foreground">Nhiệm vụ của tôi</h4>
              <p className="text-xs text-muted-foreground">Quản lý danh sách task đồng bộ từ Jira.</p>
            </div>
          </Link>

          <Link href="/assessment">
            <div className="p-4 rounded-2xl bg-card border border-border/70 hover:border-emerald-500/40 transition-all cursor-pointer space-y-2 group shadow-xs">
              <GraduationCapIcon className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-sm text-foreground">Đánh giá của tôi</h4>
              <p className="text-xs text-muted-foreground">Xem kết quả đánh giá thành viên và giảng viên.</p>
            </div>
          </Link>

          <Link href="/contribution">
            <div className="p-4 rounded-2xl bg-card border border-border/70 hover:border-amber-500/40 transition-all cursor-pointer space-y-2 group shadow-xs">
              <SparklesIcon className="w-6 h-6 text-amber-500 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-sm text-foreground">Mức đóng góp</h4>
              <p className="text-xs text-muted-foreground">Biểu đồ đo lường mức độ đóng góp cá nhân.</p>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  // ── Render Admin Dashboard khi User role là ADMIN ─────────────────
  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <LayoutDashboardIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground tracking-tight">
                  Trung tâm điều hành SAGA (Admin)
                </h1>
                <Badge className="bg-success-muted text-success border-0 text-[10px] font-semibold">
                  Hệ thống sẵn sàng
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Giám sát thời gian thực tiến độ đồ án, chỉ số Traceability và trạng thái tích hợp Webhook Jira / GitHub.
              </p>
            </div>
          </div>
        </div>

        {/* Top Controls: Semester Selector & Role Switcher */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              switchRole("STUDENT");
              router.push("/courses");
            }}
            className="h-9 text-xs font-semibold rounded-xl gap-1.5 border-info-muted text-info hover:bg-info-muted/30 cursor-pointer"
          >
            <UserCheckIcon className="w-3.5 h-3.5" />
            Xem Giao diện Sinh viên
          </Button>

          <div className="w-48">
            <CustomSelect
              value={selectedSemester}
              onChange={(val) => setSelectedSemester(val)}
              options={[
                { value: "FA26", label: "Fall 2026 (FA26)", subLabel: "Đang diễn ra" },
                { value: "SU26", label: "Summer 2026 (SU26)", subLabel: "Đã hoàn thành" },
                { value: "SP27", label: "Spring 2027 (SP27)", subLabel: "Sắp diễn ra" },
              ]}
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-9 gap-1.5 text-xs font-semibold rounded-xl cursor-pointer shrink-0"
          >
            <RefreshCwIcon className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* 1. KPIs Section */}
      <DashboardKPIsSection kpis={currentData.kpis} />

      {/* 2. Charts Section */}
      <DashboardChartsSection />

      {/* 3. Webhook & Integration Section */}
      <WebhookIntegrationSection
        integrations={currentData.integrations}
        unconnectedGroups={currentData.unconnectedGroups}
      />

      {/* 4. Recent Audit Logs & Quick Actions */}
      <RecentAuditAndQuickActionsSection />
    </div>
  );
}
