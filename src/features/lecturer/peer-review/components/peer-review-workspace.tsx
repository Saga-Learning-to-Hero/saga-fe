"use client";

import { useMemo, useState, type ReactNode } from "react";
import { CustomSelect } from "@/components/common/custom-select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  buildPeerReviewKpis,
  buildRevieweeSummaries,
  filterRevieweeSummaries,
  getPeerReviewMaxScore,
  groupReviewsByReviewee,
  resolveCriteriaColumns,
  resolveMatrixMembers,
} from "../lib/lecturer-peer-review";
import type {
  LecturerPeerReviewItem,
  LecturerPeerReviewRubric,
} from "../types/lecturer-peer-review";
import { PeerReviewSummaryStrip } from "./peer-review-summary-strip";
import { PeerReviewRevieweeList } from "./peer-review-reviewee-list";
import { PeerReviewDetailPanel } from "./peer-review-detail-panel";

interface PeerReviewWorkspaceProps {
  reviews: LecturerPeerReviewItem[];
  rubric: LecturerPeerReviewRubric | null;
  members?: Array<{
    studentProfileId: string;
    fullName: string;
    studentCode?: string | null;
  }>;
  selectedRevieweeId?: string;
  fallbackSprintName?: string;
  rubricError?: boolean;
  filters?: ReactNode;
  onSelectReviewee?: (revieweeId: string) => void;
  onRetryRubric?: () => void;
}

export function PeerReviewWorkspace({
  reviews,
  rubric,
  members = [],
  selectedRevieweeId = "",
  fallbackSprintName = "",
  rubricError = false,
  filters,
  onSelectReviewee,
  onRetryRubric,
}: PeerReviewWorkspaceProps) {
  const [keyword, setKeyword] = useState("");
  const criteria = useMemo(
    () => resolveCriteriaColumns(rubricError ? null : rubric, reviews),
    [reviews, rubric, rubricError]
  );
  const maxScore = getPeerReviewMaxScore(criteria.length);
  const matrixMembers = useMemo(
    () => resolveMatrixMembers(members, reviews),
    [members, reviews]
  );
  const summaries = useMemo(
    () => buildRevieweeSummaries(members, reviews, matrixMembers.length || members.length || undefined),
    [matrixMembers.length, members, reviews]
  );
  const kpis = useMemo(
    () => buildPeerReviewKpis(matrixMembers, reviews, maxScore),
    [matrixMembers, maxScore, reviews]
  );
  const visibleSummaries = useMemo(
    () => filterRevieweeSummaries(summaries, keyword),
    [keyword, summaries]
  );
  const visibleReviews = useMemo(
    () => (selectedRevieweeId ? reviews.filter((review) => review.revieweeId === selectedRevieweeId) : reviews),
    [reviews, selectedRevieweeId]
  );
  const groups = useMemo(() => groupReviewsByReviewee(reviews, summaries), [reviews, summaries]);
  const selectedReviewee = summaries.find((item) => item.id === selectedRevieweeId);

  return (
    <div className="space-y-4">
      {rubricError ? (
        <Card className="flex flex-col gap-2 rounded-2xl border border-dashed border-border/80 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Chưa tải được chi tiết tiêu chí. Vẫn xem được các chỉ số tổng quan.
          </p>
          {onRetryRubric ? (
            <Button size="sm" variant="outline" className="cursor-pointer text-xs" onClick={onRetryRubric}>
              Thử lại
            </Button>
          ) : null}
        </Card>
      ) : null}

      <PeerReviewSummaryStrip kpis={kpis} filters={filters} />

      <div className="space-y-1.5 rounded-2xl border border-border/80 bg-card p-3 shadow-xs lg:hidden">
        <Label htmlFor="peer-review-reviewee" className="text-[11px] font-semibold text-muted-foreground">
          Người được đánh giá
        </Label>
        <CustomSelect
          id="peer-review-reviewee"
          value={selectedRevieweeId}
          onChange={(value) => onSelectReviewee?.(value)}
          options={[
            { value: "", label: "Tổng quan nhóm" },
            ...summaries.map((option) => ({
              value: option.id,
              label: option.name,
              subLabel: option.studentCode || undefined,
            })),
          ]}
        />
      </div>

      <div className="relative z-0 grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="hidden lg:sticky lg:top-28 lg:z-10 lg:block lg:self-start">
          <PeerReviewRevieweeList
            summaries={visibleSummaries}
            selectedRevieweeId={selectedRevieweeId}
            keyword={keyword}
            maxScore={maxScore}
            onKeywordChange={setKeyword}
            onSelectReviewee={(value) => onSelectReviewee?.(value)}
          />
        </div>
        <PeerReviewDetailPanel
          reviews={reviews}
          visibleReviews={visibleReviews}
          groups={groups}
          criteria={criteria}
          maxScore={maxScore}
          selectedRevieweeId={selectedRevieweeId}
          selectedReviewee={selectedReviewee}
          fallbackSprintName={fallbackSprintName}
        />
      </div>
    </div>
  );
}
