import { describe, expect, it } from "vitest";

import { shouldRetryCsrfRequest } from "@/lib/csrf-retry";

describe("shouldRetryCsrfRequest", () => {
  it("UTCID01 - [N] Normal: retry mutation một lần khi backend xác nhận token CSRF không hợp lệ", () => {
    expect(
      shouldRetryCsrfRequest({
        status: 403,
        code: "INVALID_CSRF_TOKEN",
        method: "post",
        url: "/api/auth/login",
      })
    ).toBe(true);
  });

  it("UTCID02 - [A] Abnormal: không gửi lại request khi tài khoản bị vô hiệu hóa", () => {
    expect(
      shouldRetryCsrfRequest({
        status: 403,
        code: "ACCOUNT_DISABLED",
        method: "POST",
        url: "/api/auth/login",
      })
    ).toBe(false);
  });

  it("UTCID03 - [A] Abnormal: không gửi lại mutation khi người dùng không đủ quyền", () => {
    expect(
      shouldRetryCsrfRequest({
        status: 403,
        code: "ACCESS_DENIED",
        method: "DELETE",
        url: "/api/admin/users/user-1",
      })
    ).toBe(false);
  });

  it("UTCID04 - [B] Boundary: không retry quá một lần dù lỗi CSRF vẫn còn", () => {
    expect(
      shouldRetryCsrfRequest({
        status: 403,
        code: "CSRF_VALIDATION_FAILED",
        method: "PATCH",
        url: "/api/profile",
        retryAttempted: true,
      })
    ).toBe(false);
  });

  it("UTCID05 - [B] Boundary: không retry chính endpoint cấp CSRF token", () => {
    expect(
      shouldRetryCsrfRequest({
        status: 403,
        code: "MISSING_CSRF_TOKEN",
        method: "POST",
        url: "/api/auth/csrf",
      })
    ).toBe(false);
  });
});
