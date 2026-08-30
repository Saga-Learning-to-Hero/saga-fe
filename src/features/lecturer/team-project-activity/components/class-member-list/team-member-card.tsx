import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontalIcon, CrownIcon, ExternalLinkIcon, ClockIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TeamProjectInfo, TeamMember } from "../../types/team-project";
import Link from "next/link";
import { lecturerCourseTeamPath } from "../../lib/team-project-routes";
import { getInitials } from "@/components/layout/sidebar/nav-config";

interface TeamMemberCardProps {
  courseId: string;
  project: TeamProjectInfo;
  onAssignLeader: (member: TeamMember) => void;
}

export function TeamMemberCard({ courseId, project, onAssignLeader }: TeamMemberCardProps) {
  return (
    <div className="bg-card rounded-xl border overflow-hidden">
      <div className="p-4 border-b bg-muted/20 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-lg">{project.teamName}</h3>
            <Badge variant="outline" className="font-normal bg-background">
              {project.members.length} thành viên
            </Badge>
            {project.status === "Đang thực hiện" && (
              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
                Đang thực hiện
              </Badge>
            )}
            {project.status === "Chưa bắt đầu" && (
              <Badge variant="secondary" className="text-muted-foreground">
                Chưa bắt đầu
              </Badge>
            )}
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Project: <span className="text-foreground">{project.projectName}</span>
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
            <span className="flex items-center">
              <CrownIcon className="w-3.5 h-3.5 mr-1 text-amber-500" />
              Leader: {project.members.find(m => m.id === project.leaderId)?.fullName || "Chưa có"}
            </span>
            <span>•</span>
            <span className="flex items-center">
              <ClockIcon className="w-3.5 h-3.5 mr-1" />
              {project.lastSyncAt ? "Hoạt động gần đây" : "Chưa có hoạt động"}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <Link 
            href={lecturerCourseTeamPath(courseId, project.id)}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Xem dự án nhóm
            <ExternalLinkIcon className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
      
      <div className="p-0 overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-muted/5 text-muted-foreground border-b">
            <tr>
              <th className="px-4 py-3 font-medium w-[120px]">MSSV</th>
              <th className="px-4 py-3 font-medium">Họ tên</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium w-[120px]">Vai trò</th>
              <th className="px-4 py-3 font-medium w-[60px]"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {project.members.map((member) => (
              <tr key={member.id} className="hover:bg-muted/5 transition-colors">
                <td className="px-4 py-3 font-mono text-xs">{member.studentId}</td>
                <td className="px-4 py-3 font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                      {getInitials(member.fullName)}
                    </div>
                    {member.fullName}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{member.email}</td>
                <td className="px-4 py-3">
                  {member.role === "Leader" ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20">
                      Leader
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">Member</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger 
                      className={buttonVariants({ variant: "ghost", size: "icon-sm", className: "h-8 w-8" })}
                    >
                      <MoreHorizontalIcon className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => onAssignLeader(member)}
                        disabled={member.role === "Leader"}
                      >
                        Đặt làm trưởng nhóm
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled>Xem thông tin thành viên</DropdownMenuItem>
                      <DropdownMenuItem disabled>Chuyển sang nhóm khác</DropdownMenuItem>
                      <DropdownMenuItem disabled className="text-danger">Xóa khỏi nhóm</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {project.members.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Nhóm chưa có thành viên
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
