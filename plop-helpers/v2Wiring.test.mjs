import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { insertAtMarker, V2_WIRING_FILES } from "./v2Wiring.mjs";

const ROOT = resolve(import.meta.dirname, "..");

describe("insertAtMarker", () => {
  const base = ["const a = [", "  // plop:demo", "];"].join("\n");

  it("inserts the snippet before the marker and keeps its indentation", () => {
    const { content, changed } = insertAtMarker(
      base,
      "// plop:demo",
      "{ id: 'x' }, // v2-module:x",
      "x",
    );
    expect(changed).toBe(true);
    expect(content).toBe(
      ["const a = [", "  { id: 'x' }, // v2-module:x", "  // plop:demo", "];"].join("\n"),
    );
  });

  it("is idempotent for the same module id", () => {
    const first = insertAtMarker(base, "// plop:demo", "{ id: 'x' }, // v2-module:x", "x");
    const second = insertAtMarker(first.content, "// plop:demo", "{ id: 'x' }, // v2-module:x", "x");
    expect(second.changed).toBe(false);
    expect(second.content).toBe(first.content);
  });

  it("throws when the marker is missing", () => {
    expect(() => insertAtMarker(base, "// plop:none", "x // v2-module:x", "x")).toThrow(
      /Thiếu marker/,
    );
  });
});

describe("wiring marker contract", () => {
  it.each(Object.entries(V2_WIRING_FILES))("%s still contains its markers", (file, markers) => {
    const path = resolve(ROOT, file);
    expect(existsSync(path), `thiếu file ${file}`).toBe(true);
    const text = readFileSync(path, "utf8");
    for (const marker of markers) expect(text).toContain(marker);
  });
});
