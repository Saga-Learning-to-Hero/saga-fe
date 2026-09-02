import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    reporters: ["default", "./src/testing/fpt-reporter.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/api/*.ts", "src/lib/*.ts"],
      exclude: ["**/*.spec.ts", "**/*.test.ts", "**/node_modules/**", "**/types/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
