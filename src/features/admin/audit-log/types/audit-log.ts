export type AuditActionType =
  | "USER_LOGIN"
  | "USER_LOGOUT"
  | "USER_BAN"
  | "USER_UNBAN"
  | "ROLE_CHANGE"
  | "COURSE_CREATE"
  | "COURSE_UPDATE"
  | "COURSE_DELETE"
  | "STUDENTS_IMPORT"
  | "CLASS_CREATE"
  | "CLASS_UPDATE"
  | "CLASS_DELETE"
  | "SUBJECT_CREATE"
  | "SUBJECT_UPDATE"
  | "SYSTEM_CONFIG_CHANGE"
  | string;

export type AuditCategory = "AUTH_SECURITY" | "ACADEMIC" | "SYSTEM";

export type AuditSeverity = "INFO" | "WARNING" | "CRITICAL";

export interface AuditActor {
  id: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "LECTURER" | "SYSTEM";
  ipAddress: string;
  userAgent?: string;
  studentCode?: string;
  avatar?: string;
}

export interface AuditTarget {
  id?: string;
  name: string;
  type: string;
  code?: string;
}

export interface AuditChangeDetail {
  field: string;
  oldValue: string | null;
  newValue: string | null;
}

export interface AuditContextSnapshot {
  classId?: string | null;
  classCode?: string | null;
  className?: string | null;
  courseId?: string | null;
  teamId?: string | null;
  projectId?: string | null;
  source?: string | null;
}

export interface AuditLogItem {
  id: string;
  requestId: string;
  timestamp: string; // ISO Date string
  actor: AuditActor;
  action: AuditActionType;
  category: AuditCategory;
  severity: AuditSeverity;
  target: AuditTarget;
  description: string;
  changes?: AuditChangeDetail[];
  rawBefore?: string | null;
  rawAfter?: string | null;
  rawMetadata?: string | null;
  context?: AuditContextSnapshot;
  status: "SUCCESS" | "FAILED";
  failureReason?: string;
}

export interface AuditFilterState {
  search: string;
  category: "ALL" | AuditCategory;
  severity: "ALL" | AuditSeverity;
  timeRange: "TODAY" | "7_DAYS" | "30_DAYS" | "ALL";
  action?: string;
  entityType?: string;
}

// -----------------------------------------------------------------------------
// DTOs từ REST API Backend: GET /api/admin/audit-logs
// -----------------------------------------------------------------------------

export interface AdminAuditLogItemResponse {
  id: string;
  occurredAt: string;
  actorUserId: string;
  actorFullNameSnapshot?: string | null;
  actorRoleSnapshot?: string | null;
  actorEmailSnapshot?: string | null;
  actorStudentCodeSnapshot?: string | null;
  contextClassId?: string | null;
  contextClassCodeSnapshot?: string | null;
  contextClassNameSnapshot?: string | null;
  contextCourseId?: string | null;
  contextTeamId?: string | null;
  contextProjectId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
  metadata?: unknown;
  source?: string | null;
  requestId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface AdminAuditLogsListResponse {
  items: AdminAuditLogItemResponse[];
  page: number;
  size: number;
  total: number;
}

export interface GetAdminAuditLogsParams {
  actorUserId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

/**
 * Chuyen doi an toan gia tri bat ky sang chuoi hien thi.
 */
function toDisplayString(val: unknown): string {
  if (val === undefined || val === null) return "";
  if (typeof val === "object") {
    try {
      return JSON.stringify(val);
    } catch {
      return String(val);
    }
  }
  return String(val);
}

/**
 * Phan tich du lieu JSON hoac doi tuong thanh Record<string, unknown>.
 */
function toRecordObject(input: unknown): Record<string, unknown> | null {
  if (!input) return null;
  if (typeof input === "object") {
    return input as Record<string, unknown>;
  }
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    ) {
      try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === "object" && parsed !== null) {
          return parsed as Record<string, unknown>;
        }
      } catch {
        return null;
      }
    }
  }
  return null;
}

/**
 * Dinh dang chuoi JSON tho phuc vu hien thi khoi JSON.
 */
export function formatRawJsonString(input: unknown): string | null {
  if (input === undefined || input === null || input === "") return null;
  if (typeof input === "object") {
    try {
      return JSON.stringify(input, null, 2);
    } catch {
      return String(input);
    }
  }
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    ) {
      try {
        const parsed = JSON.parse(trimmed);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return input;
      }
    }
    return input;
  }
  return String(input);
}

/**
 * Trich xuat cac truong du lieu thay doi tu truoc va sau (Before & After).
 * Ho tro ca chuoi JSON lan doi tuong JavaScript duoc Axios tu dong parse.
 */
export function parseDiffChanges(
  beforeInput?: unknown,
  afterInput?: unknown
): AuditChangeDetail[] {
  if (!beforeInput && !afterInput) return [];

  const beforeObj = toRecordObject(beforeInput);
  const afterObj = toRecordObject(afterInput);

  if (beforeObj || afterObj) {
    const bObj = beforeObj || {};
    const aObj = afterObj || {};
    const allKeys = Array.from(new Set([...Object.keys(bObj), ...Object.keys(aObj)]));
    const changes: AuditChangeDetail[] = [];

    for (const key of allKeys) {
      const oldVal = bObj[key];
      const newVal = aObj[key];

      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes.push({
          field: key,
          oldValue: oldVal !== undefined ? toDisplayString(oldVal) : null,
          newValue: newVal !== undefined ? toDisplayString(newVal) : null,
        });
      }
    }
    if (changes.length > 0) return changes;
  }

  // Fallback neu khong phai dang object / json
  if (beforeInput || afterInput) {
    const oldStr = toDisplayString(beforeInput);
    const newStr = toDisplayString(afterInput);
    if (oldStr || newStr) {
      return [
        {
          field: "Du lieu",
          oldValue: oldStr || null,
          newValue: newStr || null,
        },
      ];
    }
  }
  return [];
}

/**
 * Ánh xạ DTO từ Backend sang mô hình hiển thị UI của bảng Audit Logs.
 */
export function mapAdminAuditLogResponseToItem(
  res: AdminAuditLogItemResponse
): AuditLogItem {
  const role = res.actorRoleSnapshot?.toUpperCase() || "SYSTEM";
  const normalizedRole: "ADMIN" | "LECTURER" | "SYSTEM" =
    role === "ADMIN" ? "ADMIN" : role === "LECTURER" ? "LECTURER" : "SYSTEM";

  let category: AuditCategory = "SYSTEM";
  const upperEntity = (res.entityType || "").toUpperCase();
  const upperAction = (res.action || "").toUpperCase();

  if (
    upperEntity.includes("USER") ||
    upperEntity.includes("AUTH") ||
    upperAction.includes("LOGIN") ||
    upperAction.includes("LOGOUT") ||
    upperAction.includes("BAN") ||
    upperAction.includes("STATUS")
  ) {
    category = "AUTH_SECURITY";
  } else if (
    upperEntity.includes("COURSE") ||
    upperEntity.includes("CLASS") ||
    upperEntity.includes("SUBJECT") ||
    upperEntity.includes("SYLLABUS") ||
    upperEntity.includes("STUDENT") ||
    upperEntity.includes("TEAM") ||
    upperEntity.includes("ROSTER")
  ) {
    category = "ACADEMIC";
  }

  let severity: AuditSeverity = "INFO";
  if (
    upperAction.includes("BAN") ||
    upperAction.includes("DELETE") ||
    upperAction.includes("CRITICAL") ||
    upperAction.includes("FAIL")
  ) {
    severity = "CRITICAL";
  } else if (
    upperAction.includes("UPDATE") ||
    upperAction.includes("CHANGE") ||
    upperAction.includes("OVERRIDE") ||
    upperAction.includes("IMPORT")
  ) {
    severity = "WARNING";
  }

  const targetName =
    res.contextClassNameSnapshot ||
    res.contextClassCodeSnapshot ||
    (res.entityType
      ? `${res.entityType} #${res.entityId ? res.entityId.slice(0, 8) : ""}`
      : res.entityId || "Hệ thống");

  const changes = parseDiffChanges(res.before, res.after);

  return {
    id: res.id,
    requestId: res.requestId || res.id,
    timestamp: res.occurredAt,
    actor: {
      id: res.actorUserId,
      fullName: res.actorFullNameSnapshot || "Hệ thống SAGA",
      email: res.actorEmailSnapshot || "system@saga.local",
      role: normalizedRole,
      ipAddress: res.ipAddress || "—",
      userAgent: res.userAgent || undefined,
      studentCode: res.actorStudentCodeSnapshot || undefined,
    },
    action: res.action,
    category,
    severity,
    target: {
      id: res.entityId,
      name: targetName,
      type: res.entityType || "SYSTEM",
      code: res.contextClassCodeSnapshot || undefined,
    },
    description: `Thao tác [${res.action}] trên đối tượng ${res.entityType || "thực thể"} (ID: ${res.entityId})`,
    changes: changes.length > 0 ? changes : undefined,
    rawBefore: formatRawJsonString(res.before),
    rawAfter: formatRawJsonString(res.after),
    rawMetadata: formatRawJsonString(res.metadata),
    context: {
      classId: res.contextClassId,
      classCode: res.contextClassCodeSnapshot,
      className: res.contextClassNameSnapshot,
      courseId: res.contextCourseId,
      teamId: res.contextTeamId,
      projectId: res.contextProjectId,
      source: res.source,
    },
    status: "SUCCESS",
  };
}
