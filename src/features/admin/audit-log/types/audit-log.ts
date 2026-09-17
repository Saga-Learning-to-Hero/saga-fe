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
  courseName?: string | null;
  teamId?: string | null;
  teamNo?: number | null;
  teamName?: string | null;
  projectId?: string | null;
  projectName?: string | null;
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
  action: string;      // Chuỗi hành động hoặc "ALL"
  entityType: string;  // Loại đối tượng hoặc "ALL"
  actorUserId: string; // UUID người thực hiện
  entityId: string;    // UUID đối tượng tác động
  fromDate: string;    // Chuỗi ngày YYYY-MM-DD (From Timestamp)
  toDate: string;      // Chuỗi ngày YYYY-MM-DD (To Timestamp)
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
  contextTeamNoSnapshot?: number | null;
  contextTeamNameSnapshot?: string | null;
  contextProjectId?: string | null;
  contextProjectNameSnapshot?: string | null;
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

  const beforeObj = toRecordObject(res.before);
  const afterObj = toRecordObject(res.after);
  const metaObj = toRecordObject(res.metadata);

  // Trích xuất tên Team từ backend snapshot, metadata hoặc before/after nếu có
  const extractedTeamName =
    res.contextTeamNameSnapshot ||
    (metaObj?.teamName as string) ||
    (metaObj?.team_name as string) ||
    (afterObj?.teamName as string) ||
    (beforeObj?.teamName as string) ||
    (metaObj?.groupName as string) ||
    (metaObj?.name && (res.entityType === "TEAM" || res.contextTeamId)
      ? (metaObj.name as string)
      : null);

  // Trích xuất tên Project từ backend snapshot, metadata hoặc before/after nếu có
  const extractedProjectName =
    res.contextProjectNameSnapshot ||
    (metaObj?.projectName as string) ||
    (metaObj?.project_name as string) ||
    (metaObj?.projectKey as string) ||
    (metaObj?.project_key as string) ||
    (afterObj?.projectName as string) ||
    (beforeObj?.projectName as string) ||
    (metaObj?.name && (res.entityType === "PROJECT" || res.contextProjectId)
      ? (metaObj.name as string)
      : null);

  // Trích xuất tên Course từ metadata hoặc before/after nếu có
  const extractedCourseName =
    (metaObj?.courseName as string) ||
    (metaObj?.courseCode as string) ||
    (afterObj?.courseName as string) ||
    (afterObj?.courseCode as string) ||
    (beforeObj?.courseName as string) ||
    (metaObj?.name && (res.entityType === "COURSE" || res.contextCourseId)
      ? (metaObj.name as string)
      : null);

  // Xác định tên đối tượng tác động (Target) với fallback thông minh
  let resolvedTargetName: string | null = null;
  if (upperEntity.includes("USER")) {
    const uName =
      (afterObj?.fullName as string) ||
      (beforeObj?.fullName as string) ||
      (metaObj?.fullName as string) ||
      (metaObj?.userName as string) ||
      (afterObj?.email as string) ||
      (beforeObj?.email as string) ||
      (metaObj?.email as string);
    if (uName) resolvedTargetName = uName;
  } else if (upperEntity.includes("COURSE")) {
    resolvedTargetName = extractedCourseName;
  } else if (upperEntity.includes("SUBJECT")) {
    resolvedTargetName =
      (afterObj?.nameVietnamese as string) ||
      (afterObj?.nameEnglish as string) ||
      (afterObj?.code as string) ||
      (beforeObj?.nameVietnamese as string) ||
      (beforeObj?.code as string) ||
      (metaObj?.name as string);
  } else if (upperEntity.includes("PROJECT")) {
    resolvedTargetName =
      res.contextProjectNameSnapshot ||
      extractedProjectName ||
      (afterObj?.name as string) ||
      (beforeObj?.name as string) ||
      (metaObj?.name as string);
  } else if (upperEntity.includes("TEAM")) {
    resolvedTargetName =
      res.contextTeamNameSnapshot ||
      extractedTeamName ||
      (afterObj?.name as string) ||
      (beforeObj?.name as string) ||
      (metaObj?.name as string);
  }

  const targetName =
    resolvedTargetName ||
    res.contextClassNameSnapshot ||
    res.contextClassCodeSnapshot ||
    (res.entityType || "Hệ thống");

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
    description: `Thao tác [${res.action}] trên ${res.entityType || "thực thể"}: ${targetName}`,
    changes: changes.length > 0 ? changes : undefined,
    rawBefore: formatRawJsonString(res.before),
    rawAfter: formatRawJsonString(res.after),
    rawMetadata: formatRawJsonString(res.metadata),
    context: {
      classId: res.contextClassId,
      classCode: res.contextClassCodeSnapshot,
      className: res.contextClassNameSnapshot,
      courseId: res.contextCourseId,
      courseName: extractedCourseName,
      teamId: res.contextTeamId,
      teamNo: res.contextTeamNoSnapshot ?? (metaObj?.teamNo as number) ?? undefined,
      teamName: extractedTeamName,
      projectId: res.contextProjectId,
      projectName: extractedProjectName,
      source: res.source,
    },
    status: "SUCCESS",
  };
}
