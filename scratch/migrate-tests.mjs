import { readFileSync, writeFileSync, mkdirSync, unlinkSync, existsSync } from "fs";
import { execSync } from "child_process";
import path from "path";

const SRC_ROOT = path.resolve("src");
const TESTS_ROOT = path.resolve("tests/unit");

const rawList = execSync('powershell -Command "Get-ChildItem -Path src -Recurse -Include *.spec.ts,*.spec.tsx | Select-Object -ExpandProperty FullName"', { encoding: "utf-8" });

const files = rawList.split(/\r?\n/).map(f => f.trim()).filter(Boolean);

console.log(`Tìm thấy ${files.length} file test.`);

for (const absPath of files) {
  const relFromSrc = path.relative(SRC_ROOT, absPath);
  const dirFromSrc = path.dirname(relFromSrc).replace(/\\/g, "/");
  
  let content = readFileSync(absPath, "utf-8");
  
  content = content.replace(
    /from\s+(['"])(\.\.?\/[^'"]+)(['"])/g,
    (match, q1, importPath, q3) => {
      const resolved = path.posix.normalize(path.posix.join(dirFromSrc, importPath));
      return `from ${q1}@/${resolved}${q3}`;
    }
  );
  
  content = content.replace(
    /import\s*\(\s*(['"])(\.\.?\/[^'"]+)(['"])\s*\)/g,
    (match, q1, importPath, q3) => {
      const resolved = path.posix.normalize(path.posix.join(dirFromSrc, importPath));
      return `import(${q1}@/${resolved}${q3})`;
    }
  );
  
  const destPath = path.join(TESTS_ROOT, relFromSrc);
  const destDir = path.dirname(destPath);
  
  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
  }
  
  writeFileSync(destPath, content, "utf-8");
  unlinkSync(absPath);
  
  console.log(`  ✓ ${relFromSrc}`);
}

console.log("\nHoàn thành! Đã di chuyển tất cả file test sang tests/unit/");
