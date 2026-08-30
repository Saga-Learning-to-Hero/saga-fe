"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ChevronRightIcon, SaveIcon, AlertTriangleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ClassDefaultWeightCard } from "./class-default-weight-card";
import { TeamWeightList } from "./team-weight-list";
import { TeamWeightDialog } from "./team-weight-dialog";
import { createMockCourseWeightConfig } from "../data/mock-course-weight-config";
import type { 
  CourseWeightConfiguration, 
  ContributionCriterion, 
  ContributionWeights,
  WeightApplicationMode 
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
  
  const [modeConfirmState, setModeConfirmState] = useState<{ isOpen: boolean; targetMode: WeightApplicationMode | null }>({
    isOpen: false,
    targetMode: null,
  });

  // Mock loading data
  useEffect(() => {
    const stored = localStorage.getItem(`saga-weight-config-${course.id}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setConfig(parsed);
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

  const handleModeRequest = (newMode: WeightApplicationMode) => {
    if (newMode === config.applicationMode) return;
    setModeConfirmState({ isOpen: true, targetMode: newMode });
  };

  const confirmModeChange = () => {
    if (!modeConfirmState.targetMode) return;
    const targetMode = modeConfirmState.targetMode;

    setConfig((prev) => {
      if (!prev) return prev;

      if (targetMode === "CLASS_WIDE") {
        return {
          ...prev,
          applicationMode: "CLASS_WIDE",
          teamWeights: {},
        };
      }

      const initializedTeamWeights = Object.fromEntries(
        teams.map((team) => [
          team.id,
          prev.teamWeights[team.id] ?? {
            teamId: team.id,
            weights: { ...prev.classWeights },
            updatedAt: new Date().toISOString(),
            updatedBy: "Nguyễn Mạnh Cường",
          },
        ]),
      );

      return {
        ...prev,
        applicationMode: "PER_TEAM",
        teamWeights: initializedTeamWeights,
      };
    });
    setIsDirty(true);
    setModeConfirmState({ isOpen: false, targetMode: null });
  };

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
        teamWeights: {
          ...prev.teamWeights,
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
    toast.success(`Đã áp dụng cấu hình riêng cho team.`);
  };

  const handleSave = () => {
    if (config.applicationMode === "CLASS_WIDE" && !isWeightValid(config.classWeights)) {
      toast.error("Trọng số lớp không hợp lệ (tổng phải bằng 100%).");
      return;
    }
    
    if (config.applicationMode === "PER_TEAM") {
      const missingTeams = teams.filter((team) => !config.teamWeights[team.id]);
      const invalidTeams = teams.filter((team) => {
        const teamConfig = config.teamWeights[team.id];
        return teamConfig && !isWeightValid(teamConfig.weights);
      });

      if (missingTeams.length > 0) {
        toast.error(`Còn ${missingTeams.length} team chưa được cấu hình trọng số.`);
        return;
      }

      if (invalidTeams.length > 0) {
        toast.error(`Có ${invalidTeams.length} team có tổng trọng số không hợp lệ.`);
        return;
      }
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
            Thiết lập mức ảnh hưởng của Code, Test, Document và Research. Bạn có thể áp dụng chung cho toàn lớp hoặc riêng cho từng team.
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
          
          {/* Mode Selector */}
          <div className="bg-card p-5 rounded-xl border border-primary/10 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Chế độ áp dụng</h2>
            <RadioGroup 
              value={config.applicationMode} 
              onValueChange={(v) => handleModeRequest(v as WeightApplicationMode)} 
              className="grid sm:grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem value="CLASS_WIDE" id="mode-class" className="peer sr-only" />
                <Label
                  htmlFor="mode-class"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
                >
                  <span className="font-bold text-base mb-1">Toàn lớp</span>
                  <span className="text-xs text-muted-foreground text-center font-normal">
                    Tất cả các nhóm sử dụng chung một bộ trọng số.
                  </span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="PER_TEAM" id="mode-team" className="peer sr-only" />
                <Label
                  htmlFor="mode-team"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
                >
                  <span className="font-bold text-base mb-1">Từng Team</span>
                  <span className="text-xs text-muted-foreground text-center font-normal">
                    Cấu hình chi tiết trọng số riêng biệt cho từng nhóm.
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {config.applicationMode === "CLASS_WIDE" && (
            <ClassDefaultWeightCard
              weights={config.classWeights}
              onChange={handleClassWeightChange}
              onReset={handleResetClassWeights}
              isDirty={isDirty}
              totalTeams={teams.length}
            />
          )}

          {config.applicationMode === "PER_TEAM" && (
            <div className="pt-2">
              <h2 className="text-xl font-bold mb-4">Danh sách team</h2>
              <TeamWeightList
                teams={teams}
                teamWeights={config.teamWeights}
                onCustomizeTeam={handleCustomizeTeam}
              />
            </div>
          )}

        </div>
      </div>

      {editingTeamId && editingTeamMock && (
        <TeamWeightDialog
          isOpen={teamDialogState.isOpen}
          onOpenChange={(open) => setTeamDialogState({ ...teamDialogState, isOpen: open })}
          teamId={editingTeamId}
          teamName={editingTeamMock.name}
          projectName={editingTeamMock.projectName}
          initialWeights={config.teamWeights[editingTeamId]?.weights}
          onApply={handleApplyTeamWeight}
        />
      )}

      {/* Mode Change Confirmation Dialog */}
      <AlertDialog open={modeConfirmState.isOpen} onOpenChange={(open) => !open && setModeConfirmState({ isOpen: false, targetMode: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangleIcon className="w-5 h-5 text-amber-500" />
              Chuyển đổi chế độ
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn đang chuyển từ chế độ <strong>{config.applicationMode === "CLASS_WIDE" ? "Toàn lớp" : "Từng Team"}</strong> sang <strong>{modeConfirmState.targetMode === "CLASS_WIDE" ? "Toàn lớp" : "Từng Team"}</strong>.
              <br/><br/>
              {modeConfirmState.targetMode === "CLASS_WIDE"
                ? "Các cấu hình riêng của từng team sẽ bị xóa và toàn bộ lớp sẽ sử dụng một bộ trọng số chung."
                : "Cấu hình lớp hiện tại sẽ được sao chép làm giá trị ban đầu cho tất cả team."}
              {" "}Bạn có chắc chắn muốn thay đổi?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction onClick={confirmModeChange}>Xác nhận chuyển</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
