import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createEmptyPreferences,
  localStorageColumnPreferences as storage,
  parsePreferences,
  resolveColumnOrder,
} from "./v2ColumnPreferences";

describe("parsePreferences", () => {
  it("returns null for non objects", () => {
    expect(parsePreferences(null)).toBeNull();
    expect(parsePreferences("x")).toBeNull();
  });

  it("drops invalid entries and keeps valid ones", () => {
    expect(
      parsePreferences({
        visibility: { a: false, b: "no", c: true },
        order: ["a", 1, "c"],
        sizing: { a: 120, b: -5, c: "wide", d: Number.NaN },
      }),
    ).toEqual({
      visibility: { a: false, c: true },
      order: ["a", "c"],
      sizing: { a: 120 },
    });
  });

  it("tolerates missing fields", () => {
    expect(parsePreferences({})).toEqual(createEmptyPreferences());
  });
});

describe("resolveColumnOrder", () => {
  it("drops unknown keys and appends new columns in default order", () => {
    expect(resolveColumnOrder(["c", "zz", "a"], ["a", "b", "c", "d"])).toEqual([
      "c",
      "a",
      "b",
      "d",
    ]);
  });

  it("returns the default order when nothing is saved", () => {
    expect(resolveColumnOrder([], ["a", "b"])).toEqual(["a", "b"]);
  });
});

describe("localStorageColumnPreferences", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it("saves, loads and clears per tableId", () => {
    const prefs = { visibility: { a: false }, order: ["b", "a"], sizing: {} };
    storage.save("t1", prefs);
    expect(storage.load("t1")).toEqual(prefs);
    expect(storage.load("t2")).toBeNull();
    storage.clear("t1");
    expect(storage.load("t1")).toBeNull();
  });

  it("returns null for corrupted JSON", () => {
    window.localStorage.setItem("erp_v2_table_prefs:t1", "{not json");
    expect(storage.load("t1")).toBeNull();
  });

  it("never throws when storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(storage.load("t1")).toBeNull();
    expect(() => storage.save("t1", createEmptyPreferences())).not.toThrow();
    expect(() => storage.clear("t1")).not.toThrow();
  });
});
