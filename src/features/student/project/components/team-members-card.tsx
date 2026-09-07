"use client";

import { UsersIcon, CrownIcon } from "lucide-react";
import type {
  StudentProjectDetails,
  StudentCourseTeamResponse,
} from "../types/student-project";
import type { StudentCourse } from "@/features/student/courses/types/student-course";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TeamMembersCardProps {
  project?: StudentProjectDetails;
  course?: StudentCourse | null;
  teamData?: StudentCourseTeamResponse | null;
}

export function TeamMembersCard({
  course,
  teamData,
}: TeamMembersCardProps) {
  // Hoàn toàn sử dụng dữ liệu từ API GET /api/student/courses/{courseId}/team, không dùng mock data
  const hasTeam = Boolean(
    teamData?.teamId ||
    teamData?.teamName ||
    (teamData?.members && teamData.members.length > 0)
  );

  const members = (teamData?.members || []).map((m) => ({
    id: m.studentCode,
    name: m.fullName,
    studentCode: m.studentCode,
    email: `${m.studentCode.toLowerCase()}@fpt.edu.vn`,
    isLeader: m.role?.toUpperCase() === "LEADER",
  }));

  const groupDisplayName = teamData?.teamName
    ? `Nhóm ${teamData.teamNo || 1} - ${teamData.teamName}`
    : "Chưa có nhóm";

  return (
    <Card className="rounded-2xl border border-border/80 shadow-xs bg-card">
      <CardHeader className="p-5 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <UsersIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-foreground">
                  Thông tin Nhóm & Các Thành viên
                </CardTitle>
                <Badge
                  variant="outline"
                  className={
                    hasTeam
                      ? "font-mono text-xs bg-primary/10 text-primary border-primary/25 font-bold"
                      : "text-xs bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25 font-semibold"
                  }
                >
                  {groupDisplayName}
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                Danh sách thành viên thực hiện đồ án{course?.semesterCode ? ` học kỳ ${course.semesterCode}` : ""}
              </CardDescription>
            </div>
          </div>

          <Badge variant="secondary" className="w-fit text-xs font-mono">
            Sĩ số: {members.length} sinh viên
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {!hasTeam || members.length === 0 ? (
          <div className="py-8 text-center space-y-1.5 border border-dashed border-border/70 rounded-2xl bg-muted/20 px-4">
            <p className="text-xs font-bold text-foreground">Chưa có nhóm</p>
            <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
              Bạn hiện tại chưa được xếp nhóm trong lớp học này. Vui lòng liên hệ Giảng viên bộ môn để được phân nhóm và chỉ định vai trò.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="p-3.5 rounded-2xl border border-border/70 bg-card/60 hover:bg-muted/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Member Profile info */}
                <div className="flex items-center gap-3 min-w-[240px]">
                  <Avatar className="h-10 w-10 border border-background shadow-xs shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                      {member.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-foreground truncate">
                        {member.name}
                      </span>
                      {member.isLeader && (
                        <CrownIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                      <span>MSSV: {member.studentCode}</span>
                      <span>•</span>
                      <span className="truncate">{member.email}</span>
                    </div>
                  </div>
                </div>

                {/* Role Badge */}
                <div className="flex items-center gap-4 text-xs shrink-0">
                  <Badge
                    variant="outline"
                    className={
                      member.isLeader
                        ? "bg-primary/10 text-primary border-primary/25 text-[10px] font-semibold"
                        : "bg-muted text-muted-foreground border-border text-[10px] font-medium"
                    }
                  >
                    {member.isLeader ? "Trưởng nhóm (Leader)" : "Thành viên"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
