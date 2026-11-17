import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
    testTimeout: 15000,
    include: [
      "src/v2/**/*.{test,spec}.{ts,tsx}",
      "src/core/components/layout/**/*.{test,spec}.{ts,tsx}",
      "src/modules/garage/components/organisms/garage-debt-detail-drawer/**/*.{test,spec}.{ts,tsx}",
      "src/modules/garage/components/organisms/garage-month-detail-drawer/**/*.{test,spec}.{ts,tsx}",
    ],
    exclude: ["**/node_modules/**", "**/dist/**", "**/.git/**", "**/e2e/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
