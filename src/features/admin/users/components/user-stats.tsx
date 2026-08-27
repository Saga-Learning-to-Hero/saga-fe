import { UsersIcon, UserCheckIcon, ClockIcon, ShieldAlertIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ManagedUser } from "../types/user-management";

interface UserStatsProps {
  users: ManagedUser[];
}

export function UserStats({ users }: UserStatsProps) {
  const totalUsers = users.length;
  const activeCount = users.filter((u) => u.status === "ACTIVE").length;
  const pendingCount = users.filter((u) => u.status === "PENDING").length;
  const bannedCount = users.filter((u) => u.status === "BANNED").length;
  const inactiveCount = users.filter((u) => u.status === "INACTIVE").length;

  const stats = [
    {
      label: "Tổng người dùng",
      value: totalUsers,
      sub: `${users.filter((u) => u.role === "LECTURER").length} Giảng viên · ${users.filter((u) => u.role === "STUDENT").length
        } Sinh viên`,
      icon: UsersIcon,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Đang hoạt động",
      value: activeCount,
      sub: "Đã đăng nhập & tương tác",
      icon: UserCheckIcon,
      color: "text-success",
      bg: "bg-success-muted",
    },
    {
      label: "Chờ kích hoạt",
      value: pendingCount,
      sub: "Đã thêm vào lớp, chưa đăng nhập",
      icon: ClockIcon,
      color: "text-warning",
      bg: "bg-warning-muted",
    },
    {
      label: "Bị khóa / Tạm ngưng",
      value: bannedCount + inactiveCount,
      sub: `${bannedCount} bị khóa · ${inactiveCount} không hoạt động`,
      icon: ShieldAlertIcon,
      color: bannedCount > 0 ? "text-danger" : "text-muted-foreground",
      bg: bannedCount > 0 ? "bg-danger-muted" : "bg-muted",
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
