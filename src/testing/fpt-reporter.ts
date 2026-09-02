import type { Reporter } from "vitest/reporters";

interface FunctionStats {
  suiteName: string;
  passed: number;
  failed: number;
  normal: number;
  abnormal: number;
  boundary: number;
  dates: Set<string>;
}

export default class FPTUnitTestReporter implements Reporter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onTestRunEnd(testModules: ReadonlyArray<any> = []) {
    this.processTestModules(testModules);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onFinished(files: any[] = []) {
    this.processTestModules(files);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private processTestModules(modules: ReadonlyArray<any> = []) {
    const statsMap = new Map<string, FunctionStats>();

    let totalPassed = 0;
    let totalFailed = 0;
    let totalNormal = 0;
    let totalAbnormal = 0;
    let totalBoundary = 0;

    for (const mod of modules) {
      const suiteName = mod.moduleId
        ? mod.moduleId.split("/").pop()?.replace(/\.(spec|test)\.ts$/, "") || "Module"
        : mod.name || "Module";
      this.collectChildren(mod.children || mod.tasks, statsMap, suiteName);
    }

    if (statsMap.size === 0) return;

    // In bảng tổng kết chuẩn Excel FPT
    console.log("\n==========================================================================================");
    console.log("                       📊 BẢNG TỔNG HỢP KẾT QUẢ UNIT TEST (FPT REPORT)                     ");
    console.log("==========================================================================================");
    console.log(
      "No | Function / Module Name          | Passed | Failed |  N  |  A  |  B  | Total | Executed Dates"
    );
    console.log("------------------------------------------------------------------------------------------");

    let idx = 1;
    statsMap.forEach((stat, name) => {
      const total = stat.passed + stat.failed;
      totalPassed += stat.passed;
      totalFailed += stat.failed;
      totalNormal += stat.normal;
      totalAbnormal += stat.abnormal;
      totalBoundary += stat.boundary;

      const dateList = Array.from(stat.dates).join(", ") || "-";
      const paddedName = name.padEnd(30, " ").slice(0, 30);
      console.log(
        `${String(idx++).padStart(2, " ")} | ${paddedName} | ${String(stat.passed).padStart(6, " ")} | ${String(stat.failed).padStart(6, " ")} | ${String(stat.normal).padStart(3, " ")} | ${String(stat.abnormal).padStart(3, " ")} | ${String(stat.boundary).padStart(3, " ")} | ${String(total).padStart(5, " ")} | ${dateList}`
      );
    });

    const grandTotal = totalPassed + totalFailed;
    console.log("------------------------------------------------------------------------------------------");
    console.log(
      `   | Sub Total                      | ${String(totalPassed).padStart(6, " ")} | ${String(totalFailed).padStart(6, " ")} | ${String(totalNormal).padStart(3, " ")} | ${String(totalAbnormal).padStart(3, " ")} | ${String(totalBoundary).padStart(3, " ")} | ${String(grandTotal).padStart(5, " ")} |`
    );
    console.log("==========================================================================================");

    if (grandTotal > 0) {
      const passPercent = ((totalPassed / grandTotal) * 100).toFixed(2);
      const normalPercent = ((totalNormal / grandTotal) * 100).toFixed(2);
      const abnormalPercent = ((totalAbnormal / grandTotal) * 100).toFixed(2);
      const boundaryPercent = ((totalBoundary / grandTotal) * 100).toFixed(2);

      console.log(`📈 Test Successful Coverage : ${passPercent}%`);
      console.log(`🔹 Normal Case (N)          : ${normalPercent}% (${totalNormal}/${grandTotal})`);
      console.log(`🔸 Abnormal Case (A)        : ${abnormalPercent}% (${totalAbnormal}/${grandTotal})`);
      console.log(`▫️ Boundary Case (B)        : ${boundaryPercent}% (${totalBoundary}/${grandTotal})`);
      console.log("==========================================================================================\n");
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private collectChildren(children: any, statsMap: Map<string, FunctionStats>, currentSuiteName: string) {
    if (!children) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let items: any[] = [];
    if (Array.isArray(children)) {
      items = children;
    } else if (children && typeof children[Symbol.iterator] === "function") {
      items = Array.from(children);
    }

    for (const item of items) {
      if (item.type === "suite") {
        const suiteName = item.name || currentSuiteName;
        this.collectChildren(item.children || item.tasks, statsMap, suiteName);
      } else if (item.type === "test" || item.type === "custom") {
        const suite = currentSuiteName;
        if (!statsMap.has(suite)) {
          statsMap.set(suite, {
            suiteName: suite,
            passed: 0,
            failed: 0,
            normal: 0,
            abnormal: 0,
            boundary: 0,
            dates: new Set<string>(),
          });
        }

        const stat = statsMap.get(suite)!;
        const testName: string = item.name || "";

        // Parse status
        const state = typeof item.result === "function" ? item.result()?.state : item.result?.state;
        if (state === "passed" || state === "pass" || !state) {
          stat.passed++;
        } else {
          stat.failed++;
        }

        // Parse Type [Type: N] / [Type: A] / [Type: B]
        const typeMatch = testName.match(/\[Type:\s*([NAB])\]/i) || testName.match(/\[([NAB])\]/i);
        if (typeMatch) {
          const t = typeMatch[1].toUpperCase();
          if (t === "N") stat.normal++;
          else if (t === "A") stat.abnormal++;
          else if (t === "B") stat.boundary++;
        } else {
          stat.normal++;
        }

        // Parse Date [Date: 15/07/2026]
        const dateMatch = testName.match(/\[Date:\s*([^\]]+)\]/i);
        if (dateMatch) {
          stat.dates.add(dateMatch[1].trim());
        }
      }
    }
  }
}
