export interface DelayCaseTaskRef {
  id: string | null;
  externalKey: string | null;
  title: string | null;
}

export interface DelayCaseStudentRef {
  studentProfileId: string | null;
  userId: string | null;
  fullName: string | null;
  studentCode: string | null;
}

export interface DelayCaseContext {
  projectName: string | null;
  teamId: string | null;
  teamNo: number | null;
  teamName: string | null;
  courseId: string | null;
  courseCode: string | null;
  courseName: string | null;
}

export interface DelayCaseSignals {
  dueDate: string | null;
  startedAt: string | null;
  currentlyBlocked: boolean;
  commitCount: number | null;
  firstCommitAt: string | null;
  lastCommitAt: string | null;
  workSessionCount: number | null;
  firstWorkAt: string | null;
  lastWorkAt: string | null;
  evidenceCount: number | null;
  dueDateChanged: boolean;
  storyPointIncreased: boolean;
  reassignedNearDue: boolean;
  otherOpenTasksNearDue: number | null;
}

export interface DelayCaseDetail {
  id: string;
  projectId: string | null;
  context: DelayCaseContext | null;
  task: DelayCaseTaskRef | null;
  student: DelayCaseStudentRef | null;
  dueDate: string | null;
  openedAt: string | null;
  explanationDueAt: string | null;
  status: string | null;
  category: string | null;
  categoryGroup: string | null;
  explanationNote: string | null;
  blockingTask: DelayCaseTaskRef | null;
  evidenceUrl: string | null;
  explainedAt: string | null;
  signals: DelayCaseSignals | null;
  verification: string | null;
  verificationNote: string | null;
  leaderDecision: string | null;
  leaderComment: string | null;
  leaderReviewedAt: string | null;
  lecturerOutcome: string | null;
  lecturerComment: string | null;
  lecturerReviewedAt: string | null;
  closedAt: string | null;
  closeReason: string | null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function asText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function mapTask(value: unknown): DelayCaseTaskRef | null {
  if (!value || typeof value !== "object") return null;
  const raw = asRecord(value);
  return {
    id: asText(raw.id),
    externalKey: asText(raw.externalKey),
    title: asText(raw.title),
  };
}

export function mapDelayCase(value: unknown): DelayCaseDetail {
  const raw = asRecord(value);
  const contextRaw = raw.context && typeof raw.context === "object" ? asRecord(raw.context) : null;
  const studentRaw = raw.student && typeof raw.student === "object" ? asRecord(raw.student) : null;
  const signalsRaw = raw.signals && typeof raw.signals === "object" ? asRecord(raw.signals) : null;
  return {
    id: asText(raw.id) ?? "",
    projectId: asText(raw.projectId),
    context: contextRaw
      ? {
          projectName: asText(contextRaw.projectName),
          teamId: asText(contextRaw.teamId),
          teamNo: asNumber(contextRaw.teamNo),
          teamName: asText(contextRaw.teamName),
          courseId: asText(contextRaw.courseId),
          courseCode: asText(contextRaw.courseCode),
          courseName: asText(contextRaw.courseName),
        }
      : null,
    task: mapTask(raw.task),
    student: studentRaw
      ? {
          studentProfileId: asText(studentRaw.studentProfileId),
          userId: asText(studentRaw.userId),
          fullName: asText(studentRaw.fullName),
          studentCode: asText(studentRaw.studentCode),
        }
      : null,
    dueDate: asText(raw.dueDate),
    openedAt: asText(raw.openedAt),
    explanationDueAt: asText(raw.explanationDueAt),
    status: asText(raw.status),
    category: asText(raw.category),
    categoryGroup: asText(raw.categoryGroup),
    explanationNote: asText(raw.explanationNote),
    blockingTask: mapTask(raw.blockingTask),
    evidenceUrl: asText(raw.evidenceUrl),
    explainedAt: asText(raw.explainedAt),
    signals: signalsRaw
      ? {
          dueDate: asText(signalsRaw.dueDate),
          startedAt: asText(signalsRaw.startedAt),
          currentlyBlocked: signalsRaw.currentlyBlocked === true,
          commitCount: asNumber(signalsRaw.commitCount),
          firstCommitAt: asText(signalsRaw.firstCommitAt),
          lastCommitAt: asText(signalsRaw.lastCommitAt),
          workSessionCount: asNumber(signalsRaw.workSessionCount),
          firstWorkAt: asText(signalsRaw.firstWorkAt),
          lastWorkAt: asText(signalsRaw.lastWorkAt),
          evidenceCount: asNumber(signalsRaw.evidenceCount),
          dueDateChanged: signalsRaw.dueDateChanged === true,
          storyPointIncreased: signalsRaw.storyPointIncreased === true,
          reassignedNearDue: signalsRaw.reassignedNearDue === true,
          otherOpenTasksNearDue: asNumber(signalsRaw.otherOpenTasksNearDue),
        }
      : null,
    verification: asText(raw.verification),
    verificationNote: asText(raw.verificationNote),
    leaderDecision: asText(raw.leaderDecision),
    leaderComment: asText(raw.leaderComment),
    leaderReviewedAt: asText(raw.leaderReviewedAt),
    lecturerOutcome: asText(raw.lecturerOutcome),
    lecturerComment: asText(raw.lecturerComment),
    lecturerReviewedAt: asText(raw.lecturerReviewedAt),
    closedAt: asText(raw.closedAt),
    closeReason: asText(raw.closeReason),
  };
}

export function safeEvidenceUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:") return url.toString();
  } catch {
    return null;
  }
  return null;
}
