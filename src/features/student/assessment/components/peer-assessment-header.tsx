"use client";

import { UserCheckIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PeerAssessmentHeaderProps {
  teamName?: string;
  courseCode?: string;
}

export function PeerAssessmentHeader({ teamName, courseCode }: PeerAssessmentHeaderProps) {
  return (
    <div className="space-y-4 border-b border-border pb-2">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
          <UserCheckIcon className="size-5" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
              Đánh giá chéo theo Sprint
            </h1>
            {courseCode ? (
              <Badge variant="outline" className="font-mono text-xs">
                {courseCode}
              </Badge>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">
            {teamName
              ? `Đánh giá các thành viên còn lại trong ${teamName}. Giảng viên chỉ xem điểm tổng hợp trên bảng điểm.`
              : "Sinh viên đánh giá đồng đội theo từng Sprint đã hoàn thành."}
          </p>
        </div>
      </div>
    </div>
  );
}
