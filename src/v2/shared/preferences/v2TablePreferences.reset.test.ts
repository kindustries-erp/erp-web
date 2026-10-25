import { beforeEach, describe, expect, it } from "vitest";
import { clearV2TablePreferencesCache } from "./v2TablePreferences.reset";
import { useV2TablePreferencesStore } from "./useV2TablePreferencesStore";

describe("clearV2TablePreferencesCache", () => {
  beforeEach(() => {
    localStorage.setItem("v2_table_preferences", "{}");
    localStorage.setItem("erp_preferences", "{}");
    useV2TablePreferencesStore.setState({
      tables: {
        t1: { columns: { visibility: {}, order: ["a"], sizing: {} } },
      },
      migrationVersion: 1,
    });
  });

  it("xoá state và key V2, giữ nguyên V1 mặc định", () => {
    clearV2TablePreferencesCache();

    expect(useV2TablePreferencesStore.getState().tables).toEqual({});
    expect(useV2TablePreferencesStore.getState().migrationVersion).toBe(0);
    expect(localStorage.getItem("v2_table_preferences")).toBeNull();
    expect(localStorage.getItem("erp_preferences")).toBe("{}");
  });

  it("xoá cả V1 khi includeV1", () => {
    clearV2TablePreferencesCache({ includeV1: true });

    expect(localStorage.getItem("erp_preferences")).toBeNull();
  });
});
