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
      "src/shared/utils/*.test.ts",
      "src/core/components/layout/**/*.{test,spec}.{ts,tsx}",
      "src/modules/garage/components/organisms/garage-debt-detail-drawer/**/*.{test,spec}.{ts,tsx}",
      "src/modules/garage/components/organisms/garage-cases-detail-drawer/**/*.{test,spec}.{ts,tsx}",
      "src/modules/garage/components/organisms/garage-month-detail-drawer/**/*.{test,spec}.{ts,tsx}",
      "src/shared/utils/pageUrl.test.ts",
      "src/__tests__/App.imotorbike.test.tsx",
      "src/modules/garage/components/garage-case-details-tab/**/*.{test,spec}.{ts,tsx}",
      "src/modules/garage/components/__tests__/**/*.{test,spec}.{ts,tsx}",
      "src/modules/garage/components/GarageConversionFunnelCard/**/*.{test,spec}.{ts,tsx}",
    ],
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
