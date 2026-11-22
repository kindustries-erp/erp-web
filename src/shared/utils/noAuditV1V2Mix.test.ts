import { describe, expect, it } from "vitest";

/**
 * Guard: Nhật ký hoạt động (audit) tách bạch V1 và V2 trên web.
 * - V1 (`src/**` ngoài `src/v2`) dùng `auditCoreApi` + `/api/v1/audit-logs-core`, không chạm audit V2.
 * - V2 (`src/v2/**`) dùng `/api/v2/audit-logs`, không chạm audit V1.
 * Hai bên không import chéo và không dùng chung kiểu dữ liệu.
 */
const SOURCES = import.meta.glob(
  ["/src/**/*.{ts,tsx}", "!/src/**/*.{test,spec}.{ts,tsx}"],
  { query: "?raw", import: "default", eager: true },
) as Record<string, string>;

const isV2 = (path: string) => path.startsWith("/src/v2/");

const V1_AUDIT_TOKENS = [
  "auditCoreApi",
  "useAuditCoreList",
  "api/v1/audit-logs-core",
  "system/api/usersCoreApi",
  "system/api/activityLogApi",
  "v1/modules/system-audit",
];

const V2_AUDIT_TOKENS = [
  "auditLogsV2Api",
  "modules/audit-logs",
  "api/v2/audit-logs",
];

describe("audit V1 và V2 tách bạch trên web", () => {
  const entries = Object.entries(SOURCES);

  it("quét được source (tránh test pass rỗng)", () => {
    expect(entries.length).toBeGreaterThan(100);
  });

  it("file V2 không tham chiếu API/hook audit V1", () => {
    const offenders: string[] = [];
    for (const [path, content] of entries) {
      if (!isV2(path)) continue;
      for (const token of V1_AUDIT_TOKENS) {
        if (content.includes(token)) offenders.push(`${path} -> ${token}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("file V1 không tham chiếu API audit V2", () => {
    const offenders: string[] = [];
    for (const [path, content] of entries) {
      if (isV2(path) || path === "/src/App.tsx") continue;
      for (const token of V2_AUDIT_TOKENS) {
        if (content.includes(token)) offenders.push(`${path} -> ${token}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
