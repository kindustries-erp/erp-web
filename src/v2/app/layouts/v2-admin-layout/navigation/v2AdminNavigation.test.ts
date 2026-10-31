import { describe, it, expect } from "vitest";
import { getV2AdminNavigationSections } from "./v2AdminNavigation";
import { ADMIN_NAV_DEFS, ADMIN_SECTION_DEFS } from "./v2AdminNavigation.config";

describe("v2AdminNavigation", () => {
  const mockT = (_key: string, fallback?: string) => fallback ?? _key;

  it("trả về danh sách sections đầy đủ theo định nghĩa", () => {
    const sections = getV2AdminNavigationSections(mockT);

    expect(sections.length).toBeGreaterThan(0);
    expect(sections.length).toBeLessThanOrEqual(ADMIN_SECTION_DEFS.length);

    // Kiểm tra từng section có items
    sections.forEach((sec) => {
      expect(sec.items.length).toBeGreaterThan(0);
      sec.items.forEach((item) => {
        expect(item.id).toBeDefined();
        expect(item.label).toBeDefined();
        expect(item.icon).toBeDefined();
        expect(item.href).toBeDefined();
      });
    });
  });

  it("chứa các route ID quản trị cốt lõi", () => {
    const sections = getV2AdminNavigationSections(mockT);
    const allItemIds = sections.flatMap((sec) => sec.items.map((it) => it.id));

    expect(allItemIds).toContain("admin-dashboard");
    expect(allItemIds).toContain("admin-users");
    expect(allItemIds).toContain("admin-permissions");
  });

  it("định nghĩa ADMIN_NAV_DEFS có đầy đủ fallback tiếng Việt", () => {
    ADMIN_NAV_DEFS.forEach((def) => {
      expect(def.fallback).toBeTruthy();
      expect(def.labelKey).toMatch(/^v2\.admin\./);
    });
  });
});
