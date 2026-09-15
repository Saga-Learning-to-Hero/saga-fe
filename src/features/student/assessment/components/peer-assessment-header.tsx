import { ClockIcon, UserCheckIcon, UsersIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PeerAssessmentHeaderProps {
  teamName?: string;
  courseCode?: string;
  myRole?: string | null;
  sprintName?: string | null;
  sprintStateLabel?: string | null;
  rubricSource?: string | null;
  criteriaCount?: number | null;
  reviewedCount?: number | null;
  candidateCount?: number | null;
}

export function PeerAssessmentHeader({
  teamName,
  courseCode,
  myRole,
  sprintName,
  sprintStateLabel,
  rubricSource,
  criteriaCount,
  reviewedCount,
  candidateCount,
}: PeerAssessmentHeaderProps) {
  const showSummary =
    Boolean(sprintName) ||
    Boolean(rubricSource) ||
    typeof criteriaCount === "number" ||
    typeof candidateCount === "number";

  return (
    <div className="flex flex-col justify-between gap-3.5 rounded-3xl border border-border/70 bg-card/60 p-4 shadow-2xs backdrop-blur-xs sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xs">
          <UserCheckIcon className="size-5" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-extrabold tracking-tight text-foreground sm:text-xl">
              Đánh giá chéo theo Sprint
            </h1>
            {courseCode ? (
              <Badge
                variant="outline"
                className="border-primary/30 bg-primary/10 font-mono text-[11px] font-bold text-primary"
              >
                {courseCode}
              </Badge>
            ) : null}
            {teamName ? (
              <Badge
                variant="secondary"
                className="gap-1 border-border/60 text-[11px] font-medium text-muted-foreground"
              >
                <UsersIcon className="size-3 text-primary" />
                {teamName}
              </Badge>
            ) : null}
          </div>

          {showSummary ? (
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
              {sprintName ? (
                <span>
                  Sprint:{" "}
                  <span className="font-semibold text-foreground">
                    {sprintName}
                  </span>
                  {sprintStateLabel ? ` · ${sprintStateLabel}` : ""}
                </span>
              ) : null}
              {rubricSource ? (
                <span>
                  Nguồn rubric:{" "}
                  <span className="font-semibold text-foreground">
                    {rubricSource}
                  </span>
                </span>
              ) : null}
              {typeof criteriaCount === "number" ? (
                <span>Tiêu chí: {criteriaCount}</span>
              ) : null}
              {typeof candidateCount === "number" ? (
                <span>
                  Thành viên cần đánh giá: {candidateCount}
                  {typeof reviewedCount === "number"
                    ? ` · Đã gửi ${reviewedCount}/${candidateCount}`
                    : ""}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
        {myRole ? (
          <Badge variant="outline" className="text-[11px] font-semibold">
            {myRole.toUpperCase() === "LEADER" ? "Trưởng nhóm" : "Thành viên"}
          </Badge>
        ) : (
          <div className="flex items-center gap-1.5 rounded-xl border border-border/70 bg-muted/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            <ClockIcon className="size-3.5" />
            <span>Cùng quyền chấm</span>
          </div>
        )}
      </div>
    </div>
  );
}
