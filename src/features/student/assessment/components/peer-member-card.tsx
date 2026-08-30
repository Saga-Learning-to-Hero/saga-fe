"use client";

import {
  CrownIcon,
  CheckCircle2Icon,
  ClockIcon,
  StarIcon,
  Edit3Icon,
  LockIcon,
  GitCommitIcon,
  CheckSquareIcon,
  LayersIcon,
} from "lucide-react";
import type { PeerReviewMember, PeerReviewRecord } from "../types/peer-assessment";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PeerMemberCardProps {
  member: PeerReviewMember;
  record?: PeerReviewRecord;
  isSelf: boolean;
  isSprintLocked: boolean;
  onOpenReviewModal: (member: PeerReviewMember) => void;
}

export function PeerMemberCard({
  member,
  record,
  isSelf,
  isSprintLocked,
  onOpenReviewModal,
}: PeerMemberCardProps) {
  const isReviewed = Boolean(record?.isCompleted);

  // Calculate average score if reviewed
  const avgScore = isReviewed && record?.scores
    ? (Object.values(record.scores).reduce((a, b) => a + b, 0) / Object.keys(record.scores).length).toFixed(1)
    : null;

  return (
    <Card
      className={`rounded-2xl border transition-all duration-200 overflow-hidden p-4 sm:p-5 flex flex-col justify-between h-full space-y-4 ${
        isSelf
          ? "bg-muted/30 border-border/60 opacity-80"
          : isReviewed
          ? "bg-card border-emerald-500/30 shadow-xs hover:border-emerald-500/50"
          : "bg-card border-border/80 shadow-xs hover:border-primary/40"
      }`}
    >
      <div className="space-y-3 flex-1 flex flex-col justify-between">
        {/* Top Content: Header & Stats */}
        <div className="space-y-3">
          {/* Top Header: Member Avatar, Name & Status Badge */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="w-10 h-10 border border-background shadow-xs shrink-0">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                  {member.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <h3 className="text-xs sm:text-sm font-bold text-foreground truncate">
                    {member.name}
                  </h3>
                  {member.role === "LEADER" && (
                    <CrownIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  )}
                </div>

                <p className="text-[10px] text-muted-foreground font-mono truncate">
                  MSSV: {member.studentCode}
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="shrink-0">
              {isSelf ? (
                <Badge variant="secondary" className="text-[9px] font-bold px-1.5 py-0.5 gap-1 bg-muted text-muted-foreground">
                  <LockIcon className="w-2.5 h-2.5" />
                  Bản thân
                </Badge>
              ) : isReviewed ? (
                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold px-1.5 py-0.5 gap-1">
                  <CheckCircle2Icon className="w-3 h-3" />
                  Đã đánh giá ({avgScore} ★)
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px] font-bold px-1.5 py-0.5 gap-1">
                  <ClockIcon className="w-3 h-3" />
                  Chưa đánh giá
                </Badge>
              )}
            </div>
          </div>

          {/* Sprint Contribution Stats */}
          <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-muted/40 border border-border/50 text-[11px] font-mono text-center">
            <div>
              <span className="text-[9px] text-muted-foreground flex items-center justify-center gap-0.5">
                <CheckSquareIcon className="w-2.5 h-2.5 text-blue-500" />
                Tasks
              </span>
              <strong className="text-foreground text-xs font-bold block mt-0.5">
                {member.sprintStats.tasksDone}
              </strong>
            </div>

            <div>
              <span className="text-[9px] text-muted-foreground flex items-center justify-center gap-0.5">
                <LayersIcon className="w-2.5 h-2.5 text-emerald-500" />
                Points
              </span>
              <strong className="text-foreground text-xs font-bold block mt-0.5">
                {member.sprintStats.storyPoints} SP
              </strong>
            </div>

            <div>
              <span className="text-[9px] text-muted-foreground flex items-center justify-center gap-0.5">
                <GitCommitIcon className="w-2.5 h-2.5 text-purple-500" />
                Commits
              </span>
              <strong className="text-foreground text-xs font-bold block mt-0.5">
                {member.sprintStats.commitsCount}
              </strong>
            </div>
          </div>
        </div>

        {/* Review Comment Snippet if evaluated or Placeholder hint if not */}
        {isReviewed && record?.comment ? (
          <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-muted-foreground space-y-1 mt-auto">
            <span className="text-[10px] font-bold text-emerald-600 block uppercase">Nhận xét của bạn:</span>
            <p className="line-clamp-2 italic text-foreground text-[11px]">
              &quot;{record.comment}&quot;
            </p>
          </div>
        ) : !isSelf ? (
          <div className="p-2.5 rounded-xl bg-muted/20 border border-dashed border-border/60 text-xs text-muted-foreground space-y-1 mt-auto">
            <span className="text-[10px] font-semibold text-muted-foreground block uppercase">Chưa gửi nhận xét</span>
            <p className="text-[11px] text-muted-foreground/70 italic line-clamp-2">
              Bấm nút bên dưới để chấm điểm &amp; gửi nhận xét cho đồng đội.
            </p>
          </div>
        ) : null}
      </div>

      {/* Action Button */}
      <div className="pt-1 shrink-0">
        {isSelf ? (
          <Button
            type="button"
            disabled
            variant="ghost"
            className="w-full h-8 text-xs font-semibold rounded-xl cursor-not-allowed opacity-60"
          >
            Không thể tự đánh giá
          </Button>
        ) : isSprintLocked ? (
          <Button
            type="button"
            disabled
            variant="outline"
            className="w-full h-8 text-xs font-semibold rounded-xl cursor-not-allowed opacity-60 gap-1"
          >
            <LockIcon className="w-3 h-3" />
            Sprint đang mở (Chưa đóng)
          </Button>
        ) : isReviewed ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenReviewModal(member)}
            className="w-full h-8 text-xs font-bold rounded-xl gap-1.5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
          >
            <Edit3Icon className="w-3.5 h-3.5" />
            Chỉnh sửa đánh giá
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => onOpenReviewModal(member)}
            className="w-full h-8 text-xs font-bold rounded-xl gap-1.5 bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-xs"
          >
            <StarIcon className="w-3.5 h-3.5 fill-current text-amber-300" />
            Đánh giá ngay
          </Button>
        )}
      </div>
    </Card>
  );
}
