import { describe, expect, it } from "vitest";

const SOURCES = import.meta.glob<string>("../**/*.{ts,tsx}", {
  query: "?raw",
  import: "default",
  eager: true,
});

const EXCLUDED = /\.(test|stories|spec)\.tsx?$/;

/**
 * Guard: ring-offset-<n> phải đi kèm ring-offset-background hoặc ring-offset-0
 * trên cùng dòng. Thiếu thì offset mặc định là trắng (#fff) và làm viền
 * trắng đậm trong dark theme.
 */
describe("v2 focus ring guard", () => {
  it("no ring-offset-<n> without ring-offset-background or ring-offset-0", () => {
    const offending: string[] = [];
    const pattern = /ring-offset-[1-9]\d*/;

    for (const [path, content] of Object.entries(SOURCES)) {
      if (EXCLUDED.test(path)) continue;
      content.split("\n").forEach((line, idx) => {
        if (!pattern.test(line)) return;
        if (/ring-offset-background|ring-offset-0\b/.test(line)) return;
        offending.push(`${path}:${idx + 1}: ${line.trim()}`);
      });
    }

    expect(offending).toEqual([]);
  });
});
