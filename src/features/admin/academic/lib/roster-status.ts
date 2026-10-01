import type { CourseRosterEntry, RosterEnrollmentStatus } from "../types/course-roster-types";

export function normalizeRosterStatus(value?: string | null): string {
  return (value ?? "").trim().toUpperCase();
}

export function isActiveEnrollment(
  entry: Pick<CourseRosterEntry, "enrollmentStatus" | "status">
): boolean {
  const enrollmentStatus = normalizeRosterStatus(entry.enrollmentStatus);
  if (enrollmentStatus) return enrollmentStatus === "ACTIVE";
  return entry.status === "ENROLLED";
}

export function isWithdrawnEnrollment(
  entry: Pick<CourseRosterEntry, "enrollmentStatus" | "status">
): boolean {
  const enrollmentStatus = normalizeRosterStatus(entry.enrollmentStatus);
  if (enrollmentStatus === "WITHDRAWN" || enrollmentStatus === "COMPLETED") {
    return true;
  }
  return entry.status === "DROPPED";
}

export function isPendingInvitation(
  entry: Pick<CourseRosterEntry, "kind" | "invitationStatus" | "status">
): boolean {
  const invitationStatus = normalizeRosterStatus(entry.invitationStatus);
  if (invitationStatus) {
    return (
      invitationStatus === "PENDING" ||
      invitationStatus === "SENT" ||
      invitationStatus === "FAILED"
    );
  }
  return entry.kind === "INVITATION" || entry.status === "INVITED";
}

export function toUiRosterStatus(entry: CourseRosterEntry): RosterEnrollmentStatus {
  if (isWithdrawnEnrollment(entry)) return "DROPPED";
  if (isActiveEnrollment(entry)) return "ENROLLED";
  if (isPendingInvitation(entry)) return "INVITED";
  return "DROPPED";
}

export function canRemoveRosterEntry(entry: CourseRosterEntry): boolean {
  if (isWithdrawnEnrollment(entry)) return false;
  if (normalizeRosterStatus(entry.invitationStatus) === "CANCELLED") return false;
  return isActiveEnrollment(entry) || isPendingInvitation(entry);
}

export function normalizeRosterEntry(entry: CourseRosterEntry): CourseRosterEntry {
  const enrollmentStatus = normalizeRosterStatus(entry.enrollmentStatus) || null;
  const invitationStatus = normalizeRosterStatus(entry.invitationStatus) || null;
  const normalized = {
    ...entry,
    enrollmentStatus,
    invitationStatus,
  };
  return {
    ...normalized,
    status: toUiRosterStatus(normalized),
  };
}
