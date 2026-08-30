import { FolderKanbanIcon, CheckCircle2Icon, AlertTriangleIcon, UsersIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ManagedProject } from "../types/project-management";

interface ProjectStatsProps {
  projects: ManagedProject[];
}

export function ProjectStats({ projects }: ProjectStatsProps) {
  const totalProjects = projects.length;
  const fullyConnected = projects.filter(
    (p) => p.jira.status === "CONNECTED" && p.github.status === "CONNECTED"
  ).length;
  const withWarnings = projects.filter(
    (p) => p.jira.status !== "CONNECTED" || p.github.status !== "CONNECTED"
  ).length;
  const totalStudents = projects.reduce((acc, p) => acc + p.members.length, 0);

  const stats = [
    {
      label: "Tổng nhóm đồ án",
      value: totalProjects,
      sub: "Trong các kỳ học đang quản lý",
      icon: FolderKanbanIcon,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Tích hợp hoàn tất",
      value: fullyConnected,
      sub: "Đã kết nối cả Jira & GitHub",
      icon: CheckCircle2Icon,
      color: "text-success",
      bg: "bg-success-muted",
    },
    {
      label: "Cảnh báo Webhook",
      value: withWarnings,
      sub: "Chưa kết nối hoặc mất tín hiệu",
      icon: AlertTriangleIcon,
      color: withWarnings > 0 ? "text-warning" : "text-success",
      bg: withWarnings > 0 ? "bg-warning-muted" : "bg-success-muted",
    },
    {
      label: "Sinh viên tham gia",
      value: totalStudents,
      sub: "Thuộc các nhóm đồ án",
      icon: UsersIcon,
      color: "text-info",
      bg: "bg-info-muted",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <Card
            key={item.label}
            className="rounded-2xl border border-border shadow-xs hover:shadow-sm transition-all duration-150"
          >
            <CardContent className="p-4.5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                <p className="text-2xl font-bold text-foreground tracking-tight">{item.value}</p>
                <p className="text-[11px] text-muted-foreground/80">{item.sub}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${item.bg}`}>
                <Icon className={`w-5 h-5 ${item.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
