import { LayoutDashboardIcon } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <LayoutDashboardIcon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Tổng quan hệ thống đánh giá học tập
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Sinh viên", value: "128", color: "text-primary" },
          { label: "Hoạt động", value: "342", color: "text-saga-accent" },
          { label: "Đánh giá", value: "56", color: "text-saga-success" },
        ].map((stat) => (
          <div key={stat.label} className="surface-raised p-5 space-y-1">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="surface-raised p-8 text-center text-muted-foreground">
        <p className="text-sm">
          Nội dung dashboard sẽ được xây dựng trong các sprint tiếp theo.
        </p>
      </div>
    </div>
  );
}
