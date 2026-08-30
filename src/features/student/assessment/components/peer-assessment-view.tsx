"use client";

import { useState, useMemo } from "react";
import {
  CalendarIcon,
  ShieldAlertIcon,
  LockIcon,
  CheckCircle2Icon,
  SparklesIcon,
} from "lucide-react";
import {
  MOCK_ASSESSMENT_SPRINTS,
  MOCK_TEAM_MEMBERS_ASSESSMENT,
  INITIAL_MOCK_RECORDS,
} from "../data/mock-peer-assessment-data";
import type {
  PeerReviewMember,
  PeerReviewRecord,
} from "../types/peer-assessment";
import { PeerAssessmentHeader } from "./peer-assessment-header";
import { PeerMemberCard } from "./peer-member-card";
import { PeerReviewModal } from "./peer-review-modal";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { Badge } from "@/components/ui/badge";
import { CustomSelect, type CustomSelectOption } from "@/components/common/custom-select";

export function PeerAssessmentView() {
  const authUser = useAuthStore((state) => state.user);
  const currentUserStudentCode = authUser?.studentCode || "HE170504";

  // Select Sprint state (Default: Sprint 2 - COMPLETED)
  const [selectedSprintId, setSelectedSprintId] = useState<string>("sprint-02");
  const selectedSprint = useMemo(() => {
    return (
      MOCK_ASSESSMENT_SPRINTS.find((s) => s.id === selectedSprintId) ||
      MOCK_ASSESSMENT_SPRINTS[0]
    );
  }, [selectedSprintId]);

  const isSprintLocked = selectedSprint.status !== "COMPLETED";

  const sprintOptions: CustomSelectOption[] = useMemo(() => {
    return MOCK_ASSESSMENT_SPRINTS.map((s) => ({
      value: s.id,
      label: `${s.name} (${s.status === "COMPLETED" ? "Đã đóng ✓" : "Đang mở ⏳"})`,
      subLabel: s.status === "COMPLETED" ? "Đã hoàn thành · Mở Form đánh giá chéo" : "Đang diễn ra · Chưa đóng sprint",
    }));
  }, []);

  // Records state
  const [records, setRecords] = useState<PeerReviewRecord[]>(INITIAL_MOCK_RECORDS);

  // Modal State
  const [targetMemberForModal, setTargetMemberForModal] = useState<PeerReviewMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Other team members to review (excluding self)
  const membersToReview = useMemo(() => {
    return MOCK_TEAM_MEMBERS_ASSESSMENT.filter(
      (m) => m.studentCode !== currentUserStudentCode
    );
  }, [currentUserStudentCode]);

  // Overall evaluation progress
  const completedReviewsCount = useMemo(() => {
    return membersToReview.filter((member) => {
      const rec = records.find(
        (r) =>
          r.sprintId === selectedSprintId &&
          r.targetStudentCode === member.studentCode
      );
      return rec?.isCompleted;
    }).length;
  }, [membersToReview, records, selectedSprintId]);

  // Handler open modal
  const handleOpenReviewModal = (member: PeerReviewMember) => {
    if (isSprintLocked) return;
    setTargetMemberForModal(member);
    setIsModalOpen(true);
  };

  const handleSaveRecord = (savedRecord: PeerReviewRecord) => {
    setRecords((prev) => {
      const exists = prev.some(
        (r) =>
          r.sprintId === savedRecord.sprintId &&
          r.targetStudentCode === savedRecord.targetStudentCode &&
          r.evaluatorStudentCode === savedRecord.evaluatorStudentCode
      );
      if (exists) {
        return prev.map((r) =>
          r.sprintId === savedRecord.sprintId &&
            r.targetStudentCode === savedRecord.targetStudentCode &&
            r.evaluatorStudentCode === savedRecord.evaluatorStudentCode
            ? savedRecord
            : r
        );
      }
      return [...prev, savedRecord];
    });
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Top Header Banner */}
      <PeerAssessmentHeader
        completedCount={completedReviewsCount}
        totalMembersToReview={membersToReview.length}
        currentSprintName={selectedSprint.name}
      />

      {/* Toolbar: Sprint Selector & Info */}
      <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="space-y-1.5 min-w-[280px] sm:min-w-[380px] md:min-w-[440px]">
              <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                Chọn Sprint để đánh giá chéo:
              </label>

              <CustomSelect
                value={selectedSprintId}
                onChange={(val) => setSelectedSprintId(val)}
                options={sprintOptions}
                placeholder="Chọn Sprint..."
              />
            </div>

            {selectedSprint.status === "COMPLETED" ? (
              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold text-xs gap-1 hidden md:flex self-end mb-0.5">
                <CheckCircle2Icon className="w-3.5 h-3.5" />
                Sprint đã hoàn thành (Mở Form Đánh giá)
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 font-bold text-xs gap-1 hidden md:flex self-end mb-0.5">
                <LockIcon className="w-3.5 h-3.5" />
                Sprint đang mở (Chưa đóng)
              </Badge>
            )}
          </div>

          <div className="text-xs text-muted-foreground text-right hidden lg:block">
            <span className="font-semibold text-foreground">Hạn chót Sprint:</span> {selectedSprint.endDate}
          </div>
        </div>
      </div>

      {/* Warning Notice if selecting ACTIVE or PLANNED sprint */}
      {isSprintLocked && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center gap-3 animate-in fade-in-0 shadow-2xs">
          <ShieldAlertIcon className="w-5 h-5 shrink-0 text-amber-500" />
          <div>
            <strong className="block text-sm font-bold">Sprint này đang diễn ra / Chưa kết thúc!</strong>
            <span>
              Theo quy định, đánh giá chéo đồng đội chỉ được thực hiện sau khi Sprint đã hoàn thành và được Trưởng nhóm đóng chính thức. Vui lòng chọn Sprint 1 hoặc Sprint 2 để tiến hành chấm điểm.
            </span>
          </div>
        </div>
      )}

      {/* Peer Members Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <SparklesIcon className="w-4 h-4 text-purple-500" />
            Danh sách Đồng đội cần Đánh giá ({membersToReview.length} thành viên)
          </h2>
          <span className="text-xs text-muted-foreground font-mono">
            Tự động ẩn bản thân
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-5">
          {membersToReview.map((member) => {
            const record = records.find(
              (r) =>
                r.sprintId === selectedSprintId &&
                r.targetStudentCode === member.studentCode &&
                r.evaluatorStudentCode === currentUserStudentCode
            );

            return (
              <PeerMemberCard
                key={member.id}
                member={member}
                record={record}
                isSelf={false}
                isSprintLocked={isSprintLocked}
                onOpenReviewModal={handleOpenReviewModal}
              />
            );
          })}
        </div>
      </div>

      {/* Review Modal */}
      <PeerReviewModal
        isOpen={isModalOpen}
        targetMember={targetMemberForModal}
        currentSprintName={selectedSprint.name}
        existingRecord={records.find(
          (r) =>
            r.sprintId === selectedSprintId &&
            r.targetStudentCode === targetMemberForModal?.studentCode &&
            r.evaluatorStudentCode === currentUserStudentCode
        )}
        onClose={() => setIsModalOpen(false)}
        onSaveRecord={handleSaveRecord}
      />
    </div>
  );
}
