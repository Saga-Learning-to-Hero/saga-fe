import type { ContributionMember } from "../types/contribution";

export function cleanMemberName(fullName: string | null | undefined): string {
  if (!fullName) return "";
  return fullName.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
}

export function getMemberDisplayName(member: { fullName?: string; studentCode?: string }): string {
  const cleaned = cleanMemberName(member.fullName);
  if (cleaned) return cleaned;
  return member.studentCode || "Thành viên";
}

export function calculateTotalSliceScore(members: ContributionMember[]): number {
  if (!Array.isArray(members) || members.length === 0) return 0;
  const total = members.reduce((sum, m) => sum + (Number(m.sliceScore) || 0), 0);
  return Math.round(total * 100) / 100;
}

export function hasPeerReviewAdjustment(members: ContributionMember[]): boolean {
  if (!Array.isArray(members)) return false;
  return members.some((m) => {
    const prScore = Number(m.peerReviewScore);
    const slicePct = Number(m.sliceContributionPercentage);
    const finalPct = Number(m.finalContributionPercentage);
    if (!Number.isNaN(prScore) && prScore !== 1 && prScore > 0) return true;
    if (!Number.isNaN(slicePct) && !Number.isNaN(finalPct) && Math.abs(slicePct - finalPct) >= 0.05) {
      return true;
    }
    return false;
  });
}

export interface MemberWarningGroup {
  studentProfileId: string;
  studentCode: string;
  fullName: string;
  warnings: string[];
  ctaType: "PEER_REVIEW" | "TASK_EVIDENCE" | "GENERAL";
  ctaHref: string;
  ctaLabel: string;
}

export function groupWarningsByMember(
  members: ContributionMember[],
  courseId?: string | null
): MemberWarningGroup[] {
  if (!Array.isArray(members)) return [];

  const courseQuery = courseId ? `?courseId=${encodeURIComponent(courseId)}` : "";

  return members
    .filter((m) => Array.isArray(m.warnings) && m.warnings.length > 0)
    .map((m) => {
      const hasPeerWarning = m.warnings.some((w) =>
        w.toUpperCase().includes("PEER")
      );
      const hasEvidenceWarning = m.warnings.some((w) =>
        w.toUpperCase().includes("EVIDENCE")
      );

      let ctaType: MemberWarningGroup["ctaType"] = "GENERAL";
      let ctaHref = `/student/graph${courseQuery}`;
      let ctaLabel = "Xem đối soát";

      if (hasPeerWarning) {
        ctaType = "PEER_REVIEW";
        ctaHref = `/student/assessment${courseQuery}`;
        ctaLabel = "Đến Đánh giá đồng đẳng";
      } else if (hasEvidenceWarning) {
        ctaType = "TASK_EVIDENCE";
        ctaHref = `/student/sprint-progress${courseQuery}`;
        ctaLabel = "Xem Minh chứng Task";
      }

      return {
        studentProfileId: m.studentProfileId,
        studentCode: m.studentCode,
        fullName: cleanMemberName(m.fullName) || m.studentCode,
        warnings: m.warnings,
        ctaType,
        ctaHref,
        ctaLabel,
      };
    });
}
