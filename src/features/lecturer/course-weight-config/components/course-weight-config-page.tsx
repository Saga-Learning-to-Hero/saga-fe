"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ChevronRightIcon, SaveIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClassDefaultWeightCard } from "./class-default-weight-card";
import { TeamWeightList } from "./team-weight-list";
import { TeamWeightDialog } from "./team-weight-dialog";
import { createMockCourseWeightConfig } from "../data/mock-course-weight-config";
import type { 
  CourseWeightConfiguration, 
  ContributionCriterion, 
  ContributionWeights 
} from "../types/course-weight-config";
import { isWeightValid } from "../lib/weight-config-utils";
import type { LecturerCourse } from "@/features/lecturer/courses/types/course";
import type { TeamMock } from "../data/mock-course-weight-config";

interface CourseWeightConfigPageProps {
  course: LecturerCourse;
  teams: TeamMock[];
}

export function CourseWeightConfigPage({ course, teams }: CourseWeightConfigPageProps) {
  const [config, setConfig] = useState<CourseWeightConfiguration | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  
  // Dialog states
  const [teamDialogState, setTeamDialogState] = useState<{ isOpen: boolean; teamId: string | null }>({
    isOpen: false,
    teamId: null,
  });

  // Mock loading data
  useEffect(() => {
    const stored = localStorage.getItem(`saga-weight-config-${course.id}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        
        // Migration from old mode to new model (remove applicationMode, rename teamWeights to teamOverrides)
        const migratedConfig = { ...parsed };
        if (parsed.applicationMode !== undefined) {
          delete migratedConfig.applicationMode;
        }
        if (parsed.teamWeights !== undefined) {
          migratedConfig.teamOverrides = parsed.teamWeights;
          delete migratedConfig.teamWeights;
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setConfig(migratedConfig);
      } catch {
        // Ignore
      }
    } else {
      const initial = createMockCourseWeightConfig(course.id);
      setConfig(initial);
    }
  }, [course.id]);

  // Alert on unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  if (!config) return null;

  // --- Handlers ---

  const handleClassWeightChange = (criterion: ContributionCriterion, value: number) => {
    setConfig((prev) => {
      if (!prev) return prev;
      return { 
        ...prev, 
        classWeights: { ...prev.classWeights, [criterion]: value } 
      };
    });
    setIsDirty(true);
  };

  const handleResetClassWeights = () => {
    // Reset to equal distribution
    setConfig((prev) => {
      if (!prev) return prev;
      return { 
        ...prev, 
        classWeights: { CODE: 25, TEST: 25, DOCUMENT: 25, RESEARCH: 25 } 
      };
    });
    setIsDirty(true);
  };

  const handleCustomizeTeam = (teamId: string) => {
    setTeamDialogState({ isOpen: true, teamId });
  };

  const handleApplyTeamWeight = (teamId: string, weights: ContributionWeights) => {
    setConfig((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        teamOverrides: {
          ...prev.teamOverrides,
          [teamId]: {
            teamId,
            weights,
            updatedAt: new Date().toISOString(),
            updatedBy: "Nguyễn Mạnh Cường",
          },
        }
      };
    });
    setIsDirty(true);
    toast.success(`Đã áp dụng cấu hình riêng cho nhóm.`);
  };

  const handleRemoveTeamOverride = (teamId: string) => {
    setConfig((prev) => {
      if (!prev) return prev;
      const newOverrides = { ...prev.teamOverrides };
      delete newOverrides[teamId];
      return {
        ...prev,
        teamOverrides: newOverrides
      };
    });
    setIsDirty(true);
    toast.success(`Đã xóa cấu hình riêng, nhóm sẽ dùng chung cấu hình lớp.`);
  };

  const handleSave = () => {
    if (!isWeightValid(config.classWeights)) {
      toast.error("Trọng số lớp không hợp lệ (tổng phải bằng 100%).");
      return;
    }
    
    const invalidTeams = teams.filter((team) => {
      const teamConfig = config.teamOverrides[team.id];
      return teamConfig && !isWeightValid(teamConfig.weights);
    });

    if (invalidTeams.length > 0) {
      toast.error(`Có ${invalidTeams.length} nhóm có tổng trọng số không hợp lệ.`);
      return;
    }
    
    const newConfig = {
      ...config,
      updatedAt: new Date().toISOString(),
    };
    
    setConfig(newConfig);
    setIsDirty(false);
    localStorage.setItem(`saga-weight-config-${course.id}`, JSON.stringify(newConfig));
    toast.success("Đã lưu cấu hình trọng số thành công.");
  };

  const editingTeamId = teamDialogState.teamId;
  const editingTeamMock = editingTeamId ? teams.find(t => t.id === editingTeamId) : null;
  
  return (
    <div className="flex flex-col h-full bg-background/50 relative">
      {/* Inline Page Header */}
      <div className="shrink-0 p-4 md:p-6 lg:p-8 pb-4 border-b bg-background flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-3">
            <span className="hover:text-foreground cursor-pointer">Khóa học</span>
            <ChevronRightIcon className="w-3.5 h-3.5" />
            <span className="hover:text-foreground cursor-pointer uppercase">{course.code}</span>
            <ChevronRightIcon className="w-3.5 h-3.5" />
            <span className="text-foreground">Cấu hình trọng số</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Cấu hình trọng số đánh giá
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            Thiết lập mức ảnh hưởng của Code, Test, Document và Research. Lớp sẽ có cấu hình mặc định, các nhóm có thể tạo cấu hình riêng nếu cần.
          </p>
        </div>
        
        <div className="flex items-center">
           <Button size="lg" onClick={handleSave} disabled={!isDirty} className="w-full md:w-auto shadow-sm">
             <SaveIcon className="w-4 h-4 mr-2" />
             Lưu thay đổi
           </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <div className="space-y-4">
            <h2 className="text-xl font-bold">1. Cấu hình mặc định của lớp</h2>
            <p className="text-sm text-muted-foreground">Tất cả nhóm sẽ sử dụng cấu hình này nếu chưa có cấu hình riêng.</p>
            <ClassDefaultWeightCard
              weights={config.classWeights}
              onChange={handleClassWeightChange}
              onReset={handleResetClassWeights}
              isDirty={isDirty}
              totalTeams={teams.length}
            />
            <div className="text-sm text-muted-foreground italic px-2">
              Lưu ý: Các thay đổi ở cấu hình lớp cũng cập nhật nhóm đang kế thừa. Nhóm có cấu hình riêng không bị thay đổi.
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h2 className="text-xl font-bold">2. Cấu hình riêng cho từng nhóm</h2>
            <p className="text-sm text-muted-foreground">Nhóm nào không tùy chỉnh sẽ tự động dùng cấu hình lớp.</p>
            <TeamWeightList
              teams={teams}
              teamOverrides={config.teamOverrides}
              classWeights={config.classWeights}
              onCustomizeTeam={handleCustomizeTeam}
              onRemoveOverride={handleRemoveTeamOverride}
            />
          </div>

        </div>
      </div>

      {editingTeamId && editingTeamMock && (
        <TeamWeightDialog
          isOpen={teamDialogState.isOpen}
          onOpenChange={(open) => setTeamDialogState({ ...teamDialogState, isOpen: open })}
          teamId={editingTeamId}
          teamName={editingTeamMock.name}
          projectName={editingTeamMock.projectName}
          initialWeights={config.teamOverrides[editingTeamId]?.weights ?? config.classWeights}
          classWeights={config.classWeights}
          onApply={handleApplyTeamWeight}
        />
      )}
    </div>
  );
}
