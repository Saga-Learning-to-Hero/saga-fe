import { it } from "vitest";

export type TestCaseType = "N" | "A" | "B"; // Normal | Abnormal | Boundary

export interface FPTTestCaseMeta {
  id: string; // e.g., "UTCID01", "UTCID02"
  type: TestCaseType; // "N" | "A" | "B"
  executedDate?: string; // e.g., "15/07/2026"
  description: string;
}

/**
 * Format ngày mặc định: DD/MM/YYYY
 */
export function getTodayDateString(): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Helper khai báo Test Case chuẩn format FPT Unit Test Matrix
 *
 * @example
 * fptTest({
 *   id: "UTCID01",
 *   type: "N",
 *   executedDate: "15/07/2026",
 *   description: "Tính toán tỷ lệ hợp lệ khi trọng số đủ 100%"
 * }, async () => {
 *   expect(1 + 1).toBe(2);
 * });
 */
export function fptTest(
  meta: FPTTestCaseMeta,
  testFn: () => void | Promise<void>,
  timeout?: number
) {
  const date = meta.executedDate || getTodayDateString();
  const testTitle = `${meta.id} | [Type: ${meta.type}] | [Date: ${date}] | ${meta.description}`;

  return it(
    testTitle,
    async () => {
      await testFn();
    },
    timeout
  );
}
