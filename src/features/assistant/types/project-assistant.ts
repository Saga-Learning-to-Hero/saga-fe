export type AssistantKeySource = "TEAM" | "COURSE" | "PLATFORM" | "UNAVAILABLE" | "UNKNOWN";
export type AssistantAnswerSource = "AI" | "FALLBACK" | "UNKNOWN";
export type AssistantMessageRole = "USER" | "ASSISTANT" | "UNKNOWN";
export type AssistantCitationKind = "TASK" | "COMMIT" | "MEMBER" | "DELAY_CASE" | "UNKNOWN";

export interface AssistantStatus {
  enabled: boolean;
  aiConfigured: boolean;
  keySource: AssistantKeySource;
  dailyLimit: number | null;
  usedToday: number | null;
  remainingToday: number | null;
}

export interface AssistantConversation {
  id: string;
  projectId: string;
  title: string;
  createdAt: string | null;
  lastMessageAt: string | null;
}

export interface AssistantCitation {
  kind: AssistantCitationKind;
  id: string | null;
  label: string;
  taskId: string | null;
  sha: string | null;
}

export interface AssistantFeedback {
  helpful: boolean;
  comment: string | null;
  at: string | null;
}

export interface AssistantMessage {
  id: string;
  conversationId: string;
  role: AssistantMessageRole;
  content: string;
  createdAt: string | null;
  answerSource: AssistantAnswerSource | null;
  insufficientData: boolean;
  outOfScope: boolean;
  verified: boolean;
  removedCitationCount: number;
  citations: AssistantCitation[];
  followUpQuestions: string[];
  fallbackReason: string | null;
  feedback: AssistantFeedback | null;
}

export interface AssistantAskResult {
  question: AssistantMessage;
  answer: AssistantMessage;
}

const KEY_SOURCES = new Set<AssistantKeySource>(["TEAM", "COURSE", "PLATFORM", "UNAVAILABLE"]);
const ANSWER_SOURCES = new Set<AssistantAnswerSource>(["AI", "FALLBACK"]);
const MESSAGE_ROLES = new Set<AssistantMessageRole>(["USER", "ASSISTANT"]);
const CITATION_KINDS = new Set<AssistantCitationKind>(["TASK", "COMMIT", "MEMBER", "DELAY_CASE"]);

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function asTrimmedString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function normalizeKeySource(value: unknown): AssistantKeySource {
  const normalized = asTrimmedString(value)?.toUpperCase();
  if (normalized && KEY_SOURCES.has(normalized as AssistantKeySource)) {
    return normalized as AssistantKeySource;
  }
  return normalized ? "UNKNOWN" : "UNKNOWN";
}

export function normalizeAnswerSource(value: unknown): AssistantAnswerSource | null {
  const normalized = asTrimmedString(value)?.toUpperCase();
  if (!normalized) return null;
  if (ANSWER_SOURCES.has(normalized as AssistantAnswerSource)) {
    return normalized as AssistantAnswerSource;
  }
  return "UNKNOWN";
}

export function normalizeMessageRole(value: unknown): AssistantMessageRole {
  const normalized = asTrimmedString(value)?.toUpperCase();
  if (normalized && MESSAGE_ROLES.has(normalized as AssistantMessageRole)) {
    return normalized as AssistantMessageRole;
  }
  return "UNKNOWN";
}

export function normalizeCitationKind(value: unknown): AssistantCitationKind {
  const normalized = asTrimmedString(value)?.toUpperCase();
  if (normalized && CITATION_KINDS.has(normalized as AssistantCitationKind)) {
    return normalized as AssistantCitationKind;
  }
  return "UNKNOWN";
}

export function mapCitation(value: unknown): AssistantCitation {
  const raw = asRecord(value);
  return {
    kind: normalizeCitationKind(raw.kind),
    id: asTrimmedString(raw.id),
    label: asTrimmedString(raw.label) ?? "Nguồn",
    taskId: asTrimmedString(raw.taskId),
    sha: asTrimmedString(raw.sha),
  };
}

export function mapFeedback(value: unknown): AssistantFeedback | null {
  if (!value || typeof value !== "object") return null;
  const raw = asRecord(value);
  if (typeof raw.helpful !== "boolean") return null;
  return {
    helpful: raw.helpful,
    comment: asTrimmedString(raw.comment),
    at: asTrimmedString(raw.at),
  };
}

export function mapStatus(value: unknown): AssistantStatus {
  const raw = asRecord(value);
  return {
    enabled: raw.enabled === true,
    aiConfigured: raw.aiConfigured === true,
    keySource: normalizeKeySource(raw.keySource),
    dailyLimit: asNumber(raw.dailyLimit),
    usedToday: asNumber(raw.usedToday),
    remainingToday: asNumber(raw.remainingToday),
  };
}

export function mapConversation(value: unknown): AssistantConversation {
  const raw = asRecord(value);
  return {
    id: asTrimmedString(raw.id) ?? "",
    projectId: asTrimmedString(raw.projectId) ?? "",
    title: asTrimmedString(raw.title) ?? "Cuộc trò chuyện",
    createdAt: asTrimmedString(raw.createdAt),
    lastMessageAt: asTrimmedString(raw.lastMessageAt),
  };
}

export function mapConversations(value: unknown): AssistantConversation[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 20).map(mapConversation).filter((item) => item.id);
}

export function mapMessage(value: unknown): AssistantMessage {
  const raw = asRecord(value);
  const citations = Array.isArray(raw.citations) ? raw.citations.map(mapCitation) : [];
  const followUpQuestions = Array.isArray(raw.followUpQuestions)
    ? raw.followUpQuestions.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
  const removed = asNumber(raw.removedCitationCount);
  return {
    id: asTrimmedString(raw.id) ?? "",
    conversationId: asTrimmedString(raw.conversationId) ?? "",
    role: normalizeMessageRole(raw.role),
    content: typeof raw.content === "string" ? raw.content : "",
    createdAt: asTrimmedString(raw.createdAt),
    answerSource: normalizeAnswerSource(raw.answerSource),
    insufficientData: raw.insufficientData === true,
    outOfScope: raw.outOfScope === true,
    verified: raw.verified === true,
    removedCitationCount: removed && removed > 0 ? removed : 0,
    citations,
    followUpQuestions,
    fallbackReason: asTrimmedString(raw.fallbackReason),
    feedback: mapFeedback(raw.feedback),
  };
}

export function mapMessages(value: unknown): AssistantMessage[] {
  if (!Array.isArray(value)) return [];
  return value.map(mapMessage).filter((item) => item.id);
}

export function mapAskResult(value: unknown): AssistantAskResult {
  const raw = asRecord(value);
  return {
    question: mapMessage(raw.question),
    answer: mapMessage(raw.answer),
  };
}
