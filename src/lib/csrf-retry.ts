const CSRF_ERROR_CODES = new Set([
  "CSRF_TOKEN_INVALID",
  "INVALID_CSRF_TOKEN",
  "MISSING_CSRF_TOKEN",
  "CSRF_VALIDATION_FAILED",
]);

interface CsrfRetryInput {
  status?: number;
  code?: string;
  method?: string;
  url?: string;
  retryAttempted?: boolean;
}

export function shouldRetryCsrfRequest({
  status,
  code,
  method,
  url,
  retryAttempted,
}: CsrfRetryInput): boolean {
  const normalizedMethod = method?.toUpperCase();
  const isMutation =
    normalizedMethod === "POST" ||
    normalizedMethod === "PUT" ||
    normalizedMethod === "PATCH" ||
    normalizedMethod === "DELETE";

  if (status !== 403 || !isMutation || retryAttempted || url?.includes("/api/auth/csrf")) {
    return false;
  }

  const normalizedCode = code?.toUpperCase();
  return Boolean(
    normalizedCode &&
      (CSRF_ERROR_CODES.has(normalizedCode) || normalizedCode.includes("CSRF"))
  );
}
