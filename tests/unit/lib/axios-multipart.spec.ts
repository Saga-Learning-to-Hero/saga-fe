import { describe, expect, it } from "vitest";
import type { AxiosAdapter, InternalAxiosRequestConfig } from "axios";

import { apiClient } from "@/lib/axios";

/** The request exactly as it leaves axios, after every interceptor and transformRequest. */
async function sent(data: unknown): Promise<InternalAxiosRequestConfig> {
  let captured: InternalAxiosRequestConfig | null = null;
  const adapter: AxiosAdapter = async (config) => {
    captured = config;
    return { data: {}, status: 200, statusText: "OK", headers: {}, config };
  };
  await apiClient.post("/api/tasks/task-1/files", data, { adapter });
  if (!captured) throw new Error("request was not sent");
  return captured;
}

describe("apiClient multipart uploads", () => {
  it("UTCID01 - [N] Normal: FormData chứa file đi nguyên dạng multipart, không bị đổi thành JSON (lỗi 415)", async () => {
    document.cookie = "XSRF-TOKEN=test-token";
    const form = new FormData();
    form.append("file", new File(["%PDF-1.4"], "bao-cao.pdf", { type: "application/pdf" }));

    const config = await sent(form);

    expect(config.data).toBeInstanceOf(FormData);
    expect((config.data as FormData).get("file")).toBeInstanceOf(File);
    // the browser adds multipart/form-data with its boundary; a JSON type here is what broke uploads
    expect(String(config.headers.getContentType() ?? "")).not.toContain("application/json");
  });

  it("UTCID02 - [B] Boundary: request JSON bình thường vẫn gửi Content-Type application/json", async () => {
    document.cookie = "XSRF-TOKEN=test-token";

    const config = await sent({ title: "x" });

    expect(String(config.headers.getContentType())).toContain("application/json");
    expect(config.data).toBe(JSON.stringify({ title: "x" }));
  });
});
