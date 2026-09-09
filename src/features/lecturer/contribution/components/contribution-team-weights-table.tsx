"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { lecturerCourseTeamPath } from "@/features/lecturer/courses/lib/course-routes";
import type { ContributionConfigMode, ContributionTeamSummary } from "../types/contribution";
import { cn } from "@/lib/utils";

interface ContributionTeamWeightsTableProps {
  courseId: string;
  mode: ContributionConfigMode;
  teams: ContributionTeamSummary[];
}

export function ContributionTeamWeightsTable({
  courseId,
  mode,
  teams,
}: ContributionTeamWeightsTableProps) {
  if (teams.length === 0) {
    return (
      <Card className="rounded-2xl border border-dashed border-border p-8 text-center">
        <p className="text-sm font-semibold">Chưa có nhóm trong lớp học phần</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Hãy phân nhóm bằng Excel trước khi theo dõi trạng thái trọng số theo dự án nhóm.
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-2xl border border-border shadow-xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nhóm</TableHead>
            <TableHead>Dự án nhóm</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team) => {
            const hasProject = Boolean(team.projectId);
            return (
              <TableRow key={team.teamId}>
                <TableCell>
                  <p className="text-sm font-semibold">{team.teamName || `Nhóm ${team.teamNo}`}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">TeamNo {team.teamNo}</p>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {hasProject ? "Đã có dự án nhóm" : "Nhóm chưa có dự án nhóm để thiết lập trọng số."}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      team.configured
                        ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300"
                    }
                  >
                    {team.configured ? "Đã cấu hình" : "Chưa cấu hình"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {hasProject ? (
                    <Link
                      href={lecturerCourseTeamPath(courseId, team.teamId)}
                      prefetch={true}
                      className={cn(buttonVariants({ size: "sm", variant: "outline" }), "text-xs")}
                    >
                      Xem cấu hình
                    </Link>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">
                      {mode === "COURSE" ? "Chỉ xem trạng thái" : "Không mở trang không tồn tại"}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
