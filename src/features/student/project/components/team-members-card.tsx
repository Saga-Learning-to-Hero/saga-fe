"use client";

import {
  UsersIcon,
  CrownIcon,
  MailIcon,
  CheckSquareIcon,
  GitGraphIcon,
  GraduationCapIcon,
  SparklesIcon,
} from "lucide-react";
import type { StudentProjectDetails } from "../types/student-project";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TeamMembersCardProps {
  project: StudentProjectDetails;
}

export function TeamMembersCard({ project }: TeamMembersCardProps) {
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
                <Badge variant="outline" className="font-mono text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-bold">
                  {project.groupName}
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                Danh sách 5 thành viên thực hiện đồ án học kỳ {project.semesterCode}
              </CardDescription>
            </div>
          </div>

          <Badge variant="secondary" className="w-fit text-xs font-mono">
            Sĩ số: {project.members.length} sinh viên
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {/* Members List Table / Cards */}
        <div className="space-y-3">
          {project.members.map((member) => {
            const isLeader = member.role === "LEADER";

            return (
              <div
                key={member.id}
                className="p-3.5 rounded-2xl border border-border/70 bg-card/60 hover:bg-muted/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Member Profile info */}
                <div className="flex items-center gap-3 min-w-[240px]">
                  <Avatar className="h-10 w-10 border border-background shadow-xs shrink-0">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                      {member.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-foreground truncate">
                        {member.name}
                      </span>
                      {isLeader && (
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

                {/* Member Metrics & Role Badge */}
                <div className="flex items-center gap-4 text-xs shrink-0">
                  {/* Role Badge */}
                  <Badge
                    className={
                      isLeader
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-0 text-[10px] font-semibold"
                        : "bg-muted text-muted-foreground border-0 text-[10px] font-medium"
                    }
                  >
                    {isLeader ? "Trưởng nhóm (Leader)" : "Thành viên"}
                  </Badge>

                  {/* Tasks count */}
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <CheckSquareIcon className="w-3.5 h-3.5 text-blue-500" />
                    <span>Tasks: <strong className="text-foreground font-mono">{member.tasksCompleted}/{member.tasksAssigned}</strong></span>
                  </div>

                  {/* Traceability Score */}
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <GitGraphIcon className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Score: <strong className="text-emerald-600 font-mono">{member.traceabilityScore}%</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
