import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import type { GroupHealth, GroupHealthStatus } from "../types/course-dashboard";

export function GroupHealthTable({ groups }: { groups: GroupHealth[] }) {
  const getStatusBadge = (status: GroupHealthStatus) => {
    switch (status) {
      case "HEALTHY":
        return <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600">Ổn định</Badge>;
      case "WARNING":
        return <Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning-foreground hover:bg-warning/20">Cảnh báo</Badge>;
      case "CRITICAL":
        return <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">Nghiêm trọng</Badge>;
    }
  };

  return (
    <div className="flex flex-col">
      <div className="mb-4">
        <h3 className="text-base font-bold text-foreground">Tiến độ từng nhóm</h3>
        <p className="text-xs text-muted-foreground">Chi tiết hoạt động và đóng góp của sinh viên</p>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-semibold w-[200px]">Nhóm</TableHead>
                <TableHead className="font-semibold text-center">Thành viên</TableHead>
                <TableHead className="font-semibold text-center">Sprint</TableHead>
                <TableHead className="font-semibold w-[150px]">Task</TableHead>
                <TableHead className="font-semibold text-center">Commit (7 ngày)</TableHead>
                <TableHead className="font-semibold text-center">Trạng thái</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <TableRow key={group.id} className="group hover:bg-muted/30">
                  <TableCell>
                    <div className="font-bold text-foreground">{group.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate max-w-[180px]">{group.projectName}</div>
                  </TableCell>
                  <TableCell className="text-center text-sm">{group.memberCount}</TableCell>
                  <TableCell className="text-center text-sm font-medium">{group.currentSprint}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{group.tasksCompleted}/{group.totalTasks}</span>
                        <span className="text-muted-foreground">{Math.round((group.tasksCompleted / group.totalTasks) * 100)}%</span>
                      </div>
                      <Progress value={(group.tasksCompleted / group.totalTasks) * 100} className="h-1.5" />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex h-6 items-center justify-center rounded-md bg-muted px-2.5 text-xs font-bold font-mono">
                      {group.commitsLast7Days}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(group.status)}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/lecturer/courses/prn212-01/groups/${group.id}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <ChevronRightIcon className="size-4" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
