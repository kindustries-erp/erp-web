import { defineConfig } from "vitest/config";
import path from "path";

// Mặc định (`bun run test`, CI) chỉ chạy V2 và các thư mục V1 đã được giữ test.
const DEFAULT_INCLUDE = [
  "src/v2/**/*.{test,spec}.{ts,tsx}",
  "src/shared/utils/*.test.ts",
  "src/core/components/layout/**/*.{test,spec}.{ts,tsx}",
  "src/modules/garage/components/organisms/garage-debt-detail-drawer/**/*.{test,spec}.{ts,tsx}",
  "src/modules/garage/components/organisms/garage-cases-detail-drawer/**/*.{test,spec}.{ts,tsx}",
  "src/modules/garage/components/organisms/garage-month-detail-drawer/**/*.{test,spec}.{ts,tsx}",
  "src/modules/garage/components/organisms/garage-case-sync-drawer/**/*.{test,spec}.{ts,tsx}",
  "src/shared/utils/pageUrl.test.ts",
  "src/__tests__/App.imotorbike.test.tsx",
  "src/modules/garage/components/garage-case-details-tab/**/*.{test,spec}.{ts,tsx}",
  "src/modules/garage/components/__tests__/**/*.{test,spec}.{ts,tsx}",
  "src/modules/garage/components/GarageConversionFunnelCard/**/*.{test,spec}.{ts,tsx}",
  "src/shared/components/print-templates/**/*.{test,spec}.{ts,tsx}",
  "src/modules/garage/components/organisms/garage-cashflow-drawer/**/*.{test,spec}.{ts,tsx}",
  "src/modules/garage/hooks/garageCashflowQueries.test.ts",
];

// `VITEST_ALL=1` (script `test:all`): chạy mọi test trong `src` khi audit thủ công.
const ALL_INCLUDE = ["src/**/*.{test,spec}.{ts,tsx}"];

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
    testTimeout: 15000,
    include: process.env.VITEST_ALL ? ALL_INCLUDE : DEFAULT_INCLUDE,
    exclude: ["**/node_modules/**", "**/dist/**", "**/.git/**", "**/e2e/**"],
  },
  resolve: {
    alias: {
      "@/v2": path.resolve(__dirname, "./src/v2"),
      "@/v1": path.resolve(__dirname, "./src/v1"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
