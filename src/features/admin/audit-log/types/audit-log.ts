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
  | "SYSTEM_CONFIG_CHANGE";

export type AuditCategory = "AUTH_SECURITY" | "ACADEMIC" | "SYSTEM";

export type AuditSeverity = "INFO" | "WARNING" | "CRITICAL";

export interface AuditActor {
  id: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "LECTURER" | "SYSTEM";
  ipAddress: string;
  userAgent?: string;
  avatar?: string;
}

export interface AuditTarget {
  id?: string;
  name: string;
  type: "USER" | "COURSE" | "CLASS" | "SUBJECT" | "PROJECT" | "SYSTEM";
  code?: string;
}

export interface AuditChangeDetail {
  field: string;
  oldValue: string | null;
  newValue: string | null;
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
  status: "SUCCESS" | "FAILED";
  failureReason?: string;
}

export interface AuditFilterState {
  search: string;
  category: "ALL" | AuditCategory;
  severity: "ALL" | AuditSeverity;
  timeRange: "TODAY" | "7_DAYS" | "30_DAYS" | "ALL";
}
