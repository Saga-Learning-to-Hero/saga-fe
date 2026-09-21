import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  GitCommitIcon,
  GraduationCapIcon,
  Link2Icon,
  UsersIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDashboardPercent } from "../lib/dashboard-format";
import type { AdminDashboardKpis } from "../types/dashboard";

interface DashboardKPIsProps {
  kpis: AdminDashboardKpis;
}

export function DashboardKPIsSection({ kpis }: DashboardKPIsProps) {
  const growth = kpis.studentsGrowthPercentage;
  const GrowthIcon = growth !== null && growth < 0
    ? ArrowDownRightIcon
    : ArrowUpRightIcon;

  return (
    <section
      aria-label="Chỉ số tổng quan học kỳ"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      <MetricCard
        icon={<UsersIcon className="size-5" />}
        iconClassName="bg-primary/10 text-primary"
        title="Sinh viên đang học"
        value={kpis.totalStudents.toLocaleString("vi-VN")}
        detail={
          growth === null ? (
            "Chưa có học kỳ trước để đối chiếu"
          ) : (
            <span
              className={
                growth < 0
                  ? "inline-flex items-center gap-1 text-danger"
                  : "inline-flex items-center gap-1 text-success"
              }
            >
              <GrowthIcon className="size-3.5" />
              {formatDashboardPercent(Math.abs(growth))} so với {kpis.comparedSemesterCode}
            </span>
          )
        }
      />

      <MetricCard
        icon={<GraduationCapIcon className="size-5" />}
        iconClassName="bg-info-muted text-info"
        title="Lớp học phần"
        value={kpis.totalCourses.toLocaleString("vi-VN")}
        detail={`${kpis.totalTeams.toLocaleString("vi-VN")} nhóm đồ án`}
      />

      <MetricCard
        icon={<Link2Icon className="size-5" />}
        iconClassName="bg-success-muted text-success"
        title="Nhóm đã kết nối"
        value={`${kpis.connectedTeamsCount}/${kpis.totalTeams}`}
        detail={`${formatDashboardPercent(kpis.connectedTeamsRate)} có đủ Jira và GitHub`}
      />

      <MetricCard
        icon={<GitCommitIcon className="size-5" />}
        iconClassName="bg-warning-muted text-warning"
        title="Tỷ lệ commit liên kết task"
        value={formatDashboardPercent(kpis.traceabilityRate)}
        detail={`${kpis.totalCommitsSynced.toLocaleString("vi-VN")} commits · ${kpis.totalJiraTasksSynced.toLocaleString("vi-VN")} Jira tasks`}
      />
    </section>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  iconClassName: string;
  title: string;
  value: string;
  detail: React.ReactNode;
}

function MetricCard({
  icon,
  iconClassName,
  title,
  value,
  detail,
}: MetricCardProps) {
  return (
    <Card className="rounded-2xl border-border/80 bg-card shadow-xs">
      <CardContent className="flex min-h-32 items-start justify-between gap-4 p-4">
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p className="font-mono text-2xl font-extrabold tracking-tight text-foreground">
            {value}
          </p>
          <div className="text-[11px] leading-4 text-muted-foreground">
            {detail}
          </div>
        </div>
        <div
          className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${iconClassName}`}
        >
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
