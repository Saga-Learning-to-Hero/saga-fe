"use client";

import { BookOpenIcon, CheckSquareIcon, GitGraphIcon, PieChartIcon } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

export default function StudentDashboardPage() {
  const { user } = useAuthStore();
  const displayName = user?.name ?? "Sinh viên";

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Dashboard sinh viên</p>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Xin chào, {displayName.split(" ").at(-1)} 👋</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Theo dõi tiến độ nhiệm vụ và mức đóng góp dự án của bạn.</p>
      </div>

      {/* Placeholder KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: CheckSquareIcon, label: "Nhiệm vụ hoàn thành", value: "12 / 18", color: "bg-success-muted text-success" },
          { icon: GitGraphIcon, label: "Commits GitHub", value: "34", color: "bg-primary/10 text-primary" },
          { icon: PieChartIcon, label: "Mức đóng góp", value: "27%", color: "bg-info-muted text-info" },
          { icon: BookOpenIcon, label: "Sprint hiện tại", value: "Sprint 3", color: "bg-warning-muted text-warning" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-saga-xs">
            <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${color}`}>
              <Icon className="size-5" />
            </span>
            <div>
              <strong className="block text-lg font-bold">{value}</strong>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Coming soon */}
      <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-border bg-card">
        <div className="text-center px-4">
          <span className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
            <BookOpenIcon className="size-6" />
          </span>
          <h2 className="text-sm font-bold">Nội dung đang được phát triển</h2>
          <p className="mt-1 text-xs text-muted-foreground">Đồ thị truy xuất, lịch sử nhiệm vụ và báo cáo đóng góp sẽ sớm xuất hiện tại đây.</p>
        </div>
      </div>
    </div>
  );
}
