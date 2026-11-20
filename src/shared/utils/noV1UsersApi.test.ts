import { describe, expect, it } from "vitest";

/**
 * Guard: web đã ngắt hoàn toàn kết nối users V1 (API /api/v1/admin/users).
 * Các file V1 bị ngắt được giữ lại (chưa xóa) và là nơi duy nhất còn chứa
 * các ký hiệu bên dưới. Mọi file khác không được nối lại V1.
 */
const SOURCES = import.meta.glob(
  ["/src/**/*.{ts,tsx}", "!/src/**/*.{test,spec}.{ts,tsx}"],
  { query: "?raw", import: "default", eager: true },
) as Record<string, string>;

const LEGACY_V1_FILES = new Set([
  "/src/v1/pages/ErpUsersPage.tsx",
  "/src/v1/pages/ErpPermissionsCorePage.tsx",
  "/src/modules/system/hooks/useUsersAdminList.ts",
  "/src/modules/system/hooks/useCoreRoleUsers.ts",
  "/src/modules/system/api/usersCoreApi.ts",
]);

const FORBIDDEN = [
  "usersAdminApi",
  "useCoreRoleUsers",
  "useUsersAdminList",
  "api/v1/admin/users",
  "pages/ErpUsersPage",
  "pages/ErpPermissionsCorePage",
  "v1/pages/ErpUsersPage",
  "v1/pages/ErpPermissionsCorePage",
];

describe("users V1 đã bị ngắt kết nối khỏi web", () => {
  const entries = Object.entries(SOURCES);

  it("quét được source (tránh test pass rỗng)", () => {
    expect(entries.length).toBeGreaterThan(100);
  });

  it("file V1 bị ngắt vẫn còn nguyên (chưa xóa)", () => {
    for (const legacy of LEGACY_V1_FILES) {
      expect(legacy in SOURCES, `${legacy} phải còn tồn tại`).toBe(true);
    }
  });

  it("không file runtime nào tham chiếu API/hook/page users V1", () => {
    const offenders: string[] = [];
    for (const [path, content] of entries) {
      if (LEGACY_V1_FILES.has(path)) continue;
      for (const token of FORBIDDEN) {
        if (content.includes(token)) offenders.push(`${path} -> ${token}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
