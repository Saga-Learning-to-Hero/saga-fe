import { it } from "vitest";

export type TestCaseType = "N" | "A" | "B";

export interface FPTTestCaseMeta {
  id: string;
  type: TestCaseType;
  executedDate?: string;
  description: string;
}

export function getTodayDateString(): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

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
