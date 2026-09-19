import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";
import path from "path";

const TESTS_ROOT = path.resolve("tests/unit");

const rawList = execSync('powershell -Command "Get-ChildItem -Path tests\\unit -Recurse -Include *.spec.ts,*.spec.tsx | Select-Object -ExpandProperty FullName"', { encoding: "utf-8" });

const files = rawList.split(/\r?\n/).map(f => f.trim()).filter(Boolean);

console.log(`Kiểm tra ${files.length} file test...`);

let fixedCount = 0;

for (const absPath of files) {
  const relFromTests = path.relative(TESTS_ROOT, absPath);
  const dirFromSrc = path.dirname(relFromTests).replace(/\\/g, "/");

  let content = readFileSync(absPath, "utf-8");
  let changed = false;

  const newContent = content.replace(
    /vi\.mock\(\s*(['"])(\.\.?\/[^'"]+)(['"])/g,
    (match, q1, importPath, q3) => {
      const resolved = path.posix.normalize(path.posix.join(dirFromSrc, importPath));
      changed = true;
      return `vi.mock(${q1}@/${resolved}${q3}`;
    }
  );

  if (changed) {
    writeFileSync(absPath, newContent, "utf-8");
    console.log(`  ✓ Fixed vi.mock paths: ${relFromTests}`);
    fixedCount++;
  }
}

console.log(`\nHoàn thành! Đã fix ${fixedCount} file có vi.mock() relative paths.`);
