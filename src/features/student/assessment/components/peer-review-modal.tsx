"use client";

import { useState } from "react";
import {
  XIcon,
  StarIcon,
  SaveIcon,
  CheckCircle2Icon,
  LoaderCircleIcon,
  MessageSquareIcon,
} from "lucide-react";
import type {
  PeerReviewMember,
  PeerReviewRecord,
} from "../types/peer-assessment";
import { MOCK_PEER_CRITERIA } from "../data/mock-peer-assessment-data";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PeerReviewModalProps {
  isOpen: boolean;
  targetMember: PeerReviewMember | null;
  currentSprintName: string;
  existingRecord?: PeerReviewRecord;
  onClose: () => void;
  onSaveRecord: (record: PeerReviewRecord) => void;
}

export function PeerReviewModal({
  isOpen,
  targetMember,
  currentSprintName,
  existingRecord,
  onClose,
  onSaveRecord,
}: PeerReviewModalProps) {
  const [scores, setScores] = useState<Record<string, number>>({
    quality: existingRecord?.scores?.quality || 5,
    punctuality: existingRecord?.scores?.punctuality || 5,
    teamwork: existingRecord?.scores?.teamwork || 5,
    initiative: existingRecord?.scores?.initiative || 4,
  });

  const [comment, setComment] = useState<string>(existingRecord?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>("");

  if (!isOpen || !targetMember) return null;

  const handleStarClick = (criteriaId: string, rating: number) => {
    setScores((prev) => ({ ...prev, [criteriaId]: rating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg("");
    await new Promise((r) => setTimeout(r, 600));

    const finalRecord: PeerReviewRecord = {
      id: existingRecord?.id || `rec-${Date.now()}`,
      sprintId: existingRecord?.sprintId || "sprint-02",
      evaluatorStudentCode: "HE170504",
      targetStudentCode: targetMember.studentCode,
      isCompleted: true,
      scores,
      comment,
      updatedAt: new Date().toISOString(),
    };

    onSaveRecord(finalRecord);

    setIsSubmitting(false);
    setSuccessMsg(`Đã lưu đánh giá chéo cho ${targetMember.name}!`);
    setTimeout(() => {
      setSuccessMsg("");
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-0 duration-200">
      <div className="bg-card border border-border/80 rounded-3xl w-full max-w-xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-border/60 flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border border-background shadow-xs shrink-0">
              <AvatarImage src={targetMember.avatar} alt={targetMember.name} />
              <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
                {targetMember.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div>
              <h3 className="text-base font-bold text-foreground">
                Đánh giá chéo: {targetMember.name}
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                MSSV: {targetMember.studentCode} • {currentSprintName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          {/* Feedback message */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in-0">
              <CheckCircle2Icon className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Criteria Ratings List */}
          <div className="space-y-4">
            {MOCK_PEER_CRITERIA.map((criteria) => {
              const currentRating = scores[criteria.id] || 5;

              return (
                <div
                  key={criteria.id}
                  className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">
                        {criteria.label}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        {criteria.description}
                      </p>
                    </div>

                    {/* Star Selector */}
                    <div className="flex items-center gap-1 shrink-0 pt-1 sm:pt-0">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleStarClick(criteria.id, star)}
                          className="p-1 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <StarIcon
                            className={`w-5 h-5 ${
                              star <= currentRating
                                ? "text-amber-400 fill-amber-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-mono font-bold w-6 text-right ml-1">
                        {currentRating}/5
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feedback Comment Textarea */}
          <div className="space-y-1.5">
            <Label htmlFor="review-comment" className="text-xs font-semibold flex items-center gap-1.5">
              <MessageSquareIcon className="w-3.5 h-3.5 text-purple-500" />
              Nhận xét & Góp ý chân thành cho đồng đội
            </Label>
            <Textarea
              id="review-comment"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Nhập ghi chú khen ngợi hoặc góp ý tích cực cho thành viên này trong Sprint vừa qua..."
              className="text-xs rounded-xl bg-card resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-border/60 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-9 text-xs rounded-xl cursor-pointer"
            >
              Hủy
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9 text-xs font-bold rounded-xl gap-2 cursor-pointer shadow-xs bg-purple-600 hover:bg-purple-700 text-white px-5"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircleIcon className="w-4 h-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <SaveIcon className="w-4 h-4" />
                  Lưu đánh giá chéo
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
