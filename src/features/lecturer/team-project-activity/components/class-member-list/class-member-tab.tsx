"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { ClassSummaryCards } from "./class-summary-cards";
import { MemberFilterBar } from "./member-filter-bar";
import { TeamMemberCard } from "./team-member-card";
import { MemberTable } from "./member-table";
import { AssignLeaderDialog } from "./assign-leader-dialog";
import { ImportExcelDialog } from "./import-excel-dialog";
import { ExportExcelDialog } from "./export-excel-dialog";
import { MOCK_MEMBERS, MOCK_PROJECTS } from "../../data/mock-team-projects";
import type { TeamMember } from "../../types/team-project";

interface ClassMemberTabProps {
  courseId: string;
}

export function ClassMemberTab({ courseId }: ClassMemberTabProps) {
  // State
  const [members, setMembers] = useState<TeamMember[]>(MOCK_MEMBERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"teams" | "table">("teams");
  
  // Dialog state
  const [assignLeaderMember, setAssignLeaderMember] = useState<TeamMember | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Derived data
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      // Search
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        m.fullName.toLowerCase().includes(searchLower) ||
        m.email.toLowerCase().includes(searchLower) ||
        m.studentId.toLowerCase().includes(searchLower);
        
      // Role
      const matchesRole = roleFilter === "all" || m.role === roleFilter;
      
      // Status
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "has-team" && m.groupId !== null) ||
        (statusFilter === "no-team" && m.groupId === null);
        
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [members, searchQuery, roleFilter, statusFilter]);

  // Handlers
  const handleAssignLeaderConfirm = () => {
    if (!assignLeaderMember || !assignLeaderMember.groupId) return;
    
    setMembers(prev => prev.map(m => {
      // If same group
      if (m.groupId === assignLeaderMember.groupId) {
        if (m.id === assignLeaderMember.id) {
          return { ...m, role: "Leader" }; // New leader
        } else if (m.role === "Leader") {
          return { ...m, role: "Member" }; // Old leader becomes member
        }
      }
      return m;
    }));
    
    toast.success(`Đã đặt ${assignLeaderMember.fullName} làm trưởng nhóm!`);
    setAssignLeaderMember(null);
  };

  return (
    <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full">
      <ClassSummaryCards members={members} projects={MOCK_PROJECTS} />
      
      <MemberFilterBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExportClick={() => setIsExportOpen(true)}
        onImportClick={() => setIsImportOpen(true)}
      />
      
      <div className="flex-1 min-h-0">
        {viewMode === "teams" ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-12">
            {MOCK_PROJECTS.map(project => {
              // Get filtered members for this team
              const teamMembers = filteredMembers.filter(m => m.groupId === project.id);
              
              // To show the team even if only some members match the filter, 
              // we can pass the filtered members to the project object
              const filteredProject = {
                ...project,
                members: teamMembers
              };
              
              // Only render if the team has members matching the filter, OR if no filters are applied
              const hasFilters = searchQuery || roleFilter !== "all" || statusFilter !== "all";
              if (hasFilters && teamMembers.length === 0) return null;
              
              return (
                <TeamMemberCard 
                  key={project.id} 
                  courseId={courseId} 
                  project={filteredProject}
                  onAssignLeader={setAssignLeaderMember}
                />
              );
            })}
            
            {/* Show unassigned students if they match filters */}
            {filteredMembers.some(m => !m.groupId) && (
              <div className="bg-card rounded-xl border border-dashed border-danger/30 overflow-hidden col-span-1 xl:col-span-2">
                <div className="p-4 border-b bg-danger/5">
                  <h3 className="font-bold text-lg text-danger">Chưa có nhóm</h3>
                  <p className="text-sm text-muted-foreground">Những sinh viên chưa được xếp vào nhóm nào</p>
                </div>
                <div className="p-0 overflow-x-auto">
                  <MemberTable 
                    members={filteredMembers.filter(m => !m.groupId)} 
                    onAssignLeader={() => {}} // Cannot assign leader without a team
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <MemberTable 
            members={filteredMembers} 
            onAssignLeader={setAssignLeaderMember} 
          />
        )}
      </div>

      <AssignLeaderDialog
        isOpen={!!assignLeaderMember}
        onOpenChange={(open) => !open && setAssignLeaderMember(null)}
        member={assignLeaderMember}
        onConfirm={handleAssignLeaderConfirm}
      />
      
      <ImportExcelDialog 
        isOpen={isImportOpen}
        onOpenChange={setIsImportOpen}
      />
      
      <ExportExcelDialog 
        isOpen={isExportOpen}
        onOpenChange={setIsExportOpen}
        courseId={courseId}
      />
    </div>
  );
}
