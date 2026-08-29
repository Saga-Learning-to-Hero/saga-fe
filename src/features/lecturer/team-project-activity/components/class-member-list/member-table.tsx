import { buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontalIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TeamMember } from "../../types/team-project";
import { getInitials } from "@/components/layout/sidebar/nav-config";

interface MemberTableProps {
  members: TeamMember[];
  onAssignLeader: (member: TeamMember) => void;
}

export function MemberTable({ members, onAssignLeader }: MemberTableProps) {
  return (
    <div className="bg-card rounded-xl border overflow-x-auto">
      <table className="w-full text-sm text-left whitespace-nowrap">
        <thead className="bg-muted/10 text-muted-foreground border-b uppercase text-[10px] tracking-wider font-bold">
          <tr>
            <th className="px-4 py-3 w-10 text-center">
              <Checkbox />
            </th>
            <th className="px-4 py-3">MSSV</th>
            <th className="px-4 py-3">Sinh viên</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Nhóm</th>
            <th className="px-4 py-3">Vai trò</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3 w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {members.map((member) => (
            <tr key={member.id} className="hover:bg-muted/5 transition-colors">
              <td className="px-4 py-3 text-center">
                <Checkbox />
              </td>
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
                {member.groupName ? (
                  <span className="font-medium text-foreground">{member.groupName}</span>
                ) : (
                  <span className="text-muted-foreground italic text-xs">Chưa có nhóm</span>
                )}
              </td>
              <td className="px-4 py-3">
                {member.role === "Leader" ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    Leader
                  </span>
                ) : (
                  <span className="text-muted-foreground text-xs">Member</span>
                )}
              </td>
              <td className="px-4 py-3">
                <Badge variant={member.status === "Active" ? "outline" : "secondary"} className="font-normal">
                  {member.status === "Active" ? "Đang học" : "Đã nghỉ"}
                </Badge>
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
                      disabled={member.role === "Leader" || !member.groupId}
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
          {members.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                Không tìm thấy sinh viên nào phù hợp.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
