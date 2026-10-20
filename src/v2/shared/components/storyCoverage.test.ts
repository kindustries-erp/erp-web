import { describe, expect, it } from "vitest";

/** Thành phần chưa có story riêng, chỉ được minh họa qua story của drawer. Thêm mới vào đây là vi phạm. */
const ALLOWLIST = new Set([
  "molecules/v2-drawer-audit-timeline",
  "molecules/v2-drawer-field",
  "molecules/v2-drawer-footer",
  "molecules/v2-drawer-header",
  "molecules/v2-drawer-related-deck",
]);

const files = Object.keys(
  import.meta.glob("./{atoms,molecules,organisms,templates}/**/*.{ts,tsx}"),
).map((f) => f.replace("./", ""));

const components = [
  ...new Set(
    files
      .filter((f) => f.split("/").length > 2)
      .map((f) => f.split("/").slice(0, 2).join("/")),
  ),
];
const hasStory = (component: string): boolean =>
  files.some(
    (f) => f.startsWith(`${component}/`) && f.endsWith(".stories.tsx"),
  );

describe("Storybook coverage của thành phần V2", () => {
  it("quét được thành phần", () => {
    expect(components.length).toBeGreaterThan(30);
  });

  it("mọi thành phần có ít nhất một *.stories.tsx (trừ allowlist)", () => {
    const missing = components.filter((c) => !ALLOWLIST.has(c) && !hasStory(c));
    expect(missing).toEqual([]);
  });

  it("allowlist không chứa mục thừa (đã có story hoặc không còn tồn tại)", () => {
    const stale = [...ALLOWLIST].filter(
      (c) => !components.includes(c) || hasStory(c),
    );
    expect(stale).toEqual([]);
  });
});
