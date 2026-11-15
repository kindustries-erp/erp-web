import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Guard: web đã ngắt hoàn toàn kết nối users V1 (API /api/v1/admin/users).
 * Các file V1 bị ngắt được giữ lại (chưa xóa) và là nơi duy nhất còn chứa
 * các ký hiệu bên dưới. Mọi file khác không được nối lại V1.
 */
const SRC_ROOT = join(process.cwd(), "src");

const LEGACY_V1_FILES = new Set([
  "pages/ErpUsersPage.tsx",
  "pages/ErpPermissionsCorePage.tsx",
  "modules/system/hooks/useUsersAdminList.ts",
  "modules/system/hooks/useCoreRoleUsers.ts",
  "modules/system/api/usersCoreApi.ts",
]);

const FORBIDDEN = [
  "usersAdminApi",
  "useCoreRoleUsers",
  "useUsersAdminList",
  "api/v1/admin/users",
  "pages/ErpUsersPage",
  "pages/ErpPermissionsCorePage",
];

function listSourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listSourceFiles(full));
    } else if (
      /\.(ts|tsx)$/.test(entry.name) &&
      !/\.(test|spec)\.(ts|tsx)$/.test(entry.name)
    ) {
      out.push(full);
    }
  }
  return out;
}

describe("users V1 đã bị ngắt kết nối khỏi web", () => {
  const files = listSourceFiles(SRC_ROOT).map((full) => ({
    rel: relative(SRC_ROOT, full).split(sep).join("/"),
    full,
  }));

  it("quét được source (tránh test pass rỗng)", () => {
    expect(files.length).toBeGreaterThan(100);
  });

  it("file V1 bị ngắt vẫn còn nguyên (chưa xóa)", () => {
    const rels = new Set(files.map((f) => f.rel));
    for (const legacy of LEGACY_V1_FILES) {
      expect(rels.has(legacy), `${legacy} phải còn tồn tại`).toBe(true);
    }
  });

  it("không file runtime nào tham chiếu API/hook/page users V1", () => {
    const offenders: string[] = [];
    for (const { rel, full } of files) {
      if (LEGACY_V1_FILES.has(rel)) continue;
      const content = readFileSync(full, "utf8");
      for (const token of FORBIDDEN) {
        if (content.includes(token)) offenders.push(`${rel} -> ${token}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
