import { describe, expect, it } from "vitest";
import {
  getSyncLogClassName,
  getSyncProgressPercent,
  getSyncProgressStatusLabel,
  getSyncProgressTone,
} from "./V2SyncProgress.helper";

const labels = { empty: "", running: "R", done: "D", error: "E" };

describe("getSyncProgressTone", () => {
  it("maps each status to its tone", () => {
    expect(getSyncProgressTone("idle")).toBe("primary");
    expect(getSyncProgressTone("running")).toBe("primary");
    expect(getSyncProgressTone("done")).toBe("emerald");
    expect(getSyncProgressTone("error")).toBe("rose");
  });
});

describe("getSyncProgressStatusLabel", () => {
  it("returns the label for running, done and error, and nothing when idle", () => {
    expect(getSyncProgressStatusLabel("running", labels)).toBe("R");
    expect(getSyncProgressStatusLabel("done", labels)).toBe("D");
    expect(getSyncProgressStatusLabel("error", labels)).toBe("E");
    expect(getSyncProgressStatusLabel("idle", labels)).toBeUndefined();
  });
});

describe("getSyncProgressPercent", () => {
  it("forces 100 when done and 0 for idle without data", () => {
    expect(getSyncProgressPercent("done", 20)).toBe(100);
    expect(getSyncProgressPercent("idle", undefined)).toBe(0);
  });

  it("keeps the given value while running or on error", () => {
    expect(getSyncProgressPercent("running", 45)).toBe(45);
    expect(getSyncProgressPercent("running", undefined)).toBeUndefined();
    expect(getSyncProgressPercent("error", 30)).toBe(30);
  });
});

describe("getSyncLogClassName", () => {
  it("colors by level and defaults to info", () => {
    expect(getSyncLogClassName("success")).toBe("text-emerald-300");
    expect(getSyncLogClassName("error")).toBe("text-rose-300");
    expect(getSyncLogClassName()).toBe("text-slate-100");
  });
});
